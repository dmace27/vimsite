import type { Project, Writing } from "@/types/site";

export const profile = {
  name: "Daniel Mace",
  role: "Software developer & systems thinker",
  location: "Waterloo, Ontario, Canada",
  email: "hello@danielmace.dev",
  intro: "I build calm, useful software at the intersection of design and engineering.",
  bio: [
    "I am a software developer who cares about the details people feel: fast feedback, clear language, and interfaces that stay out of the way.",
    "My work moves between product engineering, design systems, and developer tooling. Away from the keyboard, I read, write, and keep a running list of questions worth exploring.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Email", href: "mailto:hello@danielmace.dev" },
  ],
};

export const writingSections = [
  {
    label: "essays",
    href: "/writing/essays",
    category: "Essay",
    description: "Longer thoughts, slowly formed",
  },
  {
    label: "blogs",
    href: "/writing/blogs",
    category: "Blog",
    description: "Notes from work in progress",
  },
  {
    label: "notes",
    href: "/writing/notes",
    category: "Note",
    description: "Small observations and implementation notes",
  },
] as const;

export const projects: Project[] = [
  {
    slug: "northstar",
    title: "Northstar",
    summary:
      "A focused workspace that turns scattered product signals into clear weekly decisions.",
    stack: ["Next.js", "TypeScript", "Postgres"],
    year: "2026",
    status: "Building",
    body: [
      "Northstar turns scattered qualitative and quantitative product signals into a focused weekly brief.",
      "The design emphasizes traceability: every decision can be followed back to the evidence that shaped it.",
    ],
  },
  {
    slug: "patchwork",
    title: "Patchwork",
    summary:
      "Composable tools for documenting and evolving a design system without slowing teams down.",
    stack: ["React", "Storybook", "Tokens"],
    year: "2025",
    status: "Shipped",
    body: [
      "Patchwork gives product teams a shared vocabulary for documenting components, tokens, and interface decisions.",
      "Its composable workflow keeps the system useful without turning contribution into a bottleneck.",
    ],
  },
  {
    slug: "local-first-notes",
    title: "Local First Notes",
    summary: "An experiment in resilient personal knowledge tools that work beautifully offline.",
    stack: ["TypeScript", "IndexedDB", "CRDT"],
    year: "2025",
    status: "Research",
    body: [
      "Local First Notes explores a resilient writing environment that remains fast and fully useful without a network.",
      "The prototype studies synchronization, conflict resolution, and the feeling of owning your tools and data.",
    ],
  },
];

export const writing: Writing[] = [
  {
    slug: "this-interface-is-a-conversation",
    title: "This interface is a conversation",
    excerpt: "What changes when we design software around continuity, context, and trust?",
    date: "Jun 18, 2026",
    readTime: "6 min",
    category: "Blog",
    body: [
      "Every interface teaches people what kind of relationship they can have with a system.",
      "Continuity, context, and trust are not finishing touches. They are part of the conversation from the first interaction.",
    ],
  },
  {
    slug: "small-tools-sharp-edges",
    title: "Small tools, sharp edges",
    excerpt: "A field note on why narrow software can create unusually deep value.",
    date: "May 04, 2026",
    readTime: "4 min",
    category: "Blog",
    body: [
      "A narrow tool can make stronger promises because its boundaries are visible.",
      "The sharp edge is not hostility; it is a clear opinion about the work the tool exists to support.",
    ],
  },
  {
    slug: "learning-to-leave-the-map-unfinished",
    title: "Learning to leave the map unfinished",
    excerpt: "On expertise, ambiguity, and making room for better questions.",
    date: "Mar 22, 2026",
    readTime: "12 min",
    category: "Essay",
    body: [
      "Expertise often looks like a complete map, but the most useful maps leave room for the territory to surprise us.",
      "An unfinished map can be an invitation to notice ambiguity, ask better questions, and revise what we thought we knew.",
    ],
  },
  {
    slug: "the-quiet-architecture-of-attention",
    title: "The quiet architecture of attention",
    excerpt: "How our tools shape what we notice—and what they quietly erase.",
    date: "Jan 09, 2026",
    readTime: "15 min",
    category: "Essay",
    body: [
      "Tools do more than hold information. They establish a quiet architecture for what reaches our attention.",
      "Designing that architecture responsibly means considering what the interface amplifies, delays, and lets disappear.",
    ],
  },
  {
    slug: "designing-with-local-state",
    title: "Designing with local state",
    excerpt: "A short implementation note on keeping preferences fast, private, and unsurprising.",
    date: "Jul 02, 2026",
    readTime: "2 min",
    category: "Note",
    body: [
      "Device-local preferences should be immediate, legible, and easy to reset.",
      "A small state boundary often produces a calmer experience than introducing an account or remote dependency.",
    ],
  },
  {
    slug: "questions-for-calm-software",
    title: "Questions for calm software",
    excerpt: "Prompts I return to when an interface starts asking too much of the person using it.",
    date: "Jun 11, 2026",
    readTime: "3 min",
    category: "Note",
    body: [
      "What can the interface remember so the person does not have to?",
      "What can disappear until it becomes relevant, and what should remain visible to preserve trust?",
    ],
  },
];

export function getWritingEntryHref(entry: Pick<Writing, "category" | "slug">) {
  const section = writingSections.find(({ category }) => category === entry.category);
  return `${section?.href ?? "/writing"}/${entry.slug}`;
}
