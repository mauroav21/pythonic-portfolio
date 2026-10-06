import { Section } from "@/components/ui/section";
import { Timeline } from "@/components/sections/timeline";
import { experience } from "@/data/experience";
import { education } from "@/data/education";
import { certifications } from "@/data/certifications";
import { sectionText } from "@/data/site";

export function ExperienceSection() {
  return (
    <Section
      id="experience"
      index="01"
      label="Trayectoria"
      title="Experiencia y formación"
      description={sectionText.experience}
    >
      <div className="space-y-16">
        <Timeline heading="Experiencia" entries={experience} />
        <Timeline heading="Educación" entries={education} />
        <Timeline heading="Certificaciones" entries={certifications} />
      </div>
    </Section>
  );
}
