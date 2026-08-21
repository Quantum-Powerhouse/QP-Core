import type { ClaimStatus } from "./claims";

export type EvidenceRecord = {
  /** Claim IDs (C01–C13) this record supplies evidence for. Cross-checked against
   *  research/evidence.json by `npm run validate:research`. */
  claimIds: string[];
  claim: string;
  status: ClaimStatus;
  statusLabel: string;
  evidence: string;
  sourceUrl: string;
  sourceType: string;
  sourceTitle: string;
  notes: string;
};

export const EVIDENCE: EvidenceRecord[] = [
  {
    claimIds: ["C01"],
    claim: "MQT QCEC provides substantially the same capability as the proposed cross-version regression-testing infrastructure.",
    status: "false",
    statusLabel: "FALSE",
    evidence:
      "MQT QCEC is a mature equivalence-checking library (decision-diagram, alternating DD, simulation-based falsification, ZX-calculus engines) for Qiskit circuits and OpenQASM files. Its own CI matrix is OS/architecture/compiler only — no SDK-version matrix, no cross-SDK-version regression harness, no CI/CD product for arbitrary user projects.",
    sourceUrl: "https://github.com/munich-quantum-toolkit/qcec",
    sourceType: "Official GitHub repository, raw CI config, official documentation",
    sourceTitle: "munich-quantum-toolkit/qcec (README, CI workflow, verification handbook)",
    notes:
      "117 GitHub stars, 1,516+ commits, MIT license. Citation: Burgholzer & Wille, “QCEC: A JKQ tool for quantum circuit equivalence checking,” Software Impacts, 2021.",
  },
  {
    claimIds: ["C02"],
    claim: "MQT Debugger provides substantially the same capability as the proposed CI/CD regression-testing infrastructure.",
    status: "false",
    statusLabel: "FALSE",
    evidence:
      "MQT Debugger is an assertion-based, simulation-driven debugger for locating errors within a single quantum program run, with a Debugger Adapter Protocol (DAP) server for IDE integration. Its GitHub Actions workflows are standard CI for its own codebase, not a feature for testing other projects across SDK versions.",
    sourceUrl: "https://arxiv.org/abs/2412.12269",
    sourceType: "Official GitHub repository, arXiv paper",
    sourceTitle: "Rovara, Burgholzer, Wille, “A Framework for Debugging Quantum Programs,” arXiv:2412.12269",
    notes: "21 stars, 4 forks, 496 commits, MIT license. arXiv:2412.12269 submitted 2024-12-16.",
  },
  {
    claimIds: ["C03"],
    claim: "“Q-Trace” or other quantum debugging/tracing systems overlap with the proposed CI/CD regression-testing idea.",
    status: "false",
    statusLabel: "FALSE",
    evidence:
      "“Q-Trace” as a named quantum debugging tool does not exist. Other real systems verified — QMon, TraceQ, the Microsoft QDK Trace Simulator, CUDA-Q statistical assertions, Proq, Bloq/AutoBloq, MorphQ — all operate at the single-circuit, single-run fault-localization or monitoring level. None perform cross-version or cross-SDK regression comparison; none integrate with pytest or GitHub Actions.",
    sourceUrl: "https://arxiv.org/abs/2506.18458",
    sourceType: "arXiv papers (verified directly)",
    sourceTitle: "See the Prior-Art matrix for the full per-system table",
    notes: "MorphQ (Qiskit-testing-Qiskit) flagged for cross-check but not deeply verified in this pass.",
  },
  {
    claimIds: ["C04"],
    claim: "A practitioner survey found approximately 31% of quantum software developers use quantum-specific testing tools.",
    status: "confirmed",
    statusLabel: "CONFIRMED",
    evidence:
      "Verbatim from the full PDF text: “Only eight of 26 respondents (31%) reported using quantum-specific testing tools.” Stated as Finding 2, Section 5.2, p.18. Survey of 26 analyzed respondents (from 1,397 industry/government + 75 academic invitees), plus 4 follow-up interviews, fielded via Qualtrics 2024-05-20 to 2024-08-05, IRB-approved.",
    sourceUrl: "https://arxiv.org/abs/2506.17306",
    sourceType: "arXiv paper (to appear ACM TOSEM)",
    sourceTitle:
      "Zappin, Stalnaker, Chaparro, Poshyvanyk, “Challenges and Practices in Quantum Software Testing and Debugging: Insights from Practitioners,” arXiv:2506.17306",
    notes:
      "Authors themselves flag N=26 as a generalizability limitation (Section 9.2). Paper explicitly calls for, but does not build, “CI/CD pipelines tailored to hybrid systems” — evidence of need, not of prior-art absence.",
  },
  {
    claimIds: ["C05", "C06"],
    claim: "Two arXiv papers previously cited as evidence for the research gap — verify their existence and content.",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED",
    evidence:
      "No specific arXiv IDs were supplied to check against, so the original “two papers” could not be confirmed or denied directly. Independent search reconstructed the most material candidates: QUTest (arXiv:2605.19736) already implements cross-Qiskit-version regression testing with CI-compatible (JUnit/xUnit) output for GitHub Actions — but does not integrate with pytest, and supports only Qiskit today.",
    sourceUrl: "https://arxiv.org/abs/2605.19736",
    sourceType: "arXiv papers (abstract pages and full text verified directly)",
    sourceTitle: "Campos, “QUTest: A Native Testing Framework for Quantum Programs,” arXiv:2605.19736",
    notes:
      "The single most material finding of the whole research phase: it directly narrows the novelty claim. What remains open per QUTest’s own stated limitations: pytest-native integration, cross-SDK testing, automated (not hand-written) regression detection.",
  },
  {
    claimIds: ["C07"],
    claim: "There is no dedicated standard bug corpus for quantum SDK versions / quantum software regression testing.",
    status: "false",
    statusLabel: "FALSE",
    evidence:
      "Bugs4Q (36 bugs in the 2021 preprint; 42 in the DOI-resolved JSS 2023 version) is described by independent replication work as “a widely used dataset.” Critically, arXiv:2606.27124 ran 37 Bugs4Q artifacts across 21 Qiskit core-library versions (77,700 executions), found reproducibility collapsed from 62.2% on v0.20.1 to 16.2% on v2.3.1, and released a patched fork “Bugs4Q-Robust” that restores it to 78.4%.",
    sourceUrl: "https://github.com/Z-928/Bugs4Q",
    sourceType: "arXiv papers, journal article, public GitHub repository",
    sourceTitle: "Bugs4Q (arXiv:2108.09744, JSS vol. 205 2023); cross-version replication (arXiv:2606.27124)",
    notes:
      "No single corpus is a universal standard (unlike Defects4J for Java) — the narrowest defensible claim is that existing corpora are not packaged as ready-to-use pytest/CI fixtures. The replication authors note most failures needed source-code migration (import paths, API calls), not just dependency pinning — version drift in quantum SDKs is a code-level, not packaging-level, problem.",
  },
  {
    claim:
      "An open-source pytest plugin already discovers quantum tests, executes across multiple SDK versions, compares results, detects regressions, and runs in GitHub Actions.",
    claimIds: ["C08"],
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED",
    evidence:
      "Three real, installable pytest plugins exist (pytest-quantum, qtest-quantum, qc-assert) but do framework-to-framework (not version-to-version) equivalence or single-run assertions only. All are under 9 months old, single-maintainer, 0–2 GitHub stars.",
    sourceUrl: "https://github.com/qbench/pytest-quantum",
    sourceType: "GitHub repositories, PyPI release metadata, workflow YAML",
    sourceTitle: "See the Prior-Art matrix for the full inspection table",
    notes: "None execute a test suite against multiple installed versions of the same SDK and auto-diff results.",
  },
  {
    claimIds: ["C09"],
    claim: "Existing GitHub Actions workflows/repositories combine quantum SDKs with matrix builds, multiple SDK versions, or regression testing.",
    status: "confirmed",
    statusLabel: "CONFIRMED",
    evidence:
      "Qiskit’s official ecosystem CI template ships three real, verified workflow files (test_latest / development / minimum_versions.yml), reused across ~8 Qiskit-ecosystem repos. Qiskit core’s own qpy.yml performs genuine cross-Qiskit-version regression testing for QPY serialization compatibility.",
    sourceUrl: "https://github.com/Qiskit/qiskit-addon-cutting",
    sourceType: "GitHub repositories, raw workflow YAML",
    sourceTitle: "Qiskit ecosystem CI template; Qiskit QPY compatibility harness",
    notes: "These templates assert pass/fail of existing tests at each version tier — they do not diff behavior between versions themselves.",
  },
  {
    claimIds: ["C10"],
    claim: "Cross-SDK or cross-version quantum regression testing already exists as reusable open tooling.",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED",
    evidence:
      "quantum-transpiler-regression-testing (“cart”), independently verified via GitHub repo and Zenodo DOI resolution, found that ~38% of real Qiskit transpiler bug-fixes are regressions invisible to black-box equivalence oracles. Scope: single-SDK, CLI-based, brand new (0 stars). No cross-SDK tool of any kind was found anywhere.",
    sourceUrl: "https://github.com/furqan-nr/quantum-transpiler-regression-testing",
    sourceType: "GitHub repository, independently-resolved Zenodo DOI record",
    sourceTitle: "furqan-nr/quantum-transpiler-regression-testing; Zenodo 10.5281/zenodo.21020113",
    notes: "Treat as directly relevant, possibly competing/complementary prior art.",
  },
  {
    claimIds: ["C11"],
    claim: "Other equivalence/regression tooling exists beyond MQT QCEC.",
    status: "not_found",
    statusLabel: "NOT FOUND",
    evidence:
      "GitHub repository search for “quantum equivalence checking” returned only unrelated SAT-solver student projects whose legitimacy was not independently verified. No other academic or industry open-source equivalence checker with CI integration was found beyond MQT QCEC, QUTest, and the “cart” pilot.",
    sourceUrl: "https://github.com/munich-quantum-toolkit/qcec",
    sourceType: "GitHub repository search",
    sourceTitle: "gh search repos “quantum equivalence checking”",
    notes: "Absence of evidence after search, not proof of non-existence.",
  },
  {
    claim:
      "A dedicated product/framework already exists combining quantum software testing + state-aware testing + autonomous/agentic behavior + CI/CD + cross-version regression detection.",
    claimIds: ["C12"],
    status: "not_found",
    statusLabel: "NOT FOUND",
    evidence:
      "Generic autonomous AI testing agents exist abundantly for classical software QA with no quantum angle. The closest quantum-specific agentic system, QBugLM, is genuinely agentic and quantum-specific but has no CI/CD integration, no cross-SDK-version regression detection, and no demonstrated state-awareness.",
    sourceUrl: "https://arxiv.org/abs/2606.07314",
    sourceType: "arXiv paper + broad web search (absence result)",
    sourceTitle: "QBugLM (arXiv:2606.07314); general web search for autonomous quantum testing agents",
    notes:
      "Explicitly marked NOT FOUND rather than FALSE — absence of evidence after a reasonably broad search, not proof of non-existence. Least load-bearing part of the original idea.",
  },
];
