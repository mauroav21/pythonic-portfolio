import { ExternalLink } from "lucide-react";
import type { TimelineEntry } from "@/data/types";
import { Reveal } from "@/components/ui/reveal";

export function Timeline({
  heading,
  entries,
}: {
  heading: string;
  entries: TimelineEntry[];
}) {
  return (
    <div>
      <Reveal>
        <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
      </Reveal>
      <ol className="mt-6 space-y-6 border-l border-border pl-6">
        {entries.map((entry, index) => {
          const Icon = entry.icon;
          return (
            <Reveal key={entry.title} delay={Math.min(index * 0.05, 0.3)}>
              <li className="relative">
                <span className="absolute top-1 -left-[1.9rem] flex size-8 items-center justify-center rounded-full border border-border bg-surface text-accent">
                  <Icon className="size-4" />
                </span>
                <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:border-border-strong hover:shadow-md">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="font-semibold text-foreground">{entry.title}</h4>
                    <span className="font-mono text-xs text-muted-foreground">
                      {entry.date}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-accent">
                    {entry.subtitle}
                    {entry.location ? (
                      <span className="text-muted-foreground"> · {entry.location}</span>
                    ) : null}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {entry.description}
                  </p>
                  {entry.certificate ? (
                    <a
                      href={entry.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      Ver certificado
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
