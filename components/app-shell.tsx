"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandLine } from "./command-line";
import { ExplorerSidebar } from "./explorer-sidebar";
import { StatusLine } from "./status-line";
import { navigation } from "@/data/navigation";

function editable(target: EventTarget | null) { return (target as HTMLElement | null)?.matches("input, textarea, select, [contenteditable='true']") ?? false; }

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const [explorer, setExplorer] = useState(true); const [command, setCommand] = useState(false); const [search, setSearch] = useState(false); const [query, setQuery] = useState("");
  const [activeLine, setActiveLine] = useState(0); const [lineCount, setLineCount] = useState(1); const [leader, setLeader] = useState(false);
  const leaderTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const pendingG = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const syncLine = useCallback((next: number, scroll = true) => {
    const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")]; if (!lines.length) return;
    const index = Math.max(0, Math.min(next, lines.length - 1));
    lines.forEach((line, i) => { line.toggleAttribute("data-current", i === index); const n = line.querySelector<HTMLElement>(".line-number"); if (n) n.textContent = String(i === index ? i + 1 : Math.abs(i - index)); });
    setActiveLine(index); setLineCount(lines.length); if (scroll) lines[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  useEffect(() => { const id = requestAnimationFrame(() => syncLine(0, false)); return () => cancelAnimationFrame(id); }, [pathname, children, syncLine]);
  useEffect(() => { if (search) searchRef.current?.focus(); }, [search]);
  useEffect(() => {
    const click = (e: MouseEvent) => { const row = (e.target as HTMLElement).closest<HTMLElement>("[data-buffer-line]"); if (row) syncLine(Number(row.dataset.line), false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSearch(false); setCommand(false); setLeader(false); return; }
      if (search || command || editable(event.target)) return;
      if (leader) { event.preventDefault(); setLeader(false); if (event.key === "e") setExplorer((v) => !v); return; }
      if (event.key === " ") { event.preventDefault(); setLeader(true); leaderTimer.current = setTimeout(() => setLeader(false), 800); return; }
      if (event.key === ":") { event.preventDefault(); setCommand(true); return; }
      if (event.key === "/") { event.preventDefault(); setSearch(true); return; }
      if (event.key === "j") { event.preventDefault(); syncLine(activeLine + 1); return; }
      if (event.key === "k") { event.preventDefault(); syncLine(activeLine - 1); return; }
      if (event.key === "G") { event.preventDefault(); syncLine(lineCount - 1); return; }
      if (event.key === "g") { event.preventDefault(); if (pendingG.current) { pendingG.current = false; syncLine(0); } else { pendingG.current = true; gTimer.current = setTimeout(() => { pendingG.current = false; }, 650); } return; }
      if (event.key === "n" && query) { event.preventDefault(); const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")]; const hit = lines.findIndex((line, i) => i > activeLine && line.textContent?.toLowerCase().includes(query.toLowerCase())); const wrapped = hit >= 0 ? hit : lines.findIndex((line) => line.textContent?.toLowerCase().includes(query.toLowerCase())); if (wrapped >= 0) syncLine(wrapped); return; }
      if (pathname === "/") { const item = navigation.find((entry) => entry.shortcut === event.key.toLowerCase()); if (item) { event.preventDefault(); router.push(item.href); } }
    };
    window.addEventListener("keydown", onKey); document.addEventListener("click", click);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("click", click); if (leaderTimer.current) clearTimeout(leaderTimer.current); if (gTimer.current) clearTimeout(gTimer.current); };
  }, [activeLine, command, leader, lineCount, pathname, query, router, search, syncLine]);

  const executeSearch = () => { setSearch(false); requestAnimationFrame(() => { const lines = [...document.querySelectorAll<HTMLElement>("[data-buffer-line]")]; const hit = lines.findIndex((line) => line.textContent?.toLowerCase().includes(query.toLowerCase())); if (hit >= 0) syncLine(hit); }); };
  return <div className="nvim">
    <a className="skip-link" href="#content">Skip to content</a>
    <div className="tabline"><span className="nvim-mark"></span><span className="tab active">{pathname === "/" ? "portfolio.md" : `${pathname.slice(1)}.md`}</span><span className="tab-fill" /><button onClick={() => setExplorer((v) => !v)} aria-label="Toggle explorer"></button></div>
    <div className="workspace"><ExplorerSidebar open={explorer} onClose={() => setExplorer(false)} /><main id="content" className="main-pane">{children}</main></div>
    {search && <div className="vim-command"><span>/</span><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") executeSearch(); if (e.key === "Escape") setSearch(false); }} aria-label="Search buffer" /><span className="command-hint">Enter to search · n for next</span></div>}
    {command && <CommandLine onClose={() => setCommand(false)} />}
    <StatusLine pathname={pathname} leader={leader} line={activeLine + 1} total={lineCount} />
  </div>;
}
