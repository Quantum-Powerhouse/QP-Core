import { NextRequest, NextResponse } from "next/server";

type TranspileRequest = {
  qasm?: string;
  version?: "2.0" | "3.0";
};

/**
 * Temporary mock transpiler endpoint used until NEXT_PUBLIC_TRANSPILER_API_URL
 * points at the real FastAPI backend on Render. Echoes the submitted QASM
 * inside a well-formed but fake Braket IR envelope, clearly labeled as mock
 * output so it can't be mistaken for a real transpilation result.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as TranspileRequest;
  const qasm = body.qasm ?? "";
  const version = body.version ?? "2.0";

  const qubitCount = (qasm.match(/qreg\s+q\[(\d+)\]|qubit\[(\d+)\]/)?.[1] ??
    qasm.match(/qreg\s+q\[(\d+)\]|qubit\[(\d+)\]/)?.[2]) ?? "?";

  return NextResponse.json({
    braket_ir: {
      mock: true,
      note:
        "This is a placeholder response from the site's built-in mock endpoint. " +
        "Set NEXT_PUBLIC_TRANSPILER_API_URL to your real FastAPI backend on Render " +
        "to get actual OpenQASM → Braket IR transpilation.",
      braketSchemaHeader: {
        name: "braket.ir.openqasm.program",
        version: "1",
      },
      source_version: version,
      source_qasm: qasm,
      qubit_count: qubitCount,
    },
  });
}
