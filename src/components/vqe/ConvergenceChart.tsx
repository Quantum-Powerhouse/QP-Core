"use client";

import { useMemo, useState } from "react";
import type { VqeIterationPoint } from "@/lib/physics/vqe";

const CHEMICAL_ACCURACY_HARTREE = 0.0016;

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 20, right: 24, bottom: 40, left: 76 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

export function ConvergenceChart({
  trajectory,
  exactEnergyHartree,
}: {
  trajectory: VqeIterationPoint[];
  exactEnergyHartree: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { xScale, yScale, yTicks } = useMemo(() => {
    const maxIteration = trajectory[trajectory.length - 1]?.iteration ?? 1;
    const energies = trajectory.map((p) => p.energyHartree).concat(exactEnergyHartree);
    const yMin = Math.min(...energies) - 0.01;
    const yMax = Math.max(...energies) + 0.01;

    const xScale = (iteration: number) => (iteration / Math.max(maxIteration, 1)) * PLOT_W;
    const yScale = (energy: number) => PLOT_H - ((energy - yMin) / (yMax - yMin)) * PLOT_H;

    const tickCount = 5;
    const yTicks = Array.from({ length: tickCount }, (_, i) => yMin + ((yMax - yMin) * i) / (tickCount - 1));

    return { xScale, yScale, yTicks };
  }, [trajectory, exactEnergyHartree]);

  const linePath = trajectory
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.iteration).toFixed(2)} ${yScale(p.energyHartree).toFixed(2)}`)
    .join(" ");

  const bandTop = yScale(exactEnergyHartree + CHEMICAL_ACCURACY_HARTREE);
  const bandBottom = yScale(exactEnergyHartree - CHEMICAL_ACCURACY_HARTREE);
  const last = trajectory[trajectory.length - 1];
  const hovered = hoverIndex !== null ? trajectory[hoverIndex] : null;

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-xl">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full min-w-[560px]">
        <defs>
          <filter id="convergence-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={0} y1={yScale(tick)} x2={PLOT_W} y2={yScale(tick)} stroke="#d9d1bf" strokeWidth={1} />
              <text
                x={-10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fontFamily="var(--font-jetbrains-mono), monospace"
                fill="#a89a80"
              >
                {tick.toFixed(3)}
              </text>
            </g>
          ))}

          <rect
            x={0}
            y={bandTop}
            width={PLOT_W}
            height={Math.max(bandBottom - bandTop, 1)}
            fill="#a06b1f"
            opacity={0.12}
          />
          <line
            x1={0}
            y1={yScale(exactEnergyHartree)}
            x2={PLOT_W}
            y2={yScale(exactEnergyHartree)}
            stroke="#a89a80"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <text
            x={PLOT_W}
            y={yScale(exactEnergyHartree) - 8}
            textAnchor="end"
            fontSize={11}
            fontFamily="var(--font-jetbrains-mono), monospace"
            fill="#a89a80"
          >
            exact (FCI): {exactEnergyHartree.toFixed(4)} Ha
          </text>

          <path d={linePath} fill="none" stroke="#a06b1f" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {last && (
            <>
              <circle cx={xScale(last.iteration)} cy={yScale(last.energyHartree)} r={6} fill="#faf8f3" stroke="#faf8f3" strokeWidth={3} />
              <circle cx={xScale(last.iteration)} cy={yScale(last.energyHartree)} r={5} fill="#a06b1f" filter="url(#convergence-glow)" />
            </>
          )}

          {trajectory.map((p, i) => (
            <rect
              key={p.iteration}
              x={xScale(p.iteration) - (PLOT_W / trajectory.length) / 2}
              y={0}
              width={PLOT_W / trajectory.length}
              height={PLOT_H}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
            />
          ))}

          {hovered && (
            <g>
              <line x1={xScale(hovered.iteration)} y1={0} x2={xScale(hovered.iteration)} y2={PLOT_H} stroke="#a89a80" strokeWidth={1} strokeDasharray="2 3" />
              <circle cx={xScale(hovered.iteration)} cy={yScale(hovered.energyHartree)} r={5} fill="#1c1917" stroke="#a06b1f" strokeWidth={2} />
            </g>
          )}

          <text x={PLOT_W / 2} y={PLOT_H + 32} textAnchor="middle" fontSize={12} fontFamily="var(--font-jetbrains-mono), monospace" fill="#a89a80">
            iteration
          </text>
        </g>
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute rounded-md border border-border bg-background/95 px-3 py-2 font-mono text-xs text-foreground shadow-xl" style={{ left: 16, top: 16 }}>
          <p className="text-muted">iteration {hovered.iteration}</p>
          <p className="text-accent">{hovered.energyHartree.toFixed(6)} Ha</p>
          <p className="text-muted">
            {((hovered.energyHartree - exactEnergyHartree) * 1000).toFixed(3)} mHa from exact
          </p>
        </div>
      )}
    </div>
  );
}
