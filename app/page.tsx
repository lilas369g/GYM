import type { Metadata } from "next";
import { readContent } from "@/lib/content-store";
import { LandingPage } from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readContent();
  return { title: content.seo.title, description: content.seo.description };
}

export default async function Home() {
  return <LandingPage content={await readContent()} />;
}
