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
      eyebrow="Trayectoria"
      title="Experiencia y formación"
      description={sectionText.experience}
    >
      <div className="grid gap-12 sm:grid-cols-2">
        <Timeline heading="Experiencia" entries={experience} />
        <Timeline heading="Educación" entries={education} />
      </div>
      <div className="mt-12">
        <Timeline heading="Certificaciones" entries={certifications} />
      </div>
    </Section>
  );
}
