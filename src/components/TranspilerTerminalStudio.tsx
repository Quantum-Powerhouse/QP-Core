"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CodeBlock } from "@/components/CodeBlock";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";
import { RepresentsTag } from "@/components/quantum/RepresentsTag";
import { analyzeQasm } from "@/lib/qasmAnalyzer";

type QasmVersion = "2.0" | "3.0";
type TabId = "qasm" | "instructions" | "python" | "ir" | "metrics";

const SAMPLE_QASM: Record<QasmVersion, string> = {
  "2.0": `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
h q[0];
cx q[0], q[1];
measure q -> c;
`,
  "3.0": `OPENQASM 3.0;
include "stdgates.inc";

qubit[2] q;
bit[2] c;

h q[0];
h q[0];
cx q[0], q[1];
c = measure q;
`,
};

const TABS: { id: TabId; label: string }[] = [
  { id: "qasm", label: "OpenQASM" },
  { id: "instructions", label: "Parsed Instructions" },
  { id: "python", label: "Qiskit Python" },
  { id: "ir", label: "Optimized IR" },
  { id: "metrics", label: "Circuit Metrics" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_TRANSPILER_API_URL ?? "";
const IS_MOCK = !API_BASE_URL;
const TRANSPILE_ENDPOINT = API_BASE_URL
  ? `${API_BASE_URL.replace(/\/$/, "")}/transpile`
  : "/api/transpile";

type Metrics = {
  qubit_count: number;
  gate_count: number;
  optimized_gate_count: number;
  reduction_pct: number;
  depth: number;
};

type TranspileResult = {
  braketIr: string;
  qiskitPython: string | null;
  optimizedQasm: string | null;
  metrics: Metrics | null;
  latencyMs: number;
  mock: boolean;
};

async function runTranspile(
  qasm: string,
  version: QasmVersion,
): Promise<{ ok: true; result: TranspileResult } | { ok: false; message: string }> {
  const start = performance.now();
  try {
    const res = await fetch(TRANSPILE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qasm, version }),
    });
    const latencyMs = performance.now() - start;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        message: `Backend returned ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`,
      };
    }

    const data = await res.json();
    const ir = data.braket_ir ?? data.ir ?? data;

    return {
      ok: true,
      result: {
        braketIr: typeof ir === "string" ? ir : JSON.stringify(ir, null, 2),
        qiskitPython: typeof data.qiskit_python === "string" ? data.qiskit_python : null,
        optimizedQasm: typeof data.optimized_qasm === "string" ? data.optimized_qasm : null,
        metrics: data.metrics ?? null,
        latencyMs,
        mock: IS_MOCK,
      },
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

function useAnimatedNumber(target: number) {
  const [value, setValue] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    const from = startRef.current;
    const startTime = performance.now();
    const duration = 700;
    let raf: number;

    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        startRef.current = target;
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

function MetricCard({
  label,
  value,
  suffix,
  decimals = 0,
  color,
}: {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
  color: string;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold" style={{ color }}>
        {animated.toFixed(decimals)}
        <span className="text-base">{suffix}</span>
      </p>
    </div>
  );
}

function CopyButton({ text, onCopied }: { text: string; onCopied: () => void }) {
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          onCopied();
        } catch {
          // clipboard unavailable, silently ignore
        }
      }}
      className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
    >
      Copy
    </button>
  );
}

export function TranspilerTerminalStudio() {
  const [version, setVersion] = useState<QasmVersion>("2.0");
  const [code, setCode] = useState(SAMPLE_QASM["2.0"]);
  const [tab, setTab] = useState<TabId>("qasm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranspileResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const eventBus = useQuantumEventBus();
  const liveAnalysis = useMemo(() => analyzeQasm(code), [code]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(id);
  }, [toast]);

  function handleVersionChange(next: QasmVersion) {
    setVersion(next);
    setCode(SAMPLE_QASM[next]);
    setResult(null);
    setError(null);
  }

  async function handleTranspile() {
    setLoading(true);
    setError(null);
    eventBus.emit("TRANSPILATION_STARTED", { qasmVersion: version });

    const outcome = await runTranspile(code, version);
    if (outcome.ok) {
      setResult(outcome.result);
      setTab("ir");
      eventBus.emit("TRANSPILATION_FINISHED", {
        latencyMs: outcome.result.latencyMs,
        mock: outcome.result.mock,
        qubitCount: outcome.result.metrics?.qubit_count ?? null,
      });
    } else {
      setError(outcome.message);
      setResult(null);
      eventBus.emit("ERROR", { scope: "transpile", message: outcome.message });
    }
    setLoading(false);
  }

  return (
    <section id="transpiler" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-sm text-accent">Live Tool</p>
          <RepresentsTag docsHref="/docs/qp-core/transpiler-pipeline">
            a compiled program, parsing and Amazon Braket IR emission, not a running or simulated circuit
          </RepresentsTag>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Quantum Transpiler Terminal Studio
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Paste an OpenQASM 2.0 or 3.0 circuit, transpile it, and inspect the
            generated Qiskit Python, optimized IR, and real circuit metrics,             computed live from whatever you paste in.
          </p>
        </div>
        <a
          href="/playground/qp-core"
          className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          Open full playground →
        </a>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface/70 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {loading && (
          <motion.div
            className="absolute left-0 top-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="flex items-center justify-between border-b border-border bg-surface-2/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs text-muted">
              qasm-to-braket-ir, zsh
            </span>
          </div>
          {tab === "qasm" && (
            <div className="flex gap-1 rounded-full border border-border bg-background/60 p-1 font-mono text-xs">
              {(["2.0", "3.0"] as QasmVersion[]).map((v) => (
                <button
                  key={v}
                  onClick={() => handleVersionChange(v)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    version === v
                      ? "bg-accent text-[#faf8f3]"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  QASM {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border px-4 pt-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-t-md border-x border-t px-4 py-2 font-mono text-xs transition-colors ${
                tab === t.id
                  ? "border-border bg-surface text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="h-[420px]">
          {tab === "qasm" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="font-mono text-xs text-muted">input.qasm</span>
                <button
                  onClick={handleTranspile}
                  disabled={loading}
                  className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-medium text-[#faf8f3] transition-opacity disabled:opacity-50"
                >
                  {loading ? "Transpiling…" : "Run ▸ Transpile"}
                </button>
              </div>
              <textarea
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          )}

          {tab === "instructions" && (
            <div className="flex h-full flex-col overflow-auto px-4 py-3">
              <RepresentsTag docsHref="/docs/qp-core/transpiler-pipeline">
                a flat instruction list from a simplified client side line parser, not a full OpenQASM AST
                (no grammar tree, no scoping, no expressions), and not what the production Qiskit based
                backend does internally
              </RepresentsTag>
              <p className="mb-3 font-mono text-xs text-muted">
                Updates live as you type, no network round-trip. {liveAnalysis.originalGateCount} gates parsed,{" "}
                {liveAnalysis.cancelledCount} cancelled ({liveAnalysis.reductionPct}% reduction), same
                computation as the Circuit Metrics tab.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Gate</th>
                      <th className="px-3 py-2">Qubits</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveAnalysis.instructions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-muted">
                          {"// no recognized gates in the current input"}
                        </td>
                      </tr>
                    ) : (
                      liveAnalysis.instructions.map((ins) => (
                        <tr key={ins.index} className={`border-b border-border/60 ${ins.kept ? "" : "opacity-50"}`}>
                          <td className="px-3 py-2 text-muted">{ins.index}</td>
                          <td className={`px-3 py-2 ${ins.kept ? "text-foreground" : "text-muted line-through"}`}>
                            {ins.gate.name}
                          </td>
                          <td className="px-3 py-2 text-muted">{ins.gate.qubits.join(", ")}</td>
                          <td className="px-3 py-2">
                            {ins.kept ? (
                              <span className="text-accent">kept</span>
                            ) : (
                              <span className="text-[#b3372a]">
                                cancelled{ins.pairedWithIndex !== null ? ` → paired with #${ins.pairedWithIndex}` : ""}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "python" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="font-mono text-xs text-muted">circuit.py</span>
                {result?.qiskitPython && (
                  <CopyButton
                    text={result.qiskitPython}
                    onCopied={() => setToast("Copied circuit.py")}
                  />
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {result?.qiskitPython ? (
                  <CodeBlock code={result.qiskitPython} lang="python" />
                ) : (
                  <EmptyState error={error} loading={loading} />
                )}
              </div>
            </div>
          )}

          {tab === "ir" && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="font-mono text-xs text-muted">
                  braket_ir.json
                  {result?.mock && (
                    <span className="ml-2 rounded-full border border-accent-2/40 bg-accent-2/10 px-2 py-0.5 text-xs text-accent-2">
                      demo mode
                    </span>
                  )}
                </span>
                {result?.braketIr && (
                  <CopyButton
                    text={result.braketIr}
                    onCopied={() => setToast("Copied braket_ir.json")}
                  />
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {result?.braketIr ? (
                  <CodeBlock code={result.braketIr} lang="json" />
                ) : (
                  <EmptyState error={error} loading={loading} />
                )}
              </div>
            </div>
          )}

          {tab === "metrics" && (
            <div className="flex h-full flex-col justify-center gap-4 px-4">
              {result?.metrics ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard
                    label="Gate Count Reduction"
                    value={result.metrics.reduction_pct}
                    suffix="%"
                    color="#20507c"
                  />
                  <MetricCard
                    label="Circuit Depth"
                    value={result.metrics.depth}
                    suffix=" layers"
                    color="#20507c"
                  />
                  <MetricCard
                    label="Execution Latency"
                    value={result.latencyMs}
                    suffix="ms"
                    decimals={1}
                    color="#20507c"
                  />
                </div>
              ) : (
                <EmptyState error={error} loading={loading} />
              )}
              {result?.metrics && (
                <p className="font-mono text-xs text-muted">
                  {result.metrics.gate_count} gates in → {result.metrics.optimized_gate_count} after
                  cancelling adjacent self-inverse pairs · {result.metrics.qubit_count} qubits ·
                  latency measured client-side for this request.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-50 rounded-lg border border-accent/40 bg-surface px-4 py-2 font-mono text-xs text-accent shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function EmptyState({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) {
    return (
      <pre className="whitespace-pre-wrap px-4 py-4 font-mono text-sm text-[#b3372a]">
        {error}
      </pre>
    );
  }
  if (loading) {
    return (
      <p className="animate-pulse px-4 py-4 font-mono text-sm text-muted">
        {"// compiling circuit..."}
      </p>
    );
  }
  return (
    <p className="px-4 py-4 font-mono text-sm text-muted">
      {"// run a transpile from the OpenQASM tab to populate this view"}
    </p>
  );
}
