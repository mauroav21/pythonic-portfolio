import { Hero } from "@/components/sections/hero";
import { CommunitiesSection } from "@/components/sections/communities-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { MaterialsSection } from "@/components/sections/materials-section";
import { TechStack } from "@/components/sections/tech-stack";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <Hero />
      <ExperienceSection />
      <ProjectsSection />
      <CommunitiesSection />
      <MaterialsSection />
      <TechStack />
      <ContactSection />
    </>
  );
}
