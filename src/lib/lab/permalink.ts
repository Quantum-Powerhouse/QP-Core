import type { Circuit, GateName } from "./circuit";

/**
 * Compact circuit permalinks: a shared link recomputes on the recipient's
 * machine, which is the only kind of sharing the site's rules permit.
 * Grammar: "n:op,op,..." where an op is code + qubit, an optional "." + second
 * qubit for two qubit gates, and an optional "@" + angle in radians.
 * Example: "2:h0,cx1.0" is the Bell pair.
 */
const CODE: Record<GateName, string> = {
  H: "h", X: "x", Y: "y", Z: "z", S: "s", T: "t",
  RX: "rx", RY: "ry", RZ: "rz", CNOT: "cx", CZ: "cz", SWAP: "sw",
};
const NAME: Record<string, GateName> = Object.fromEntries(
  Object.entries(CODE).map(([k, v]) => [v, k as GateName])
);
const TWO_QUBIT: GateName[] = ["CNOT", "CZ", "SWAP"];
const ANGLED: GateName[] = ["RX", "RY", "RZ"];

export function encodeCircuit(circuit: Circuit): string {
  const ops = circuit.ops.map((op) => {
    let s = CODE[op.gate] + op.q;
    if (op.q2 !== undefined) s += "." + op.q2;
    if (op.theta !== undefined) s += "@" + Number(op.theta.toFixed(4));
    return s;
  });
  return `${circuit.numQubits}:${ops.join(",")}`;
}

export function decodeCircuit(text: string): Circuit | null {
  const m = /^([1-5]):(.*)$/.exec(text.trim());
  if (!m) return null;
  const numQubits = Number(m[1]);
  const ops: Circuit["ops"] = [];
  const body = m[2];
  if (body === "") return { numQubits, ops };
  for (const raw of body.split(",")) {
    const om = /^([a-z]{1,2})(\d)(?:\.(\d))?(?:@(-?\d+(?:\.\d+)?))?$/.exec(raw);
    if (!om) return null;
    const gate = NAME[om[1]];
    if (!gate) return null;
    const q = Number(om[2]);
    const q2 = om[3] === undefined ? undefined : Number(om[3]);
    const theta = om[4] === undefined ? undefined : Number(om[4]);
    if (q >= numQubits) return null;
    if (TWO_QUBIT.includes(gate)) {
      if (q2 === undefined || q2 >= numQubits || q2 === q) return null;
    } else if (q2 !== undefined) return null;
    if (ANGLED.includes(gate)) {
      if (theta === undefined || !Number.isFinite(theta)) return null;
    } else if (theta !== undefined) return null;
    ops.push(theta !== undefined ? { gate, q, q2, theta } : q2 !== undefined ? { gate, q, q2 } : { gate, q });
    if (ops.length > 64) return null;
  }
  return { numQubits, ops };
}

export function circuitHash(circuit: Circuit): string {
  return `#c=${encodeCircuit(circuit)}`;
}

export function circuitFromHash(hash: string): Circuit | null {
  const m = /^#c=(.+)$/.exec(hash);
  return m ? decodeCircuit(decodeURIComponent(m[1])) : null;
}
