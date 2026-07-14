import {
  WritingEntryRoute,
  writingMetadata,
  writingParams,
} from "@/components/content/writing-entry-route";

export const generateStaticParams = () => writingParams("Essay");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return writingMetadata("Essay", (await params).slug);
}

export default async function Essay({ params }: { params: Promise<{ slug: string }> }) {
  return <WritingEntryRoute category="Essay" slug={(await params).slug} />;
}
