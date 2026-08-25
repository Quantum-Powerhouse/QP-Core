import { AUTHOR_NAME, GITHUB_ORG_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: SITE_URL,
    sameAs: [GITHUB_ORG_URL],
    jobTitle: "Quantum Software Engineer",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
  };
}

type SoftwareApplicationArgs = {
  name: string;
  description: string;
  applicationCategory: string;
  url: string;
  keywords?: string[];
};

export function softwareApplicationSchema({
  name,
  description,
  applicationCategory,
  url,
  keywords,
}: SoftwareApplicationArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory,
    operatingSystem: "Any (web based)",
    keywords: keywords?.join(", "),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

type TechArticleArgs = {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
};

export function techArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
}: TechArticleArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
  };
}
