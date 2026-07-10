/**
 * Datos base del sitio: identidad, redes y textos de cada sección.
 * Edita este archivo para actualizar tu información personal.
 */

export const site = {
  name: "Mauro Alvarado",
  username: "@mauroav.dev",
  email: "contacto@mauroav.dev",
  location: "Saltillo, México",
  role: "Computer Systems Engineering | SCM Engineer | DevOps & Cloud Enthusiast",
  greeting: "Hola, soy Mauro Alvarado.",
  url: "https://mauroav.dev",
  github: "https://github.com/mauroav21",
  linkedin: "https://www.linkedin.com/in/mauroav/",
  cvPath: "/Mauro_Alvarado_CV.pdf",
  avatarPath: "/images/avatar.jpg",
} as const;

export const seo = {
  title: `${site.name} | Portfolio`,
  description:
    "Portfolio de Mauro Alvarado — Computer Systems Engineer especializado en DevOps, SCM y ecosistemas cloud-native.",
  keywords: [
    "Mauro Alvarado",
    "portfolio",
    "DevOps",
    "SCM Engineer",
    "Cloud",
    "AWS",
    "Azure",
    "GCP",
    "desarrollo web",
  ],
} as const;

export const aboutText = [
  "Soy Computer Systems Engineer, actualmente trabajando como SCM Engineer, con una especialización profunda en DevOps y ecosistemas cloud-native. Mi carrera está impulsada por la pasión por el cómputo en la nube, el liderazgo técnico y la transformación digital a través de infraestructura escalable.",
  "Además de mi rol como ingeniero, tengo un historial comprobado construyendo y liderando comunidades tecnológicas de alto impacto.",
] as const;

export const sectionText = {
  education: "Instituciones donde me he formado académicamente.",
  experience: "Empresas y organizaciones donde he aplicado mis conocimientos profesionalmente.",
  certifications: "Certificaciones y cursos que avalan mi conocimiento.",
  projects: "Proyectos destacados que he desarrollado utilizando diversas tecnologías.",
  communities: "Comunidades técnicas y grupos donde participo activamente compartiendo conocimiento.",
  materials: "Contenido educativo, artículos y charlas que he creado y presentado.",
} as const;
