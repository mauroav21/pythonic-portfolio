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
        <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {heading}
        </h3>
      </Reveal>
      <ul className="mt-4 border-t border-border">
        {entries.map((entry, index) => (
          <Reveal key={entry.title + entry.subtitle} delay={Math.min(index * 0.05, 0.3)}>
            <li className="grid gap-2 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
              <span className="font-mono text-xs text-muted-foreground sm:pt-1">{entry.date}</span>
              <div>
                <h4 className="text-lg font-semibold tracking-tight">{entry.title}</h4>
                <p className="text-sm font-medium text-accent">
                  {entry.subtitle}
                  {entry.location ? (
                    <span className="text-muted-foreground"> · {entry.location}</span>
                  ) : null}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
        ))}
      </ul>
    </div>
  );
}
