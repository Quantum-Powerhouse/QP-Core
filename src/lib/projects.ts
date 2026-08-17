export type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    title: "QP-Core Transpiler",
    description:
      "A FastAPI service that parses OpenQASM 2.0/3.0 circuits and compiles them into Amazon Braket IR, powering the live terminal on this page.",
    tags: ["Qiskit", "OpenQASM", "Amazon Braket", "FastAPI"],
  },
  {
    title: "Variational Quantum Eigensolver Suite",
    description:
      "Qiskit-based VQE implementations for molecular ground-state energy estimation, benchmarked across simulators and hardware backends.",
    tags: ["Qiskit", "VQE", "Quantum Chemistry"],
  },
  {
    title: "Quantum Error Mitigation Toolkit",
    description:
      "Zero-noise extrapolation and readout error mitigation routines for improving fidelity on NISQ-era quantum devices.",
    tags: ["Qiskit", "Error Mitigation", "NISQ"],
  },
  {
    title: "Quantum Circuit Visualizer",
    description:
      "An interactive tool for building, simulating, and visualizing quantum circuits and their resulting statevectors.",
    tags: ["Quantum Mechanics", "Simulation", "Visualization"],
  },
];
