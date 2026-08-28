import hardware from "@/data/hardware.json";

type Run = {
  label: string;
  device?: string | null;
  shots: number | null;
  S: number | null;
  note?: string;
  correlations?: Record<string, number>;
};

/**
 * Simulation vs. a real device's noise model vs. real hardware, for the CHSH
 * Bell test. The data file is produced by scripts/hardware/ibm_noise_model.py;
 * whatever hasn't been run says so, no placeholder numbers, ever.
 */
export function HardwareComparison() {
  const data = hardware as { experiment: string; generated_at: string; classical_bound: number; tsirelson_bound: number; runs: Run[] };
  return (
    <section id="simulation-vs-device-chsh" className="glass-panel scroll-mt-24 rounded-xl p-5">
      <h3 className="text-base font-semibold text-foreground">Simulation vs. device: CHSH</h3>
      <p className="mt-1 text-sm text-muted">{data.experiment}. Classical bound 2, Tsirelson bound 2.83.</p>
      <div className="mt-4 flex flex-col gap-3">
        {data.runs.map((run) => {
          const has = typeof run.S === "number";
          const pct = has ? Math.min(100, (Math.abs(run.S as number) / data.tsirelson_bound) * 100) : 0;
          return (
            <div key={run.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs text-foreground">{run.label}</span>
                <span className={`font-mono text-lg ${has ? "text-accent" : "text-muted"}`}>{has ? `S = ${(run.S as number).toFixed(3)}` : "not run"}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-sm bg-surface-2">
                <div className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
                <div className="absolute inset-y-0 w-px bg-[#78660f]" style={{ left: `${(data.classical_bound / data.tsirelson_bound) * 100}%` }} title="classical bound" />
              </div>
              {run.note && <p className="font-mono text-[11px] text-muted">{run.note}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted">
        Amber tick = classical bound. Generated {new Date(data.generated_at).toISOString().slice(0, 10)} by{" "}
        <code>scripts/hardware/ibm_noise_model.py</code> (Qiskit Aer + IBM calibration snapshot).
      </p>
    </section>
  );
}
