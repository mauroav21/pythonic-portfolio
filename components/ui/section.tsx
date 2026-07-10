import type { ReactNode } from "react";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { cn } from "@/lib/cn";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
      <Container>
        <Reveal className="max-w-2xl">
          <p className="font-mono text-sm font-medium tracking-wide text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          ) : null}
        </Reveal>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}
