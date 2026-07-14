export function StatusLine({
  pathname,
  mode,
  memory,
  line,
  column,
  total,
}: {
  pathname: string;
  mode: "normal" | "visual";
  memory: string;
  line: number;
  column: number;
  total: number;
}) {
  const file = pathname === "/" ? "portfolio.md" : `${pathname.slice(1)}.md`;
  return (
    <footer className="statusline">
      <span className={`mode mode-${mode}`}>{mode.toUpperCase()}</span>
      <span className="branch"> main</span>
      <span className="status-file">{file}</span>
      <span className="status-spacer" />
      <span className="filetype">markdown</span>
      <span
        className={`keystroke-memory ${memory ? "has-keys" : ""}`}
        aria-label={memory ? `Recent Vim keys: ${memory}` : "No pending Vim keys"}
        aria-live="polite"
        title="Pending keys clear after 0.9s; completed commands clear after 1.4s"
      >
        {memory || "\u00a0"}
      </span>
      <span>utf-8</span>
      <span>{Math.round((line / total) * 100)}%</span>
      <span>
        {line}:{column}
      </span>
    </footer>
  );
}
