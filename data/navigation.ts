import type { NavItem } from "@/types/site";

export const navigation: NavItem[] = [
  { label: "about me", href: "/about", shortcut: "a", description: "The person behind the cursor" },
  { label: "projects", href: "/projects", shortcut: "p", description: "Selected things I have built" },
  { label: "blog", href: "/blog", shortcut: "b", description: "Notes from work in progress" },
  { label: "essays", href: "/essays", shortcut: "e", description: "Longer thoughts, slowly formed" },
  { label: "contact me", href: "/contact", shortcut: "c", description: "Start a conversation" },
  { label: "settings", href: "/settings", shortcut: "s", description: "Make this interface yours" },
  { label: "help", href: "/help", shortcut: "h", description: "Keyboard map and commands" },
];
