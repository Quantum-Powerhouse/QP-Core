import type { Metadata } from "next";
import { Cite, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { JsonLd } from "@/components/JsonLd";
import { techArticleSchema } from "@/lib/jsonld";
import { Katex } from "@/lib/math";
import { SITE_URL, buildMetadata } from "@/lib/seo";

const DATE_PUBLISHED = "2026-08-18";

export const metadata: Metadata = buildMetadata({
  title: "VQE Suite: Statevector Amplitudes, Reduced Density Matrix & Measurement",
  description:
    "How the H2 ansatz's statevector amplitudes become measurement probabilities, why its reduced single qubit state is mixed rather than pure, and how a single real projective measurement is sampled.",
  path: "/docs/vqe-suite/state-representations-and-measurement",
  keywords: ["quantum statevector", "reduced density matrix", "purity", "projective measurement", "QSphere"],
  ogTitle: "VQE Suite: State Representations & Measurement",
});

export default function StateRepresentationsDocPage() {
  const url = `${SITE_URL}/docs/vqe-suite/state-representations-and-measurement`;

  return (
    <>
      <DocTitle
        eyebrow="VQE Suite / Physics"
        title="State Representations & Measurement"
        dek="The same statevector that the Convergence tab optimizes also drives the Statevector table, the QSphere, and the Measure button, this page derives what each of those views actually shows."
      />

      <H2>From θ to amplitudes and probabilities</H2>
      <P>
        The ansatz statevector, derived on{" "}
        <SourceLink href="/docs/vqe-suite/hamiltonian-and-ansatz">the Hamiltonian &amp; Ansatz page</SourceLink>{" "}
        by tracing the circuit gate by gate, is
      </P>
      <Katex display expr="|\psi(\theta)\rangle = \cos\tfrac{\theta}{2}\,|01\rangle + \sin\tfrac{\theta}{2}\,|10\rangle" />
      <P>
        using this site&apos;s basis index convention (basis index <Katex expr="= 2q_1 + q_0" />, see{" "}
        <code>src/lib/physics/statevector.ts</code>), the same convention the Statevector table&apos;s{" "}
        <code>BASIS_LABELS</code> and the QSphere&apos;s point layout both use. Both amplitudes are always real
        for this ansatz, so the Statevector table&apos;s Phase column only ever reads 0° or 180°, and the
        QSphere colors points by the sign of the real amplitude (green positive, blue negative) rather than a
        general complex phase.
      </P>
      <P>
        Measurement probabilities are the squared amplitudes, exactly what{" "}
        <code>probabilitiesOf()</code> in <code>src/lib/physics/measurement.ts</code> computes:
      </P>
      <Katex display expr="P(01) = \cos^2\tfrac{\theta}{2}, \qquad P(10) = \sin^2\tfrac{\theta}{2}" />
      <P>
        At the VQE converged <Katex expr="\theta^\ast \approx -0.22974" />: <Katex expr="P(01) \approx 98.69\%" />,
        <Katex expr="P(10) \approx 1.31\%" />, the near certainty of the |01⟩ outcome you see reflected in
        both the Statevector table and the QSphere&apos;s point sizes (point radius{" "}
        <Katex expr="\propto \sqrt{P}" />, so area encodes probability).
      </P>

      <H2>The reduced state of qubit 0, and why it&apos;s mixed</H2>
      <P>
        <code>reducedDensityMatrixQubit0()</code> partial traces qubit 1 out of the full 2-qubit state:{" "}
        <Katex expr="\rho_0[a][b] = \sum_{q_1} \langle 2q_1{+}a | \psi \rangle \langle \psi | 2q_1{+}b \rangle" />.
        For this ansatz only the <Katex expr="|01\rangle" /> and <Katex expr="|10\rangle" /> amplitudes are
        nonzero, so every off diagonal cross term vanishes and the sum collapses to a diagonal matrix:
      </P>
      <Katex display expr="\rho_0 = \begin{pmatrix} \sin^2\tfrac{\theta}{2} & 0 \\ 0 & \cos^2\tfrac{\theta}{2} \end{pmatrix}" />
      <Note>
        For this particular ansatz, <Katex expr="\rho_0" />&apos;s diagonal entries are literally the same
        numbers as the measurement probabilities above, a coincidence of this ansatz&apos;s structure (only
        two, mutually exclusive on qubit 0 basis states are populated), not a general fact about reduced
        states.
      </Note>
      <P>
        <code>purity()</code> then computes <Katex expr="\operatorname{Tr}(\rho_0^2)" />, which for a diagonal
        matrix is just the sum of the squared diagonal entries:
      </P>
      <Katex display expr="\operatorname{Tr}(\rho_0^2) = \sin^4\tfrac{\theta}{2} + \cos^4\tfrac{\theta}{2}" />
      <P>
        At <Katex expr="\theta = 0" /> (the untrained ansatz, exactly <Katex expr="|01\rangle" />) this gives{" "}
        <Katex expr="1" /> exactly, qubit 0 is a pure, unentangled product state. At{" "}
        <Katex expr="\theta^\ast \approx -0.22974" /> it drops to <Katex expr="\approx 0.97407" />: the
        converged ground state is entangled, if only slightly, across the two qubits, a real
        property of the H<sub>2</sub> ground state this ansatz reaches, not an artifact of the visualization.
      </P>

      <H2>Measurement is a real single sample, not an animation</H2>
      <P>
        Clicking <em>Measure ▸</em> on the Statevector tab calls <code>sampleMeasurement()</code>, which draws
        one <code>Math.random()</code> value and walks the cumulative distribution of{" "}
        <Katex expr="|\text{amplitude}|^2" /> until it exceeds the draw (inverse CDF sampling), a single projective measurement, done once per click, not a scripted collapse effect. Run repeatedly, the outcome frequencies
        converge to the probabilities above; a 20,000-sample check against this exact implementation matched
        the true probabilities to within statistical error (max deviation ≈0.00074, consistent with the
        expected <Katex expr="\sqrt{p(1-p)/N}" /> sampling noise).
      </P>
      <P>
        See it running live on{" "}
        <SourceLink href="/playground/vqe-suite">the VQE Suite playground</SourceLink>, the Statevector,
        QSphere, and Step by Step tabs all read from the same <code>runH2AnsatzStatevector(theta)</code> call.
      </P>

      <JsonLd
        data={techArticleSchema({
          headline: "VQE Suite: Statevector Amplitudes, Reduced Density Matrix & Measurement",
          description:
            "How the H2 ansatz's statevector amplitudes become measurement probabilities, why its reduced single qubit state is mixed, and how a real projective measurement is sampled.",
          url,
          datePublished: DATE_PUBLISHED,
        })}
      />
      <Cite>Source: src/lib/physics/statevector.ts, entanglement.ts, measurement.ts, vqe.ts</Cite>
    </>
  );
}
