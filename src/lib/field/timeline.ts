import type { FieldClaim } from "./types";

/**
 * The timeline debate. The honest shape of it, as of the check date: the
 * *results* (below-threshold error correction, logical-beats-physical) are
 * verified and no longer seriously disputed; the disagreement is about how
 * fast useful fault-tolerant machines follow, and whether scaling economics
 * cooperate. Impossibility skeptics are a small minority. The lists below
 * are not symmetric because the evidence is not symmetric.
 */

export const TIMELINE_OPTIMISTS: FieldClaim[] = [
  {
    id: "neven-five-years",
    title: "Hartmut Neven (Google Quantum AI): commercial applications 'within five years'",
    body: "In February 2025 the head of Google Quantum AI told Reuters he expects commercial quantum applications within five years, naming materials science, medicine and energy. That is a prediction from the lab that published the below-threshold result two months earlier.",
    status: "opinion",
    date: "2025-02",
    source: { label: "The Quantum Insider, reporting Reuters, 5 Feb 2025", url: "https://thequantuminsider.com/2025/02/05/google-quantum-ai-head-sees-commercial-quantum-within-five-years/" },
  },
  {
    id: "ibm-2029",
    title: "IBM: a fault-tolerant Starling system by 2029",
    body: "IBM's roadmap commits to 200 logical qubits executing 100 million gates in 2029. It is the most detailed public engineering plan in the industry — and a roadmap, not a result.",
    status: "projection",
    date: "2025-06",
    source: { label: "IBM Quantum blog", url: "https://www.ibm.com/quantum/blog/large-scale-ftqc" },
  },
  {
    id: "aaronson-2025",
    title: "Scott Aaronson (UT Austin): from cautious to 'one of the most optimistic talks I've ever given'",
    body: "A decade-long voice of caution, Aaronson wrote on 21 December 2025 that 2025's hardware met or exceeded his expectations — multiple platforms above 99.9% two-qubit fidelity and below fault-tolerance thresholds — and that his Q2B keynote, 'Why I Think Quantum Computing Works', was among the most optimistic he has given. He paraphrased his critics: 'A decade ago you said you were 35. Now you say you're 45.' He remains clear that useful fault-tolerant machines are a matter of years, not months.",
    status: "opinion",
    date: "2025-12",
    source: { label: "Shtetl-Optimized, 'More on whether useful quantum computing is imminent'", url: "https://scottaaronson.blog/?p=9425" },
  },
];

export const TIMELINE_SKEPTICS: FieldClaim[] = [
  {
    id: "huang-2025",
    title: "Jensen Huang (NVIDIA): '15 to 30 years' — then a public retraction ten weeks later",
    body: "At CES on 7 January 2025 Huang said that if you put 'very useful quantum computers' at 15 years 'that would probably be on the early side' and 30 'probably on the late side', sending quantum stocks down sharply. At NVIDIA's first Quantum Day on 20 March 2025 he opened with: 'This is the first event in history where a company CEO invites all of the guests to explain why he was wrong.' Worth recording on both sides: the original skepticism, and how quickly a well-informed outsider reversed it.",
    status: "opinion",
    date: "2025-03",
    source: { label: "HPCwire: GTC Quantum Day, Jensen's mea culpa", url: "https://www.hpcwire.com/2025/03/25/gtc-quantum-day-jensens-mea-culpa-nvidias-growing-quantum-bet/" },
    also: { label: "CNBC, 20 Mar 2025", url: "https://www.cnbc.com/2025/03/20/nvidia-ceo-huang-says-was-wrong-about-timeline-for-quantum-computing.html" },
  },
  {
    id: "kalai-2026",
    title: "Gil Kalai (Hebrew University): still a skeptic — correlated noise may forbid scalable error correction",
    body: "Kalai's long-standing thesis is that some principle of correlated noise, beyond plain quantum mechanics, screens off quantum computation; as of his 10 March 2026 post he still identifies as a skeptic. Aaronson's characterization, which Kalai reproduces: he 'starts with quantum computation being impossible as his axiom, then works backwards to find what kinds of correlated noise would kill' error correction. This is the principled impossibility position — and, after the 2024–2026 below-threshold results, a minority one.",
    status: "opinion",
    date: "2026-03",
    source: { label: "Combinatorics and more, 10 Mar 2026", url: "https://gilkalai.wordpress.com/2026/03/10/scott-aaronsons-view-of-my-view-about-quantum-computing/" },
  },
  {
    id: "das-sarma-2022",
    title: "Sankar Das Sarma (Maryland): 'Quantum computing has a hype problem'",
    body: "Writing in MIT Technology Review in March 2022, a leading condensed-matter theorist with 100+ quantum papers argued that NISQ-era devices were 'a tremendous scientific achievement' that 'take us no closer to having a quantum computer that can solve a problem that anybody cares about', and that commercialization claims around optimization and AI were mystifying even to experts. The critique of NISQ commercial claims has aged well; the results that followed it were about error correction, not NISQ.",
    status: "opinion",
    date: "2022-03",
    source: { label: "MIT Technology Review, 28 Mar 2022", url: "https://www.technologyreview.com/2022/03/28/1048355/quantum-computing-has-a-hype-problem/" },
  },
];
