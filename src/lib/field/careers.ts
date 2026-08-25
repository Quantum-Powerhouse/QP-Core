import type { FieldClaim } from "./types";

/** Careers, a small, high-barrier, well-paid specialist market. No hype. */

export const CAREER_FACTS: FieldClaim[] = [
  {
    id: "qedc-2026-workforce",
    title: "The pure play quantum workforce is ~16,500 people worldwide",
    body: "QED-C's State of the Global Quantum Industry 2026 (data as of end 2025, published 14 April 2026) counts 16,482 pure play quantum workers, up 14% year over year, with 8,261 new quantum related openings in 2025 (+11%). The market it serves was $1.9B in 2025. For scale: that is a mid sized software company's headcount, spread across the entire industry.",
    status: "verified",
    date: "2026-04",
    source: { label: "QED-C, State of the Global Quantum Industry 2026", url: "https://quantumconsortium.org/publication/2026-state-of-the-global-quantum-industry-report/" },
  },
  {
    id: "hughes-2022-degrees",
    title: "Degrees: employers hire across bachelor's, master's and PhD: except for the most specialized roles",
    body: "A survey of 57 quantum companies (Hughes et al., IEEE Transactions on Education, 2022) found that 'except for the highly specific jobs, companies … are looking for a range of degree levels … from bachelors to masters to PhDs', and that the broader roles 'require a range of skills, most of which are not quantum related'. Read that as: algorithms and device physics research skews PhD; software, systems, applications and cryptography engineering are reachable with a strong portfolio.",
    status: "verified",
    date: "2022-11",
    source: { label: "Hughes et al., arXiv:2109.03601 / IEEE Trans. Educ. 65(4) (2022)", url: "https://arxiv.org/abs/2109.03601" },
  },
  {
    id: "glassdoor-qse",
    title: "Compensation: a US 'Quantum Software Engineer' averages ~$208k on Glassdoor: from 16 reports",
    body: "Glassdoor's May 2026 figure for Quantum Software Engineer in the United States is $208,435 (range $168k, $263k), based on sixteen anonymous submissions; its 'Quantum Computing Engineer' figure is $164,333. Treat these as a rough ceiling signal, not a market rate: aggregator data in a 16,000-person field is thin, self selected, and skewed toward large US employers. Offers vary enormously by PhD, employer, and equity.",
    status: "estimate",
    date: "2026-05",
    source: { label: "Glassdoor: Quantum Software Engineer salaries (n=16)", url: "https://www.glassdoor.com/Salaries/quantum-software-engineer-salary-SRCH_KO0,25.htm" },
    also: { label: "Glassdoor: Quantum Computing Engineer salaries", url: "https://www.glassdoor.com/Salaries/quantum-computing-engineer-salary-SRCH_KO0,26.htm" },
  },
];

export type CareerRole = {
  role: string;
  does: string;
  needs: string;
  /** which artifacts on this site are portfolio proof for the role */
  proof: { label: string; href: string }[];
  typicalDegree: string;
};

export const CAREER_ROLES: CareerRole[] = [
  {
    role: "Quantum software engineer",
    does: "Compilers, transpilers, SDKs, simulators, control software; the layer between circuits and hardware.",
    needs: "Strong classical software engineering, linear algebra, one or more SDKs (Qiskit, Cirq, Braket), compilers/IRs, testing discipline.",
    proof: [
      { label: "OpenQASM → Braket IR transpiler", href: "/playground/qp-core" },
      { label: "In browser statevector & density matrix engine", href: "/playground/arcade#engine-scaling-benchmark" },
      { label: "pytest-qequiv cross SDK plugin", href: "https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" },
    ],
    typicalDegree: "BSc/MSc common; portfolio driven",
  },
  {
    role: "Quantum algorithms researcher",
    does: "Designs and analyzes algorithms, resource estimates, variational methods, complexity arguments.",
    needs: "Graduate level quantum information theory, complexity, numerical methods; publication record.",
    proof: [
      { label: "VQE suite (parameter shift optimizer, H₂)", href: "/playground/vqe-suite" },
      { label: "Grover, Deutsch, QAOA in the arcade", href: "/playground/arcade#grover-searchlight" },
    ],
    typicalDegree: "PhD typical",
  },
  {
    role: "Quantum error correction / error mitigation specialist",
    does: "Codes, decoders, thresholds, syndrome extraction; on NISQ hardware, mitigation techniques like ZNE.",
    needs: "Stabilizer formalism, decoding algorithms, noise modeling, statistics; for FTQC roles, deep theory.",
    proof: [
      { label: "Zero Noise Extrapolation toolkit (Richardson, density matrix noise)", href: "/playground/vqe-suite" },
      { label: "Repetition Rescue & Decoherence Dial", href: "/playground/arcade#repetition-rescue" },
    ],
    typicalDegree: "PhD typical for research; MSc possible for mitigation engineering",
  },
  {
    role: "Quantum hardware / device engineer",
    does: "Qubit fabrication, cryogenics, lasers and traps, control electronics, characterization.",
    needs: "Experimental physics or EE, cleanroom/cryo/optics experience, measurement skills.",
    proof: [{ label: "Simulation vs ibm_brisbane noise model", href: "/playground/arcade#simulation-vs-device-chsh" }],
    typicalDegree: "PhD typical; MSc for test & control roles",
  },
  {
    role: "Quantum classical hybrid systems engineer",
    does: "Orchestration of QPU + HPC/cloud workflows, runtime services, queueing, noise aware compilation pipelines.",
    needs: "Distributed systems, cloud, Python/C++, CI/CD, familiarity with vendor runtimes (Qiskit Runtime, Braket).",
    proof: [
      { label: "FastAPI transpiler service + event driven site engine", href: "/docs/qp-core/transpiler-pipeline" },
      { label: "Evidence integrity CI pipeline", href: "/research/methodology" },
    ],
    typicalDegree: "BSc/MSc common",
  },
  {
    role: "Quantum applications scientist",
    does: "Maps domain problems (chemistry, materials, finance) onto hybrid algorithms and benchmarks them.",
    needs: "Domain science + quantum algorithms; rigorous benchmarking against classical baselines.",
    proof: [
      { label: "H₂ VQE at chemical accuracy", href: "/playground/vqe-suite" },
      { label: "What gets solved first", href: "/field/first-solved" },
    ],
    typicalDegree: "PhD typical in the domain science",
  },
  {
    role: "Post quantum cryptography engineer (adjacent, growing)",
    does: "Inventories quantum vulnerable crypto, plans and executes migrations to ML-KEM/ML-DSA, crypto agility.",
    needs: "Applied cryptography, protocols (TLS, PKI), secure software engineering; no quantum hardware knowledge required.",
    proof: [
      { label: "pqc-scan, crypto inventory with a Quantum Readiness Score", href: "https://github.com/sadeqisaidmohaddes-star/pqc-scan" },
      { label: "BB84. Catch Eve (arcade)", href: "/playground/arcade#bb84-catch-eve" },
      { label: "Post quantum cryptography section", href: "/field/pqc" },
    ],
    typicalDegree: "BSc/MSc common; the most accessible entry point",
  },
];

export const EMPLOYERS: { name: string; url: string; kind: string }[] = [
  { name: "IBM Quantum", url: "https://www.ibm.com/quantum", kind: "full stack, superconducting" },
  { name: "Google Quantum AI", url: "https://quantumai.google/", kind: "full stack, superconducting" },
  { name: "Microsoft Azure Quantum", url: "https://azure.microsoft.com/en-us/solutions/quantum-computing/", kind: "platform + topological research" },
  { name: "Amazon Braket (AWS)", url: "https://aws.amazon.com/braket/", kind: "cloud platform, multi vendor" },
  { name: "Quantinuum", url: "https://www.quantinuum.com/", kind: "trapped ion" },
  { name: "IonQ", url: "https://www.ionq.com/", kind: "trapped ion" },
  { name: "Rigetti", url: "https://www.rigetti.com/", kind: "superconducting" },
  { name: "PsiQuantum", url: "https://www.psiquantum.com/", kind: "photonic" },
  { name: "QuEra", url: "https://www.quera.com/", kind: "neutral atom" },
  { name: "JPMorgan Chase. Global Technology Applied Research", url: "https://www.jpmorgan.com/technology/applied-research", kind: "finance R&D" },
  { name: "US national labs (e.g., Fermilab SQMS, Oak Ridge)", url: "https://sqms.fnal.gov/", kind: "government research" },
];
