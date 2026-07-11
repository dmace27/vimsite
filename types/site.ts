export type NavItem = { label: string; href: string; shortcut: string; description: string };
export type Project = { title: string; summary: string; stack: string[]; year: string; status: string };
export type Writing = { title: string; excerpt: string; date: string; readTime: string; category: "Blog" | "Essay" };
export type SiteSettings = { contrast: "soft" | "high"; accent: "green" | "blue" | "purple"; reducedMotion: boolean; showHints: boolean };
