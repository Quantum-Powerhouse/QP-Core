import { h2AnsatzGates } from "@/lib/physics/h2Ansatz";

const WIRE_Y = [40, 100];
const COL_SPACING = 110;
const WIRE_START_X = 90;
const FIRST_COL_X = 170;

function GateBox({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g>
      <rect x={x - 26} y={y - 20} width={52} height={40} rx={8} fill="#0b1120" stroke={color} strokeWidth={1.5} filter="url(#ansatz-glow)" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={12} fontFamily="var(--font-jetbrains-mono), monospace" fill={color}>
        {label}
      </text>
    </g>
  );
}

export function AnsatzCircuitDiagram() {
  const gates = h2AnsatzGates();
  const wireEndX = FIRST_COL_X + gates.length * COL_SPACING;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-xl">
      <svg viewBox={`0 0 ${wireEndX + 60} 160`} className="h-auto w-full min-w-[520px]">
        <defs>
          <filter id="ansatz-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {WIRE_Y.map((y, qubit) => (
          <g key={qubit}>
            <line x1={WIRE_START_X} y1={y} x2={wireEndX} y2={y} stroke="#1e293b" strokeWidth={1.5} />
            <text x={WIRE_START_X - 16} y={y + 4} textAnchor="end" fontSize={12} fontFamily="var(--font-jetbrains-mono), monospace" fill="#8b97b8">
              q{qubit}
            </text>
          </g>
        ))}
        <text x={WIRE_START_X - 16} y={WIRE_Y[0] - 16} textAnchor="end" fontSize={10} fontFamily="var(--font-jetbrains-mono), monospace" fill="#4b5875">
          |0⟩
        </text>

        {gates.map((gate, i) => {
          const x = FIRST_COL_X + i * COL_SPACING;
          if (gate.kind === "X") {
            return <GateBox key={i} x={x} y={WIRE_Y[gate.qubit]} label="X" color="#06b6d4" />;
          }
          if (gate.kind === "CNOT") {
            const y1 = WIRE_Y[gate.control];
            const y2 = WIRE_Y[gate.target];
            return (
              <g key={i}>
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="#7c3aed" strokeWidth={1.5} />
                <circle cx={x} cy={y1} r={6} fill="#7c3aed" filter="url(#ansatz-glow)" />
                <circle cx={x} cy={y2} r={12} fill="none" stroke="#7c3aed" strokeWidth={1.5} filter="url(#ansatz-glow)" />
                <line x1={x - 8} y1={y2} x2={x + 8} y2={y2} stroke="#7c3aed" strokeWidth={1.5} />
                <line x1={x} y1={y2 - 8} x2={x} y2={y2 + 8} stroke="#7c3aed" strokeWidth={1.5} />
              </g>
            );
          }
          return <GateBox key={i} x={x} y={WIRE_Y[gate.qubit]} label="RY(θ)" color="#2dd4bf" />;
        })}
      </svg>
    </div>
  );
}
