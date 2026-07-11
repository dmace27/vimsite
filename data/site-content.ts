import type { Project, Writing } from "@/types/site";

export const profile = {
  name: "Daniel Mace",
  role: "Software developer & systems thinker",
  location: "New York, USA",
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

export const projects: Project[] = [
  { title: "Northstar", summary: "A focused workspace that turns scattered product signals into clear weekly decisions.", stack: ["Next.js", "TypeScript", "Postgres"], year: "2026", status: "Building" },
  { title: "Patchwork", summary: "Composable tools for documenting and evolving a design system without slowing teams down.", stack: ["React", "Storybook", "Tokens"], year: "2025", status: "Shipped" },
  { title: "Local First Notes", summary: "An experiment in resilient personal knowledge tools that work beautifully offline.", stack: ["TypeScript", "IndexedDB", "CRDT"], year: "2025", status: "Research" },
];

export const writing: Writing[] = [
  { title: "The interface is a conversation", excerpt: "What changes when we design software around continuity, context, and trust?", date: "Jun 18, 2026", readTime: "6 min", category: "Blog" },
  { title: "Small tools, sharp edges", excerpt: "A field note on why narrow software can create unusually deep value.", date: "May 04, 2026", readTime: "4 min", category: "Blog" },
  { title: "Learning to leave the map unfinished", excerpt: "On expertise, ambiguity, and making room for better questions.", date: "Mar 22, 2026", readTime: "12 min", category: "Essay" },
  { title: "The quiet architecture of attention", excerpt: "How our tools shape what we notice—and what they quietly erase.", date: "Jan 09, 2026", readTime: "15 min", category: "Essay" },
];
