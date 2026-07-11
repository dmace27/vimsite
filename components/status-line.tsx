export function StatusLine({ pathname, leader, line, total }: { pathname: string; leader: boolean; line: number; total: number }) {
  const file = pathname === "/" ? "portfolio.md" : `${pathname.slice(1)}.md`;
  return <footer className="statusline"><span className="mode"> NORMAL </span><span className="branch"> main</span><span className="status-file">{file}</span><span className="status-spacer" /><span>{leader ? "󱁐 LEADER" : "markdown"}</span><span>utf-8</span><span>{Math.round((line / total) * 100)}%</span><span>{line}:1</span></footer>;
}
