import type { Project } from "./types";

/**
 * Proyectos destacados. Los de abajo son EJEMPLOS — reemplázalos con
 * tus propios proyectos (título, descripción, imagen en /public/images/projects
 * y link al repositorio).
 */
export const projects: Project[] = [
  {
    title: "Sistema de Gestión de Tareas",
    subtitle: "Aplicación Web Full Stack",
    description:
      "Aplicación web para gestión de proyectos y tareas con autenticación de usuarios, asignación de tareas y seguimiento en tiempo real.",
    image: "/images/projects/project.jpeg",
    repo: "https://github.com/mauroav21/task-manager",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
  },
  {
    title: "E-Commerce Platform",
    subtitle: "Tienda en Línea Completa",
    description:
      "Plataforma de comercio electrónico con carrito de compras, pasarela de pagos, gestión de inventario y panel de administración.",
    image: "/images/projects/project.jpeg",
    repo: "https://github.com/mauroav21/ecommerce-platform",
    technologies: ["Python", "Django", "PostgreSQL", "Stripe"],
  },
  {
    title: "Clasificador de Imágenes con IA",
    subtitle: "Machine Learning Project",
    description:
      "Modelo de aprendizaje profundo para clasificación de imágenes usando redes neuronales convolucionales con interfaz web.",
    image: "/images/projects/project.jpeg",
    repo: "https://github.com/mauroav21/image-classifier",
    technologies: ["Python", "TensorFlow", "Flask", "Docker"],
  },
];
