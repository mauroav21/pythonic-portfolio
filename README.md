# Mauro Alvarado — Portfolio

Portafolio personal construido con [Next.js](https://nextjs.org) (App Router), TypeScript y
Tailwind CSS. Diseño limpio e inspirado en la estética de Apple/Google, con modo claro/oscuro,
animaciones sutiles al hacer scroll y despliegue en Vercel.

Sitio en producción: [mauroav.dev](https://mauroav.dev)

## Stack

- [Next.js 16](https://nextjs.org) — App Router, React Server Components
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [next-themes](https://github.com/pacocoursey/next-themes) — modo claro/oscuro
- [Framer Motion](https://motion.dev) — animaciones al hacer scroll
- [lucide-react](https://lucide.dev) + [react-icons](https://react-icons.github.io/react-icons/) — iconografía

## Estructura del proyecto

```
├── app/                     # Rutas de Next.js (App Router)
│   ├── layout.tsx           # Layout raíz: fuentes, metadata, tema, navbar/footer
│   ├── page.tsx             # Página principal (ensambla todas las secciones)
│   ├── globals.css          # Tokens de tema (colores light/dark) y estilos base
│   ├── sitemap.ts           # Sitemap generado
│   └── robots.ts            # robots.txt generado
├── components/
│   ├── sections/            # Secciones del sitio (hero, experiencia, proyectos, etc.)
│   ├── ui/                  # Componentes base (Card, Badge, Button, Section, Reveal...)
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── theme-toggle.tsx
├── data/                    # Contenido del portafolio (edita aquí tu información)
│   ├── site.ts               # Identidad, redes y textos de sección
│   ├── technologies.ts       # Stack tecnológico
│   ├── experience.ts
│   ├── education.ts
│   ├── certifications.ts
│   ├── projects.ts           # ⚠️ Contiene proyectos de ejemplo — reemplázalos
│   ├── communities.ts
│   └── materials.ts
├── public/
│   ├── images/               # Avatar, comunidades, materiales, proyectos
│   └── Mauro_Alvarado_CV.pdf
└── lib/                      # Utilidades compartidas
```

## Personalización

Toda tu información vive en `data/`. No necesitas tocar los componentes para actualizar
contenido:

- `data/site.ts`: nombre, usuario, ubicación, redes, rol y textos descriptivos de cada sección.
- `data/technologies.ts`: stack tecnológico (nombre + ícono de `lucide-react`/`react-icons`).
- `data/experience.ts`, `data/education.ts`, `data/certifications.ts`: entradas de línea de
  tiempo (título, subtítulo, descripción, fecha, ubicación/certificado opcional).
- `data/projects.ts`: proyectos destacados — **actualmente tiene datos de ejemplo**, edítalos
  con tus proyectos reales (imagen en `public/images/projects/`).
- `data/communities.ts` / `data/materials.ts`: comunidades y contenido/artículos.

Reemplaza también los archivos en `public/images/` y el CV en `public/`.

## Desarrollo local

Requiere Node.js 20.9+.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # ESLint
```

## Despliegue

El proyecto está listo para desplegarse en [Vercel](https://vercel.com) sin configuración
adicional: importa el repositorio y Vercel detecta automáticamente el framework Next.js.
Cada push a `main` genera un despliegue de producción; cada Pull Request genera un preview.
