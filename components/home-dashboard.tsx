"use client";
import Link from "next/link";
import { navigation } from "@/data/navigation";

const icons: Record<string, string> = {
  about: "󰋙",
  projects: "󰏗",
  writing: "󰈙",
  contact: "󰇮",
  settings: "󰒓",
  help: "󰞋",
};

const glyphs: Record<string, string[]> = {
  D: ["████  ", "██  ██", "██  ██", "██  ██", "████  "],
  A: [" ███  ", "██ ██ ", "█████ ", "██ ██ ", "██ ██ "],
  N: ["██  ██", "███ ██", "██████", "██ ███", "██  ██"],
  I: ["██████", "  ██  ", "  ██  ", "  ██  ", "██████"],
  E: ["██████", "██    ", "█████ ", "██    ", "██████"],
  L: ["██    ", "██    ", "██    ", "██    ", "██████"],
  M: ["██   ██", "███ ███", "██ █ ██", "██   ██", "██   ██"],
  C: [" █████", "██    ", "██    ", "██    ", " █████"],
  " ": ["    ", "    ", "    ", "    ", "    "],
};

// Convert the bitmap alphabet into equal-sized cells. Using CSS pixels instead
// of block characters avoids width differences caused by Unicode font fallback.
const asciiRows = Array.from({ length: 5 }, (_, row) =>
  [..."DANIEL MACE"].map((letter) => glyphs[letter][row]).join("  "),
);

export function HomeDashboard() {
  return (
    <section className="lazy-home" aria-label="Portfolio dashboard">
      <div className="lazy-dashboard">
        <div className="ascii-name" role="img" aria-label="Daniel Mace" aria-hidden="true">
          <div className="ascii-grid" aria-hidden="true">
            {asciiRows.flatMap((row, rowIndex) =>
              [...row].map((cell, columnIndex) => (
                <span
                  className={cell === "█" ? "pixel on" : "pixel"}
                  key={`${rowIndex}-${columnIndex}`}
                />
              )),
            )}
          </div>
        </div>
        <nav className="lazy-menu" aria-label="Main pages">
          {navigation.map((item, index) => {
            const key = item.href.slice(1);
            return (
              <Link
                href={item.href}
                key={item.href}
                data-buffer-line
                data-line={index}
                data-vim-item
              >
                <span className="lazy-icon" aria-hidden="true">
                  {icons[key]}
                </span>
                <span className="lazy-label">{item.label.replace(" me", "")}</span>
                <span className="lazy-key">␠{item.shortcut}</span>
              </Link>
            );
          })}
        </nav>
        <div className="lazy-loaded">
          <span></span> Neovim loaded{" "}
          <strong>
            {navigation.length}/{navigation.length}
          </strong>{" "}
          pages in <strong>24.67ms</strong>
        </div>
      </div>
    </section>
  );
}
