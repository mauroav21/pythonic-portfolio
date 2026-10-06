import { Mail, FileText } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { TbBrandLinkedin } from "react-icons/tb";
import { site } from "@/data/site";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-border py-24 sm:py-32">
      <Container>
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">05</span> / Contacto
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-bold tracking-tighter text-balance uppercase sm:text-6xl lg:text-8xl">
            Hablemos.
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block text-xl text-accent underline-offset-4 hover:underline sm:text-2xl"
          >
            {site.email}
          </a>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={site.linkedin} external variant="primary">
              <TbBrandLinkedin className="size-4" /> LinkedIn
            </Button>
            <Button href={site.github} external variant="secondary">
              <SiGithub className="size-4" /> GitHub
            </Button>
            <Button href={`mailto:${site.email}`} external variant="secondary">
              <Mail className="size-4" /> Email
            </Button>
            <Button href={site.cvPath} external variant="ghost">
              <FileText className="size-4" /> CV
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
