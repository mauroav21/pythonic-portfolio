import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/data/projects";
import { sectionText } from "@/data/site";

export function ProjectsSection() {
  return (
    <Section
      id="work"
      index="02"
      label="Proyectos"
      title="Trabajo seleccionado"
      description={sectionText.projects}
    >
      <ul className="border-t border-border">
        {projects.map((project, index) => (
          <Reveal key={project.title} delay={Math.min(index * 0.05, 0.3)}>
            <li className="border-b border-border">
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-6 py-8 sm:grid-cols-[10rem_1fr_auto] sm:items-center"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(min-width: 640px) 10rem, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tighter uppercase transition-colors group-hover:text-accent sm:text-5xl">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">{project.subtitle}</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
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
