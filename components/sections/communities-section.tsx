import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { communities } from "@/data/communities";
import { leadership } from "@/data/site";

export function CommunitiesSection() {
  return (
    <Section
      id="leadership"
      index="03"
      label="Liderazgo"
      title="Liderazgo de comunidades"
      description={leadership.statement}
    >
      <div className="grid gap-8 sm:grid-cols-3">
        {leadership.principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
          </Reveal>
        ))}
      </div>

      <ul className="mt-16 border-t border-border">
        {communities.map((c, i) => (
          <Reveal key={c.title} delay={Math.min(i * 0.05, 0.3)}>
            <li className="border-b border-border">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid items-center gap-6 py-8 sm:grid-cols-[10rem_1fr_auto]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-muted">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(min-width: 640px) 10rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-3xl font-bold tracking-tighter uppercase transition-colors group-hover:text-accent sm:text-5xl">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <ArrowUpRight className="hidden size-6 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent sm:block" />
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
