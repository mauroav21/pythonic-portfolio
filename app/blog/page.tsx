import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { BlogIndex } from "@/components/blog-index";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre la nube, arquitectura y comunidad.",
};

export default function BlogPage() {
  return (
    <Section id="blog" title="Lo que" highlight="escribo" className="pt-24 sm:pt-28">
      <BlogIndex posts={getPosts()} />
    </Section>
  );
}
