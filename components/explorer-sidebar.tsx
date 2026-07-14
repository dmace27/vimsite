"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getWritingEntryHref, projects, writing, writingSections } from "@/data/site-content";

type ExplorerNode = {
  label: string;
  href: string;
  kind: "file" | "folder";
  children?: ExplorerNode[];
};

type VisibleNode = {
  node: ExplorerNode;
  depth: number;
};

const writingFolders: ExplorerNode[] = writingSections.map((section) => ({
  label: section.label,
  href: section.href,
  kind: "folder",
  children: writing
    .filter((entry) => entry.category === section.category)
    .map((entry) => ({
      label: `${entry.slug}.md`,
      href: getWritingEntryHref(entry),
      kind: "file",
    })),
}));

const explorerTree: ExplorerNode[] = [
  { label: "portfolio.md", href: "/", kind: "file" },
  { label: "about.md", href: "/about", kind: "file" },
  {
    label: "projects",
    href: "/projects",
    kind: "folder",
    children: projects.map((project) => ({
      label: `${project.slug}.md`,
      href: `/projects/${project.slug}`,
      kind: "file",
    })),
  },
  {
    label: "writing",
    href: "/writing",
    kind: "folder",
    children: writingFolders,
  },
  { label: "contact.md", href: "/contact", kind: "file" },
  { label: "settings.md", href: "/settings", kind: "file" },
  { label: "help.md", href: "/help", kind: "file" },
];

function visibleTree(nodes: ExplorerNode[], expanded: Set<string>, depth = 0): VisibleNode[] {
  return nodes.flatMap((node) => {
    const current = { node, depth };
    if (node.kind !== "folder" || !expanded.has(node.href) || !node.children?.length) {
      return [current];
    }

    return [current, ...visibleTree(node.children, expanded, depth + 1)];
  });
}

export function ExplorerSidebar({
  open,
  focusRequest,
  onClose,
}: {
  open: boolean;
  focusRequest: number;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [cursorHref, setCursorHref] = useState(explorerTree[0].href);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const restoreFocusAfterNavigation = useRef(false);
  const visibleNodes = useMemo(() => visibleTree(explorerTree, expanded), [expanded]);

  const focusRow = (href: string) => {
    requestAnimationFrame(() => rowRefs.current.get(href)?.focus({ preventScroll: true }));
  };

  const toggleFolder = (href: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  const activateNode = (node: ExplorerNode) => {
    if (node.kind === "folder" && !expanded.has(node.href)) {
      toggleFolder(node.href);
      return;
    }

    restoreFocusAfterNavigation.current = true;
    router.push(node.href);
  };

  const moveCursor = (offset: number) => {
    const currentIndex = Math.max(
      0,
      visibleNodes.findIndex(({ node }) => node.href === cursorHref),
    );
    const nextIndex = Math.max(0, Math.min(currentIndex + offset, visibleNodes.length - 1));
    const nextHref = visibleNodes[nextIndex].node.href;
    setCursorHref(nextHref);
    focusRow(nextHref);
  };

  useEffect(() => {
    if (!open || focusRequest === 0) return;
    focusRow(explorerTree[0].href);
  }, [focusRequest, open]);

  useEffect(() => {
    if (!open || !restoreFocusAfterNavigation.current) return;
    restoreFocusAfterNavigation.current = false;
    focusRow(cursorHref);
  }, [cursorHref, open, pathname]);

  return (
    <aside
      className={`explorer ${open ? "is-open" : ""}`}
      aria-label="Explorer"
      aria-hidden={!open}
    >
      <div className="explorer-heading">
        <span>EXPLORER</span>
        <button onClick={onClose} aria-label="Close explorer">
          󰅖
        </button>
      </div>
      <div className="tree-label"> PORTFOLIO</div>
      <nav
        role="tree"
        aria-label="Portfolio files"
        data-explorer-tree
        onKeyDown={(event) => {
          if (event.key === "j" || event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            moveCursor(1);
          } else if (event.key === "k" || event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
            moveCursor(-1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const current = visibleNodes.find(({ node }) => node.href === cursorHref);
            if (current) activateNode(current.node);
          }
        }}
      >
        {visibleNodes.map(({ node, depth }) => {
          const isFolder = node.kind === "folder";
          const isExpanded = isFolder && expanded.has(node.href);
          const isFocused = cursorHref === node.href;

          return (
            <div
              key={node.href}
              ref={(element) => {
                if (element) rowRefs.current.set(node.href, element);
                else rowRefs.current.delete(node.href);
              }}
              className={`tree-entry ${isFocused ? "is-focused" : ""}`}
              style={{ "--tree-depth": depth } as React.CSSProperties}
              role="treeitem"
              aria-level={depth + 1}
              aria-expanded={isFolder ? isExpanded : undefined}
              aria-selected={isFocused}
              tabIndex={isFocused ? 0 : -1}
              onFocus={() => setCursorHref(node.href)}
              onClick={() => setCursorHref(node.href)}
            >
              {isFolder ? (
                <button
                  className="tree-toggle"
                  tabIndex={-1}
                  onClick={() => toggleFolder(node.href)}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.label}`}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "" : ""}
                </button>
              ) : (
                <span className="tree-spacer" aria-hidden="true" />
              )}

              <Link
                href={node.href}
                tabIndex={-1}
                className={`tree-link ${pathname === node.href ? "active" : ""}`}
                aria-current={pathname === node.href ? "page" : undefined}
                onClick={() => {
                  setCursorHref(node.href);
                  restoreFocusAfterNavigation.current = true;
                }}
              >
                <span
                  className={isFolder ? "tree-folder-icon" : "tree-file-icon"}
                  aria-hidden="true"
                >
                  {isFolder ? (isExpanded ? "󰝰" : "󰉋") : "󰈙"}
                </span>
                <span>{node.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="explorer-foot">j/k move · enter open · space e close</div>
    </aside>
  );
}
