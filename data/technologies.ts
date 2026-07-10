import type { IconType } from "react-icons";
import { Workflow } from "lucide-react";
import {
  SiPython,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiGit,
  SiGithub,
  SiGitlab,
  SiDocker,
  SiPostgresql,
  SiMongodb,
  SiLinux,
  SiFedora,
  SiUbuntu,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiTypescript,
  SiGooglecloud,
  SiGooglecolab,
} from "react-icons/si";
import { TbBrandAzure, TbBrandAws, TbBrandVscode } from "react-icons/tb";

export interface Technology {
  name: string;
  icon: IconType;
}

/**
 * Tecnologías con las que tienes experiencia. Edita libremente
 * esta lista para reflejar tu propio stack.
 */
export const technologies: Technology[] = [
  { name: "Azure", icon: TbBrandAzure },
  { name: "Azure DevOps", icon: Workflow },
  { name: "AWS", icon: TbBrandAws },
  { name: "GCP", icon: SiGooglecloud },
  { name: "Google Colab", icon: SiGooglecolab },
  { name: "Python", icon: SiPython },
  { name: "JavaScript", icon: SiJavascript },
  { name: "TypeScript", icon: SiTypescript },
  { name: "React", icon: SiReact },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Git", icon: SiGit },
  { name: "GitHub", icon: SiGithub },
  { name: "GitLab", icon: SiGitlab },
  { name: "Docker", icon: SiDocker },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "MongoDB", icon: SiMongodb },
  { name: "Linux", icon: SiLinux },
  { name: "Fedora", icon: SiFedora },
  { name: "Ubuntu", icon: SiUbuntu },
  { name: "VS Code", icon: TbBrandVscode },
  { name: "HTML5", icon: SiHtml5 },
  { name: "CSS3", icon: SiCss },
  { name: "Tailwind CSS", icon: SiTailwindcss },
];
