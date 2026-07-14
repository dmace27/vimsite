import type { Metadata } from "next";
import { WritingBuffer } from "@/components/content/editor-pages";

export const metadata: Metadata = { title: "Notes" };

export default function Notes() {
  return <WritingBuffer kind="Note" />;
}
