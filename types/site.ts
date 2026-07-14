export type NavItem = { label: string; href: string; shortcut: string; description: string };
export type Project = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  year: string;
  status: string;
  body: string[];
};
export type Writing = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: "Blog" | "Essay" | "Note";
  body: string[];
};
export type SiteSettings = {
  contrast: "soft" | "high";
  accent: "green" | "blue" | "purple";
  reducedMotion: boolean;
  showHints: boolean;
};
