"use client";

import { useMemo, useState } from "react";
import { lagrangeInterpolate } from "@/lib/physics/linalg";
import type { ZneResult } from "@/lib/physics/zne";

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 20, right: 24, bottom: 40, left: 76 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

const RAW_COLOR = "#20507c";
const FIT_COLOR = "#0891b2";
const REFERENCE_COLOR = "#a89a80";

export function ZneChart({ result }: { result: ZneResult }) {
  const [hover, setHover] = useState<{ label: string; lambda: number; energy: number } | null>(null);

  const fitPoints = result.points.map((p) => ({ x: p.lambda, y: p.energyHartree }));

  const { xScale, yScale, yTicks, curvePath } = useMemo(() => {
    const xMin = 0;
    const xMax = 5;
    const allY = [
      ...result.points.map((p) => p.energyHartree),
      result.quadraticExtrapolationHartree,
      result.linearExtrapolationHartree,
      result.noiselessEnergyHartree,
    ];
    const yMin = Math.min(...allY) - 0.01;
    const yMax = Math.max(...allY) + 0.01;

    const xScale = (lambda: number) => ((lambda - xMin) / (xMax - xMin)) * PLOT_W;
    const yScale = (energy: number) => PLOT_H - ((energy - yMin) / (yMax - yMin)) * PLOT_H;

    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => yMin + ((yMax - yMin) * i) / (tickCount - 1));

    const steps = 40;
    const curvePath = Array.from({ length: steps + 1 }, (_, i) => {
      const lambda = (xMax * i) / steps;
      const energy = lagrangeInterpolate(fitPoints, lambda);
      return `${i === 0 ? "M" : "L"} ${xScale(lambda).toFixed(2)} ${yScale(energy).toFixed(2)}`;
    }).join(" ");

    return { xScale, yScale, yTicks, curvePath };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RAW_COLOR }} />
          noisy measurement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FIT_COLOR }} />
          Richardson extrapolation (λ→0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3" style={{ backgroundColor: REFERENCE_COLOR }} />
          noiseless reference
        </span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full min-w-[560px]">
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={0} y1={yScale(tick)} x2={PLOT_W} y2={yScale(tick)} stroke="#d9d1bf" strokeWidth={1} />
              <text x={-10} y={yScale(tick) + 4} textAnchor="end" fontSize={11} fontFamily="var(--font-jetbrains-mono), monospace" fill="#a89a80">
                {tick.toFixed(3)}
              </text>
            </g>
          ))}

          <line
            x1={0}
            y1={yScale(result.noiselessEnergyHartree)}
            x2={PLOT_W}
            y2={yScale(result.noiselessEnergyHartree)}
            stroke={REFERENCE_COLOR}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          <path d={curvePath} fill="none" stroke={FIT_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />

          {result.points.map((p) => (
            <g
              key={p.lambda}
              onMouseEnter={() => setHover({ label: `λ = ${p.lambda} (noisy)`, lambda: p.lambda, energy: p.energyHartree })}
              onMouseLeave={() => setHover((cur) => (cur?.lambda === p.lambda ? null : cur))}
            >
              <circle cx={xScale(p.lambda)} cy={yScale(p.energyHartree)} r={7} fill="#faf8f3" />
              <circle cx={xScale(p.lambda)} cy={yScale(p.energyHartree)} r={5.5} fill={RAW_COLOR} />
            </g>
          ))}

          <g
            onMouseEnter={() =>
              setHover({ label: "λ = 0 (quadratic extrapolation)", lambda: 0, energy: result.quadraticExtrapolationHartree })
            }
            onMouseLeave={() => setHover((cur) => (cur?.lambda === 0 ? null : cur))}
          >
            <circle cx={xScale(0)} cy={yScale(result.quadraticExtrapolationHartree)} r={8} fill="#faf8f3" />
            <path
              d={`M ${xScale(0) - 6} ${yScale(result.quadraticExtrapolationHartree)} L ${xScale(0)} ${yScale(result.quadraticExtrapolationHartree) - 6} L ${xScale(0) + 6} ${yScale(result.quadraticExtrapolationHartree)} L ${xScale(0)} ${yScale(result.quadraticExtrapolationHartree) + 6} Z`}
              fill={FIT_COLOR}
            />
          </g>

          <text x={PLOT_W / 2} y={PLOT_H + 32} textAnchor="middle" fontSize={12} fontFamily="var(--font-jetbrains-mono), monospace" fill="#a89a80">
            noise scale factor (λ)
          </text>
        </g>
      </svg>

      {hover && (
        <div className="pointer-events-none absolute rounded-md border border-border bg-background/95 px-3 py-2 font-mono text-xs text-foreground shadow-xl" style={{ left: 16, top: 16 }}>
          <p className="text-muted">{hover.label}</p>
          <p style={{ color: hover.lambda === 0 ? FIT_COLOR : RAW_COLOR }}>{hover.energy.toFixed(6)} Ha</p>
        </div>
      )}
    </div>
  );
}
