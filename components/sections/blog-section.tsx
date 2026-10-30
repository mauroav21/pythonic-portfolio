import Link from "next/link";
import { Section } from "@/components/ui/section";
import { BlogList } from "@/components/blog-list";
import { getPosts } from "@/lib/blog";

const LATEST = 3;

export function BlogSection() {
  const posts = getPosts();

  return (
    <Section
      id="blog"
      title="Lo que"
      highlight="escribo"
      description="Notas sobre la nube, arquitectura y lo que voy aprendiendo en comunidad."
    >
      <BlogList posts={posts.slice(0, LATEST)} />
      {posts.length > LATEST ? (
        <Link
          href="/blog"
          className="mt-8 inline-block text-sm font-bold text-accent hover:underline"
        >
          Ver todos los artículos →
        </Link>
      ) : null}
    </Section>
  );
}
