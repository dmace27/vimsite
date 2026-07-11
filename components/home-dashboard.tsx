import { EditorBuffer, FileLink, Tok, type BufferLine } from "./editor-buffer";
import { navigation } from "@/data/navigation";

export function HomeDashboard() {
  const lines: BufferLine[] = [
    { content: <Tok kind="comment">--- portfolio.md ───────────────────────────────────────────────</Tok> },
    {},
    { content: <><Tok kind="keyword">#</Tok> <Tok kind="heading">Daniel Mace</Tok></>, className: "title-line" },
    { content: <Tok kind="comment">&lt;!-- software developer · systems thinker · builder --&gt;</Tok> },
    {},
    { content: <>I build calm, useful software at the intersection of</> },
    { content: <>design, engineering, and thoughtful systems.</> },
    {},
    { content: <Tok kind="comment">-- files ─────────────────────────────────────────────────────</Tok> },
    {},
    ...navigation.map((item) => ({ content: <><Tok kind="keyword">{item.shortcut}</Tok>  <FileLink href={item.href}>󰈙 {item.href.slice(1)}.md</FileLink> <Tok kind="muted">— {item.description}</Tok></>, indent: 1 })),
    {},
    { content: <Tok kind="comment">-- keymaps ───────────────────────────────────────────────────</Tok> },
    { content: <><Tok kind="type">j / k</Tok>         move cursor</>, indent: 1 },
    { content: <><Tok kind="type">gg / G</Tok>        first / last line</>, indent: 1 },
    { content: <><Tok kind="type">/</Tok>             search this buffer</>, indent: 1 },
    { content: <><Tok kind="type">n</Tok>             next search match</>, indent: 1 },
    { content: <><Tok kind="type">&lt;space&gt;e</Tok>      toggle explorer</>, indent: 1 },
    { content: <><Tok kind="type">:</Tok>             command mode</>, indent: 1 },
    {},
    { content: <Tok kind="comment">-- Press a file key or click a filename to continue. --</Tok> },
    {}, {}, {}, {}, {},
  ];
  return <EditorBuffer lines={lines} />;
}
