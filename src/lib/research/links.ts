export const RESEARCH_REPO_URL = "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research";
export const RESEARCH_REPO_LABEL = "sadeqisaidmohaddes-star/quantum-cicd-research";

export function researchFileUrl(path: string): string {
  return `${RESEARCH_REPO_URL}/blob/master/${path}`;
}
