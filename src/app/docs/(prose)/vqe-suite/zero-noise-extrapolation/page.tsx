import type { Metadata } from "next";
import { Cite, DocCode, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { JsonLd } from "@/components/JsonLd";
import { techArticleSchema } from "@/lib/jsonld";
import { Katex } from "@/lib/math";
import { SITE_URL, buildMetadata } from "@/lib/seo";

const DATE_PUBLISHED = "2026-08-17";

export const metadata: Metadata = buildMetadata({
  title: "Zero-Noise Extrapolation: Gate Folding & Richardson Extrapolation",
  description:
    "The math behind the VQE Suite's ZNE panel: depolarizing-channel Kraus operators, digital gate folding, and Richardson extrapolation via Lagrange interpolation, with real measured numbers.",
  path: "/docs/vqe-suite/zero-noise-extrapolation",
  keywords: ["Quantum Zero Noise Extrapolation toolkit", "Richardson extrapolation quantum", "NISQ error mitigation"],
  ogTitle: "VQE Suite: Zero-Noise Extrapolation",
});

const FOLD_SNIPPET = `applySequence(ansatzPhysicalGates(theta, false));      // U
for (let k = 0; k < foldK; k++) {
  applySequence(ansatzPhysicalGates(theta, true));      // U-dagger
  applySequence(ansatzPhysicalGates(theta, false));     // U
}
// lambda = 2*foldK + 1`;

const EXTRAPOLATE_SNIPPET = `export function lagrangeInterpolate(points: { x: number; y: number }[], atX: number): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    let weight = 1;
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      weight *= (atX - points[j].x) / (points[i].x - points[j].x);
    }
    total += weight * points[i].y;
  }
  return total;
}`;

export default function ZneDocPage() {
  const url = `${SITE_URL}/docs/vqe-suite/zero-noise-extrapolation`;

  return (
    <>
      <DocTitle
        eyebrow="VQE Suite / Physics"
        title="Zero-Noise Extrapolation"
        dek="How the ZNE panel turns a noisy energy estimate back toward the noiseless answer: depolarizing noise, digital gate folding, and Richardson extrapolation, with real numbers from the shipped simulator."
      />

      <H2>Depolarizing noise</H2>
      <P>
        Each gate in the ansatz circuit is followed by a depolarizing channel acting on the qubit(s) it touched.
        For a single qubit,
      </P>
      <Katex display expr="\rho \to (1-p)\rho + \frac{p}{3}\left(X\rho X + Y\rho Y + Z\rho Z\right)" />
      <P>
        and for the two-qubit CNOT gate, the channel spreads over all 15 non-identity two-qubit Pauli strings:
      </P>
      <Katex
        display
        expr="\rho \to (1-p)\rho + \frac{p}{15}\sum_{P \neq I\otimes I} P\rho P^\dagger"
      />
      <P>
        implemented directly on a 4×4 density matrix in <code>src/lib/physics/densityMatrix.ts</code>, the
        playground&apos;s two sliders set the single-qubit gate error rate and the two-qubit (CNOT) gate error
        rate independently, since real hardware&apos;s two-qubit gates are consistently noisier.
      </P>

      <H2>Digital gate folding</H2>
      <P>
        Zero-noise extrapolation needs the <em>same circuit</em> run at several different noise levels. Rather
        than changing hardware noise directly, digital ZNE scales it by re-running extra, otherwise-redundant
        gates: global folding replaces the ansatz unitary <Katex expr="U" /> with
      </P>
      <Katex display expr="U_\lambda = U\,(U^\dagger U)^{k}, \qquad \lambda = 2k+1" />
      <P>
        Ideally <Katex expr="U^\dagger U = I" />, so <Katex expr="U_\lambda" /> computes the same thing as{" "}
        <Katex expr="U" />, but each extra <Katex expr="U^\dagger U" /> pair re-executes every physical gate,
        which re-exposes the state to the depolarizing channels above. More folds, same ideal answer, more
        accumulated noise:
      </P>
      <DocCode lang="typescript" code={FOLD_SNIPPET} />
      <P>
        The playground evaluates <Katex expr="\lambda = 1, 3, 5" /> (<Katex expr="k = 0, 1, 2" />).
      </P>

      <H2>Richardson extrapolation via Lagrange interpolation</H2>
      <P>
        With noisy energy estimates <Katex expr="E(\lambda_1), \ldots, E(\lambda_n)" /> at{" "}
        <Katex expr="n" /> known noise scales, Richardson extrapolation fits the unique degree-<Katex expr="(n-1)" />{" "}
        polynomial through those points and evaluates it at <Katex expr="\lambda = 0" />. Since these are exact
        deterministic simulation outputs (not statistically noisy samples), plain Lagrange interpolation is the
        right tool, no least-squares regression needed:
      </P>
      <Katex
        display
        expr="E(0) \approx \sum_{i=1}^{n} E(\lambda_i) \prod_{j \neq i} \frac{0 - \lambda_j}{\lambda_i - \lambda_j}"
      />
      <DocCode lang="typescript" code={EXTRAPOLATE_SNIPPET} />
      <P>
        The playground reports both the 2-point linear extrapolation (<Katex expr="\lambda=1,3" />) and the
        3-point quadratic extrapolation (<Katex expr="\lambda=1,3,5" />).
      </P>

      <H2>Worked example (real measured output)</H2>
      <Note>
        These numbers are a real run of the shipped code (<code>runZne()</code> in{" "}
        <code>src/lib/physics/zne.ts</code>) at the VQE-optimized <Katex expr="\theta \approx -0.2297" />, with
        error rates <Katex expr="p_1 = 0.2\%" /> per single-qubit gate and <Katex expr="p_2 = 2\%" /> per CNOT,         not illustrative/rounded figures.
      </Note>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-4">λ</th>
              <th className="py-2 pr-4">Energy (Ha)</th>
              <th className="py-2 pr-4">Error vs. noiseless (mHa)</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-b border-border/60">
              <td className="py-2 pr-4">1 (raw, noisy)</td>
              <td className="py-2 pr-4">-1.083360</td>
              <td className="py-2 pr-4">62.270</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-2 pr-4">3 (raw, noisy)</td>
              <td className="py-2 pr-4">-0.967183</td>
              <td className="py-2 pr-4">178.446</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-2 pr-4">5 (raw, noisy)</td>
              <td className="py-2 pr-4">-0.861327</td>
              <td className="py-2 pr-4">284.302</td>
            </tr>
            <tr className="border-b border-border/60">
              <td className="py-2 pr-4">0 (linear extrap., 2-pt)</td>
              <td className="py-2 pr-4">-1.141448</td>
              <td className="py-2 pr-4">4.181</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">0 (quadratic extrap., 3-pt)</td>
              <td className="py-2 pr-4">-1.145319</td>
              <td className="py-2 pr-4 text-accent">0.311</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        Chemical accuracy is conventionally <Katex expr="1.6" /> mHa. The raw λ=1 estimate misses it by nearly
        40×; quadratic Richardson extrapolation recovers it from the same noisy data. Reproduce this yourself,
        or with your own error rates, on{" "}
        <SourceLink href="/playground/vqe-suite">the VQE Suite playground</SourceLink>, see also{" "}
        <SourceLink href="/docs/vqe-suite/hamiltonian-and-ansatz">Hamiltonian &amp; Ansatz</SourceLink> for the
        parameter-shift optimizer that produces <Katex expr="\theta" />.
      </P>

      <JsonLd
        data={techArticleSchema({
          headline: "Zero-Noise Extrapolation: Gate Folding & Richardson Extrapolation",
          description:
            "Depolarizing-channel Kraus operators, digital gate folding, and Richardson extrapolation via Lagrange interpolation, with real measured numbers.",
          url,
          datePublished: DATE_PUBLISHED,
        })}
      />
      <Cite>Source: src/lib/physics/densityMatrix.ts, zne.ts, linalg.ts</Cite>
    </>
  );
}
