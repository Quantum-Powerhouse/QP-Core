import type { FieldClaim } from "./types";

/**
 * Unsolved theoretical problems — the questions whose answers would change
 * what the hardware scoreboard is for. Each entry cites the paper that
 * framed it; none of these are settled at the check date.
 */
export const OPEN_PROBLEMS: FieldClaim[] = [
  {
    id: "open-bqp-np",
    title: "Is BQP contained in NP? Is NP contained in BQP? (open)",
    body: "The exact relationship between what quantum computers can do efficiently (BQP) and the NP / polynomial-hierarchy landscape is unproven in either direction. Aaronson's 2009 work gave evidence — a relativized world where BQP is not in the polynomial hierarchy — but no unconditional separation exists. The working conjecture in the field is that NP-complete problems stay hard for quantum computers; the applications map on this site is written under that assumption.",
    status: "verified",
    date: "2009-10",
    source: { label: "Aaronson, 'BQP and the Polynomial Hierarchy' (2009) — arXiv 0910.4698", url: "https://arxiv.org/abs/0910.4698" },
  },
  {
    id: "open-quantum-pcp",
    title: "The quantum PCP conjecture (open)",
    body: "Classically, the PCP theorem says certain approximation problems are as hard as exact ones. The quantum version asks whether estimating the ground energy of a local Hamiltonian to constant precision is QMA-hard. Aharonov, Arad and Vidick's 2013 survey framed the question and its consequences for physics (robust entanglement at constant temperature); it remains unresolved.",
    status: "verified",
    date: "2013-09",
    source: { label: "Aharonov, Arad, Vidick, 'The Quantum PCP Conjecture' (2013) — arXiv 1309.7495", url: "https://arxiv.org/abs/1309.7495" },
  },
  {
    id: "open-dequantization",
    title: "Which claimed speedups survive dequantization?",
    body: "In 2018 Ewin Tang gave a classical algorithm for recommendation systems that, assuming sample-and-query access to the data, matches the earlier quantum algorithm up to polynomial factors — erasing a claimed exponential speedup. The pattern has since been applied to other quantum-machine-learning algorithms; which remaining speedups are genuine versus artifacts of a data-access assumption is an active question, and the reason the applications map labels quantum machine learning 'promising, unproven'.",
    status: "verified",
    date: "2018-07",
    source: { label: "Tang, 'A quantum-inspired classical algorithm for recommendation systems' (2018) — arXiv 1807.04271", url: "https://arxiv.org/abs/1807.04271" },
  },
  {
    id: "open-threshold-assumptions",
    title: "The threshold theorem's assumptions versus real noise",
    body: "Aharonov and Ben-Or proved that quantum computation can be made robust against errors when the error rate is below a constant threshold — for a noise model the abstract describes as general and not necessarily probabilistic, and even for one-dimensional devices with nearest-neighbor interactions. The guarantee is relative to that model: whether a real device's correlated, drifting or leakage errors fit it well enough is exactly what the below-threshold experiments on the scoreboard test.",
    status: "verified",
    date: "1999-06",
    source: { label: "Aharonov & Ben-Or, 'Fault-Tolerant Quantum Computation With Constant Error Rate' — arXiv quant-ph/9906129", url: "https://arxiv.org/abs/quant-ph/9906129" },
  },
  {
    id: "open-nisq-advantage",
    title: "Is there useful advantage before fault tolerance?",
    body: "Preskill's 2018 'NISQ' paper named the era of noisy intermediate-scale devices (50–100 qubits, in his framing) and argued they may surpass classical computers on some tasks while noting that gate noise limits the circuit sizes that run reliably. Eight years on, the strongest advantage claims (see the hardware scoreboard and applications map) still come with caveats, and whether NISQ-era devices deliver useful advantage before fault tolerance remains an open empirical question — one DARPA's benchmarking initiative exists to adjudicate.",
    status: "verified",
    date: "2018-01",
    source: { label: "Preskill, 'Quantum Computing in the NISQ era and beyond', Quantum 2, 79 (2018) — arXiv 1801.00862", url: "https://arxiv.org/abs/1801.00862" },
  },
];
