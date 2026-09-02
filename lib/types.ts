export type ImageField = { src: string; alt: string };

export type NavItem = {
  id: string;
  label: string;
  target: string;
  visible: boolean;
};

export type Program = {
  id: string;
  label: string;
  title: string;
  coach: string;
  days: string;
  times: string[];
  description: string;
  image: ImageField;
  accent: "orange" | "teal";
  visible: boolean;
};

export type ContentCard = {
  id: string;
  title: string;
  description: string;
  image: ImageField;
  visible: boolean;
};

export type SiteContent = {
  revision: number;
  updatedAt: string;
  seo: { title: string; description: string };
  brand: { name: string; location: string; footerDescription: string };
  header: { nav: NavItem[]; ctaLabel: string };
  hero: {
    eyebrow: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    description: string;
    ctaLabel: string;
    image: ImageField;
  };
  trust: string[];
  programsSection: { eyebrow: string; title: string; description: string };
  programs: Program[];
  facilitiesSection: { eyebrow: string; title: string; description: string };
  facilities: ContentCard[];
  gallery: Array<ImageField & { id: string; visible: boolean }>;
  offers: ContentCard[];
  about: { eyebrow: string; body: string };
  contact: {
    eyebrow: string;
    title: string;
    menTitle: string;
    menDescription: string;
    menButtonLabel: string;
    menWhatsappNumber: string;
    menDisplayNumber: string;
    menMessage: string;
    womenTitle: string;
    womenDescription: string;
    womenButtonLabel: string;
    womenWhatsappNumber: string;
    womenDisplayNumber: string;
    womenMessage: string;
    address: string;
    mapEmbedUrl: string;
    mapTitle: string;
  };
  footer: {
    contactLabel: string;
    socialLabel: string;
    facebookUrl: string;
    copyrightText: string;
    designerName: string;
    designerEmail: string;
  };
};
