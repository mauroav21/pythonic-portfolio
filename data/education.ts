import { GraduationCap } from "lucide-react";
import type { TimelineEntry } from "./types";

/**
 * Formación académica. Añade nuevas entradas al inicio del arreglo.
 */
export const education: TimelineEntry[] = [
  {
    icon: GraduationCap,
    title: "Ingeniería en Sistemas Computacionales",
    subtitle: "TecNM Saltillo",
    description:
      "Formación en desarrollo de software, algoritmos, arquitectura de sistemas y gestión de desarrollo de software, combinada con el diseño de infraestructura en la nube y automatización de procesos para el ciclo de vida del software.",
    date: "2021 — 2027",
    location: "Saltillo, México",
  },
];
