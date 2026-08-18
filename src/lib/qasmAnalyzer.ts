export type ParsedGate = {
  name: string;
  qubits: number[];
};

export type QasmAnalysis = {
  qubitCount: number;
  originalGateCount: number;
  optimizedGateCount: number;
  cancelledCount: number;
  reductionPct: number;
  depth: number;
  qiskitPython: string;
  optimizedQasm: string;
};

const SINGLE_QUBIT_SELF_INVERSE = new Set(["h", "x", "y", "z"]);
const GATE_LINE_RE =
  /^\s*(h|x|y|z|s|t|cx|cnot)\s+q\[(\d+)\](?:\s*,\s*q\[(\d+)\])?\s*;/i;
const QREG_RE = /qreg\s+q\[(\d+)\]|qubit\[(\d+)\]\s*q/;

/**
 * Parses a small subset of OpenQASM (single/two-qubit gates on register `q`)
 * and derives real metrics from it: a gate-count reduction from cancelling
 * adjacent self-inverse single-qubit gates, and a circuit depth from greedy
 * per-qubit layering. Everything here is computed from the actual input,
 * not hardcoded — it just doesn't implement a full quantum compiler.
 */
export function analyzeQasm(qasm: string): QasmAnalysis {
  const gates: ParsedGate[] = [];
  let qubitCount = 0;

  const qregMatch = qasm.match(QREG_RE);
  if (qregMatch) {
    qubitCount = parseInt(qregMatch[1] ?? qregMatch[2] ?? "0", 10);
  }

  for (const line of qasm.split("\n")) {
    const m = line.match(GATE_LINE_RE);
    if (!m) continue;
    const name = m[1].toLowerCase();
    const qubits = [parseInt(m[2], 10)];
    if (m[3] !== undefined) qubits.push(parseInt(m[3], 10));
    gates.push({ name, qubits });
    qubitCount = Math.max(qubitCount, ...qubits.map((q) => q + 1));
  }

  const optimized: (ParsedGate | null)[] = gates.map((g) => ({ ...g }));
  const lastCancellableIndex = new Map<number, number>();

  for (let i = 0; i < optimized.length; i++) {
    const gate = optimized[i];
    if (!gate) continue;

    if (gate.qubits.length === 1 && SINGLE_QUBIT_SELF_INVERSE.has(gate.name)) {
      const q = gate.qubits[0];
      const lastIdx = lastCancellableIndex.get(q);
      if (lastIdx !== undefined) {
        const lastGate = optimized[lastIdx];
        if (lastGate && lastGate.name === gate.name) {
          optimized[lastIdx] = null;
          optimized[i] = null;
          lastCancellableIndex.delete(q);
          continue;
        }
      }
      lastCancellableIndex.set(q, i);
    } else {
      for (const q of gate.qubits) lastCancellableIndex.delete(q);
    }
  }

  const optimizedGates = optimized.filter((g): g is ParsedGate => g !== null);
  const cancelledCount = gates.length - optimizedGates.length;
  const reductionPct =
    gates.length > 0 ? Math.round((cancelledCount / gates.length) * 100) : 0;

  const qubitLayer = new Map<number, number>();
  let depth = 0;
  for (const gate of gates) {
    const layer =
      Math.max(0, ...gate.qubits.map((q) => qubitLayer.get(q) ?? 0)) + 1;
    for (const q of gate.qubits) qubitLayer.set(q, layer);
    depth = Math.max(depth, layer);
  }

  return {
    qubitCount,
    originalGateCount: gates.length,
    optimizedGateCount: optimizedGates.length,
    cancelledCount,
    reductionPct,
    depth,
    qiskitPython: toQiskitPython(qubitCount, gates),
    optimizedQasm: toQasm(qubitCount, optimizedGates),
  };
}

function toQiskitPython(qubitCount: number, gates: ParsedGate[]): string {
  const lines = [
    "from qiskit import QuantumCircuit",
    "",
    `qc = QuantumCircuit(${qubitCount}, ${qubitCount})`,
    "",
  ];
  for (const gate of gates) {
    const fn = gate.name === "cnot" ? "cx" : gate.name;
    lines.push(`qc.${fn}(${gate.qubits.join(", ")})`);
  }
  lines.push("", "qc.measure_all()");
  return lines.join("\n");
}

function toQasm(qubitCount: number, gates: ParsedGate[]): string {
  const lines = [
    "OPENQASM 2.0;",
    'include "qelib1.inc";',
    "",
    `qreg q[${qubitCount}];`,
    `creg c[${qubitCount}];`,
    "",
  ];
  for (const gate of gates) {
    if (gate.qubits.length === 2) {
      lines.push(`${gate.name} q[${gate.qubits[0]}], q[${gate.qubits[1]}];`);
    } else {
      lines.push(`${gate.name} q[${gate.qubits[0]}];`);
    }
  }
  lines.push("measure q -> c;");
  return lines.join("\n");
}
