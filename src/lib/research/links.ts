export const RESEARCH_REPO_URL = "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research";
export const RESEARCH_REPO_LABEL = "sadeqisaidmohaddes-star/quantum-cicd-research";

export function researchFileUrl(path: string): string {
  return `${RESEARCH_REPO_URL}/blob/master/${path}`;
}

/** The website repository, which carries the validated copy of evidence.json. */
export const SITE_REPO_URL = "https://github.com/Quantum-Powerhouse/QP-Core";

export function siteFileUrl(path: string): string {
  return `${SITE_REPO_URL}/blob/main/${path}`;
}
