import type { Metadata } from "next";
import { SettingsBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "Settings" };
export default function Settings() {
  return <SettingsBuffer />;
}
