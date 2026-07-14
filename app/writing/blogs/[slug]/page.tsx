import {
  WritingEntryRoute,
  writingMetadata,
  writingParams,
} from "@/components/content/writing-entry-route";

export const generateStaticParams = () => writingParams("Blog");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return writingMetadata("Blog", (await params).slug);
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  return <WritingEntryRoute category="Blog" slug={(await params).slug} />;
}
