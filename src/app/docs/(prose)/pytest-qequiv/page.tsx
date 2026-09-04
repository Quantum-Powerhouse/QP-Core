import type { Metadata } from "next";
import Link from "next/link";
import { Cite, DocTitle, H2, P } from "@/components/docs/DocElements";
import { CodeBlock } from "@/components/CodeBlock";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "pytest-qequiv: Cross SDK Circuit Equivalence for pytest",
  description:
    "The companion tool of the research study: assert that the circuit your Qiskit code builds is the same unitary your Cirq or Braket port builds, with endianness normalization, and fail CI when it stops being true.",
  path: "/docs/pytest-qequiv",
  keywords: ["pytest quantum plugin", "circuit equivalence testing", "Qiskit Cirq Braket comparison", "quantum regression testing", "endianness qubit ordering"],
  ogTitle: "pytest-qequiv",
});

export default function PytestQequivPage() {
  return (
    <>
      <DocTitle
        eyebrow="Docs · the companion tool"
        title="pytest-qequiv"
        dek="One assertion: the circuit your Qiskit code builds is the same unitary your Cirq or Braket port builds. It exists because the research study found no tool that let a pytest suite say that and fail CI when it stops being true."
      />

      <H2>Quickstart</H2>
      <CodeBlock
        lang="python"
        code={`def test_my_bell_port_matches(qequiv):
    qequiv.assert_equivalent(build_bell_qiskit(), build_bell_cirq())`}
      />
      <P>
        When the port drifts, the failure says what happened and, when the culprit is qubit ordering, says that
        too:
      </P>
      <CodeBlock
        lang="python"
        code={`AssertionError: circuits are not equivalent: qiskit vs cirq, dim=4,
fidelity=0.500000 (need >= 0.999999990) (they DO match with
normalize_endianness=False, a qubit-ordering convention difference)`}
      />

      <H2>Install</H2>
      <CodeBlock
        lang="python"
        code={`pip install "pytest-qequiv[all] @ git+https://github.com/sadeqisaidmohaddes-star/pytest-qequiv"`}
      />
      <P>
        The core depends only on numpy; Qiskit, Cirq and the Braket SDK are optional extras, and you only need the
        ones your tests import. PyPI publishing is prepared in the repository and waits on the owner enabling the
        trusted publisher; until then the install comes from GitHub, as above.
      </P>

      <H2>The API</H2>
      <P>
        <code>assert_equivalent(a, b, atol=1e-8, normalize_endianness=True, msg=None)</code> raises with a diagnostic
        when the two circuits build different unitaries. <code>compare(a, b, ...)</code> returns a result object that
        is truthy on match, for use in plain asserts. <code>to_unitary(obj, normalize_endianness=True)</code> exposes
        the extraction step alone. Inputs may be Qiskit, Cirq or Braket circuit objects in any combination.
      </P>

      <H2>Why endianness normalization is the useful part</H2>
      <P>
        Qiskit orders qubits little endian; Cirq and Braket order big endian. The same program in two SDKs therefore
        builds matrices that differ by a qubit permutation, and a naive comparison calls every honest port broken.
        The plugin normalizes the convention before comparing, and when a mismatch would vanish under the other
        convention, the error message says so instead of leaving you to rediscover the field&apos;s most common
        false alarm.
      </P>

      <H2>Limits, stated plainly</H2>
      <P>
        Comparison is by the full unitary, so circuits must be deterministic (no mid circuit measurement or
        conditioning) and small enough to build the matrix, which in practice means unit test sized. That is the
        deliberate scope: the study&apos;s surviving gap was CI sized regression detection, and a unit test that
        builds a 4 by 4 matrix and fails on drift covers it.
      </P>

      <H2>Where it came from</H2>
      <P>
        The <Link href="/research" className="text-accent">research study</Link> checked what already existed: MQT
        QCEC checks equivalence within one toolchain, QUTest tests across versions of Qiskit only, Benchpress runs
        pytest across eight SDKs but detects nothing, and the pytest native plugins found were immature. The one
        surviving gap became this tool, and the{" "}
        <Link href="/research/replication" className="text-accent">replication page</Link> states exactly what
        finding would invalidate that claim.
      </P>
      <Cite>
        Repository: <a href="https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" className="text-accent" target="_blank" rel="noopener noreferrer">github.com/sadeqisaidmohaddes-star/pytest-qequiv</a>, MIT licensed, CI matrix across the three SDKs.
      </Cite>
    </>
  );
}
