import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { formatDate, type Post } from "@/lib/blog";

const PALETTE: [string, string][] = [
  ["#0b3a6b", "#2997ff"],
  ["#3a1f5c", "#b46bff"],
  ["#0f4b3a", "#2fd6a0"],
  ["#5c2b12", "#ff8a3d"],
  ["#4a1230", "#ff5c9a"],
  ["#2a3f0f", "#b5e04a"],
];

function colorFor(tag = "") {
  let h = 0;
  for (const ch of tag) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function cover(post: Post) {
  const [from, to] = colorFor(post.tags[0]);
  return { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` };
}

function Badge({ post }: { post: Post }) {
  const [, to] = colorFor(post.tags[0]);
  if (!post.tags[0]) return null;
  return (
    <span
      className="inline-block rounded-sm px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#0a0d14] uppercase"
      style={{ backgroundColor: to }}
    >
      {post.tags[0]}
    </span>
  );
}

function SectionHeader({ children, centered }: { children: string; centered?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {centered ? <span className="h-0.5 flex-1 bg-accent" /> : null}
      <h2 className="text-xl font-bold tracking-tight">{children}</h2>
      <span className={centered ? "h-0.5 flex-1 bg-accent" : "h-px flex-1 bg-border-strong"} />
    </div>
  );
}

export function BlogIndex({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-muted-foreground">Todavía no hay artículos publicados. Vuelve pronto.</p>;
  }

  const [featured, ...rest] = posts;
  const topics = Object.entries(
    posts.flatMap((p) => p.tags).reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-8">
        <SectionHeader centered>Lo último</SectionHeader>

        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative flex min-h-80 flex-col justify-end gap-3 overflow-hidden rounded-md p-6 sm:min-h-96 sm:p-8"
            style={cover(featured)}
          >
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative">
              <Badge post={featured} />
              <h3 className="mt-3 max-w-xl text-2xl leading-tight font-bold tracking-tight text-white text-balance transition-opacity group-hover:opacity-90 sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-3 text-sm text-white/80">
                {formatDate(featured.date)} · {featured.readingMinutes} min de lectura
              </p>
            </div>
          </Link>
        </Reveal>

        <SectionHeader>Mira esto</SectionHeader>

        <ul className="divide-y divide-border">
          {rest.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 py-6 sm:flex-row sm:gap-6"
              >
                <div
                  className="flex h-40 shrink-0 items-start rounded-md p-3 sm:h-36 sm:w-56"
                  style={cover(post)}
                >
                  <Badge post={post} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl leading-snug font-semibold tracking-tight text-balance transition-colors group-hover:text-accent sm:text-2xl">
                    {post.title}
                  </h3>
                  {post.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(post.date)} · {post.readingMinutes} min
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4">
          <SectionHeader>Temas</SectionHeader>
          <ul>
            {topics.map(([tag, n]) => (
              <li key={tag} className="flex items-center gap-3 border-b border-border py-2.5 text-sm">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: colorFor(tag)[1] }}
                />
                <span className="flex-1 text-muted-foreground">{tag}</span>
                <span className="text-xs text-muted-foreground">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <SectionHeader>También reciente</SectionHeader>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5">
            {posts.slice(1, 5).map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block space-y-2">
                  <div className="flex h-20 items-start rounded-md p-2" style={cover(post)}>
                    <Badge post={post} />
                  </div>
                  <p className="line-clamp-3 text-sm leading-snug font-semibold transition-colors group-hover:text-accent">
                    {post.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
