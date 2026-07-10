import Image from "next/image";
import { SiGithub } from "react-icons/si";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/data/projects";
import { sectionText } from "@/data/site";

export function ProjectsSection() {
  return (
    <Section
      id="projects"
      eyebrow="Trabajo"
      title="Proyectos"
      description={sectionText.projects}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal key={project.title} delay={Math.min(index * 0.05, 0.3)}>
            <Card className="flex h-full flex-col overflow-hidden p-0">
              <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                <p className="mt-0.5 text-sm font-medium text-accent">
                  {project.subtitle}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent"
                >
                  <SiGithub className="size-4" />
                  Ver repositorio
                </a>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
