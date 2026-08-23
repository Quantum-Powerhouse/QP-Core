import { RepresentsTag } from "@/components/quantum/RepresentsTag";
import { H2_BOND_LENGTH_ANGSTROM, H2_COEFFICIENTS, h2NuclearRepulsion } from "@/lib/physics/h2Hamiltonian";

const TERMS: { coeff: number; label: string }[] = [
  { coeff: H2_COEFFICIENTS.g0, label: "I" },
  { coeff: H2_COEFFICIENTS.g1, label: "Z₀" },
  { coeff: H2_COEFFICIENTS.g2, label: "Z₁" },
  { coeff: H2_COEFFICIENTS.g3, label: "Z₀Z₁" },
  { coeff: H2_COEFFICIENTS.g4, label: "Y₀Y₁" },
  { coeff: H2_COEFFICIENTS.g5, label: "X₀X₁" },
];

function formatTerm({ coeff, label }: { coeff: number; label: string }): string {
  const sign = coeff >= 0 ? "+" : "−";
  return `${sign} ${Math.abs(coeff).toFixed(4)}·${label}`;
}

export function HamiltonianPanel() {
  const nuclearRepulsion = h2NuclearRepulsion();

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-xl">
      <RepresentsTag docsHref="/docs/vqe-suite/hamiltonian-and-ansatz">
        the actual qubit Hamiltonian this simulator diagonalizes and optimizes against, every coefficient
        below is a real number the code computes with, not a label
      </RepresentsTag>

      <p className="overflow-x-auto whitespace-pre font-mono text-sm text-foreground">
        H = {TERMS.map(formatTerm).join(" ")}
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs text-muted sm:grid-cols-3">
        {TERMS.map((term) => (
          <p key={term.label}>
            <span className="text-muted">{term.label === "I" ? "g₀" : `g(${term.label})`}</span> ={" "}
            <span className="text-foreground">{term.coeff.toFixed(4)}</span> Ha
          </p>
        ))}
      </div>

      <p className="font-mono text-xs text-muted">
        Nuclear repulsion (R = {H2_BOND_LENGTH_ANGSTROM} Å):{" "}
        <span className="text-foreground">{nuclearRepulsion.toFixed(6)} Ha</span> · H₂ (STO-3G, parity-reduced
        to 2 qubits) · O&apos;Malley et al., Phys. Rev. X 6, 031007 (2016)
      </p>
    </div>
  );
}
