import { Section } from "@/components/ui/section";
import { CardGrid } from "@/components/sections/card-grid";
import { materials } from "@/data/materials";
import { sectionText } from "@/data/site";

export function MaterialsSection() {
  return (
    <Section
      id="writing"
      eyebrow="Difusión"
      title="Material y artículos"
      description={sectionText.materials}
    >
      <CardGrid entries={materials} linkLabel="Leer más" />
    </Section>
  );
}
