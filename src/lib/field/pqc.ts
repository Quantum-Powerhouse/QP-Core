import type { FieldClaim } from "./types";

/** Post-quantum cryptography: the most actionable section on the site. */

export const PQC_STANDARDS: FieldClaim[] = [
  {
    id: "fips-203-204-205",
    title: "NIST finalized FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA)",
    body: "On 13 August 2024 NIST issued its first three post quantum standards. ML-KEM (key encapsulation) derives from CRYSTALS-Kyber; ML-DSA (signatures) from CRYSTALS-Dilithium; SLH-DSA (stateless hash based signatures) from SPHINCS+. They are the algorithms the rest of this section assumes you will migrate to.",
    status: "verified",
    date: "2024-08",
    source: { label: "Federal Register notice, 14 Aug 2024", url: "https://www.federalregister.gov/documents/2024/08/14/2024-17956/announcing-issuance-of-federal-information-processing-standards-fips-fips-203-module-lattice-based" },
    also: { label: "NIST CSRC: Post Quantum Cryptography project", url: "https://csrc.nist.gov/projects/post-quantum-cryptography" },
  },
  {
    id: "hqc-backup",
    title: "HQC selected as a fifth, non lattice backup algorithm",
    body: "On 11 March 2025 NIST selected HQC, a code based key encapsulation scheme, as a backup to ML-KEM, deliberately not lattice based, so a future break of lattice assumptions would not take down both. ML-KEM remains the primary recommendation.",
    status: "verified",
    date: "2025-03",
    source: { label: "HPCwire: NIST selects HQC as fifth algorithm", url: "https://www.hpcwire.com/2025/03/12/nist-selects-hqc-as-fifth-algorithm-for-post-quantum-encryption/" },
  },
  {
    id: "nist-ir-8547-timeline",
    title: "NIST IR 8547: RSA/ECC at 112-bit strength deprecated after 2030, all quantum vulnerable public key disallowed after 2035",
    body: "NIST's transition roadmap (initial public draft, November 2024) sets two dates: algorithms providing ~112 bits of security. RSA-2048, ECDSA/ECDH on P-256, are deprecated after 2030 (no new use), and all quantum vulnerable public key algorithms are disallowed after 2035. The window between is the intended migration runway. Note: the document is an initial public draft; the dates are NIST's stated plan.",
    status: "verified",
    date: "2024-11",
    source: { label: "NIST IR 8547 ipd (PDF)", url: "https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf" },
  },
];

export const PQC_THREAT: FieldClaim[] = [
  {
    id: "mosca-inequality",
    title: "Mosca's inequality: if X + Y > Z, you are already late",
    body: "Michele Mosca's framing (IEEE Security & Privacy, 2018): let X be how long your data must stay secret, Y how long your migration to quantum safe cryptography takes, and Z how long until a cryptographically relevant quantum computer exists. If X + Y > Z, some data you protect today will be exposed. Because Z is uncertain and X can be decades for medical, legal or state secrets, the rational move is to shrink Y now.",
    status: "verified",
    date: "2018-09",
    source: { label: "Mosca, IEEE Security & Privacy 16(5), 38-41 (2018)", url: "https://ui.adsabs.harvard.edu/abs/2018ISPri..16e..38M/abstract" },
  },
  {
    id: "harvest-now-decrypt-later",
    title: "'Harvest now, decrypt later': why the deadline is before the computer exists",
    body: "An adversary can record encrypted traffic today and decrypt it when a capable machine arrives. Key exchange (RSA, ECDH) is the exposure: anything whose confidentiality must outlast the arrival of such a machine is at risk the moment it crosses the wire under classical public key protection. This is the threat model NIST's 2030/2035 dates are built around, and why migration of key exchange is prioritized over signatures.",
    status: "verified",
    date: "2024-11",
    source: { label: "NIST IR 8547 ipd, transition rationale", url: "https://nvlpubs.nist.gov/nistpubs/ir/2024/NIST.IR.8547.ipd.pdf" },
  },
  {
    id: "symmetric-not-broken",
    title: "AES and hash functions are not broken the same way",
    body: "Only public key cryptography is exposed to Shor's algorithm. Symmetric ciphers and hashes face at most Grover's quadratic speedup, which must run serially to realize; NIST's own FAQ states it is 'quite likely that Grover's algorithm will provide little or no advantage in attacking AES, and AES 128 will remain secure'. NIST even uses AES-128 as the security baseline for its post quantum categories. Migration effort belongs on key exchange and signatures.",
    status: "verified",
    date: "2024-08",
    source: { label: "NIST PQC FAQs", url: "https://csrc.nist.gov/projects/post-quantum-cryptography/faqs" },
  },
];

/** The falling cost of breaking RSA-2048, each point a named estimate. */
export const RSA_ESTIMATES: (FieldClaim & { qubits: string; time: string })[] = [
  {
    id: "fowler-2012",
    title: "Fowler, Mariantoni, Martinis & Cleland (2012)",
    qubits: "≈ 10⁹ physical qubits",
    time: "≈ 1 day (order of magnitude)",
    body: "The foundational surface code resource analysis. Its order of magnitude figure of roughly a billion physical qubits became the baseline that framed the urgency of NIST's 2016 call for post quantum algorithms.",
    status: "estimate",
    date: "2012-09",
    source: { label: "Phys. Rev. A 86, 032324 (2012)", url: "https://link.aps.org/doi/10.1103/PhysRevA.86.032324" },
  },
  {
    id: "gidney-ekera-2021",
    title: "Gidney & Ekerå (2019 preprint, Quantum 2021)",
    qubits: "20 million noisy physical qubits",
    time: "8 hours",
    body: "Assuming a planar superconducting grid, 10⁻³ physical error rate, 1 µs surface code cycle: ~20 million physical qubits, ~2.7 billion Toffoli gates, ~8 hours. A roughly 50× reduction from the 2012 baseline.",
    status: "verified",
    date: "2021-04",
    source: { label: "Quantum 5, 433 (2021)", url: "https://quantum-journal.org/papers/q-2021-04-15-433/" },
  },
  {
    id: "gidney-2025",
    title: "Gidney (2025)",
    qubits: "fewer than 1 million noisy physical qubits",
    time: "under one week",
    body: "The lowest published estimate as of this page's check date: a 20× reduction in qubits from the 2021 figure, at the cost of a longer runtime, using approximate residue arithmetic and yoked surface codes. A preprint; the direction of travel, down, fast, is the point.",
    status: "verified",
    date: "2025-05",
    source: { label: "Gidney, arXiv:2505.15917", url: "https://arxiv.org/abs/2505.15917" },
    also: { label: "Google Research listing", url: "https://research.google/pubs/how-to-factor-2048-bit-rsa-integers-with-less-than-a-million-noisy-qubits/" },
  },
];
