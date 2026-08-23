import type { FieldClaim } from "./types";

/**
 * Hardware scoreboard, scored on logical qubits, gate fidelity, and code
 * distance, not raw physical qubit counts. Each entry says whether it is a
 * published result or a roadmap promise.
 */

export const HARDWARE_MILESTONES: FieldClaim[] = [
  {
    id: "google-willow-below-threshold",
    title: "Google Willow: below-threshold surface-code error correction",
    body: "A 105-qubit superconducting processor ran surface-code memories at distance 3, 5 and 7. Each step of +2 in code distance suppressed the logical error rate by Λ = 2.14 ± 0.02; the distance-7 code reached 0.143% ± 0.003% error per cycle with real-time decoding. The logical memory also beat break-even, outliving the processor's best physical qubit by 2.4 ± 0.3×.",
    status: "verified",
    date: "2024-12",
    source: { label: "Google Quantum AI, Nature 638, 920-926 (2025)", url: "https://www.nature.com/articles/s41586-024-08449-y" },
    also: { label: "arXiv:2408.13687", url: "https://arxiv.org/abs/2408.13687" },
  },
  {
    id: "msft-quantinuum-800x",
    title: "Microsoft + Quantinuum: logical qubits 800× better than physical",
    body: "Four logical qubits encoded in 30 trapped-ion physical qubits on Quantinuum's H2, with a logical error rate reported 800× lower than the physical rate and more than 14,000 circuit trials without an uncorrected error. The first widely cited demonstration that encoded qubits can beat the raw qubits they are built from.",
    status: "vendor-reported",
    date: "2024-04",
    source: { label: "Microsoft Official Blog, 3 Apr 2024", url: "https://blogs.microsoft.com/blog/2024/04/03/advancing-science-microsoft-and-quantinuum-demonstrate-the-most-reliable-logical-qubits-on-record-with-an-error-rate-800x-better-than-physical-qubits/" },
    also: { label: "Quantinuum press release", url: "https://www.quantinuum.com/press-releases/quantinuum-and-microsoft-announce-new-era-in-quantum-computing-with-breakthrough-demonstration-of-reliable-qubits" },
  },
  {
    id: "msft-quantinuum-12-logical",
    title: "Microsoft + Quantinuum: 12 entangled logical qubits",
    body: "Twelve logical qubits created and entangled on H2 with the same 800× single-qubit improvement, and a 22× circuit-error improvement over the corresponding physical circuit when all twelve were entangled.",
    status: "vendor-reported",
    date: "2024-09",
    source: { label: "Microsoft Official Blog, 10 Sep 2024", url: "https://blogs.microsoft.com/blog/2024/09/10/microsoft-announces-the-best-performing-logical-qubits-on-record-and-will-provide-priority-access-to-reliable-quantum-hardware-in-azure-quantum/" },
  },
  {
    id: "harvard-quera-48-logical",
    title: "Harvard / MIT / QuEra: 48 logical qubits on neutral atoms",
    body: "A reconfigurable neutral-atom processor ran algorithms on up to 48 logical qubits with hundreds of logical gates, the first logical-qubit demonstration at that scale, using 280 physical atoms and error-detecting codes.",
    status: "verified",
    date: "2023-12",
    source: { label: "Bluvstein et al., Nature 626, 58-65 (2024), arXiv:2312.03982", url: "https://arxiv.org/abs/2312.03982" },
  },
  {
    id: "harvard-quera-448-architecture",
    title: "Harvard / MIT / QuEra: 448-atom fault-tolerant architecture, 96 logical qubits, below threshold",
    body: "An integrated architecture on 448 atomic qubits combining the essential elements of fault-tolerant computation and demonstrating below-threshold error suppression; reported as 96 logical qubits using high-rate [[16,6,4]] codes, published in Nature in January 2026.",
    status: "verified",
    date: "2026-01",
    source: { label: "Harvard et al., arXiv:2506.20661 (Nature, Jan 2026)", url: "https://arxiv.org/abs/2506.20661" },
    also: { label: "Quantum Computing Report summary", url: "https://quantumcomputingreport.com/harvard-and-collaborators-demonstrate-scalable-fault-tolerant-architecture-with-448-neutral-atom-qubits/" },
  },
  {
    id: "quantinuum-helios",
    title: "Quantinuum Helios: 98 physical qubits, 99.921% two-qubit fidelity, 48 error-corrected logical qubits at 2:1",
    body: "Helios launched with 98 fully connected trapped-ion qubits, 99.921% average two-qubit gate fidelity and 99.9975% single-qubit fidelity. Three distinct logical results were reported, read the distinctions carefully: 94 error-*detected* logical qubits entangled in a GHZ state (~1:1 encoding, Iceberg code); 50 error-detected logical qubits at better-than-break-even; and 48 error-*corrected* logical qubits at a 2:1 physical-to-logical ratio via code concatenation.",
    status: "vendor-reported",
    date: "2025-11",
    source: { label: "Quantinuum blog, 5 Nov 2025", url: "https://www.quantinuum.com/blog/introducing-helios-the-most-accurate-quantum-computer-in-the-world" },
  },
  {
    id: "microsoft-majorana-contested",
    title: "Microsoft Majorana 1: the topological-qubit claim is disputed",
    body: "Microsoft announced a processor with eight 'topological' qubits by press release. The accompanying Nature paper stopped short of demonstrating a topological qubit, and Nature's editorial note stated the results 'do not represent evidence for the presence of Majorana zero modes'. A peer-reviewed challenge by Henry Legg (St Andrews) was later published in Nature alongside Microsoft's rebuttal. Status: not a verified logical-qubit result.",
    status: "contested",
    date: "2025-02",
    source: { label: "Nature news: 'some physicists are sceptical'", url: "https://www.nature.com/articles/d41586-025-00527-z" },
    also: { label: "Science: 'Debate erupts around Microsoft's claims'", url: "https://www.science.org/content/article/debate-erupts-around-microsoft-s-blockbuster-quantum-computing-claims" },
  },
];

export const HARDWARE_ROADMAPS: FieldClaim[] = [
  {
    id: "ibm-starling-2029",
    title: "IBM: Starling (2029): 200 logical qubits, 100 million gates; Blue Jay (post-2033): 2,000 logical qubits",
    body: "IBM's published path: Loon (2025) demonstrates qLDPC architecture elements; Kookaburra (2026) the first fault-tolerant module; Cockatoo (2027) entanglement between modules; Starling (2029) a full system executing 100 million gates on 200 logical qubits; Blue Jay (after 2033) one billion operations on 2,000 logical qubits.",
    status: "projection",
    date: "2025-06",
    source: { label: "IBM Quantum blog: 'IBM lays out clear path to fault-tolerant quantum computing'", url: "https://www.ibm.com/quantum/blog/large-scale-ftqc" },
    also: { label: "IBM Quantum roadmap", url: "https://www.ibm.com/roadmaps/quantum/" },
  },
  {
    id: "quantinuum-apollo-2029",
    title: "Quantinuum: Sol (2027) then Apollo (2029): universal, fully fault-tolerant",
    body: "Quantinuum's roadmap names Sol for 2027 (trap chip 'back from fabrication and advancing through product validation' as of 2026) and Apollo for 2029, described as 'fully fault-tolerant and universal', with 'hundreds of logical qubits' by 2030.",
    status: "projection",
    date: "2024-09",
    source: { label: "Quantinuum press release: accelerated roadmap", url: "https://www.quantinuum.com/press-releases/quantinuum-unveils-accelerated-roadmap-to-achieve-universal-fault-tolerant-quantum-computing-by-2030" },
  },
  {
    id: "ionq-2030",
    title: "IonQ: 2,000,000 physical / 80,000 logical qubits by 2030",
    body: "IonQ's roadmap page lists 12 logical qubits in 2026, 10,000 physical / 800 logical in 2027, 20,000 physical / 1,600 logical in 2028, and 2,000,000 physical / 80,000 logical in 2030 at 99.99% physical fidelity. These are the most aggressive public targets in the industry and should be read as such.",
    status: "projection",
    date: "2025-06",
    source: { label: "IonQ roadmap", url: "https://www.ionq.com/roadmap" },
  },
  {
    id: "psiquantum-2027",
    title: "PsiQuantum: first 'utility-scale, fault-tolerant' machine in Brisbane by end of 2027; Chicago to follow",
    body: "Announced in April 2024 with AU$940M in Australian federal and state backing; a second site in Chicago was announced with a US$760M Illinois commitment. Photonic architecture; no intermediate logical-qubit results have been published on the scale of the milestones above.",
    status: "projection",
    date: "2024-04",
    source: { label: "PsiQuantum announcement (Business Wire), 29 Apr 2024", url: "https://www.businesswire.com/news/home/20240429080449/en/PsiQuantum-to-Build-Worlds-First-Utility-Scale-Fault-Tolerant-Quantum-Computer-in-Australia" },
  },
];

/** The three-line summary the page leads with. */
export const HARDWARE_STATE = [
  { label: "Below-threshold error correction", achieved: true, note: "Google Willow (Nature, 2025); Harvard/QuEra 448-atom architecture (Nature, 2026)." },
  { label: "Logical qubits beating physical qubits", achieved: true, note: "Microsoft/Quantinuum 800× (2024); Willow memory 2.4× beyond break-even (2025); Helios (2025)." },
  { label: "A fault-tolerant machine solving useful problems", achieved: false, note: "Not achieved as of 2026-08-21. Every vendor target above is dated 2027 or later." },
];
