"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Mail, FileText, MapPin } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { TbBrandLinkedin } from "react-icons/tb";
import { site, aboutText } from "@/data/site";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section
      id="about"
      className="relative flex min-h-[calc(100vh-4rem)] scroll-mt-20 items-center overflow-hidden pt-24 pb-16"
    >
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted-foreground"
            >
              <MapPin className="size-3.5 text-accent" />
              {site.location}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.1}
              className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              {site.greeting}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.2}
              className="mt-4 text-balance text-lg font-medium text-accent sm:text-xl"
            >
              {site.role}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.3}
              className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-muted-foreground"
            >
              {aboutText.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.4}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button href={site.github} external variant="primary">
                <SiGithub className="size-4" />
                GitHub
              </Button>
              <Button href={site.linkedin} external variant="secondary">
                <TbBrandLinkedin className="size-4" />
                LinkedIn
              </Button>
              <Button href={`mailto:${site.email}`} external variant="secondary">
                <Mail className="size-4" />
                Contacto
              </Button>
              <Button href={site.cvPath} external variant="ghost">
                <FileText className="size-4" />
                CV
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.15}
            className="relative mx-auto aspect-square w-full max-w-sm"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent/30 via-accent/5 to-transparent blur-2xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-surface shadow-xl">
              <Image
                src={site.avatarPath}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 1024px) 24rem, 80vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
