"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchItems } from "@/data/commands";

type SearchItem = (typeof searchItems)[number];

/**
 * Gives exact and contiguous matches priority, then falls back to a
 * character-by-character subsequence match (for example, "prj" → Projects).
 */
function fuzzyScore(item: SearchItem, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;

  const label = item.label.toLowerCase();
  const haystack = `${item.label} ${item.detail} ${item.href}`.toLowerCase();

  if (label === needle) return 0;
  if (label.startsWith(needle)) return 10;

  const contiguousMatch = haystack.indexOf(needle);
  if (contiguousMatch >= 0) return 20 + contiguousMatch;

  let previousIndex = -1;
  let score = 100;

  for (const character of needle) {
    const nextIndex = haystack.indexOf(character, previousIndex + 1);
    if (nextIndex < 0) return null;
    score += nextIndex - previousIndex - 1;
    previousIndex = nextIndex;
  }

  return score;
}

export function FuzzyFinder({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useMemo(() => {
    const ranked: Array<{ item: SearchItem; score: number }> = [];

    for (const item of searchItems) {
      const score = fuzzyScore(item, query);
      if (score !== null) ranked.push({ item, score });
    }

    return ranked
      .sort(
        (left, right) =>
          left.score - right.score || left.item.label.localeCompare(right.item.label),
      )
      .slice(0, 10)
      .map(({ item }) => item);
  }, [query]);

  useEffect(() => input.current?.focus(), []);

  const selectedItem = results[selected] ?? null;

  const open = (href: string) => {
    router.push(href);
    onClose();
  };
  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="finder" role="dialog" aria-modal="true" aria-label="Find anything">
        <div className="finder-title" aria-hidden="true">
          <span>Files</span>
        </div>

        <button className="finder-close" onClick={onClose} aria-label="Close fuzzy finder">
          esc
        </button>

        <div className="finder-prompt">
          <span className="finder-chevron" aria-hidden="true">
            ❯
          </span>
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search pages…"
            aria-label="Search site"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "j") {
                e.preventDefault();
                if (results.length) {
                  setSelected((value) => Math.min(value + 1, results.length - 1));
                }
              }
              if (e.key === "ArrowUp" || e.key === "k") {
                e.preventDefault();
                setSelected((value) => Math.max(value - 1, 0));
              }
              if (e.key === "Enter" && results[selected]) open(results[selected].href);
              if (e.key === "Escape") onClose();
            }}
          />
          <span className="finder-count">
            {results.length}/{searchItems.length}
          </span>
        </div>

        <div className="finder-results">
          {results.length ? (
            results.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                className={index === selected ? "selected" : ""}
                aria-current={index === selected ? "true" : undefined}
                onMouseEnter={() => setSelected(index)}
                onClick={() => open(item.href)}
              >
                <span className="finder-file-icon" aria-hidden="true">
                  󰈙
                </span>
                <strong>{item.label}</strong>
                <span className="finder-path">{item.href}</span>
              </button>
            ))
          ) : (
            <p className="finder-empty">No matching files</p>
          )}
        </div>

        <div className="finder-preview-title" aria-hidden="true">
          <span>{selectedItem?.label ?? "No preview"}</span>
        </div>

        <div className="finder-preview" aria-live="polite">
          {selectedItem ? (
            <>
              <p>
                <span>1</span>
                <strong># {selectedItem.label}</strong>
              </p>
              <p>
                <span>2</span>
              </p>
              <p>
                <span>3</span>
                {selectedItem.detail}
              </p>
              <p>
                <span>4</span>
              </p>
              <p>
                <span>5</span>
                <em>{selectedItem.href}</em>
              </p>
            </>
          ) : (
            <p className="finder-empty">Adjust your search to preview a destination.</p>
          )}
        </div>

        <footer className="finder-footer">
          <span>↑↓ / j k select</span>
          <span>↵ open</span>
          <span>esc close</span>
        </footer>
      </section>
    </div>
  );
}
