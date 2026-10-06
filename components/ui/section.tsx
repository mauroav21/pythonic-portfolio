import type { ReactNode } from "react";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { cn } from "@/lib/cn";

export function Section({
  id,
  index,
  label,
  title,
  description,
  children,
  className,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 border-t border-border py-20 sm:py-28", className)}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase lg:sticky lg:top-24">
              <span className="text-accent">{index}</span> / {label}
            </p>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="max-w-3xl text-3xl font-bold tracking-tighter text-balance sm:text-5xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </Reveal>
            <div className="mt-14">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
