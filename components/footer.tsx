import { Mail, FileText } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { TbBrandLinkedin } from "react-icons/tb";
import { site } from "@/data/site";
import { Container } from "@/components/ui/container";

const links = [
  { href: site.github, label: "GitHub", icon: SiGithub },
  { href: site.linkedin, label: "LinkedIn", icon: TbBrandLinkedin },
  { href: `mailto:${site.email}`, label: "Email", icon: Mail },
  { href: site.cvPath, label: "CV", icon: FileText },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {site.name}
        </p>
        <div className="flex items-center gap-3">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
}
