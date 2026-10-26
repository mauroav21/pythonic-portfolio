import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionTitle } from "@/components/ui/section";
import { talks } from "@/data/materials";

export function TalksSection() {
  return (
    <section id="talks" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
          <Reveal>
            <SectionTitle title="Conferencias" highlight="y charlas" className="max-w-xs" />
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Nueve charlas sobre nube, serverless, pruebas automatizadas, comunidad y aprendizaje
              continuo.
            </p>
          </Reveal>
          <ol className="border-t border-border-strong">
            {talks.map((talk, i) => (
              <Reveal key={talk.title} delay={Math.min(i * 0.04, 0.3)}>
                <li className="grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-border py-4 sm:grid-cols-[2rem_18rem_1fr] sm:gap-x-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-bold tracking-tight">{talk.title}</span>
                  <span className="col-start-2 text-sm text-muted-foreground sm:col-start-auto">
                    {talk.subtitle}
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
