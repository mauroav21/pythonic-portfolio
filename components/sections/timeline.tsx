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
        <h3 className="text-xl font-semibold tracking-tight">{heading}</h3>
      </Reveal>
      <ul className="mt-4 border-t border-border-strong">
        {entries.map((entry, index) => (
          <Reveal key={entry.title + entry.subtitle} delay={Math.min(index * 0.05, 0.3)}>
            <li className="grid gap-3 border-b border-border py-8 md:grid-cols-[10rem_1fr_1.4fr] md:gap-10">
              <div>
                <p className="font-mono text-xs text-accent">{entry.date}</p>
                {entry.location ? (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{entry.location}</p>
                ) : null}
              </div>
              <div>
                <h4 className="text-2xl font-bold tracking-tight">{entry.subtitle}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{entry.title}</p>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
