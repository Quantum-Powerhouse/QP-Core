import type { FieldClaim } from "./types";

/** What gets solved first — by expert consensus, with the hype separated out. */

export const FIRST_SOLVED: FieldClaim[] = [
  {
    id: "hoefler-cacm-2023",
    title: "Hoefler, Häner & Troyer (CACM 2023): chemistry and materials first; quadratic speedups don't pay",
    body: "The most-cited sober analysis of practical quantum advantage concludes that 'material science and chemistry' hold the most potential, that 'most of the proposed quantum algorithms and applications do not achieve the necessary speedups to be considered practical', and that 'small data problems and quantum algorithms with super-quadratic speedups are essential'. That single sentence rules out most big-data, machine-learning and generic optimization pitches, whose speedups are at best quadratic or whose inputs are too large to load.",
    status: "verified",
    date: "2023-05",
    source: { label: "Communications of the ACM 66(5), 82–87 (2023)", url: "https://cacm.acm.org/research/disentangling-hype-from-practicality-on-realistically-achieving-quantum-advantage/" },
    also: { label: "arXiv:2307.00523", url: "https://arxiv.org/abs/2307.00523" },
  },
  {
    id: "qctrl-2026",
    title: "Q-CTRL (May 2026): ~3,000× speedup on a materials problem on IBM hardware — vendor-reported",
    body: "Q-CTRL announced a ~3,000× speedup over performance-optimized classical software on a commercially relevant materials-discovery problem for the energy sector, run on IBM hardware, presenting it as evidence of practical quantum advantage. It is the first credible-looking claim of its kind and it is a vendor announcement; treat it as promising until independently reproduced.",
    status: "vendor-reported",
    date: "2026-05",
    source: { label: "Q-CTRL announcement", url: "https://q-ctrl.com/blog/q-ctrl-delivers-3-000x-speedup-in-materials-discovery-for-the-energy-sector-with-quantum-computing-and-demonstrates-evidence-of-practical-quantum-advantage" },
  },
  {
    id: "beverland-2022",
    title: "Microsoft (Beverland et al., 2022): practical chemistry advantage needs on the order of a million physical qubits",
    body: "A resource-estimation study across chemistry, materials and cryptanalysis concluding that useful advantage requires roughly a million physical qubits with fast, high-fidelity gates — and, consistent with the CACM analysis, that quadratic-speedup applications are unlikely to be practical. This is the scale IBM's and Quantinuum's 2029 roadmaps are aiming at.",
    status: "verified",
    date: "2022-11",
    source: { label: "Beverland et al., arXiv:2211.07629", url: "https://arxiv.org/abs/2211.07629" },
  },
];

export const FIRST_SOLVED_TIERS = [
  {
    tier: "Credible near-to-medium term (hybrid quantum-classical)",
    items: [
      "Ground-state and dynamics simulation of strongly-correlated molecules and materials — catalysts, battery chemistry, magnetic materials.",
      "Drug-discovery sub-problems where electronic structure, not screening throughput, is the bottleneck.",
      "Post-quantum cryptography migration — not a quantum application, but the first economic consequence of the field, and it is happening now.",
    ],
  },
  {
    tier: "Uncertain — promising but no demonstrated practical advantage",
    items: [
      "Combinatorial optimization (logistics, scheduling) via QAOA or annealing.",
      "Finance Monte Carlo via amplitude estimation — a quadratic speedup, which the CACM analysis flags as insufficient in practice.",
      "Quantum machine learning — constrained by the cost of loading classical data.",
    ],
  },
  {
    tier: "Not quantum problems",
    items: ["General-purpose computation.", "Image, video or text generation.", "Robotics and automation control."],
  },
];
