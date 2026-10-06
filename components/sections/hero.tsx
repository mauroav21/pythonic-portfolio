"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { site } from "@/data/site";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const hl = "text-accent";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      <div
        className="absolute inset-y-0 right-0 aspect-square h-full opacity-80 dark:opacity-40 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_60%),linear-gradient(to_bottom,black_75%,transparent)] [-webkit-mask-composite:source-in] lg:opacity-100 lg:dark:opacity-60"
        aria-hidden="true"
      >
        <Image
          src={site.avatarPath}
          alt=""
          fill
          priority
          sizes="100vh"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent dark:via-background/60 dark:to-accent/10"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-40 right-0 size-[40rem] rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
      <div className="relative w-full px-6 pt-32 pb-24 sm:px-8 lg:pl-[18rem]">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
        >
          Hola, soy {site.name}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="mt-8 max-w-3xl text-4xl leading-[1.15] font-bold tracking-tight text-muted-foreground sm:text-5xl"
        >
          Ingeniero <span className={hl}>cloud y DevOps</span>, cofundador de{" "}
          <span className={hl}>Zikit</span> y líder de <span className={hl}>comunidades</span>.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.25}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          Construyo infraestructura escalable y productos web, y dedico parte de mi tiempo a que
          más personas aprendan, conecten y crezcan en tecnología.
        </motion.p>

        <motion.a
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
          href="#experience"
          className="mt-14 inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
        >
          Ver trayectoria <ArrowDown className="size-4" />
        </motion.a>
      </div>
    </section>
  );
}
