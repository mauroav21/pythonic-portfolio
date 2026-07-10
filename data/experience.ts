import { Briefcase } from "lucide-react";
import type { TimelineEntry } from "./types";

/**
 * Experiencia laboral. Cada elemento representa un puesto o rol
 * profesional. Añade nuevas entradas al inicio del arreglo.
 */
export const experience: TimelineEntry[] = [
  {
    icon: Briefcase,
    title: "SCM Engineer",
    subtitle: "Softtek",
    description:
      "Gestión de configuración de software, administración de control de versiones y automatización de procesos de build y release. Diseño de pipelines de CI/CD para asegurar la integridad y entrega continua del código. Configuración de ambientes y gestión de IaC & CaC.",
    date: "2025 — En Curso",
    location: "Monterrey, México",
  },
];
