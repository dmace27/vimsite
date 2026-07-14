"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navigation } from "@/data/navigation";
import { CommandLine } from "./command-line";
import { ExplorerSidebar } from "./explorer-sidebar";
import { FuzzyFinder } from "./fuzzy-finder";
import { StatusLine } from "./status-line";

type VimMode = "normal" | "visual";
type Cursor = { line: number; column: number };
type FindMotion = "f" | "F" | "t" | "T";
type WordMotion = "w" | "e" | "b" | "ge";

// Incomplete chords are deliberately short; completed commands linger long
// enough to be read in the status line before showcmd-style memory is cleared.
export const KEY_SEQUENCE_TIMEOUT_MS = 900;
export const COMMAND_MEMORY_TIMEOUT_MS = 1400;
const MAX_COUNT = 9999;

function editable(target: EventTarget | null) {
  return (
    (target as HTMLElement | null)?.matches("input, textarea, select, [contenteditable='true']") ??
    false
  );
}

function bufferLines() {
  return [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")];
}

function lineText(line: HTMLElement) {
  return line.querySelector<HTMLElement>(".line-content, .lazy-label")?.textContent ?? "";
}

function boundedColumn(line: HTMLElement, column: number) {
  return Math.max(0, Math.min(column, Math.max(0, lineText(line).length - 1)));
}

function firstNonBlank(line: HTMLElement) {
  const match = lineText(line).search(/\S/u);
  return match < 0 ? 0 : match;
}

function lastNonBlank(line: HTMLElement) {
  const text = lineText(line);
  const match = text.search(/\s*$/u);
  return Math.max(0, match - 1);
}

function cursorOffset(lines: HTMLElement[], cursor: Cursor) {
  return (
    lines.slice(0, cursor.line).reduce((total, line) => total + lineText(line).length + 1, 0) +
    cursor.column
  );
}

function offsetCursor(lines: HTMLElement[], target: number): Cursor {
  let remaining = Math.max(0, target);
  for (let line = 0; line < lines.length; line += 1) {
    const length = lineText(lines[line]).length;
    if (remaining <= length || line === lines.length - 1) {
      return { line, column: boundedColumn(lines[line], remaining) };
    }
    remaining -= length + 1;
  }
  return { line: 0, column: 0 };
}

function moveByWords(
  lines: HTMLElement[],
  cursor: Cursor,
  motion: WordMotion,
  count: number,
  bigWord = false,
) {
  const text = lines.map(lineText).join("\n");
  const pattern = bigWord ? /\S+/gu : /[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]+/gu;
  const words = [...text.matchAll(pattern)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length - 1,
  }));
  let offset = cursorOffset(lines, cursor);

  for (let step = 0; step < count; step += 1) {
    if (motion === "w") {
      offset = words.find((word) => word.start > offset)?.start ?? offset;
    } else if (motion === "b") {
      offset = [...words].reverse().find((word) => word.start < offset)?.start ?? offset;
    } else if (motion === "e") {
      offset = words.find((word) => word.end > offset)?.end ?? offset;
    } else {
      offset = [...words].reverse().find((word) => word.end < offset)?.end ?? offset;
    }
  }

  return offsetCursor(lines, offset);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [explorer, setExplorer] = useState(false);
  const [explorerFocusRequest, setExplorerFocusRequest] = useState(0);
  const [command, setCommand] = useState(false);
  const [finder, setFinder] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<VimMode>("normal");
  const [memory, setMemory] = useState("");
  const [activeLine, setActiveLine] = useState(0);
  const [activeColumn, setActiveColumn] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [leader, setLeader] = useState(false);

  const cursorRef = useRef<Cursor>({ line: 0, column: 0 });
  const wantedColumnRef = useRef(0);
  const lineCountRef = useRef(1);
  const modeRef = useRef<VimMode>("normal");
  const visualAnchorRef = useRef<Cursor | null>(null);
  const visualChainRef = useRef(false);
  const memoryRef = useRef("");
  const countRef = useRef("");
  const pendingGRef = useRef(false);
  const pendingFindRef = useRef<FindMotion | null>(null);
  const lastFindRef = useRef<{ motion: FindMotion; character: string } | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const setExplorerOpen = useCallback((open: boolean) => setExplorer(open), []);

  const closeExplorer = useCallback(() => {
    setExplorerOpen(false);
    requestAnimationFrame(() => document.getElementById("content")?.focus({ preventScroll: true }));
  }, [setExplorerOpen]);

  const toggleExplorer = useCallback(() => {
    const opening = !explorer;
    setExplorerOpen(opening);
    if (opening) setExplorerFocusRequest((request) => request + 1);
    else {
      requestAnimationFrame(() =>
        document.getElementById("content")?.focus({ preventScroll: true }),
      );
    }
  }, [explorer, setExplorerOpen]);

  const renderCursor = useCallback((next: Cursor, scroll = true, preserveWantedColumn = false) => {
    const lines = bufferLines();
    if (!lines.length) return;

    const line = Math.max(0, Math.min(next.line, lines.length - 1));
    const column = boundedColumn(lines[line], next.column);
    const cursor = { line, column };
    cursorRef.current = cursor;
    if (!preserveWantedColumn) wantedColumnRef.current = column;
    lineCountRef.current = lines.length;

    const anchor = modeRef.current === "visual" ? visualAnchorRef.current : null;
    const visualStart = anchor ? Math.min(anchor.line, line) : -1;
    const visualEnd = anchor ? Math.max(anchor.line, line) : -1;

    lines.forEach((row, index) => {
      row.toggleAttribute("data-current", index === line);
      row.toggleAttribute("data-visual", index >= visualStart && index <= visualEnd);
      row.style.setProperty("--cursor-offset", index === line ? `${column}ch` : "0ch");
      const number = row.querySelector<HTMLElement>(".line-number");
      if (number) number.textContent = String(index === line ? index + 1 : Math.abs(index - line));
    });

    setActiveLine(line);
    setActiveColumn(column);
    setLineCount(lines.length);
    if (scroll) lines[line].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  const changeMode = useCallback(
    (nextMode: VimMode) => {
      modeRef.current = nextMode;
      setMode(nextMode);
      if (nextMode === "visual") visualAnchorRef.current = { ...cursorRef.current };
      else visualAnchorRef.current = null;
      renderCursor(cursorRef.current, false, true);
    },
    [renderCursor],
  );

  const clearTimers = useCallback(() => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    if (memoryTimer.current) clearTimeout(memoryTimer.current);
    pendingTimer.current = null;
    memoryTimer.current = null;
  }, []);

  const clearSequence = useCallback(() => {
    clearTimers();
    countRef.current = "";
    pendingGRef.current = false;
    pendingFindRef.current = null;
    visualChainRef.current = false;
    memoryRef.current = "";
    setMemory("");
    setLeader(false);
  }, [clearTimers]);

  const expirePendingSequence = useCallback(() => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => {
      countRef.current = "";
      pendingGRef.current = false;
      pendingFindRef.current = null;
      visualChainRef.current = false;
      memoryRef.current = "";
      setMemory("");
      setLeader(false);
    }, KEY_SEQUENCE_TIMEOUT_MS);
  }, []);

  const showPending = useCallback(
    (keys: string) => {
      if (memoryTimer.current) clearTimeout(memoryTimer.current);
      memoryRef.current = keys;
      setMemory(keys);
      expirePendingSequence();
    },
    [expirePendingSequence],
  );

  const showCompleted = useCallback((keys: string) => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    if (memoryTimer.current) clearTimeout(memoryTimer.current);
    pendingTimer.current = null;
    countRef.current = "";
    pendingGRef.current = false;
    pendingFindRef.current = null;
    visualChainRef.current = false;
    setLeader(false);
    memoryRef.current = keys;
    setMemory(keys);
    memoryTimer.current = setTimeout(() => {
      memoryRef.current = "";
      setMemory("");
    }, COMMAND_MEMORY_TIMEOUT_MS);
  }, []);

  const resetVim = useCallback(
    (exitVisual = true) => {
      clearSequence();
      if (exitVisual && modeRef.current === "visual") changeMode("normal");
    },
    [changeMode, clearSequence],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      modeRef.current = "normal";
      setMode("normal");
      visualAnchorRef.current = null;
      cursorRef.current = { line: 0, column: 0 };
      wantedColumnRef.current = 0;
      clearSequence();
      renderCursor({ line: 0, column: 0 }, false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, children, clearSequence, renderCursor]);

  useEffect(() => {
    if (search) searchRef.current?.focus();
  }, [search]);

  useEffect(() => {
    const moveVertical = (delta: number) => {
      const lines = bufferLines();
      const nextLine = Math.max(0, Math.min(cursorRef.current.line + delta, lines.length - 1));
      renderCursor({ line: nextLine, column: wantedColumnRef.current }, true, true);
    };

    const runFind = (motion: FindMotion, character: string, count: number) => {
      const lines = bufferLines();
      const current = cursorRef.current;
      const text = lineText(lines[current.line]);
      const forward = motion === "f" || motion === "t";
      let position = current.column;

      for (let step = 0; step < count; step += 1) {
        const match = forward
          ? text.indexOf(character, position + 1)
          : text.lastIndexOf(character, position - 1);
        if (match < 0) break;
        position = match;
      }

      if (motion === "t" && position > current.column) position -= 1;
      if (motion === "T" && position < current.column) position += 1;
      renderCursor({ line: current.line, column: position });
      lastFindRef.current = { motion, character };
    };

    const runSearch = (count: number) => {
      if (!query) return;
      const lines = bufferLines();
      let from = cursorRef.current.line;
      for (let step = 0; step < count; step += 1) {
        const hit = lines.findIndex(
          (line, index) =>
            index > from && line.textContent?.toLowerCase().includes(query.toLowerCase()),
        );
        from =
          hit >= 0
            ? hit
            : lines.findIndex((line) =>
                line.textContent?.toLowerCase().includes(query.toLowerCase()),
              );
        if (from < 0) break;
      }
      if (from >= 0) renderCursor({ line: from, column: 0 });
    };

    const commandPrefix = () => `${visualChainRef.current ? "v" : ""}${countRef.current}`;
    const count = () => Math.max(1, Math.min(Number(countRef.current || "1"), MAX_COUNT));

    const click = (event: MouseEvent) => {
      const row = (event.target as HTMLElement).closest<HTMLElement>("[data-buffer-line]");
      if (row) renderCursor({ line: Number(row.dataset.line), column: 0 }, false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearch(false);
        setCommand(false);
        setFinder(false);
        resetVim(true);
        return;
      }
      if (search || command || finder || editable(event.target)) return;

      if (leader) {
        event.preventDefault();
        const sequence = `<Space>${event.key === " " ? "<Space>" : event.key}`;
        if (event.key === "e") toggleExplorer();
        else if (event.key === " ") setFinder(true);
        else {
          const item = navigation.find((entry) => entry.shortcut === event.key.toLowerCase());
          if (item) router.push(item.href);
          else {
            clearSequence();
            return;
          }
        }
        showCompleted(sequence);
        return;
      }

      if (event.key === " " && modeRef.current === "normal") {
        event.preventDefault();
        setLeader(true);
        showPending("<Space>");
        return;
      }

      if (
        event.defaultPrevented ||
        (event.target as HTMLElement | null)?.closest("[data-explorer-tree]")
      ) {
        return;
      }

      if (
        pathname === "/" &&
        modeRef.current === "normal" &&
        !countRef.current &&
        !pendingGRef.current &&
        !pendingFindRef.current
      ) {
        const item = navigation.find((entry) => entry.shortcut === event.key.toLowerCase());
        if (item) {
          event.preventDefault();
          showCompleted(event.key.toLowerCase());
          router.push(item.href);
          return;
        }
      }

      const pendingFind = pendingFindRef.current;
      if (pendingFind) {
        event.preventDefault();
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          runFind(pendingFind, event.key, count());
          showCompleted(`${memoryRef.current}${event.key}`);
        } else clearSequence();
        return;
      }

      if (event.ctrlKey && !event.metaKey && !event.altKey) {
        const key = event.key.toLowerCase();
        if (["d", "u", "f", "b"].includes(key)) {
          event.preventDefault();
          const pane = document.querySelector<HTMLElement>(".main-pane");
          const visibleRows = Math.max(1, Math.floor((pane?.clientHeight ?? 240) / 24));
          const distance = key === "d" || key === "u" ? Math.floor(visibleRows / 2) : visibleRows;
          moveVertical((key === "d" || key === "f" ? 1 : -1) * distance * count());
          showCompleted(`<C-${key}>`);
          return;
        }
      }

      if (/^\d$/u.test(event.key) && (event.key !== "0" || countRef.current)) {
        event.preventDefault();
        countRef.current = `${countRef.current}${event.key}`.slice(0, 4);
        showPending(`${visualChainRef.current ? "v" : ""}${countRef.current}`);
        return;
      }

      if (event.key === "v" || event.key === "V") {
        event.preventDefault();
        if (modeRef.current === "normal") {
          changeMode("visual");
          visualChainRef.current = true;
          countRef.current = "";
          showPending(event.key);
        } else {
          changeMode("normal");
          showCompleted(event.key);
        }
        return;
      }

      if (event.key === "o" && modeRef.current === "visual" && visualAnchorRef.current) {
        event.preventDefault();
        const previousAnchor = visualAnchorRef.current;
        visualAnchorRef.current = { ...cursorRef.current };
        renderCursor(previousAnchor);
        showCompleted("o");
        return;
      }

      if (pendingGRef.current) {
        event.preventDefault();
        const lines = bufferLines();
        const sequence = `${memoryRef.current}${event.key}`;
        if (event.key === "g") {
          const target = countRef.current ? count() - 1 : 0;
          renderCursor({
            line: target,
            column: firstNonBlank(lines[Math.max(0, Math.min(target, lines.length - 1))]),
          });
          showCompleted(sequence);
          return;
        }
        if (event.key === "e" || event.key === "E") {
          renderCursor(moveByWords(lines, cursorRef.current, "ge", count(), event.key === "E"));
          showCompleted(sequence);
          return;
        }
        if (event.key === "j" || event.key === "k") {
          moveVertical((event.key === "j" ? 1 : -1) * count());
          showCompleted(sequence);
          return;
        }
        if (event.key === "_") {
          renderCursor({
            line: cursorRef.current.line,
            column: lastNonBlank(lines[cursorRef.current.line]),
          });
          showCompleted(sequence);
          return;
        }
        clearSequence();
        return;
      }

      if (event.key === "g") {
        event.preventDefault();
        pendingGRef.current = true;
        showPending(`${commandPrefix()}g`);
        return;
      }

      if (["f", "F", "t", "T"].includes(event.key)) {
        event.preventDefault();
        pendingFindRef.current = event.key as FindMotion;
        showPending(`${commandPrefix()}${event.key}`);
        return;
      }

      const lines = bufferLines();
      const current = cursorRef.current;
      const repetitions = count();
      const sequence = `${commandPrefix()}${event.key}`;

      if (event.key === "h" || event.key === "l") {
        event.preventDefault();
        renderCursor({
          line: current.line,
          column: current.column + (event.key === "l" ? repetitions : -repetitions),
        });
        showCompleted(sequence);
        return;
      }
      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        moveVertical((event.key === "j" ? 1 : -1) * repetitions);
        showCompleted(sequence);
        return;
      }
      if (["w", "W", "e", "E", "b", "B"].includes(event.key)) {
        event.preventDefault();
        const motion = event.key.toLowerCase() as "w" | "e" | "b";
        renderCursor(
          moveByWords(lines, current, motion, repetitions, event.key === event.key.toUpperCase()),
        );
        showCompleted(sequence);
        return;
      }
      if (event.key === "0" || event.key === "^") {
        event.preventDefault();
        renderCursor({
          line: current.line,
          column: event.key === "0" ? 0 : firstNonBlank(lines[current.line]),
        });
        showCompleted(sequence);
        return;
      }
      if (event.key === "$" || event.key === "_") {
        event.preventDefault();
        const targetLine =
          event.key === "_"
            ? Math.min(current.line + repetitions - 1, lines.length - 1)
            : current.line;
        renderCursor({
          line: targetLine,
          column:
            event.key === "$"
              ? Math.max(0, lineText(lines[targetLine]).length - 1)
              : firstNonBlank(lines[targetLine]),
        });
        showCompleted(sequence);
        return;
      }
      if (event.key === "G") {
        event.preventDefault();
        const target = countRef.current ? repetitions - 1 : lines.length - 1;
        renderCursor({
          line: target,
          column: firstNonBlank(lines[Math.max(0, Math.min(target, lines.length - 1))]),
        });
        showCompleted(sequence);
        return;
      }
      if (["H", "M", "L"].includes(event.key)) {
        event.preventDefault();
        const pane = document.querySelector<HTMLElement>(".main-pane");
        const paneRect = pane?.getBoundingClientRect();
        const visible = lines
          .map((line, index) => ({ index, rect: line.getBoundingClientRect() }))
          .filter(
            ({ rect }) => !paneRect || (rect.bottom > paneRect.top && rect.top < paneRect.bottom),
          );
        const position =
          event.key === "H"
            ? 0
            : event.key === "L"
              ? visible.length - 1
              : Math.floor(visible.length / 2);
        const target = visible[Math.max(0, position)]?.index ?? current.line;
        renderCursor({ line: target, column: firstNonBlank(lines[target]) });
        showCompleted(sequence);
        return;
      }
      if (event.key === "{" || event.key === "}") {
        event.preventDefault();
        let target = current.line;
        for (let step = 0; step < repetitions; step += 1) {
          const direction = event.key === "}" ? 1 : -1;
          do target += direction;
          while (target > 0 && target < lines.length - 1 && lineText(lines[target]).trim());
          target = Math.max(0, Math.min(target, lines.length - 1));
        }
        renderCursor({ line: target, column: 0 });
        showCompleted(sequence);
        return;
      }
      if (event.key === ";" || event.key === ",") {
        const previous = lastFindRef.current;
        if (!previous) return;
        event.preventDefault();
        const opposite: Record<FindMotion, FindMotion> = { f: "F", F: "f", t: "T", T: "t" };
        runFind(
          event.key === ";" ? previous.motion : opposite[previous.motion],
          previous.character,
          repetitions,
        );
        showCompleted(sequence);
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        setSearch(true);
        showCompleted("/");
        return;
      }
      if (event.key === ":") {
        event.preventDefault();
        setCommand(true);
        showCompleted(":");
        return;
      }
      if (event.key === "n" && query) {
        event.preventDefault();
        runSearch(repetitions);
        showCompleted(sequence);
        return;
      }
      if (event.key === "Enter") {
        const active = lines[current.line];
        const link = active?.matches("a") ? active : active?.querySelector<HTMLElement>("a");
        if (link) {
          event.preventDefault();
          link.click();
          showCompleted("<CR>");
        }
        return;
      }

      if (countRef.current || visualChainRef.current) clearSequence();
    };

    window.addEventListener("keydown", onKey, true);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", click);
    };
  }, [
    clearSequence,
    command,
    finder,
    leader,
    pathname,
    query,
    renderCursor,
    resetVim,
    router,
    search,
    showCompleted,
    showPending,
    toggleExplorer,
    changeMode,
  ]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const executeSearch = () => {
    setSearch(false);
    requestAnimationFrame(() => {
      const lines = bufferLines();
      const hit = lines.findIndex((line) =>
        line.textContent?.toLowerCase().includes(query.toLowerCase()),
      );
      if (hit >= 0) renderCursor({ line: hit, column: 0 });
    });
  };

  return (
    <div className={`nvim ${pathname === "/" ? "is-home" : ""}`} data-vim-mode={mode}>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <div className="tabline">
        <span className="nvim-mark"></span>
        <span className="tab active">
          {pathname === "/" ? "portfolio.md" : `${pathname.slice(1)}.md`}
        </span>
        <span className="tab-fill" />
        <button onClick={toggleExplorer} aria-label="Toggle explorer">
          
        </button>
      </div>
      <div className="workspace">
        <ExplorerSidebar
          key={explorerFocusRequest}
          open={explorer}
          focusRequest={explorerFocusRequest}
          onClose={closeExplorer}
        />
        <main id="content" className="main-pane" tabIndex={-1}>
          {children}
        </main>
      </div>
      {search && (
        <div className="vim-command">
          <span>/</span>
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") executeSearch();
              if (event.key === "Escape") setSearch(false);
            }}
            aria-label="Search buffer"
          />
          <span className="command-hint">Enter to search · n for next</span>
        </div>
      )}
      {finder && <FuzzyFinder onClose={() => setFinder(false)} />}
      {command && <CommandLine onClose={() => setCommand(false)} />}
      <StatusLine
        pathname={pathname}
        mode={mode}
        memory={memory}
        line={activeLine + 1}
        column={activeColumn + 1}
        total={lineCount}
      />
    </div>
  );
}
