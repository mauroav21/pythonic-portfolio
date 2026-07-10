import { Hero } from "@/components/sections/hero";
import { TechStack } from "@/components/sections/tech-stack";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { CommunitiesSection } from "@/components/sections/communities-section";
import { MaterialsSection } from "@/components/sections/materials-section";

export default function Home() {
  return (
    <>
      <Hero />
      <TechStack />
      <ExperienceSection />
      <ProjectsSection />
      <CommunitiesSection />
      <MaterialsSection />
    </>
  );
}
