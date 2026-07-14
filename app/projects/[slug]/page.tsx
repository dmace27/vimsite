import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailBuffer } from "@/components/content/editor-pages";
import { projects } from "@/data/site-content";

export const generateStaticParams = () => projects.map(({ slug }) => ({ slug }));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project ? { title: project.title, description: project.summary } : { title: "Projects" };
}

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <ProjectDetailBuffer project={project} />;
}
