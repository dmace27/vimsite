import Link from "next/link";

export type BufferLine = { content?: React.ReactNode; indent?: number; className?: string };
export const Tok = ({ kind, children }: { kind: "comment" | "heading" | "keyword" | "string" | "type" | "muted"; children: React.ReactNode }) => <span className={`tok-${kind}`}>{children}</span>;
export const FileLink = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="buffer-link" data-vim-item>{children}</Link>;

export function EditorBuffer({ lines }: { lines: BufferLine[] }) {
  return <div className="editor-buffer" role="list" aria-label="Editor buffer">
    {lines.map((line, index) => <div key={index} role="listitem" className={`buffer-line ${line.className ?? ""}`} data-buffer-line data-line={index} style={{ "--indent": line.indent ?? 0 } as React.CSSProperties}>
      <span className="line-number" aria-hidden="true">{index + 1}</span>
      <span className="line-sign" aria-hidden="true"> </span>
      <span className="line-content">{line.content ?? " "}</span>
    </div>)}
  </div>;
}
