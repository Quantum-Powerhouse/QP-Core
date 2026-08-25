"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArcadeButton, Stat } from "@/components/arcade/kit";
import { PRESETS, toOpenQASM } from "@/lib/lab/circuit";

type Status = {
  backendConfigured: boolean;
  configured: boolean;
  busy?: boolean;
  shots_used_this_month?: number;
  monthly_shot_budget?: number;
  max_qubits?: number;
  max_gates?: number;
  shots_per_job?: number;
  note?: string;
};

type RunResult = {
  backend: string;
  job_id: string;
  shots: number;
  counts: Record<string, number>;
  ideal_counts: Record<string, number>;
  num_qubits: number;
};

/**
 * The live-hardware lane. Three states:
 *   1. backend not deployed  → explains exactly what is missing
 *   2. backend up, no token  → same, one step closer
 *   3. enabled               → submit ≤5-qubit OpenQASM, see real counts
 *                              beside the exact Born-rule prediction
 * Never shows a device result that did not come from a device.
 */
export function HardwareLane() {
  const [status, setStatus] = useState<Status | null>(null);
  const [qasm, setQasm] = useState(() => toOpenQASM(PRESETS[0].circuit));
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/hardware/status")
      .then((r) => r.json())
      .then((s: Status) => {
        if (alive) setStatus(s);
      })
      .catch(() => {
        if (alive) setStatus({ backendConfigured: false, configured: false, note: "Status endpoint unreachable." });
      });
    return () => {
      alive = false;
    };
  }, []);

  const enabled = !!status?.backendConfigured && !!status?.configured;

  const submit = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/hardware/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ qasm }) });
      const body = await r.json();
      if (!r.ok) {
        setError(body.detail ?? `request failed (${r.status})`);
      } else {
        setResult(body as RunResult);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "request failed");
    } finally {
      setRunning(false);
    }
  };

  const keys = result ? Array.from(new Set([...Object.keys(result.ideal_counts), ...Object.keys(result.counts)])).sort() : [];
  const maxCount = result ? Math.max(1, ...Object.values(result.counts), ...Object.values(result.ideal_counts)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-panel rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Lane status</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              {status === null ? "Checking…" : status.note ?? (enabled ? "Live execution enabled." : "Inactive.")}
            </p>
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              enabled ? "border-accent/60 text-accent" : "border-[#f59e0b]/60 text-[#f59e0b]"
            }`}
          >
            {status === null ? "checking" : enabled ? "live" : status.backendConfigured ? "backend up · no token" : "backend not deployed"}
          </span>
        </div>
        {status && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Stat label="max qubits" value={String(status.max_qubits ?? 5)} />
            <Stat label="max gates" value={String(status.max_gates ?? 50)} />
            <Stat label="shots per job" value={String(status.shots_per_job ?? 1024)} />
            <Stat label="monthly shot budget" value={status.monthly_shot_budget ? `${status.shots_used_this_month ?? 0} / ${status.monthly_shot_budget}` : "n/a"} accent={enabled} />
          </div>
        )}
        {!enabled && (
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
            What activates it: deploy the FastAPI service (one click Render blueprint in the backend repo) and set{" "}
            <code>QISKIT_IBM_TOKEN</code> there, then <code>NEXT_PUBLIC_TRANSPILER_API_URL</code> here. The guardrails (size caps, a monthly shot ledger, one job at a time) are enforced on the server and covered by
            the backend&apos;s tests.
          </p>
        )}
      </section>

      <section className="glass-panel rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground">Submit a circuit</h2>
        <p className="mt-1 text-sm text-muted">
          OpenQASM 2.0, up to {status?.max_qubits ?? 5} qubits. Build one in the{" "}
          <Link href="/lab" className="text-accent">Circuit Lab</Link> and paste its export here.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.filter((p) => p.circuit.numQubits <= 5).map((p) => (
            <ArcadeButton key={p.name} onClick={() => setQasm(toOpenQASM(p.circuit))}>
              {p.name}
            </ArcadeButton>
          ))}
        </div>
        <textarea
          value={qasm}
          onChange={(e) => setQasm(e.target.value)}
          spellCheck={false}
          rows={9}
          className="mt-3 w-full rounded-lg border border-border bg-background/70 p-3 font-mono text-[12px] leading-relaxed text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="OpenQASM 2.0 circuit"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ArcadeButton primary onClick={submit} disabled={!enabled || running}>
            {running ? "running on hardware…" : enabled ? "run on real hardware" : "run on real hardware (inactive)"}
          </ArcadeButton>
          {!enabled && status && <span className="font-mono text-[11px] text-muted">disabled until the lane is live; no simulation stands in for it</span>}
          {error && <span className="font-mono text-[11px] text-[#ff6b6b]">{error}</span>}
        </div>
      </section>

      {result && (
        <section className="glass-panel rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground">
            Real device vs. exact prediction, <span className="font-mono text-accent">{result.backend}</span>
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted">
            job {result.job_id} · {result.shots} shots · {result.num_qubits} qubits. Grey = exact Born-rule prediction; cyan = what the device measured. The difference is device noise.
          </p>
          <div className="mt-4 flex flex-col gap-1.5">
            {keys.map((k) => (
              <div key={k} className="flex items-center gap-2 font-mono text-xs">
                <span className="w-16 shrink-0 text-muted">|{k}⟩</span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="h-2 overflow-hidden rounded-sm bg-surface-2">
                    <div className="h-full bg-muted/60" style={{ width: `${((result.ideal_counts[k] ?? 0) / maxCount) * 100}%` }} />
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-surface-2">
                    <div className="h-full bg-accent" style={{ width: `${((result.counts[k] ?? 0) / maxCount) * 100}%` }} />
                  </div>
                </div>
                <span className="w-14 text-right text-muted">{result.ideal_counts[k] ?? 0}</span>
                <span className="w-14 text-right text-accent">{result.counts[k] ?? 0}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
