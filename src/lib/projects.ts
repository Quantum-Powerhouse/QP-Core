export type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  docsHref?: string;
};

export const projects: Project[] = [
  {
    title: "Quantum Arcade",
    description:
      "Playable quantum games and labs, every one driven by a real statevector. Grover search, CHSH Bell violation, teleportation, BB84, decoherence, error correction, every result computed live by the in browser simulator.",
    tags: ["Games", "Statevector Simulation", "Quantum Education"],
    href: "/playground/arcade",
  },
  {
    title: "QP-Core Transpiler",
    description:
      "A FastAPI service that parses OpenQASM 2.0/3.0 circuits and compiles them into Amazon Braket IR, powering the live terminal on this page.",
    tags: ["Qiskit", "OpenQASM", "Amazon Braket", "FastAPI"],
    href: "/playground/qp-core",
    docsHref: "/docs/qp-core/transpiler-pipeline",
  },
  {
    title: "Variational Quantum Eigensolver Suite",
    description:
      "A from scratch TypeScript VQE for the H2 molecule, running entirely client side: a statevector simulator, the exact parameter shift optimizer, and direct diagonalization for a ground truth check, no Qiskit, no backend.",
    tags: ["VQE", "Quantum Chemistry", "Statevector Simulation"],
    href: "/playground/vqe-suite",
    docsHref: "/docs/vqe-suite/hamiltonian-and-ansatz",
  },
  {
    title: "Zero Noise Extrapolation",
    description:
      "Digital gate folding over a real depolarizing noise density matrix simulation, then Richardson extrapolation back to the zero noise limit, implemented and demonstrated, not just described.",
    tags: ["Error Mitigation", "NISQ", "Density Matrix"],
    href: "/playground/vqe-suite",
    docsHref: "/docs/vqe-suite/zero-noise-extrapolation",
  },
  {
    title: "Circuit Gate Timeline",
    description:
      "A rendered preview of a fixed 3-qubit circuit. Hadamard, CNOT entanglement, a phase gate, and measurement. For an interactive circuit, paste your own OpenQASM into the QP-Core transpiler above.",
    tags: ["Quantum Mechanics", "Visualization"],
    href: "/playground/qp-core",
  },
];
