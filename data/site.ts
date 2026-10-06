/**
 * Datos base del sitio: identidad, redes y textos de cada sección.
 * Edita este archivo para actualizar tu información personal.
 */

export const site = {
  name: "Mauro Alvarado",
  username: "@mauroav.dev",
  email: "contacto@mauroav.dev",
  location: "Saltillo, México",
  role: "Computer Systems Engineering | Co-founder & CEO @ Zikit | FullStack Developer @ Grupo Server",
  greeting: "Hola, soy Mauro Alvarado.",
  url: "https://mauroav.dev",
  github: "https://github.com/mauroav21",
  linkedin: "https://www.linkedin.com/in/mauroav/",
  cvPath: "/Mauro_Alvarado_CV.pdf",
  avatarPath: "/images/avatar.png",
} as const;

export const seo = {
  title: `${site.name} | Portfolio`,
  description:
    "Portfolio de Mauro Alvarado — Computer Systems Engineer, Co-founder & CEO de Zikit y FullStack Developer, especializado en DevOps y ecosistemas cloud-native.",
  keywords: [
    "Mauro Alvarado",
    "portfolio",
    "Zikit",
    "FullStack Developer",
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
  "Soy Computer Systems Engineer, cofundador y CEO de Zikit y FullStack Developer Engineer en Grupo Server, con una especialización profunda en DevOps y ecosistemas cloud-native. Mi carrera está impulsada por la pasión por el cómputo en la nube, el liderazgo técnico y la transformación digital a través de infraestructura escalable.",
  "Además de mi rol como ingeniero, tengo un historial comprobado construyendo y liderando comunidades tecnológicas de alto impacto.",
] as const;

export const leadership = {
  intro:
    "Ingeniero de software y CEO de Zikit. Reúno a estudiantes y profesionales alrededor de la nube, el código y el aprendizaje compartido: mentorías, talleres y espacios donde el talento local crece junto.",
  statement:
    "Una comunidad fuerte no se mide en miembros, sino en las personas que logran dar el siguiente paso gracias a ella.",
  principles: [
    { title: "Mentoría", text: "Acompañar a quien empieza con talleres prácticos y proyectos reales." },
    { title: "Networking", text: "Conectar estudiantes y profesionales para compartir casos de uso y mejores prácticas." },
    { title: "Cultura de ingeniería", text: "Construir hábitos de excelencia técnica: DevOps, cloud y resolución de problemas." },
  ],
} as const;

export const sectionText = {
  education: "Instituciones donde me he formado académicamente.",
  experience: "Empresas y organizaciones donde he aplicado mis conocimientos profesionalmente.",
  certifications: "Certificaciones y cursos que avalan mi conocimiento.",
  projects: "Proyectos destacados que he desarrollado utilizando diversas tecnologías.",
  communities: "Comunidades técnicas y grupos donde participo activamente compartiendo conocimiento.",
  materials: "Contenido educativo, artículos y charlas que he creado y presentado.",
} as const;
