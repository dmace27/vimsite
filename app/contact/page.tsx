import type { Metadata } from "next";
import { ContactBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() {
  return <ContactBuffer />;
}
