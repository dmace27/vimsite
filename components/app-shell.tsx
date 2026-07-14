"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandLine } from "./command-line";
import { ExplorerSidebar } from "./explorer-sidebar";
import { FuzzyFinder } from "./fuzzy-finder";
import { StatusLine } from "./status-line";
import { navigation } from "@/data/navigation";

function editable(target: EventTarget | null) {
  return (
    (target as HTMLElement | null)?.matches("input, textarea, select, [contenteditable='true']") ??
    false
  );
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
  const [activeLine, setActiveLine] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [leader, setLeader] = useState(false);
  const leaderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingG = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const setExplorerOpen = useCallback((open: boolean) => {
    setExplorer(open);
  }, []);

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

  /**
   * Synchronizes the visual cursor, relative line numbers, and status line.
   * Buffer rows intentionally expose data attributes so every route can share
   * the same keyboard controller without moving page content into client state.
   */
  const syncLine = useCallback((next: number, scroll = true) => {
    const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")];
    if (!lines.length) return;
    const index = Math.max(0, Math.min(next, lines.length - 1));
    lines.forEach((line, i) => {
      line.toggleAttribute("data-current", i === index);
      const n = line.querySelector<HTMLElement>(".line-number");
      if (n) n.textContent = String(i === index ? i + 1 : Math.abs(i - index));
    });
    setActiveLine(index);
    setLineCount(lines.length);
    if (scroll) lines[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => syncLine(0, false));
    return () => cancelAnimationFrame(id);
  }, [pathname, children, syncLine]);
  useEffect(() => {
    if (search) searchRef.current?.focus();
  }, [search]);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-buffer-line]");
      if (row) syncLine(Number(row.dataset.line), false);
    };
    // Normal-mode key handling is disabled while a prompt or form field is active.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearch(false);
        setCommand(false);
        setFinder(false);
        setLeader(false);
        return;
      }
      if (search || command || finder || editable(event.target)) return;
      if (leader) {
        event.preventDefault();
        setLeader(false);
        if (leaderTimer.current) clearTimeout(leaderTimer.current);
        if (event.key === "e") toggleExplorer();
        if (event.key === " ") setFinder(true);
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        setLeader(true);
        leaderTimer.current = setTimeout(() => setLeader(false), 800);
        return;
      }
      if (
        event.defaultPrevented ||
        (event.target as HTMLElement | null)?.closest("[data-explorer-tree]")
      ) {
        return;
      }
      if (event.key === ":") {
        event.preventDefault();
        setCommand(true);
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        setSearch(true);
        return;
      }
      if (event.key === "j") {
        event.preventDefault();
        syncLine(activeLine + 1);
        return;
      }
      if (event.key === "k") {
        event.preventDefault();
        syncLine(activeLine - 1);
        return;
      }
      if (event.key === "Enter") {
        const active = document.querySelector<HTMLElement>("[data-buffer-line][data-current]");
        const link = active?.matches("a") ? active : active?.querySelector<HTMLElement>("a");
        if (link) {
          event.preventDefault();
          link.click();
        }
        return;
      }
      if (event.key === "G") {
        event.preventDefault();
        syncLine(lineCount - 1);
        return;
      }
      if (event.key === "g") {
        event.preventDefault();
        if (pendingG.current) {
          pendingG.current = false;
          syncLine(0);
        } else {
          pendingG.current = true;
          gTimer.current = setTimeout(() => {
            pendingG.current = false;
          }, 650);
        }
        return;
      }
      if (event.key === "n" && query) {
        event.preventDefault();
        const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")];
        const hit = lines.findIndex(
          (line, i) =>
            i > activeLine && line.textContent?.toLowerCase().includes(query.toLowerCase()),
        );
        const wrapped =
          hit >= 0
            ? hit
            : lines.findIndex((line) =>
                line.textContent?.toLowerCase().includes(query.toLowerCase()),
              );
        if (wrapped >= 0) syncLine(wrapped);
        return;
      }
      if (pathname === "/") {
        const item = navigation.find((entry) => entry.shortcut === event.key.toLowerCase());
        if (item) {
          event.preventDefault();
          router.push(item.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", click);
      if (leaderTimer.current) clearTimeout(leaderTimer.current);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [
    activeLine,
    command,
    finder,
    leader,
    lineCount,
    pathname,
    query,
    router,
    search,
    syncLine,
    toggleExplorer,
  ]);

  const executeSearch = () => {
    setSearch(false);
    requestAnimationFrame(() => {
      const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")];
      const hit = lines.findIndex((line) =>
        line.textContent?.toLowerCase().includes(query.toLowerCase()),
      );
      if (hit >= 0) syncLine(hit);
    });
  };
  return (
    <div className={`nvim ${pathname === "/" ? "is-home" : ""}`}>
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
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") executeSearch();
              if (e.key === "Escape") setSearch(false);
            }}
            aria-label="Search buffer"
          />
          <span className="command-hint">Enter to search · n for next</span>
        </div>
      )}
      {finder && <FuzzyFinder onClose={() => setFinder(false)} />}
      {command && <CommandLine onClose={() => setCommand(false)} />}
      <StatusLine pathname={pathname} leader={leader} line={activeLine + 1} total={lineCount} />
    </div>
  );
}
