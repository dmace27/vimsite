import type { Metadata } from "next";
import { WritingIndexBuffer } from "@/components/content/editor-pages";

export const metadata: Metadata = { title: "Writing" };

export default function Writing() {
  return <WritingIndexBuffer />;
}
