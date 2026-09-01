import { Briefcase, Code2, Rocket } from "lucide-react";
import type { TimelineEntry } from "./types";

/**
 * Experiencia laboral. Cada elemento representa un puesto o rol
 * profesional. Añade nuevas entradas al inicio del arreglo.
 */
export const experience: TimelineEntry[] = [
  {
    icon: Rocket,
    title: "Co-founder & CEO",
    subtitle: "Zikit",
    description:
      "Cofundador y CEO de Zikit, liderando la visión de producto, la estrategia técnica y el crecimiento del equipo. Responsable de la arquitectura de la plataforma y de la toma de decisiones de negocio y tecnología.",
    date: "2026 — En Curso",
    location: "Saltillo, México",
  },
  {
    icon: Code2,
    title: "FullStack Developer Engineer",
    subtitle: "Grupo Server",
    description:
      "Desarrollo full-stack de aplicaciones web, desde el diseño de APIs y modelos de datos hasta la implementación de interfaces. Integración de servicios en la nube y automatización de despliegues.",
    date: "2026 — En Curso",
    location: "Saltillo, México",
  },
  {
    icon: Briefcase,
    title: "SCM Engineer",
    subtitle: "Softtek",
    description:
      "Gestión de configuración de software, administración de control de versiones y automatización de procesos de build y release. Diseño de pipelines de CI/CD para asegurar la integridad y entrega continua del código. Configuración de ambientes y gestión de IaC & CaC.",
    date: "2025 — 2026",
    location: "Monterrey, México",
  },
];
