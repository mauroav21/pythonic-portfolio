import type { CardEntry } from "./types";

/**
 * Conferencias y charlas que has presentado.
 */
export const talks = [
  { title: "ARQ 101", subtitle: "Diseño de Arquitecturas en la Nube" },
  { title: "Serverless 101", subtitle: "Introducción a la infraestructura Serverless" },
  { title: "Disrupción Digital", subtitle: "Construyendo en una nueva era" },
  { title: "Keep Building Together", subtitle: "The Power of Community" },
  {
    title: "Automatización de Pruebas 101",
    subtitle: "Conociendo el mundo de las pruebas automatizadas",
  },
  { title: "Evolve", subtitle: "La importancia de seguir aprendiendo" },
  { title: "WWW", subtitle: "Internet, una historia en desarrollo" },
  { title: "Cloud", subtitle: "De la promesa a la implementación" },
  { title: "El Mahut y el Elefante", subtitle: "La ilusión de tener el control" },
] as const;

/**
 * Artículos, charlas y material educativo que has creado.
 */
export const materials: CardEntry[] = [
  {
    title: "AWS Builder Center",
    description:
      "Artículos sobre la nube, mejores prácticas y guías para desarrolladores interesados en el ecosistema de AWS.",
    image: "/images/materials/material.jpg",
    url: "https://builder.aws.com/community/@mauroav?tab=articles",
  },
  {
    title: "Dev.to",
    description:
      "Artículos sobre desarrollo de software, tecnologías y experiencias personales en el mundo de la programación.",
    image: "/images/materials/material.jpg",
    url: "https://dev.to/mauroavdev",
  },
];
