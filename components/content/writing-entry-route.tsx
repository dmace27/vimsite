import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WritingDetailBuffer } from "@/components/content/editor-pages";
import { writing } from "@/data/site-content";
import type { Writing } from "@/types/site";

export function writingParams(category: Writing["category"]) {
  return writing.filter((entry) => entry.category === category).map(({ slug }) => ({ slug }));
}

export function findWritingEntry(category: Writing["category"], slug: string) {
  return writing.find((entry) => entry.category === category && entry.slug === slug);
}

export function writingMetadata(category: Writing["category"], slug: string): Metadata {
  const entry = findWritingEntry(category, slug);
  return entry ? { title: entry.title, description: entry.excerpt } : { title: "Writing" };
}

export function WritingEntryRoute({
  category,
  slug,
}: {
  category: Writing["category"];
  slug: string;
}) {
  const entry = findWritingEntry(category, slug);
  if (!entry) notFound();
  return <WritingDetailBuffer entry={entry} />;
}
