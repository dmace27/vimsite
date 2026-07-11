import type { Metadata } from "next";
import { HelpBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "Help" };
export default function Help() {
  return <HelpBuffer />;
}
