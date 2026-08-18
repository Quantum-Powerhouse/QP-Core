/**
 * Minimal 1-parameter H2 ansatz for the 2-qubit parity-reduced Hamiltonian
 * (see h2Hamiltonian.ts). Prepares the Hartree-Fock reference (X on q0) then
 * rotates into the doubly-excited determinant via a CNOT-RY(theta)-CNOT block
 * — the standard "Givens rotation" excitation gate restricted to the 2-qubit
 * case (e.g. O'Malley et al. 2016, Fig. 2; Qiskit textbook's minimal H2 VQE
 * ansatz). This circuit produces exactly
 *
 *   |psi(theta)> = cos(theta/2)|q0=1,q1=0> + sin(theta/2)|q0=0,q1=1>
 *
 * i.e. a rotation confined to the 2-dimensional subspace that the
 * Hamiltonian's X0X1/Y0Y1 terms couple — the physically relevant subspace
 * for the H2 ground state search in this reduced representation.
 */
export type AnsatzGate =
  | { kind: "X"; qubit: number }
  | { kind: "CNOT"; control: number; target: number }
  | { kind: "RY"; qubit: number; parameterized: true };

export const H2_NUM_QUBITS = 2;

export function h2AnsatzGates(): AnsatzGate[] {
  return [
    { kind: "X", qubit: 0 },
    { kind: "CNOT", control: 1, target: 0 },
    { kind: "RY", qubit: 1, parameterized: true },
    { kind: "CNOT", control: 1, target: 0 },
  ];
}
