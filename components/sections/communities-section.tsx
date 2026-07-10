import { Section } from "@/components/ui/section";
import { CardGrid } from "@/components/sections/card-grid";
import { communities } from "@/data/communities";
import { sectionText } from "@/data/site";

export function CommunitiesSection() {
  return (
    <Section
      id="communities"
      eyebrow="Comunidad"
      title="Comunidades"
      description={sectionText.communities}
    >
      <CardGrid entries={communities} linkLabel="Visitar comunidad" />
    </Section>
  );
}
