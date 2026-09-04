"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRIOR_ART, type Cell } from "@/lib/research/priorArt";

const CI_KEYS = ["pytest", "githubActions", "cicd", "crossVersion", "crossSDK"] as const;
const DEPTH_KEYS = ["regressionTesting", "equivalenceChecking", "automatedFaultDetection", "bugCorpus"] as const;

function score(value: Cell): number {
  if (value === "YES") return 1;
  if (value === "PARTIAL") return 0.5;
  return 0;
}

/**
 * X axis: how much CI/version/SDK-orchestration capability a system has (0-5,
 * counted from pytest + githubActions + cicd + crossVersion + crossSDK cells).
 * Y axis: how much testing-depth capability it has (0-4, counted from
 * regressionTesting + equivalenceChecking + automatedFaultDetection + bugCorpus).
 * Both axes are derived directly from the same matrix cells rendered in the
 * table below, no relationship or ranking here is invented.
 */
export function CapabilityScatter() {
  const [active, setActive] = useState<string | null>(null);

  const points = useMemo(
    () =>
      PRIOR_ART.map((row) => {
        const ci = CI_KEYS.reduce((sum, key) => sum + score(row[key]), 0);
        const depth = DEPTH_KEYS.reduce((sum, key) => sum + score(row[key]), 0);
        const total = ci + depth;
        return { name: row.name, ci, depth, total, sourceUrl: row.sourceUrl };
      }),
    [],
  );

  const width = 560;
  const height = 360;
  const pad = 44;
  const maxCi = 5;
  const maxDepth = 4;

  const x = (v: number) => pad + (v / maxCi) * (width - pad * 2);
  const y = (v: number) => height - pad - (v / maxDepth) * (height - pad * 2);

  return (
    <div className="rounded-xl border border-border bg-surface/60 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Capability scatter plot of prior art systems">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--border)" strokeWidth={1} />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="var(--border)" strokeWidth={1} />
        <text x={width / 2} y={height - 10} textAnchor="middle" className="fill-muted font-mono text-xs">
          CI / version / SDK orchestration →
        </text>
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${height / 2})`}
          className="fill-muted font-mono text-xs"
        >
          Testing depth →
        </text>

        {points.map((p, i) => {
          const r = 4 + p.total * 1.1;
          const isActive = active === p.name;
          return (
            <g key={p.name}>
              <motion.circle
                cx={x(p.ci)}
                cy={y(p.depth)}
                r={r}
                className={isActive ? "fill-accent" : "fill-accent-2/70"}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 12) * 0.02 }}
                onMouseEnter={() => setActive(p.name)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(p.name)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                style={{ cursor: p.sourceUrl ? "pointer" : "default" }}
              >
                <title>
                  {p.name}. CI/orchestration {p.ci}/5, testing depth {p.depth}/4
                </title>
              </motion.circle>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 min-h-[1.5rem] text-center font-mono text-xs text-muted">
        {active ?? "Hover or focus a point for its name and scores"}
      </div>
    </div>
  );
}
