import type { Metadata } from "next"; import { WritingBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "Essays" }; export default function Essays() { return <WritingBuffer kind="Essay" />; }
