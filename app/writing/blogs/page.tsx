import type { Metadata } from "next";
import { WritingBuffer } from "@/components/content/editor-pages";

export const metadata: Metadata = { title: "Blog" };

export default function Blogs() {
  return <WritingBuffer kind="Blog" />;
}
