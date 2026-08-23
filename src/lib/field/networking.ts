import type { FieldClaim } from "./types";

/**
 * Quantum networking, entanglement distribution milestones, from satellite
 * links to deployed metropolitan fiber, and the repeater ingredients still
 * being built. Every entry names its paper.
 */
export const NETWORKING: FieldClaim[] = [
  {
    id: "net-micius-2017",
    title: "Satellite entanglement over 1,203 km (Micius)",
    body: "Yin et al. distributed entangled photon pairs from a satellite to two ground stations separated by 1,203 km, the distance record that established space links as a route around fiber loss.",
    status: "verified",
    date: "2017-06",
    source: { label: "Yin et al., Science 356, 1140 (2017), arXiv 1707.01339", url: "https://arxiv.org/abs/1707.01339" },
  },
  {
    id: "net-harvard-aws-2024",
    title: "Quantum memory nodes entangled over 35 km of Boston fiber",
    body: "Knaut et al. (Harvard/AWS) entangled silicon-vacancy centers in nanophotonic diamond cavities, nodes with electron and long-lived nuclear spin qubits, across a 35 km fiber loop deployed in the Boston urban environment, plus 40 km spools. Memory nodes, not just photons, are what a repeater network needs.",
    status: "verified",
    date: "2024-05",
    source: { label: "Knaut et al., Nature 629, 573 (2024), arXiv 2310.01316", url: "https://arxiv.org/abs/2310.01316" },
  },
  {
    id: "net-telekom-berlin-2025",
    title: "Entanglement on a live telecom network, alongside classical traffic",
    body: "Sena et al. ran polarization-entangled photons through Deutsche Telekom's Berlin metropolitan fibers over selectable paths from 10 m to 60 km (extended to ~100 km), at 1324 nm coexisting with bidirectional C-band classical traffic on the same fibers. Bell-state fidelities of 85-99%, CHSH S between 2.36 and 2.74, and under 1.5% downtime across multi-day runs, the same Bell test the arcade lets you run.",
    status: "verified",
    date: "2025-11",
    source: { label: "Sena et al., J. Opt. Commun. Netw. 17(12), 1072 (2025), arXiv 2504.08927", url: "https://arxiv.org/abs/2504.08927" },
  },
  {
    id: "net-geneva-modes-2026",
    title: "8,235 stored modes of entanglement across Geneva",
    body: "Rodriguez, Nicolas, Afzelius et al. distributed entanglement over 5.66 km of the Geneva metropolitan network while storing 8,235 temporal modes for 63 µs in a quantum memory (16,340 modes for 125 µs in the lab). Multimode memories are the throughput ingredient a quantum repeater requires. A preprint at the time of checking.",
    status: "preprint",
    date: "2026-08",
    source: { label: "arXiv 2608.13177 (August 2026)", url: "https://arxiv.org/abs/2608.13177" },
  },
];

export const NETWORKING_CONTEXT = {
  notYet: "No quantum-repeater network, entanglement distributed over long distance by chaining memory nodes, without trusted intermediate sites, has been deployed at scale as of the check date. The entries above are the components: space links, memory nodes, live-fiber coexistence, and multimode storage.",
};
