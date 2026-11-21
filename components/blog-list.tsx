import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { formatDate, type Post } from "@/lib/blog";

export function BlogList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="border-y border-border py-10 text-muted-foreground">
        Todavía no hay artículos publicados. Vuelve pronto.
      </p>
    );
  }

  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 [&>li]:h-full">
      {posts.map((post, i) => (
        <li key={post.slug}>
          <Reveal delay={Math.min(i * 0.05, 0.3)} className="h-full">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col border-t-2 border-border-strong pt-5 transition-colors hover:border-accent"
            >
              {post.tags.length > 0 ? (
                <p className="text-xs font-bold tracking-wider text-accent uppercase">
                  {post.tags[0]}
                </p>
              ) : null}
              <h3 className="mt-3 text-xl leading-snug font-bold tracking-tight text-balance transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              {post.description ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              ) : null}
              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                <span>
                  {formatDate(post.date)} · {post.readingMinutes} min
                </span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
