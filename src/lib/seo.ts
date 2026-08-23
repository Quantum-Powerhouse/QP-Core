import type { Metadata } from "next";

export const SITE_URL = "https://quantum.sadeqi.me";
export const SITE_NAME = "Quantum Powerhouse";
export const AUTHOR_NAME = "Said Mohaddes Sadeqi";
export const GITHUB_ORG_URL = "https://github.com/Quantum-Powerhouse";
export const GITHUB_REPO_URL = "https://github.com/Quantum-Powerhouse/QP-Core";

export const DEFAULT_DESCRIPTION =
  "Quantum Powerhouse, a quantum computing developer studio. QP-Core (OpenQASM 2.0/3.0 to Amazon Braket IR transpiler), a Qiskit VQE Suite, and a NISQ error mitigation toolkit.";

export const DEFAULT_KEYWORDS = [
  "OpenQASM to Amazon Braket transpiler",
  "Rust quantum compiler pass",
  "Quantum Zero Noise Extrapolation toolkit",
  "Qiskit VQE benchmark suite",
  "quantum computing developer tools",
];

type BuildMetadataArgs = {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  ogTitle?: string;
};

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  keywords = DEFAULT_KEYWORDS,
  ogTitle,
}: BuildMetadataArgs): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle ?? title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? title,
      description,
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}
