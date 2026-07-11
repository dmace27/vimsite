import type { Metadata } from "next";
import { AboutBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return <AboutBuffer />;
}
