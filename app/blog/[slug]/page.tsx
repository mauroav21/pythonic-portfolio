import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { Container } from "@/components/ui/container";
import { formatDate, getPost, getPosts } from "@/lib/blog";

type Params = { slug: string };

const prose = [
  "mt-10 space-y-5 leading-relaxed",
  "[&_a]:text-accent [&_a]:underline",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight",
  "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5",
  "[&_img]:w-full",
].join(" ");

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <Container className="max-w-3xl lg:px-8 xl:px-8">
        <Link href="/blog" className="text-sm font-bold text-accent hover:underline">
          ← Blog
        </Link>
        <p className="mt-8 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {formatDate(post.date)} · {post.readingMinutes} min
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tighter text-balance sm:text-5xl">
          {post.title}
        </h1>
        {post.tags.length > 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{post.tags.join(" · ")}</p>
        ) : null}

        <div className={prose}>
          <Markdown>{post.content}</Markdown>
        </div>
      </Container>
    </article>
  );
}
