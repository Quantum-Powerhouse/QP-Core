"use client";

import { useState } from "react";

type QasmVersion = "2.0" | "3.0";

type TranspileSuccess = {
  ok: true;
  ir: string;
  mock: boolean;
};

type TranspileFailure = {
  ok: false;
  message: string;
};

const SAMPLE_QASM: Record<QasmVersion, string> = {
  "2.0": `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0], q[1];
measure q -> c;
`,
  "3.0": `OPENQASM 3.0;
include "stdgates.inc";

qubit[2] q;
bit[2] c;

h q[0];
cx q[0], q[1];
c = measure q;
`,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_TRANSPILER_API_URL ?? "";
// Falls back to the site's own mock endpoint (src/app/api/transpile) when no
// real backend URL is configured, so the terminal stays interactive on a
// fresh deploy. Swap NEXT_PUBLIC_TRANSPILER_API_URL to your Render URL to
// get real transpilation.
const IS_MOCK = !API_BASE_URL;
const TRANSPILE_ENDPOINT = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/$/, "")}/transpile`
  : "/api/transpile";

async function transpile(
  qasm: string,
  version: QasmVersion,
): Promise<TranspileSuccess | TranspileFailure> {
  try {
    const res = await fetch(TRANSPILE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qasm, version }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        message: `Backend returned ${res.status} ${res.statusText}${
          text ? `: ${text}` : ""
        }`,
      };
    }

    const data = await res.json();
    const ir = data.braket_ir ?? data.ir ?? data;
    return {
      ok: true,
      mock: IS_MOCK,
      ir: typeof ir === "string" ? ir : JSON.stringify(ir, null, 2),
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Request failed: ${err.message}`
          : "Request failed: unknown error.",
    };
  }
}

export function TranspilerTerminal() {
  const [version, setVersion] = useState<QasmVersion>("2.0");
  const [code, setCode] = useState(SAMPLE_QASM["2.0"]);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wasMock, setWasMock] = useState(false);

  function handleVersionChange(next: QasmVersion) {
    setVersion(next);
    setCode(SAMPLE_QASM[next]);
    setOutput(null);
    setError(null);
  }

  async function handleTranspile() {
    setLoading(true);
    setError(null);
    setOutput(null);

    const result = await transpile(code, version);

    if (result.ok) {
      setOutput(result.ir);
      setWasMock(result.mock);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  return (
    <section id="transpiler" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8">
        <p className="mb-2 font-mono text-sm text-accent">Live Tool</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Quantum Transpiler Terminal
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Paste an OpenQASM 2.0 or 3.0 circuit and transpile it to Amazon
          Braket IR in real time, powered by our FastAPI backend on Render.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">
              qasm-to-braket-ir — zsh
            </span>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-background/60 p-1 font-mono text-xs">
            {(["2.0", "3.0"] as QasmVersion[]).map((v) => (
              <button
                key={v}
                onClick={() => handleVersionChange(v)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  version === v
                    ? "bg-accent text-[#04121a]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                QASM {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
          <div className="bg-surface">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-xs text-muted">input.qasm</span>
              <button
                onClick={handleTranspile}
                disabled={loading}
                className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#04121a] transition-opacity disabled:opacity-50"
              >
                {loading ? "Transpiling…" : "Run ▸ Transpile"}
              </button>
            </div>
            <textarea
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-80 w-full resize-none bg-transparent px-4 pb-4 font-mono text-sm text-foreground outline-none"
            />
          </div>

          <div className="bg-surface">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-xs text-muted">
                braket_ir.json
              </span>
              {!error && output && wasMock && (
                <span className="rounded-full border border-accent-2/40 bg-accent-2/10 px-2.5 py-0.5 font-mono text-[10px] text-accent-2">
                  demo mode — mock output
                </span>
              )}
            </div>
            <div className="h-80 overflow-auto px-4 pb-4">
              {error && (
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#ff6b6b]">
                  {error}
                </pre>
              )}
              {!error && output && (
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#7ee787]">
                  {output}
                </pre>
              )}
              {!error && !output && !loading && (
                <p className="font-mono text-sm text-muted">
                  {"// output will appear here"}
                </p>
              )}
              {loading && (
                <p className="font-mono text-sm text-muted animate-pulse">
                  {"// compiling circuit..."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
