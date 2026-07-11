"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/navigation";

export function ExplorerSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`explorer ${open ? "is-open" : ""}`} aria-label="Explorer" aria-hidden={!open}>
      <div className="explorer-heading"><span>EXPLORER</span><button onClick={onClose} aria-label="Close explorer">󰅖</button></div>
      <div className="tree-label">  PORTFOLIO</div>
      <nav>
        <Link href="/" className={pathname === "/" ? "active" : ""}>󰈙 portfolio.md</Link>
        {navigation.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>󰈙 {item.href.slice(1)}.md</Link>)}
      </nav>
      <div className="explorer-foot">󱁐 space e · toggle</div>
    </aside>
  );
}
