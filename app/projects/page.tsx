import type { Metadata } from "next"; import { ProjectsBuffer } from "@/components/content/editor-pages";
export const metadata: Metadata = { title: "Projects" }; export default function Projects() { return <ProjectsBuffer />; }
