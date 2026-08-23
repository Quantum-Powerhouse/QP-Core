import type { FieldClaim } from "./types";

/**
 * Quantum sensing — the nearest-term quantum technology with shipping
 * products. Verified records first, maturity estimates clearly labeled.
 */
export const SENSING: FieldClaim[] = [
  {
    id: "sense-jila-clock-2024",
    title: "An optical clock with 8.1 × 10⁻¹⁹ systematic uncertainty",
    body: "Aeppli, Kim, Warfield, Safronova and Ye (JILA) reported a strontium optical lattice clock with a total systematic uncertainty of 8.1 × 10⁻¹⁹ in fractional frequency — stated as the lowest of any clock to date — by controlling the black-body radiation shift and second-order Zeeman coefficient. Clocks at this level resolve centimetre-scale height differences through gravitational redshift.",
    status: "verified",
    date: "2024-07",
    source: { label: "Aeppli et al., Phys. Rev. Lett. 133, 023401 (2024) — arXiv 2403.10664", url: "https://arxiv.org/abs/2403.10664" },
  },
  {
    id: "sense-wannier-stark-2025",
    title: "Two-minute atomic coherence; instability 1.5 × 10⁻¹⁸ at one second",
    body: "Kim, Aeppli, Warfield, Chu, Rey and Ye reported a ⁸⁷Sr Wannier-Stark lattice clock with coherence of 118(9) s at reduced density — approaching the spontaneous-emission limit — and fractional instability of 1.5 × 10⁻¹⁸ at 1 s of averaging. Stability at one second is what makes such precision usable rather than merely attainable. A preprint at the time of checking.",
    status: "preprint",
    date: "2025-05",
    source: { label: "Kim et al., arXiv 2505.06444 (May 2025)", url: "https://arxiv.org/abs/2505.06444" },
  },
  {
    id: "sense-maturity-2026",
    title: "Maturity by modality: clocks shipping, gravimeters in trials",
    body: "An industry guide places atomic clocks as the most commercially mature quantum-sensing modality (technology readiness 7–8, field-deployed products) with quantum gravimeters at readiness 5–6 in pre-commercial trials, and projects the sensor market at $1.5–2.0 billion by 2030. An aggregator's assessment, not a measurement — treat the readiness levels as a sketch and the market figure as a forecast.",
    status: "estimate",
    date: "2026-01",
    source: { label: "Entangled Future — Quantum Sensing 2026 guide", url: "https://entangledfuture.com/guides/quantum-sensing-guide/" },
  },
];
