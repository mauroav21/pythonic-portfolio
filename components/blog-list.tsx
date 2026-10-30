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
    <ul className="border-t border-border-strong">
      {posts.map((post, i) => (
        <Reveal key={post.slug} delay={Math.min(i * 0.05, 0.3)}>
          <li className="border-b border-border">
            <Link href={`/blog/${post.slug}`} className="group flex items-start gap-6 py-7">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {formatDate(post.date)} · {post.readingMinutes} min
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                  {post.title}
                </h3>
                {post.description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                ) : null}
                {post.tags.length > 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">{post.tags.join(" · ")}</p>
                ) : null}
              </div>
              <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
            </Link>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
