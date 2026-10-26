import { site } from "@/data/site";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const links = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "GitHub", value: "github.com/mauroav21", href: site.github },
  { label: "LinkedIn", value: "linkedin.com/in/mauroav", href: site.linkedin },
  { label: "CV", value: "Descargar PDF", href: site.cvPath },
];

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-16 bg-surface py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2 className="max-w-4xl text-5xl font-bold tracking-tighter text-balance text-muted-foreground sm:text-7xl lg:text-8xl">
            Construyamos algo <span className="text-accent">juntos</span>
          </h2>
          <ul className="mt-16 grid border-t border-border-strong sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link) => (
              <li
                key={link.label}
                className="border-b border-border py-6 sm:pr-6 lg:border-b-0 lg:border-l lg:border-border lg:px-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <a
                  href={link.href}
                  target={link.label === "Email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <p className="text-xs text-muted-foreground">{link.label}</p>
                  <p className="mt-2 text-base font-semibold transition-colors group-hover:text-accent lg:text-[0.95rem]">
                    {link.value}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
