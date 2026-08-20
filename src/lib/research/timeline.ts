export type TimelineEntry = {
  date: string; // ISO 8601, taken directly from `git log --date=iso-strict`
  title: string;
  description: string;
  repo: "quantum-cicd-research" | "QP-Core";
  commit: string; // short hash, verifiable in the linked repo
  url: string;
};

/**
 * Every entry here is a real commit, sourced directly from `git log` in the
 * two repositories this project spans — nothing is estimated or rounded.
 * Re-derive with:
 *   git log --pretty=format:"%h|%ad|%s" --date=iso-strict
 */
export const TIMELINE: TimelineEntry[] = [
  {
    date: "2026-08-20T10:13:41-07:00",
    title: "Prior-art research phase committed",
    description:
      "13 claims (C01–C13) verified against primary sources across four parallel research threads: MQT QCEC/Debugger, the 31% practitioner statistic and alleged arXiv papers, quantum debugging systems and bug corpora, and GitHub/PyPI CI tooling.",
    repo: "quantum-cicd-research",
    commit: "275265d",
    url: "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/commit/275265d1f2e5c0773b9d5289915877fbfa3832d0",
  },
  {
    date: "2026-08-20T10:21:57-07:00",
    title: "Research repository made public",
    description: "Root README added and the research repository pushed to GitHub as the canonical, version-controlled source of truth.",
    repo: "quantum-cicd-research",
    commit: "4d8cf81",
    url: "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/commit/4d8cf813e01f85a918a4eb5d7eee4fe27c1a4c33",
  },
  {
    date: "2026-08-20T10:30:29-07:00",
    title: "/research section built",
    description: "Overview, claims table, prior-art matrix, evidence, and gap-analysis pages added to the Quantum Powerhouse site, rendering the research data.",
    repo: "QP-Core",
    commit: "a0661c9",
    url: "https://github.com/Quantum-Powerhouse/QP-Core/commit/a0661c904ee64cf7454abeb84bc5d91db639214b",
  },
  {
    date: "2026-08-20T10:31:55-07:00",
    title: "Research section published to production",
    description: "Pull request #1 merged into main — the research became live and publicly visible.",
    repo: "QP-Core",
    commit: "52277d9",
    url: "https://github.com/Quantum-Powerhouse/QP-Core/commit/52277d923e015b7fa02e07574a351fac27aea69c",
  },
  {
    date: "2026-08-20T10:45:18-07:00",
    title: "Verification pass 2 — citations independently confirmed",
    description:
      "The QCEC and Bugs4Q journal citations were cross-confirmed via independent bibliographic sources after direct DOI access was blocked, correcting the Bugs4Q bug count from an unverified estimate to the DOI-confirmed figure.",
    repo: "quantum-cicd-research",
    commit: "a8dabda",
    url: "https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research/commit/a8dabdaf9865677fa57c2a45b7a67499bd8c8dd9",
  },
];
