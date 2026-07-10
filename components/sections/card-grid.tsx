import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import type { CardEntry } from "@/data/types";

export function CardGrid({ entries, linkLabel }: { entries: CardEntry[]; linkLabel: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, index) => (
        <Reveal key={entry.title} delay={Math.min(index * 0.05, 0.3)}>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
          >
            <Card className="flex h-full flex-col overflow-hidden p-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
                <Image
                  src={entry.image}
                  alt={entry.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-semibold text-foreground">{entry.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {entry.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-accent">
                  {linkLabel}
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Card>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
