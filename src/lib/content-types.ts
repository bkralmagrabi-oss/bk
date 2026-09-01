export type Bilingual = { en: string; ar: string };

export type ServiceIcon = "website" | "landing" | "portfolio" | "responsive" | "support";

export type HeroContent = {
  eyebrow: Bilingual;
  title: Bilingual;
  subtitle: Bilingual;
};

export type ServiceItem = {
  id: string;
  icon: ServiceIcon;
  title: Bilingual;
  description: Bilingual;
};

export type PortfolioItem = {
  id: string;
  title: Bilingual;
  tag: Bilingual;
  imageUrl: string | null;
  link: string | null;
};

export type AboutPillar = {
  id: string;
  title: Bilingual;
  description: Bilingual;
};

export type AboutContent = {
  text: Bilingual;
  pillars: AboutPillar[];
};

export type ContactInfo = {
  email: string;
  whatsapp: string;
  instagram: string;
  instagramHandle: string;
  tiktok: string;
  tiktokHandle: string;
};

export type FooterContent = {
  tagline: Bilingual;
};

export type SiteContent = {
  hero: HeroContent;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  about: AboutContent;
  contact: ContactInfo;
  footer: FooterContent;
};

export function isValidSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    !!v.hero &&
    typeof v.hero === "object" &&
    Array.isArray(v.services) &&
    Array.isArray(v.portfolio) &&
    !!v.about &&
    typeof v.about === "object" &&
    !!v.contact &&
    typeof v.contact === "object" &&
    !!v.footer &&
    typeof v.footer === "object"
  );
}
