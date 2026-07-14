import {
  WritingEntryRoute,
  writingMetadata,
  writingParams,
} from "@/components/content/writing-entry-route";

export const generateStaticParams = () => writingParams("Note");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return writingMetadata("Note", (await params).slug);
}

export default async function Note({ params }: { params: Promise<{ slug: string }> }) {
  return <WritingEntryRoute category="Note" slug={(await params).slug} />;
}
