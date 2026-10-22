import type { CardEntry } from "./types";

/**
 * Comunidades técnicas en las que participas.
 */
export const leadershipPhotos = [
  {
    src: "/images/leadership/auditorio.jpg",
    alt: "Auditorio lleno de estudiantes durante una charla sobre TI, OT y la nube",
    caption: "Charla sobre TI, OT y la nube",
  },
  {
    src: "/images/leadership/impacto.jpg",
    alt: "Mauro presentando sobre el impacto de las competencias de programación",
    caption: "Impacto de la programación competitiva",
  },
  {
    src: "/images/leadership/laboratorio.jpg",
    alt: "Estudiantes en un laboratorio de cómputo durante un taller",
    caption: "Taller en laboratorio de cómputo",
  },
  {
    src: "/images/leadership/grupo.jpg",
    alt: "Foto grupal de estudiantes y organizadores al cierre de un evento",
    caption: "Cierre de evento con la comunidad",
  },
  {
    src: "/images/leadership/escalera.jpg",
    alt: "Foto grupal de la comunidad en la escalinata de un edificio histórico",
    caption: "Encuentro de comunidades en la nube",
  },
  {
    src: "/images/leadership/community-day.jpg",
    alt: "Grupo de estudiantes frente al letrero de AWS Community Day",
    caption: "AWS Community Day",
  },
  {
    src: "/images/leadership/cloud-clubs.jpg",
    alt: "Auditorio lleno con las banderas de Cloud Clubs y sudo",
    caption: "Evento de Cloud Clubs",
  },
  {
    src: "/images/leadership/dinamica.jpg",
    alt: "Dinámica de rifa en el escenario durante un evento de la comunidad",
    caption: "Dinámica en el escenario",
  },
  {
    src: "/images/leadership/videollamada.jpg",
    alt: "Sesión en laboratorio con ponentes conectados por videollamada",
    caption: "Sesión híbrida con ponentes remotos",
  },
  {
    src: "/images/leadership/pasillo.jpg",
    alt: "Foto grupal de la comunidad en el pasillo del campus",
    caption: "Comunidad en el campus",
  },
] as const;

export const communities: CardEntry[] = [
  {
    title: "AWS Student Builder Group at TecNM Saltillo",
    description:
      "Comunidad para estudiantes. Su fin es aprender los fundamentos de la nube y desarrollar proyectos iniciales mediante mentorías y talleres prácticos.",
    image: "/images/communities/6.png",
    url: "https://ejemplo.com/aws-student-builder-group",
  },
  {
    title: "AWS User Group Saltillo",
    description:
      "Comunidad para profesionales. Su fin es el networking, compartir casos de uso reales y discutir mejores prácticas técnicas en entornos de trabajo.",
    image: "/images/communities/7.jpg",
    url: "https://ejemplo.com/aws-user-group-saltillo",
  },
  {
    title: "Club de Programación Competitiva ITS",
    description:
      "Grupo de entrenamiento enfocado en resolver problemas de lógica, algoritmos y estructuras de datos bajo presión para participar en competencias oficiales.",
    image: "/images/communities/8.png",
    url: "https://ejemplo.com/club-programacion-competitiva",
  },
];
