import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/data/projects";

export function ProjectsSection() {
  return (
    <Section id="work" title="Lo que" highlight="construyo">
      <ul className="border-t border-border-strong">
        {projects.map((project, index) => (
          <Reveal key={project.title} delay={Math.min(index * 0.05, 0.3)}>
            <li className="border-b border-border">
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-4 py-7 lg:grid-cols-[2.5rem_minmax(0,18rem)_1fr_12rem_1.5rem] lg:items-center lg:gap-8"
              >
                <span className="hidden font-mono text-xs text-muted-foreground lg:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-accent">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{project.subtitle}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  {project.technologies.join(" · ")}
                </p>
                <ArrowUpRight className="hidden size-5 text-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent lg:block" />
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
