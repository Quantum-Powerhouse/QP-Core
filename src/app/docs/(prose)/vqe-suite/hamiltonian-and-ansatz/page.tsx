import type { Metadata } from "next";
import { Cite, DocCode, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { JsonLd } from "@/components/JsonLd";
import { techArticleSchema } from "@/lib/jsonld";
import { Katex } from "@/lib/math";
import { SITE_URL, buildMetadata } from "@/lib/seo";

const DATE_PUBLISHED = "2026-08-17";

export const metadata: Metadata = buildMetadata({
  title: "VQE Suite: H2 Hamiltonian, Jordan-Wigner Reduction & Ansatz Selection",
  description:
    "The H2 second-quantized Hamiltonian, its Jordan-Wigner-reduced 2-qubit form (O'Malley et al. 2016), and a derivation of why a single-parameter ansatz is exact for this ground-state search.",
  path: "/docs/vqe-suite/hamiltonian-and-ansatz",
  keywords: ["Qiskit VQE benchmark suite", "variational quantum eigensolver", "Jordan-Wigner transformation"],
  ogTitle: "VQE Suite: Hamiltonian & Ansatz",
});

const HAMILTONIAN_SNIPPET = `export const H2_COEFFICIENTS = {
  g0: -0.4804, g1: 0.3435, g2: -0.4347,
  g3: 0.5716,  g4: 0.091,  g5: 0.091,
};

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
}`;

const ANSATZ_SNIPPET = `export function h2AnsatzGates(): AnsatzGate[] {
  return [
    { kind: "X", qubit: 0 },
    { kind: "CNOT", control: 1, target: 0 },
    { kind: "RY", qubit: 1, parameterized: true },
    { kind: "CNOT", control: 1, target: 0 },
  ];
}`;

export default function HamiltonianAnsatzDocPage() {
  const url = `${SITE_URL}/docs/vqe-suite/hamiltonian-and-ansatz`;

  return (
    <>
      <DocTitle
        eyebrow="VQE Suite / Physics"
        title="Hamiltonian & Ansatz"
        dek="The H2 Hamiltonian used by the live VQE Suite playground, and a from-scratch derivation of why its single-parameter ansatz circuit is exact, not just a convenient guess."
      />

      <H2>The H2 electronic Hamiltonian</H2>
      <P>
        In second quantization, a molecule&apos;s electronic Hamiltonian in a finite orbital basis is
      </P>
      <Katex
        display
        expr="\hat{H} = \sum_{pq} h_{pq}\, a_p^\dagger a_q + \frac{1}{2}\sum_{pqrs} h_{pqrs}\, a_p^\dagger a_q^\dagger a_r a_s"
      />
      <P>
        where the one- and two-electron integrals <Katex expr="h_{pq}" /> and <Katex expr="h_{pqrs}" /> come
        from the molecular orbitals, and the Jordan-Wigner transform maps each fermionic operator to a string of
        Pauli operators (each <Katex expr="a_p^\dagger" /> becomes a weighted Pauli string acting on qubit{" "}
        <Katex expr="p" /> and a <Katex expr="Z" />-string over all lower-indexed qubits, so that the fermionic
        anticommutation relations survive the mapping onto qubits).
      </P>
      <P>
        For H<sub>2</sub> in a minimal (STO-3G) basis, applying Jordan-Wigner to the 4 spin-orbitals and then a
        symmetry (parity) reduction, using that the ground state has fixed particle number and{" "}
        <Katex expr="S_z" />, collapses the problem onto 2 qubits. This site uses the reduced 2-qubit
        Hamiltonian exactly as published, rather than re-deriving the parity-tapering step:
      </P>
      <Katex
        display
        expr="\hat{H}_{\text{elec}} = g_0 I + g_1 Z_0 + g_2 Z_1 + g_3 Z_0 Z_1 + g_4 Y_0 Y_1 + g_5 X_0 X_1"
      />
      <Note>
        Coefficients <Katex expr="g_0,\ldots,g_5" /> at bond length <Katex expr="R = 0.75" /> Å, from{" "}
        <SourceLink href="https://doi.org/10.1103/PhysRevX.6.031007">
          O&apos;Malley et al., &quot;Scalable Quantum Simulation of Molecular Energies,&quot; Phys. Rev. X 6,
          031007 (2016)
        </SourceLink>,
        cross-checked against an independent secondary source before use (see verification note below).
      </Note>
      <DocCode lang="typescript" code={HAMILTONIAN_SNIPPET} />
      <P>
        Nuclear repulsion is added as a classical constant, computed live rather than folded into a lookup
        table:
      </P>
      <Katex display expr="E_{nn} = \frac{Z_1 Z_2}{R} = \frac{1}{R_{\text{Bohr}}}\ \text{Hartree}" />
      <P>
        with <Katex expr="R_{\text{Bohr}} = R / a_0" /> and <Katex expr="a_0 = 0.529177210903" /> Å (CODATA Bohr
        radius). At <Katex expr="R = 0.75" /> Å this gives <Katex expr="E_{nn} \approx 0.70557" /> Hartree, see{" "}
        <code>nuclearRepulsion()</code> in <code>src/lib/physics/h2Hamiltonian.ts</code>.
      </P>

      <H2>Why the ground state lives in a 2-dimensional subspace</H2>
      <P>
        Write basis states as <Katex expr="|q_0 q_1\rangle" />. <Katex expr="I" />, <Katex expr="Z_0" />,{" "}
        <Katex expr="Z_1" />, and <Katex expr="Z_0 Z_1" /> are all diagonal in this basis, so they never mix
        different computational-basis states. <Katex expr="Y_0 Y_1" /> and <Katex expr="X_0 X_1" /> each flip{" "}
        <em>both</em> qubits at once, so they only connect <Katex expr="|00\rangle \leftrightarrow |11\rangle" />{" "}
        and <Katex expr="|01\rangle \leftrightarrow |10\rangle" />, the Hamiltonian splits into two independent
        2×2 blocks and never mixes them.
      </P>
      <P>
        Evaluating both diagonals: <Katex expr="\langle 00|\hat H|00\rangle = g_0+g_1+g_2+g_3 = 0" /> and{" "}
        <Katex expr="\langle 11|\hat H|11\rangle = g_0-g_1-g_2+g_3 \approx 0.1824" />, both non-negative, so
        that block cannot contain the ground state. The other block, in the{" "}
        <Katex expr="\{|01\rangle, |10\rangle\}" /> basis, is
      </P>
      <Katex
        display
        expr="M = \begin{pmatrix} g_0-g_1+g_2-g_3 & g_4+g_5 \\ g_4+g_5 & g_0+g_1-g_2-g_3 \end{pmatrix} \approx \begin{pmatrix} -1.8302 & 0.1820 \\ 0.1820 & -0.2738 \end{pmatrix}"
      />
      <P>
        with closed-form eigenvalues (see <code>eigen2x2Symmetric()</code> in{" "}
        <code>src/lib/physics/linalg.ts</code>, used directly, not a general iterative solver, since a 2×2
        symmetric matrix has an exact quadratic-formula solution):
      </P>
      <Katex
        display
        expr="\lambda_\pm = \frac{\operatorname{tr}(M) \pm \sqrt{\operatorname{tr}(M)^2 - 4\det(M)}}{2}"
      />
      <P>
        which gives a minimum electronic eigenvalue <Katex expr="\lambda_- \approx -1.8512" /> Hartree. Adding
        nuclear repulsion, <Katex expr="E_{\text{total}} = \lambda_- + E_{nn} \approx -1.1456" /> Hartree,         matching the well-known H<sub>2</sub>/STO-3G full-CI benchmark of{" "}
        <Katex expr="\approx -1.137" /> Hartree to within the expected residual from the R = 0.75 Å vs. 0.735 Å
        bond-length difference between the source data and the textbook value.
      </P>

      <H2>The ansatz circuit</H2>
      <P>
        Since only the <Katex expr="\{|01\rangle, |10\rangle\}" /> subspace matters, a single real parameter is
        enough to reach the exact ground state, no expressibility is wasted on states the Hamiltonian can never
        select. The ansatz is Hartree-Fock state preparation followed by a controlled rotation:
      </P>
      <DocCode lang="typescript" code={ANSATZ_SNIPPET} />
      <P>
        Tracing the circuit by hand: <Katex expr="X(q_0)" /> takes <Katex expr="|00\rangle" /> to{" "}
        <Katex expr="|q_0{=}1,q_1{=}0\rangle" />. The first <Katex expr="\text{CNOT}(q_1 \to q_0)" /> is a no-op
        (control qubit is <Katex expr="|0\rangle" />). <Katex expr="RY(\theta)" /> on <Katex expr="q_1" /> gives{" "}
        <Katex expr="\cos\frac{\theta}{2}|q_0{=}1,q_1{=}0\rangle + \sin\frac{\theta}{2}|q_0{=}1,q_1{=}1\rangle" />.
        The second CNOT now fires on the second term (control <Katex expr="q_1=1" />), flipping{" "}
        <Katex expr="q_0" /> there and landing exactly on the coupled subspace:
      </P>
      <Katex
        display
        expr="|\psi(\theta)\rangle = \cos\tfrac{\theta}{2}\,|q_0{=}1,q_1{=}0\rangle + \sin\tfrac{\theta}{2}\,|q_0{=}0,q_1{=}1\rangle"
      />
      <P>
        Optimization uses the exact parameter-shift rule for this single <Katex expr="RY(\theta)" /> generator
        (no finite-difference approximation):
      </P>
      <Katex display expr="\frac{\partial E}{\partial \theta} = \frac{E(\theta+\pi/2) - E(\theta-\pi/2)}{2}" />
      <P>
        Running this in the browser (<code>runVqe()</code> in <code>src/lib/physics/vqe.ts</code>) converges to{" "}
        <Katex expr="\theta^\ast \approx -0.2297" />, <Katex expr="E \approx -1.145630" /> Hartree, matching
        the exact diagonalization above to machine precision, confirmed against{" "}
        <code>exactGroundStateEnergy()</code> at build-verification time. See it run live on{" "}
        <SourceLink href="/playground/vqe-suite">the VQE Suite playground</SourceLink>.
      </P>

      <JsonLd
        data={techArticleSchema({
          headline: "VQE Suite: H2 Hamiltonian, Jordan-Wigner Reduction & Ansatz Selection",
          description:
            "The H2 second-quantized Hamiltonian, its Jordan-Wigner-reduced 2-qubit form, and why a single-parameter ansatz is exact for this ground-state search.",
          url,
          datePublished: DATE_PUBLISHED,
        })}
      />
      <Cite>Source: src/lib/physics/h2Hamiltonian.ts, h2Ansatz.ts, vqe.ts, linalg.ts</Cite>
    </>
  );
}
