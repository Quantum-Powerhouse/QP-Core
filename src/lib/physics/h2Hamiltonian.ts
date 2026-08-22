import { pauliSumMatrix, type PauliSum } from "./pauli.ts";

/**
 * H2 minimal-basis (STO-3G), parity-reduced 2-qubit electronic Hamiltonian.
 *
 * Coefficients from O'Malley et al., "Scalable Quantum Simulation of Molecular
 * Energies," Phys. Rev. X 6, 031007 (2016), DOI: 10.1103/PhysRevX.6.031007,
 * at bond length R = 0.75 Angstrom:
 *
 *   H_electronic = g0*I + g1*Z0 + g2*Z1 + g3*Z0Z1 + g4*Y0Y1 + g5*X0X1
 *
 * Qubit ordering: paulis are listed [q1, q0] (q1 = most-significant / left
 * Kronecker factor), matching src/lib/physics/pauli.ts's convention.
 */
export const H2_BOND_LENGTH_ANGSTROM = 0.75;

export const H2_COEFFICIENTS = {
  g0: -0.4804,
  g1: 0.3435,
  g2: -0.4347,
  g3: 0.5716,
  g4: 0.091,
  g5: 0.091,
};

const BOHR_RADIUS_ANGSTROM = 0.529177210903;

/** Nuclear repulsion energy (Hartree) for two protons separated by rAngstrom. */
export function nuclearRepulsion(rAngstrom: number): number {
  const rBohr = rAngstrom / BOHR_RADIUS_ANGSTROM;
  return 1 / rBohr;
}

export function h2PauliSum(): PauliSum {
  const { g0, g1, g2, g3, g4, g5 } = H2_COEFFICIENTS;
  return [
    { coefficient: g0, paulis: ["I", "I"] },
    { coefficient: g1, paulis: ["I", "Z"] },
    { coefficient: g2, paulis: ["Z", "I"] },
    { coefficient: g3, paulis: ["Z", "Z"] },
    { coefficient: g4, paulis: ["Y", "Y"] },
    { coefficient: g5, paulis: ["X", "X"] },
  ];
}

export function h2ElectronicHamiltonianMatrix() {
  return pauliSumMatrix(h2PauliSum());
}

export function h2NuclearRepulsion(): number {
  return nuclearRepulsion(H2_BOND_LENGTH_ANGSTROM);
}
