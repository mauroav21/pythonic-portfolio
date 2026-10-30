import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { BlogList } from "@/components/blog-list";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre la nube, arquitectura y comunidad.",
};

export default function BlogPage() {
  return (
    <Section id="blog" title="Lo que" highlight="escribo" className="pt-32 sm:pt-40">
      <BlogList posts={getPosts()} />
    </Section>
  );
}
