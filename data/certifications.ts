import { ScrollText } from "lucide-react";
import type { TimelineEntry } from "./types";

/**
 * Certificaciones y cursos. Añade nuevas entradas al inicio del arreglo.
 */
export const certifications: TimelineEntry[] = [
  {
    icon: ScrollText,
    title: "AWS Cloud Practitioner",
    subtitle: "Certificación expedida por AWS",
    description:
      "Acreditación base que valida el dominio de conceptos fundamentales, seguridad, servicios y modelos de precios dentro del ecosistema de Amazon Web Services (AWS).",
    date: "2026",
    certificate: "https://ejemplo.com/certificado/123456",
  },
];
