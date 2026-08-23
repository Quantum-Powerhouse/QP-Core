export type ClaimStatus = "confirmed" | "partial" | "unverified" | "false" | "not_found";

export type Claim = {
  id: string;
  claim: string;
  status: ClaimStatus;
  statusLabel: string;
  evidence: string;
  source: string;
  confidence: "High" | "Medium" | "Medium-High";
};

export const CLAIMS: Claim[] = [
  {
    id: "C01",
    claim: "MQT QCEC capabilities / overlap with proposed idea",
    status: "false",
    statusLabel: "FALSE (overlap claim); CONFIRMED (existence/capabilities)",
    evidence:
      "Mature equivalence-checking library (decision-diagram / ZX-calculus engines), Qiskit + OpenQASM only. Its own CI is an OS/compiler matrix only, no SDK-version matrix, no CI/CD product for user projects.",
    source: "github.com/munich-quantum-toolkit/qcec (README + CI YAML); mqt.readthedocs.io verification handbook",
    confidence: "High",
  },
  {
    id: "C02",
    claim: "MQT Debugger capabilities / overlap with proposed idea",
    status: "false",
    statusLabel: "FALSE (overlap claim); CONFIRMED (existence/capabilities)",
    evidence:
      "Assertion-based, single-run simulation debugger with DAP IDE integration, OpenQASM input. No cross-version or CI regression capability.",
    source: "github.com/munich-quantum-toolkit/debugger; arXiv:2412.12269",
    confidence: "High",
  },
  {
    id: "C03",
    claim: "“Q-Trace” / other quantum debugging systems overlap with proposed idea",
    status: "false",
    statusLabel: "FALSE (“Q-Trace” itself); real systems found operate at single-run fault-localization level only",
    evidence:
      "“Q-Trace” is not a real named tool. QMon, TraceQ, the Microsoft QDK Trace Simulator, CUDA-Q statistical assertions, Proq, Bloq/AutoBloq, and MorphQ were all verified, none do cross-version/cross-SDK regression testing or CI integration.",
    source: "arxiv.org/html/2512.13422; arxiv.org/pdf/2508.14533; arxiv.org/abs/2507.16255; arxiv.org/abs/2506.18458; arxiv.org/pdf/2206.01111",
    confidence: "High",
  },
  {
    id: "C04",
    claim: "≈31% of quantum developers use quantum-specific testing tools (practitioner survey)",
    status: "confirmed",
    statusLabel: "CONFIRMED",
    evidence:
      "Exact quote “Only eight of 26 respondents (31%)…” verified in the full PDF text, Finding 2, Section 5.2, p.18. N=26 survey, IRB-approved, fielded in 2024. Authors flag the small-N limitation themselves.",
    source: "arXiv:2506.17306 (Zappin, Stalnaker, Chaparro, Poshyvanyk; to appear ACM TOSEM)",
    confidence: "High",
  },
  {
    id: "C05",
    claim: "First alleged arXiv paper (evidence for the gap)",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED, no pre-given ID existed to check; best reconstructed candidate is highly material",
    evidence:
      "No specific ID was supplied. Best candidate found: QUTest (arXiv:2605.19736), a published cross-Qiskit-version regression-testing tool with CI-compatible (JUnit/xUnit) output. This partially contradicts the originally claimed gap rather than supporting it.",
    source: "arxiv.org/abs/2605.19736 (full HTML verified)",
    confidence: "Medium",
  },
  {
    id: "C06",
    claim: "Second alleged arXiv paper (evidence for the gap)",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED (same caveat as C05)",
    evidence:
      "Best candidates: the 31%-survey paper itself (arXiv:2506.17306, supports the need but is not a tool paper) and arXiv:2410.00650 (broad testing/analysis survey, no CI/CD content, general background only).",
    source: "arxiv.org/abs/2506.17306; arxiv.org/abs/2410.00650",
    confidence: "Medium",
  },
  {
    id: "C07",
    claim: "No dedicated standard bug corpus exists for quantum SDK versions / regression testing",
    status: "false",
    statusLabel: "FALSE",
    evidence:
      "Bugs4Q is a real, “widely used” corpus (36 bugs in the 2021 preprint; 42 in the DOI-resolved JSS 2023 version); arXiv:2606.27124 already ran 37 of its artifacts across 21 Qiskit core-library versions / 77,700 executions, found reproducibility collapsed 62.2%→16.2%, and restored it to 78.4% via a patched “Bugs4Q-Robust” fork. QBugs, a 32,296-report mined dataset, and QBugLM also exist. No corpus is a universal standard, but the “none exists” framing is false.",
    source: "arXiv:2108.09744; arXiv:2606.27124; arXiv:2103.16968; arXiv:2512.24656; github.com/Z-928/Bugs4Q",
    confidence: "High",
  },
  {
    id: "C08",
    claim: "An open-source pytest plugin already does full cross-SDK-version regression discovery/execution/comparison in CI",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED",
    evidence:
      "pytest-quantum, qtest-quantum, and qc-assert are real, installable, but do framework-to-framework (not version-to-version) equivalence or single-run assertions only; all are under 9 months old, 0-2 stars. No plugin executes across multiple SDK versions with automated diffing.",
    source: "github.com/qbench/pytest-quantum; github.com/metin-5115/qtest; github.com/JMORAF87/qc-assert; PyPI release metadata",
    confidence: "High",
  },
  {
    id: "C09",
    claim: "Existing GitHub Actions products combine quantum SDKs with matrix builds / regression / equivalence testing",
    status: "confirmed",
    statusLabel: "CONFIRMED (narrow)",
    evidence:
      "Qiskit’s official ecosystem CI template (test_latest / development / minimum_versions.yml) is real, reusable, and active across ~8 repos, but only checks pass/fail of existing tests per version tier, it doesn’t diff behavior. Qiskit core’s qpy.yml does genuine but narrowly-scoped (serialization-only) cross-version regression testing, internal only.",
    source: "github.com/Qiskit/qiskit-addon-cutting; github.com/Qiskit/qiskit/blob/main/.github/workflows/qpy.yml",
    confidence: "High",
  },
  {
    id: "C10",
    claim: "Cross-SDK or cross-version quantum regression testing already exists as reusable open tooling",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED",
    evidence:
      "quantum-transpiler-regression-testing (“cart,” Zenodo DOI 10.5281/zenodo.21020113, June 2026) found 38% of real Qiskit transpiler bug-fixes are regressions invisible to equivalence oracles, single-SDK, CLI-based, brand-new, 0 stars. QUTest (C05) does cross-Qiskit-version testing with CI output. No cross-SDK regression/equivalence tool was found. Benchpress (C14) is pytest-native and cross-SDK but benchmarks capability/performance only.",
    source: "github.com/furqan-nr/quantum-transpiler-regression-testing; Zenodo 10.5281/zenodo.21020113; arXiv:2605.19736",
    confidence: "Medium-High",
  },
  {
    id: "C11",
    claim: "Other equivalence/regression tooling exists beyond MQT QCEC",
    status: "not_found",
    statusLabel: "NOT FOUND (beyond items already catalogued under C01/C05/C10)",
    evidence: "GitHub search for “quantum equivalence checking” returned only unrelated/unverified SAT-solver student projects.",
    source: "gh search repos “quantum equivalence checking”",
    confidence: "Medium",
  },
  {
    id: "C12",
    claim: "A dedicated product combines quantum testing + state-awareness + autonomy + CI/CD + cross-version regression",
    status: "not_found",
    statusLabel: "NOT FOUND AFTER SEARCH",
    evidence:
      "The individual pieces exist separately (QBugLM is agentic and quantum-specific but has no CI/CD or state-awareness; generic autonomous testing agents exist only for classical software). No system combines all elements.",
    source: "arXiv:2606.07314; general web search",
    confidence: "Medium",
  },
  {
    id: "C13",
    claim: "Overall research gap: does a genuine, defensible gap remain?",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED, a gap exists but is much narrower than originally framed",
    evidence:
      "The narrow, defensible gap is: pytest-native + cross-SDK (not just cross-version) + automated regression/equivalence detection (not hand-written assertions) + reusable drop-in GitHub Actions packaging. No single system combines all four; several systems solve one or two of the four pieces (Benchpress. C14, covers pytest-native + cross-SDK, but only as a performance benchmark).",
    source: "Synthesis of C01. C12 and C14, see the Gap Analysis page",
    confidence: "Medium-High",
  },
  {
    id: "C14",
    claim: "Benchpress (IBM) already provides a pytest-native, cross-SDK harness overlapping the proposed infrastructure",
    status: "partial",
    statusLabel: "PARTIALLY CONFIRMED, the harness pattern exists; the detection capability does not",
    evidence:
      "Benchpress is a pytest-based suite of 1,000+ benchmarks run across 8 SDKs (Qiskit, Braket, Cirq, Tket, BQSKit, Staq, pyqpanda3, Qiskit IBM transpiler) on circuits up to 930 qubits, proving pytest-native cross-SDK orchestration works at scale. But every test measures capability/performance (pass/skip/fail/xfail + timings); it performs no equivalence checking, no cross-version regression detection, and ships no reusable GitHub Actions packaging. Apache-2.0, ~155 stars.",
    source: "github.com/Qiskit/benchpress; arXiv:2409.08844; Nation et al., Nat. Comput. Sci. 5, 427-435 (2025)",
    confidence: "High",
  },
];
