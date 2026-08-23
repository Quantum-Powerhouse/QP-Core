import type { Metadata } from "next";
import { Cite, DocCode, DocTitle, H2, Note, P, SourceLink } from "@/components/docs/DocElements";
import { JsonLd } from "@/components/JsonLd";
import { techArticleSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

const DATE_PUBLISHED = "2026-08-17";

export const metadata: Metadata = buildMetadata({
  title: "QP-Core Transpiler Pipeline: OpenQASM to Amazon Braket IR",
  description:
    "How QP-Core compiles an OpenQASM 2.0/3.0 circuit into Amazon Braket IR: Qiskit's own parser, the current (unoptimized) conversion path, and the qiskit-braket-provider IR emission step.",
  path: "/docs/qp-core/transpiler-pipeline",
  keywords: ["OpenQASM to Amazon Braket transpiler", "Qiskit Braket provider", "OpenQASM 3 parser"],
  ogTitle: "QP-Core: Transpiler Pipeline",
});

const PARSE_SNIPPET = `def _parse_circuit(source: str) -> QuantumCircuit:
    try:
        return qasm3.loads(source)
    except Exception:
        try:
            return QuantumCircuit.from_qasm_str(source)
        except Exception as exc:
            raise TranspilationError(f"Could not parse circuit source: {exc}") from exc`;

const EMIT_SNIPPET = `def transpile_to_braket(request: TranspileRequest) -> TranspileResponse:
    circuit = _parse_circuit(request.qasm)

    braket_circuit = to_braket(circuit)

    return TranspileResponse(
        braket_ir=braket_circuit.to_ir().json(),
        qasm=braket_circuit.to_ir().source if hasattr(braket_circuit.to_ir(), "source") else str(braket_circuit),
        target_device=request.target_device,
        qubit_count=circuit.num_qubits,
        gate_count=sum(circuit.count_ops().values()),
    )`;

const SCHEMA_SNIPPET = `class TranspileRequest(BaseModel):
    qasm: str
    target_device: BraketDevice = BraketDevice.LOCAL_SIMULATOR
    optimization_level: int = Field(1, ge=0, le=3)  # accepted, not yet wired up`;

export default function TranspilerPipelineDocPage() {
  const url = `${SITE_URL}/docs/qp-core/transpiler-pipeline`;

  return (
    <>
      <DocTitle
        eyebrow="QP-Core / Architecture"
        title="Transpiler Pipeline"
        dek="How a QP-Core request turns an OpenQASM 2.0/3.0 circuit into an Amazon Braket IR payload, documented against the backend's actual source, not an idealized description."
      />

      <P>
        QP-Core&apos;s FastAPI service (
        <SourceLink href="https://github.com/sadeqisaidmohaddes-star/quantumflow-api">
          quantumflow-api
        </SourceLink>
        ) exposes a single <code>POST /api/v1/transpile</code> endpoint. The request and response shapes are:
      </P>
      <DocCode lang="python" code={SCHEMA_SNIPPET} />
      <P>
        The pipeline behind that endpoint has three real stages today, parse, convert, emit. There is
        currently no fourth &quot;optimize&quot; stage in the code path, which the next section explains.
      </P>

      <H2>1. Parsing</H2>
      <P>
        Parsing is Qiskit&apos;s own, not a QP-Core-authored AST parser.{" "}
        <code>qasm3.loads()</code> is tried first (OpenQASM 3); if that raises, the code falls back to{" "}
        <code>QuantumCircuit.from_qasm_str()</code> (OpenQASM 2). Both return a Qiskit <code>QuantumCircuit</code>,
        Qiskit&apos;s own in-memory circuit representation. QP-Core doesn&apos;t define or walk its own AST.
      </P>
      <DocCode lang="python" code={PARSE_SNIPPET} />

      <H2>2. Optimization, accepted, not yet wired up</H2>
      <Note tone="warning">
        <code>TranspileRequest.optimization_level</code> is a real field in the request schema (default 1, range
        0-3, mirroring Qiskit&apos;s own convention), but the current <code>transpile_to_braket()</code>{" "}
        implementation never reads it. The circuit goes from parsed <code>QuantumCircuit</code> straight to
        Braket conversion, no <code>qiskit.transpile()</code> call, no <code>PassManager</code>, in the code
        path today.
      </Note>
      <P>
        For reference, once wired up this stage would run Qiskit&apos;s own preset pass managers, which include
        commutation-based gate cancellation (cancelling or merging adjacent gates that commute past each other,
        not just adjacent identical ones) and, for hardware targets with limited connectivity, layout selection
        and SWAP-based routing to satisfy the device&apos;s coupling map. Those are real, well-documented Qiskit
        internals, see Qiskit&apos;s{" "}
        <SourceLink href="https://quantum.cloud.ibm.com/docs/en/api/qiskit/transpiler">
          transpiler passes reference
        </SourceLink>.
        QP-Core would be selecting and configuring them, not implementing them from scratch.
      </P>
      <P>
        The{" "}
        <SourceLink href="/playground/qp-core">live playground on this site</SourceLink> shows a small, labeled
        preview of the same <em>class</em> of optimization: its client-side analyzer (
        <code>src/lib/qasmAnalyzer.ts</code>) cancels adjacent self-inverse single-qubit gate pairs on the
        circuit you paste in and reports the resulting gate-count reduction. It&apos;s a simplified, illustrative
        version of one thing a real commutation pass does, not the production QP-Core pipeline, and not a
        general commutation analysis (it only catches immediately-adjacent identical gates, not gates separated
        by something they commute past).
      </P>

      <H2>3. Braket IR emission</H2>
      <P>
        Conversion is handled by <code>qiskit_braket_provider</code>&apos;s <code>to_braket()</code> adapter,
        which maps the Qiskit circuit onto Amazon Braket&apos;s circuit model. The response serializes that via{" "}
        <code>to_ir()</code>, <code>braket_ir</code> carries the IR&apos;s JSON payload, and{" "}
        <code>qasm</code> carries a readable OpenQASM form when the IR type exposes one.
      </P>
      <DocCode lang="python" code={EMIT_SNIPPET} />

      <H2>Benchmarks</H2>
      <P>
        Not yet measured. The test suite today (
        <SourceLink href="https://github.com/sadeqisaidmohaddes-star/quantumflow-api/blob/main/tests/test_transpiler.py">
          tests/test_transpiler.py
        </SourceLink>
        ) covers correctness, a health check and a Bell-state transpile that asserts the reported qubit count,         not performance. There is no Rust or native extension anywhere in this service; it is pure Python
        (FastAPI + Qiskit + qiskit-braket-provider). A performance-benchmark section will be added here once
        real measurements exist, rather than before.
      </P>

      <JsonLd
        data={techArticleSchema({
          headline: "QP-Core Transpiler Pipeline: OpenQASM to Amazon Braket IR",
          description:
            "How QP-Core compiles an OpenQASM 2.0/3.0 circuit into Amazon Braket IR via Qiskit's parser and qiskit-braket-provider.",
          url,
          datePublished: DATE_PUBLISHED,
        })}
      />
      <Cite>Source: github.com/sadeqisaidmohaddes-star/quantumflow-api</Cite>
    </>
  );
}
