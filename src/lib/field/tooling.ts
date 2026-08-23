import type { FieldClaim } from "./types";

/**
 * The open-source tooling ecosystem, what a quantum software engineer
 * actually installs. Licenses and release facts from the repositories;
 * star counts are a dated snapshot and say so.
 */
export const TOOLING: FieldClaim[] = [
  {
    id: "tool-qiskit-2",
    title: "Qiskit SDK 2.0 (IBM): Apache-2.0",
    body: "Qiskit 2.0.0 was released on 31 March 2025. The release removed legacy APIs (the .c_if() method, the qobj module, BackendV1 and the Pulse package), added a C API for sparse observables, the SDK's first public C interface, and reported a 2× speedup in circuit construction over v1.3 from its Rust core. Qiskit is the SDK the site's own transpiler pipeline targets; the research wing's Benchpress entry (claim C14) is IBM's pytest-based cross-SDK benchmark built around it.",
    status: "verified",
    date: "2025-03",
    source: { label: "Qiskit 2.0 release notes (IBM Quantum docs)", url: "https://quantum.cloud.ibm.com/docs/en/api/qiskit/release-notes/2.0" },
    also: { label: "github.com/Qiskit/qiskit, release 2.0.0 (2025-03-31)", url: "https://github.com/Qiskit/qiskit/releases/tag/2.0.0" },
  },
  {
    id: "tool-openqasm-3",
    title: "OpenQASM 3.1.0: the circuit interchange language",
    body: "The OpenQASM specification's latest release is v3.1.0 (15 May 2024). OpenQASM 3 is the intermediate representation higher-level compilers use to talk to hardware, adding classical feed-forward control flow based on measurement outcomes and timing constructs (including 'stretch' for deferred timing resolution). The transpiler on this site parses OpenQASM 2.0 and 3.0; the Circuit Lab exports 2.0.",
    status: "verified",
    date: "2024-05",
    source: { label: "github.com/openqasm/openqasm, spec/v3.1.0 release", url: "https://github.com/openqasm/openqasm/releases" },
  },
  {
    id: "tool-cuda-q",
    title: "CUDA-Q (NVIDIA): hybrid CPU/GPU/QPU programming, Apache-2.0",
    body: "CUDA-Q is NVIDIA's open-source (Apache-2.0) platform for hybrid quantum-classical programs in C++ and Python, with a unified model for CPUs, GPUs and QPUs working together, the toolchain for the hybrid-systems engineer role in the careers section.",
    status: "verified",
    date: "2026-08",
    source: { label: "CUDA-Q documentation (NVIDIA)", url: "https://nvidia.github.io/cuda-quantum/latest/index.html" },
    also: { label: "github.com/NVIDIA/cuda-quantum (Apache-2.0)", url: "https://github.com/NVIDIA/cuda-quantum" },
  },
  {
    id: "tool-stim",
    title: "Stim (Google): the error-correction simulator",
    body: "Gidney's Stim simulates stabilizer circuits using an inverse-tableau representation, SIMD-optimized data layouts and Pauli-frame propagation. The paper reports analyzing a distance-100 surface-code circuit (20,000 qubits, 8 million gates, 1 million measurements) in 15 seconds and then sampling full shots at 1 kHz. It is the workhorse behind the below-threshold experiments on the hardware scoreboard.",
    status: "verified",
    date: "2021-07",
    source: { label: "Gidney, Quantum 5, 497 (2021)", url: "https://quantum-journal.org/papers/q-2021-07-06-497/" },
    also: { label: "github.com/quantumlib/Stim (Apache-2.0)", url: "https://github.com/quantumlib/Stim" },
  },
  {
    id: "tool-ecosystem-snapshot",
    title: "Ecosystem snapshot: licenses and adoption (GitHub, August 2026)",
    body: "All of the major frameworks are Apache-2.0 licensed. GitHub stars on the check date: Qiskit 7,731; Cirq (Google) 5,052; PennyLane (Xanadu, automatic differentiation for hybrid quantum-classical programs) 3,431; CUDA-Q 1,118; Stim 811; the OpenQASM specification 1,500. Stars measure attention, not quality, a dated proxy, nothing more.",
    status: "estimate",
    date: "2026-08",
    source: { label: "GitHub repository metadata via the GitHub API (checked 2026-08-21)", url: "https://github.com/Qiskit/qiskit" },
    also: { label: "pytest-qequiv, this site's own cross-SDK plugin", url: "https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" },
  },
];
