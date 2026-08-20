export type SourceGroup = {
  heading: string;
  note?: string;
  items: { label: string; url?: string }[];
};

export const SOURCE_GROUPS: SourceGroup[] = [
  {
    heading: "Official repositories & documentation",
    items: [
      { label: "MQT QCEC — README, features, citation block", url: "https://github.com/munich-quantum-toolkit/qcec" },
      { label: "MQT QCEC — CI workflow (raw YAML)", url: "https://raw.githubusercontent.com/munich-quantum-toolkit/qcec/main/.github/workflows/ci.yml" },
      { label: "MQT verification handbook", url: "https://mqt.readthedocs.io/en/latest/handbook/04_verification.html" },
      { label: "MQT Debugger — README, DAP server description", url: "https://github.com/munich-quantum-toolkit/debugger" },
      { label: "pytest-quantum plugin", url: "https://github.com/qbench/pytest-quantum" },
      { label: "pytest-quantum — PyPI release history", url: "https://pypi.org/project/pytest-quantum/" },
      { label: "qtest-quantum plugin", url: "https://github.com/metin-5115/qtest" },
      { label: "qc-assert plugin", url: "https://github.com/JMORAF87/qc-assert" },
      { label: "Qiskit ecosystem CI template", url: "https://github.com/Qiskit/qiskit-addon-cutting" },
      { label: "Qiskit QPY cross-version compat harness", url: "https://github.com/Qiskit/qiskit/blob/main/.github/workflows/qpy.yml" },
      { label: "quantum-transpiler-regression-testing (\"cart\") pilot", url: "https://github.com/furqan-nr/quantum-transpiler-regression-testing" },
      { label: "Bugs4Q bug corpus repository", url: "https://github.com/Z-928/Bugs4Q" },
    ],
  },
  {
    heading: "arXiv papers (abstract and/or full text verified directly)",
    items: [
      { label: "MQT Debugger — \"A Framework for Debugging Quantum Programs\" (2412.12269)", url: "https://arxiv.org/abs/2412.12269" },
      { label: "31% statistic — \"Challenges and Practices in Quantum Software Testing and Debugging\" (2506.17306)", url: "https://arxiv.org/abs/2506.17306" },
      { label: "QUTest — \"A Native Testing Framework for Quantum Programs\" (2605.19736)", url: "https://arxiv.org/abs/2605.19736" },
      { label: "\"A Survey on Testing and Analysis of Quantum Software\" (2410.00650)", url: "https://arxiv.org/abs/2410.00650" },
      { label: "Qolumbina — \"Benchmarking Quantum Software Testing with Scalable Quantum Programs\" (2607.02029)", url: "https://arxiv.org/abs/2607.02029" },
      { label: "\"Quantum Circuit Mutants: Empirical Analysis and Recommendations\" (2311.16913)", url: "https://arxiv.org/abs/2311.16913" },
      { label: "QMon (2512.13422)", url: "https://arxiv.org/html/2512.13422" },
      { label: "TraceQ (2508.14533)", url: "https://arxiv.org/pdf/2508.14533" },
      { label: "CUDA-Q Statistical Assertions (2507.16255)", url: "https://arxiv.org/abs/2507.16255" },
      { label: "Bloq / AutoBloq (2506.18458)", url: "https://arxiv.org/abs/2506.18458" },
      { label: "MorphQ (2206.01111)", url: "https://arxiv.org/pdf/2206.01111" },
      { label: "Bugs4Q preprint (2108.09744)", url: "https://arxiv.org/abs/2108.09744" },
      { label: "Cross-Qiskit-version Bugs4Q replication study, ICSME 2026 (2606.27124)", url: "https://arxiv.org/abs/2606.27124" },
      { label: "QBugs (2103.16968)", url: "https://arxiv.org/abs/2103.16968" },
      { label: "32,296-bug-report mined dataset (2512.24656)", url: "https://arxiv.org/abs/2512.24656" },
      { label: "QBugLM (2606.07314)", url: "https://arxiv.org/abs/2606.07314" },
    ],
  },
  {
    heading: "Independently resolved DOI / bibliographic records",
    note: "Verification pass 2 (2026-08-20) — direct DOI access to ScienceDirect was blocked by a JS-rendered wall, so these citations were cross-confirmed via independent bibliographic listings instead.",
    items: [
      { label: "\"cart\" — Zenodo software record", url: "https://doi.org/10.5281/zenodo.21020113" },
      { label: "Bugs4Q, JSS 2023 — ACM DL listing (source of the corrected 42-bug count)", url: "https://dl.acm.org/doi/10.1016/j.jss.2023.111805" },
      { label: "QCEC, Software Impacts 2021 — Semantic Scholar listing", url: "https://www.semanticscholar.org/paper/QCEC:-A-JKQ-tool-for-quantum-circuit-equivalence-Burgholzer-Wille/1079c0b1fc1f77e429f4e8277b63856837c1a997" },
      { label: "QCEC, Software Impacts 2021 — researchr listing", url: "https://researchr.org/publication/BurgholzerW21" },
    ],
  },
  {
    heading: "Sources attempted but inaccessible",
    note: "Documented rather than silently dropped — these were not used as evidence for any claim.",
    items: [
      { label: "PyPI mqt.qcec project page — failed to load via WebFetch" },
      { label: "arXiv 2506.17306 PDF (compressed stream) — unreadable via WebFetch; worked around via direct file read" },
      { label: "arXiv 2506.17306 HTML version — 404, not published" },
      { label: "ScienceDirect full text for the QCEC and Bugs4Q DOIs — blocked by a JS-rendered redirect wall" },
    ],
  },
  {
    heading: "Unverified leads",
    note: "Surfaced by search but never opened — explicitly flagged, not cited anywhere in the claims or evidence.",
    items: [
      { label: "arXiv 2601.08367, 2503.05240, 2506.02090, 2409.08844, 2509.04763 (NovaQ), 2601.13996, 2503.17322 (QITE), 2602.05759 — not independently verified" },
      { label: "A companion \"4,984-issue / 36-repo\" Qiskit-ecosystem benchmark mentioned alongside arXiv:2512.24656" },
      { label: "n26124939/Quentangle-SAT — legitimacy/functionality not verified", url: "https://github.com/n26124939/Quentangle-SAT" },
    ],
  },
];
