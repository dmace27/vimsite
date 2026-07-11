"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchItems } from "@/data/commands";

export function FuzzyFinder({ onClose }: { onClose: () => void }) {
  const router = useRouter(); const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(""); const [selected, setSelected] = useState(0);
  const results = useMemo(() => searchItems.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query]);
  useEffect(() => input.current?.focus(), []);
  const open = (href: string) => { router.push(href); onClose(); };
  return <div className="overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="finder modal" role="dialog" aria-modal="true" aria-label="Find anything">
      <div className="modal-title"><span>⌕ Find anything</span><button onClick={onClose}>esc</button></div>
      <input ref={input} value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0); }} placeholder="Type a page, project, or article…" aria-label="Search site" onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); setSelected((v) => Math.min(v + 1, results.length - 1)); }
        if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
        if (e.key === "Enter" && results[selected]) open(results[selected].href);
        if (e.key === "Escape") onClose();
      }} />
      <div className="result-list">{results.length ? results.map((item, index) => <button key={`${item.label}-${index}`} className={index === selected ? "selected" : ""} onMouseEnter={() => setSelected(index)} onClick={() => open(item.href)}><strong>{item.label}</strong><span>{item.detail}</span></button>) : <p className="empty">No matches. Try another command.</p>}</div>
      <footer>↑↓ / j k select <span>↵ open</span></footer>
    </section>
  </div>;
}
