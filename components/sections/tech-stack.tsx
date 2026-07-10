"use client";

import { motion } from "framer-motion";
import { technologies } from "@/data/technologies";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function TechStack() {
  return (
    <section id="stack" className="scroll-mt-20 border-y border-border bg-surface-muted/50 py-14">
      <Container>
        <Reveal>
          <p className="mb-6 font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Tecnologías
          </p>
        </Reveal>
        <motion.ul
          className="flex flex-wrap gap-3"
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {technologies.map(({ name, icon: Icon }) => (
            <motion.li
              key={name}
              variants={item}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md"
            >
              <Icon className="size-4" />
              {name}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
