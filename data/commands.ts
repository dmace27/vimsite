import { navigation } from "./navigation";
import { projects, writing } from "./site-content";

export const commands = [
  { label: "home", href: "/", detail: "Dashboard" },
  ...navigation.map((item) => ({ label: item.label, href: item.href, detail: item.description })),
];
export const searchItems = [
  ...commands,
  ...projects.map((item) => ({ label: item.title, href: "/projects", detail: item.summary })),
  ...writing.map((item) => ({
    label: item.title,
    href: item.category === "Blog" ? "/blog" : "/essays",
    detail: item.excerpt,
  })),
];
