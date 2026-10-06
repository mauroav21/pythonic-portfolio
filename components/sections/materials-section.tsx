import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { materials } from "@/data/materials";
import { sectionText } from "@/data/site";

export function MaterialsSection() {
  return (
    <Section
      id="writing"
      index="04"
      label="Difusión"
      title="Compartir lo que aprendo."
      description={sectionText.materials}
    >
      <ul className="border-t border-border">
        {materials.map((m, i) => (
          <Reveal key={m.title} delay={Math.min(i * 0.05, 0.3)}>
            <li className="border-b border-border">
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-6 py-8"
              >
                <div>
                  <h3 className="text-3xl font-bold tracking-tighter uppercase transition-colors group-hover:text-accent sm:text-5xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
                <ArrowUpRight className="size-6 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
