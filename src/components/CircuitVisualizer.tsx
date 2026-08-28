"use client";

import { motion } from "framer-motion";

const WIRES = [
  { label: "q[0]", y: 40 },
  { label: "q[1]", y: 110 },
  { label: "q[2]", y: 180 },
];

const COLUMN_X = [140, 260, 380, 500, 640];
const WIRE_START_X = 90;
const WIRE_END_X = 720;

type Gate = {
  type: "H" | "CNOT" | "P" | "MEASURE";
  col: number;
  wire: number;
  target?: number;
  color: string;
};

const GATES: Gate[] = [
  { type: "H", col: 0, wire: 0, color: "#20507c" },
  { type: "CNOT", col: 1, wire: 0, target: 1, color: "#20507c" },
  { type: "P", col: 2, wire: 1, color: "#20507c" },
  { type: "H", col: 3, wire: 2, color: "#20507c" },
  { type: "MEASURE", col: 4, wire: 0, color: "#78660f" },
  { type: "MEASURE", col: 4, wire: 1, color: "#78660f" },
  { type: "MEASURE", col: 4, wire: 2, color: "#78660f" },
];

function GateBox({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g>
      <rect
        x={x - 20}
        y={y - 20}
        width={40}
        height={40}
        rx={8}
        fill="#f3efe4"
        stroke={color}
        strokeWidth={1.5}
        filter="url(#glow)"
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontSize={13}
        fontFamily="var(--font-jetbrains-mono), monospace"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function MeasureBox({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <rect
        x={x - 20}
        y={y - 20}
        width={40}
        height={40}
        rx={8}
        fill="#f3efe4"
        stroke={color}
        strokeWidth={1.5}
        filter="url(#glow)"
      />
      <path
        d={`M ${x - 10} ${y + 6} A 10 10 0 0 1 ${x + 10} ${y + 6}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      <line x1={x} y1={y + 6} x2={x + 7} y2={y - 6} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

export function CircuitVisualizer() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-xl">
      <svg viewBox="0 0 780 220" className="h-auto w-full min-w-[640px]">
        <defs>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {WIRES.map((wire, i) => (
          <g key={wire.label}>
            <line
              x1={WIRE_START_X}
              y1={wire.y}
              x2={WIRE_END_X}
              y2={wire.y}
              stroke="#d9d1bf"
              strokeWidth={1.5}
            />
            <text
              x={WIRE_START_X - 16}
              y={wire.y + 4}
              textAnchor="end"
              fontSize={12}
              fontFamily="var(--font-jetbrains-mono), monospace"
              fill="#a89a80"
            >
              {wire.label}
            </text>
            <motion.circle
              r={4}
              fill="#20507c"
              filter="url(#glow)"
              initial={{ cx: WIRE_START_X, opacity: 0 }}
              animate={{
                cx: [WIRE_START_X, WIRE_END_X],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.6,
              }}
              cy={wire.y}
            />
          </g>
        ))}

        {GATES.filter((g) => g.type === "CNOT").map((gate, i) => {
          const x = COLUMN_X[gate.col];
          const y1 = WIRES[gate.wire].y;
          const y2 = WIRES[gate.target ?? gate.wire].y;
          return (
            <g key={`cnot-${i}`}>
              <line x1={x} y1={y1} x2={x} y2={y2} stroke={gate.color} strokeWidth={1.5} />
              <circle cx={x} cy={y1} r={6} fill={gate.color} filter="url(#glow)" />
              <circle
                cx={x}
                cy={y2}
                r={12}
                fill="none"
                stroke={gate.color}
                strokeWidth={1.5}
                filter="url(#glow)"
              />
              <line x1={x - 8} y1={y2} x2={x + 8} y2={y2} stroke={gate.color} strokeWidth={1.5} />
              <line x1={x} y1={y2 - 8} x2={x} y2={y2 + 8} stroke={gate.color} strokeWidth={1.5} />
            </g>
          );
        })}

        {GATES.filter((g) => g.type !== "CNOT" && g.type !== "MEASURE").map((gate, i) => (
          <GateBox
            key={`gate-${i}`}
            x={COLUMN_X[gate.col]}
            y={WIRES[gate.wire].y}
            label={gate.type}
            color={gate.color}
          />
        ))}

        {GATES.filter((g) => g.type === "MEASURE").map((gate, i) => (
          <MeasureBox
            key={`measure-${i}`}
            x={COLUMN_X[gate.col]}
            y={WIRES[gate.wire].y}
            color={gate.color}
          />
        ))}
      </svg>
    </div>
  );
}
