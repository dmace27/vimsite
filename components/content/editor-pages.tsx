import { EditorBuffer, FileLink, Tok, type BufferLine } from "@/components/editor-buffer";
import {
  getWritingEntryHref,
  profile,
  projects,
  writing,
  writingSections,
} from "@/data/site-content";
import type { Project, Writing } from "@/types/site";

const frame = (name: string, body: BufferLine[]): BufferLine[] => [
  {
    content: (
      <Tok kind="comment">--- {name}.md ─────────────────────────────────────────────────</Tok>
    ),
  },
  {},
  ...body,
  {},
  {},
  {},
  {},
  {},
];

export function AboutBuffer() {
  return (
    <EditorBuffer
      lines={frame("about", [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">About me</Tok>
            </>
          ),
          className: "title-line",
        },
        { content: <Tok kind="comment">&lt;!-- the person behind the cursor --&gt;</Tok> },
        {},
        ...profile.bio.flatMap((p) => [{ content: p }, {}]),
        { content: <Tok kind="keyword">## Current context</Tok> },
        {},
        {
          content: (
            <>
              <Tok kind="type">location</Tok> ={" "}
              <Tok kind="string">&quot;{profile.location}&quot;</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">focus</Tok> ={" "}
              <Tok kind="string">&quot;thoughtful web products&quot;</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">interests</Tok> = [<Tok kind="string">&quot;tools&quot;</Tok>,{" "}
              <Tok kind="string">&quot;systems&quot;</Tok>,{" "}
              <Tok kind="string">&quot;writing&quot;</Tok>]
            </>
          ),
          indent: 1,
        },
      ])}
    />
  );
}

export function ProjectsBuffer() {
  const body: BufferLine[] = [
    {
      content: (
        <>
          <Tok kind="keyword">#</Tok> <Tok kind="heading">Selected projects</Tok>
        </>
      ),
      className: "title-line",
    },
    { content: <Tok kind="comment">&lt;!-- products, systems, and useful experiments --&gt;</Tok> },
    {},
  ];
  projects.forEach((p, i) =>
    body.push(
      {
        content: (
          <>
            <Tok kind="keyword">##</Tok>{" "}
            <FileLink href={`/projects/${p.slug}`}>
              {String(i + 1).padStart(2, "0")}. {p.title}
            </FileLink>{" "}
            <Tok kind="muted">[{p.year}]</Tok>
          </>
        ),
      },
      {
        content: (
          <>
            <Tok kind="type">status:</Tok> <Tok kind="string">{p.status}</Tok>
          </>
        ),
        indent: 1,
      },
      { content: p.summary, indent: 1 },
      {
        content: (
          <>
            <Tok kind="type">stack:</Tok> {p.stack.join(" · ")}
          </>
        ),
        indent: 1,
      },
      {},
    ),
  );
  return <EditorBuffer lines={frame("projects", body)} />;
}

export function WritingIndexBuffer() {
  const body: BufferLine[] = [
    {
      content: (
        <>
          <Tok kind="keyword">#</Tok> <Tok kind="heading">Writing</Tok>
        </>
      ),
      className: "title-line",
    },
    { content: <Tok kind="comment">&lt;!-- essays, blog posts, and working notes --&gt;</Tok> },
    {},
  ];

  writingSections.forEach((section) =>
    body.push(
      {
        content: (
          <>
            <Tok kind="keyword">󰝰</Tok> <FileLink href={section.href}>{section.label}/</FileLink>
          </>
        ),
      },
      { content: section.description, indent: 1 },
      {},
    ),
  );

  return <EditorBuffer lines={frame("writing", body)} />;
}

const writingHeadings: Record<Writing["category"], string> = {
  Blog: "Working notes",
  Essay: "Longer thoughts",
  Note: "Notes",
};

export function WritingBuffer({ kind }: { kind: Writing["category"] }) {
  const section = writingSections.find(({ category }) => category === kind);
  const name = section?.label ?? "writing";
  const body: BufferLine[] = [
    {
      content: (
        <>
          <Tok kind="keyword">#</Tok> <Tok kind="heading">{writingHeadings[kind]}</Tok>
        </>
      ),
      className: "title-line",
    },
    {
      content: <Tok kind="comment">&lt;!-- {section?.description.toLowerCase()} --&gt;</Tok>,
    },
    {},
  ];
  writing
    .filter((w) => w.category === kind)
    .forEach((w) =>
      body.push(
        {
          content: (
            <>
              <Tok kind="keyword">##</Tok>{" "}
              <FileLink href={getWritingEntryHref(w)}>{w.title}</FileLink>
            </>
          ),
        },
        {
          content: (
            <Tok kind="muted">
              {w.date} · {w.readTime}
            </Tok>
          ),
          indent: 1,
        },
        { content: w.excerpt, indent: 1 },
        {},
      ),
    );
  return <EditorBuffer lines={frame(`writing/${name}`, body)} />;
}

export function ProjectDetailBuffer({ project }: { project: Project }) {
  return (
    <EditorBuffer
      lines={frame(`projects/${project.slug}`, [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">{project.title}</Tok>
            </>
          ),
          className: "title-line",
        },
        {
          content: (
            <Tok kind="comment">
              &lt;!-- {project.status.toLowerCase()} · {project.year} --&gt;
            </Tok>
          ),
        },
        {},
        ...project.body.flatMap((paragraph) => [{ content: paragraph }, {}]),
        {
          content: (
            <>
              <Tok kind="type">stack</Tok> = [
              {project.stack.map((item, index) => (
                <span key={item}>
                  <Tok kind="string">&quot;{item}&quot;</Tok>
                  {index < project.stack.length - 1 ? ", " : ""}
                </span>
              ))}
              ]
            </>
          ),
        },
      ])}
    />
  );
}

export function WritingDetailBuffer({ entry }: { entry: Writing }) {
  return (
    <EditorBuffer
      lines={frame(`${getWritingEntryHref(entry).slice(1)}`, [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">{entry.title}</Tok>
            </>
          ),
          className: "title-line",
        },
        {
          content: (
            <Tok kind="comment">
              &lt;!-- {entry.category.toLowerCase()} · {entry.date} · {entry.readTime} --&gt;
            </Tok>
          ),
        },
        {},
        ...entry.body.flatMap((paragraph) => [{ content: paragraph }, {}]),
      ])}
    />
  );
}

export function ContactBuffer() {
  return (
    <EditorBuffer
      lines={frame("contact", [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">Let&apos;s make contact</Tok>
            </>
          ),
          className: "title-line",
        },
        {
          content: (
            <Tok kind="comment">
              &lt;!-- questions, collaborations, and good reading recommendations --&gt;
            </Tok>
          ),
        },
        {},
        { content: "The best conversations start with a specific question," },
        { content: "a half-formed idea, or something worth making better." },
        {},
        {
          content: (
            <>
              <Tok kind="type">email</Tok> ={" "}
              <a className="buffer-link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </>
          ),
          indent: 1,
        },
        ...profile.socials
          .filter((s) => s.label !== "Email")
          .map((s) => ({
            content: (
              <>
                <Tok kind="type">{s.label.toLowerCase()}</Tok> ={" "}
                <a className="buffer-link" href={s.href} target="_blank" rel="noreferrer">
                  {s.href}
                </a>
              </>
            ),
            indent: 1,
          })),
        {},
        {
          content: <Tok kind="comment">-- No forms, tracking, or stored data. Just email. --</Tok>,
        },
      ])}
    />
  );
}

export function HelpBuffer() {
  return (
    <EditorBuffer
      lines={frame("help", [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">LazyVim portfolio help</Tok>
            </>
          ),
          className: "title-line",
        },
        {},
        { content: <Tok kind="keyword">## Movement</Tok> },
        {
          content: (
            <>
              <Tok kind="type">j</Tok> move down one line
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">k</Tok> move up one line
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">gg</Tok> jump to first line
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">G</Tok> jump to last line
            </>
          ),
          indent: 1,
        },
        {},
        { content: <Tok kind="keyword">## Search</Tok> },
        {
          content: (
            <>
              <Tok kind="type">/text</Tok> search current buffer
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">n</Tok> next matching line
            </>
          ),
          indent: 1,
        },
        {},
        { content: <Tok kind="keyword">## Windows</Tok> },
        {
          content: (
            <>
              <Tok kind="type">space e</Tok> toggle explorer
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">:</Tok> open command line
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">Esc</Tok> close prompt / window
            </>
          ),
          indent: 1,
        },
        {},
      ])}
    />
  );
}

export function SettingsBuffer() {
  return (
    <EditorBuffer
      lines={frame("settings", [
        {
          content: (
            <>
              <Tok kind="keyword">#</Tok> <Tok kind="heading">Settings</Tok>
            </>
          ),
          className: "title-line",
        },
        {
          content: (
            <Tok kind="comment">&lt;!-- editor settings are intentionally opinionated --&gt;</Tok>
          ),
        },
        {},
        {
          content: (
            <>
              <Tok kind="type">vim.opt</Tok>.number = <Tok kind="keyword">true</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">vim.opt</Tok>.relativenumber = <Tok kind="keyword">true</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">vim.opt</Tok>.cursorline = <Tok kind="keyword">true</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">vim.g</Tok>.colors_name ={" "}
              <Tok kind="string">&quot;tokyonight-night&quot;</Tok>
            </>
          ),
          indent: 1,
        },
        {
          content: (
            <>
              <Tok kind="type">vim.opt</Tok>.fileencoding ={" "}
              <Tok kind="string">&quot;utf-8&quot;</Tok>
            </>
          ),
          indent: 1,
        },
        {},
        {
          content: (
            <Tok kind="comment">-- Tip: use your browser zoom to tune editor density. --</Tok>
          ),
        },
      ])}
    />
  );
}
