import type { ReactNode } from "react";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { cn } from "@/lib/cn";

export function SectionTitle({
  title,
  highlight,
  className,
}: {
  title: string;
  highlight: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "max-w-3xl text-3xl font-bold tracking-tighter text-balance text-muted-foreground sm:text-5xl",
        className
      )}
    >
      {title} <span className="text-accent">{highlight}</span>
    </h2>
  );
}

export function Section({
  id,
  title,
  highlight,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  highlight: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 py-20 sm:py-28", className)}>
      <Container>
        <Reveal>
          <SectionTitle title={title} highlight={highlight} />
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </Reveal>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}
