import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { communities, leadershipPhotos } from "@/data/communities";
import { materials } from "@/data/materials";
import { leadership } from "@/data/site";
import { cn } from "@/lib/cn";

const half = "(min-width: 1024px) 50vw, 100vw";
const quarter = "(min-width: 1024px) 25vw, 50vw";
const third = "(min-width: 1024px) 33vw, 50vw";

const wide = { tile: "col-span-2 lg:col-span-6", height: "lg:h-[380px] xl:h-[500px]", sizes: half };
const row1 = { tile: "lg:col-span-3", height: "lg:h-[380px] xl:h-[500px]", sizes: quarter };
const row2 = { tile: "lg:col-span-3", height: "lg:h-[280px] xl:h-[360px]", sizes: quarter };
const row3 = { tile: "lg:col-span-4", height: "lg:h-[300px] xl:h-[400px]", sizes: third };
const row3Last = { tile: "col-span-2 lg:col-span-4", height: "lg:h-[300px] xl:h-[400px]", sizes: "(min-width: 1024px) 33vw, 100vw" };

const layout = [wide, row1, row1, row2, row2, row2, row2, row3, row3, row3Last];

export function CommunitiesSection() {
  return (
    <Section
      id="leadership"
      title="Comunidades que"
      highlight="crecen"
      description={leadership.statement}
    >
      <div className="grid border-y border-border sm:grid-cols-3">
        {leadership.principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <div className="h-full border-border py-6 sm:px-7 sm:first:pl-0 sm:[&:not(:first-child)]:border-l">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-12">
        {leadershipPhotos.map((photo, i) => (
          <Reveal
            key={photo.src}
            delay={Math.min(i * 0.04, 0.3)}
            className={layout[i].tile}
          >
            <figure>
              <div
                className={cn(
                  "relative h-44 overflow-hidden bg-surface-muted sm:h-56",
                  layout[i].height
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={layout[i].sizes}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">{photo.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_32rem] lg:gap-24">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Comunidades donde participo</h3>
          <ul className="mt-5 border-t border-border-strong">
            {communities.map((c, i) => (
              <Reveal key={c.title} delay={Math.min(i * 0.05, 0.3)}>
                <li className="border-b border-border">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-6 py-6"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden bg-surface-muted">
                      <Image src={c.image} alt="" fill sizes="6rem" className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-accent">
                        {c.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-2xl font-bold tracking-tight">Donde publico mis artículos</h3>
          <ul className="mt-5 border-t border-border-strong">
            {materials.map((m, i) => (
              <Reveal key={m.title} delay={Math.min(i * 0.05, 0.3)}>
                <li className="border-b border-border">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-6"
                  >
                    <div className="relative size-[4.5rem] shrink-0 overflow-hidden bg-surface-muted">
                      <Image src={m.image} alt="" fill sizes="4.5rem" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold tracking-tight transition-colors group-hover:text-accent">
                        {m.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                    <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
