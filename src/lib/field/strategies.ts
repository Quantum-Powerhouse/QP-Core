import type { FieldClaim } from "./types";

/**
 * National and bloc strategies, money, dates, and the one program built to
 * separate hype from reality. Legislation in progress is marked as such.
 */
export const STRATEGIES: FieldClaim[] = [
  {
    id: "strat-us-nqira-2026",
    title: "United States: reauthorizing the National Quantum Initiative",
    body: "Two reauthorization bills were moving in 2026: the House Science Committee passed H.R. 8462 on 1 May 2026 (extending the initiative to 2032), while the Senate Commerce Committee advanced S. 3597 (extending to 2034). The two must be reconciled before full votes and signature, as of the check date the reauthorization is legislation in progress, not law.",
    status: "projection",
    date: "2026-05",
    source: { label: "Quantum Computing Report. House committee passes NQI reauthorization (May 2026)", url: "https://quantumcomputingreport.com/house-committee-passes-their-version-of-the-u-s-national-quantum-initiative-reauthorization-act/" },
    also: { label: "H.R. 8462 on congress.gov", url: "https://www.congress.gov/bill/119th-congress/house-bill/8462" },
  },
  {
    id: "strat-darpa-qbi-2025",
    title: "DARPA's Quantum Benchmarking Initiative: 11 companies into Stage B",
    body: "On 6 November 2025 DARPA selected 11 companies for Stage B of QBI. Atom Computing, Diraq, IBM, IonQ, Nord Quantique, Photonic Inc., Quantinuum, Quantum Motion, QuEra, Silicon Quantum Computing and Xanadu, spanning neutral atoms, trapped ions, superconducting, silicon spins and photonics. The program's stated goal is to determine whether any approach can reach utility-scale operation (computational value exceeding cost) by 2033; Stage B is a one-year R&D-plan phase and Stage C puts a government verification team on the design. It is the closest thing the field has to an independent referee.",
    status: "verified",
    date: "2025-11",
    source: { label: "DARPA. QBI Stage B selection (6 Nov 2025)", url: "https://www.darpa.mil/research/programs/quantum-benchmarking-initiative/stage-b-selection" },
  },
  {
    id: "strat-uk-2026",
    title: "United Kingdom: £2 billion for scaling and procurement (March 2026)",
    body: "On 17 March 2026 the UK government announced £2 billion: £1 billion for a first-of-its-kind procurement programme ('ProQure: Scaling UK Quantum Computing') and over £1 billion across four years for technology, skills and facilities, reported as £500m for pharmaceutical and finance applications, £400m for sensing and navigation, £125m for networking and £205m for diagnostics and secure communications. This sits on top of the 2023 National Quantum Strategy's ten-year £2.5 billion commitment.",
    status: "verified",
    date: "2026-03",
    source: { label: "Quantum Computing Report. UK commits £2 billion (17 Mar 2026)", url: "https://quantumcomputingreport.com/uk-government-commits-2-billion-2-67-billion-usd-to-national-quantum-scaling-and-procurement/" },
    also: { label: "UK National Quantum Strategy (NQCC)", url: "https://www.nqcc.ac.uk/about-us/national-quantum-strategy/" },
  },
  {
    id: "strat-uk-2023-mission",
    title: "United Kingdom (2023): £2.5 billion over ten years, and a 2035 mission",
    body: "The March 2023 National Quantum Strategy committed £2.5 billion over ten years to research, innovation and skills, with missions in computing, networking, sensing and navigation. Its headline computing mission is a target, not a result: 'By 2035, there will be accessible, UK-based quantum computers capable of running 1 trillion operations and supporting applications that provide benefits well in excess of classical supercomputers.' The strategy's vision is a 'leading quantum-enabled economy by 2033'.",
    status: "projection",
    date: "2023-03",
    source: { label: "UK National Quantum Strategy. NQCC summary", url: "https://www.nqcc.ac.uk/about-us/national-quantum-strategy/" },
    also: { label: "National Quantum Strategy (gov.uk PDF, March 2023)", url: "https://assets.publishing.service.gov.uk/media/6411a602e90e0776996a4ade/national_quantum_strategy.pdf" },
  },
  {
    id: "strat-eu-quantum-act-2026",
    title: "European Union: a Quantum Act planned for 2026",
    body: "The European Commission opened a call for contributions (31 October 2025, extended to 15 December) to shape a Quantum Act scheduled for adoption in 2026, with three stated objectives: boost research and innovation; scale industrial capacity including pilot lines and a design facility; and reinforce supply-chain resilience and governance. A legislative plan, not yet law, at the check date.",
    status: "projection",
    date: "2025-10",
    source: { label: "European Commission, call for contributions to the Quantum Act", url: "https://digital-strategy.ec.europa.eu/en/news/commission-invites-contributions-shape-future-eu-quantum-act" },
  },
];
