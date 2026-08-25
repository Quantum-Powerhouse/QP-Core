import { NextRequest, NextResponse } from "next/server";
import { analyzeQasm } from "@/lib/qasmAnalyzer";

type TranspileRequest = {
  qasm?: string;
  version?: "2.0" | "3.0";
};

/**
 * Temporary mock transpiler endpoint used until NEXT_PUBLIC_TRANSPILER_API_URL
 * points at the real FastAPI backend on Render. The braket_ir field is a
 * clearly labeled placeholder, but qiskit_python and metrics are still
 * derived from the submitted QASM (see src/lib/qasmAnalyzer.ts) rather than
 * hardcoded, so the "live" numbers reflect the actual circuit pasted in.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as TranspileRequest;
  const qasm = body.qasm ?? "";
  const version = body.version ?? "2.0";

  const analysis = analyzeQasm(qasm);

  return NextResponse.json({
    braket_ir: {
      mock: true,
      note:
        "This is a placeholder response from the site's built in mock endpoint. " +
        "Set NEXT_PUBLIC_TRANSPILER_API_URL to your real FastAPI backend on Render " +
        "to get actual OpenQASM → Braket IR transpilation.",
      braketSchemaHeader: {
        name: "braket.ir.openqasm.program",
        version: "1",
      },
      source_version: version,
      source_qasm: qasm,
      qubit_count: analysis.qubitCount,
    },
    qiskit_python: analysis.qiskitPython,
    optimized_qasm: analysis.optimizedQasm,
    metrics: {
      qubit_count: analysis.qubitCount,
      gate_count: analysis.originalGateCount,
      optimized_gate_count: analysis.optimizedGateCount,
      reduction_pct: analysis.reductionPct,
      depth: analysis.depth,
    },
  });
}
