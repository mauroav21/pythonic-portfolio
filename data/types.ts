import type { LucideIcon } from "lucide-react";

export interface TimelineEntry {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  location?: string;
  certificate?: string;
}

export interface Project {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  repo: string;
  technologies: string[];
}

export interface CardEntry {
  title: string;
  description: string;
  image: string;
  url: string;
}
