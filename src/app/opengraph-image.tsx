import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "Quantum Powerhouse";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "quantum.sadeqi.me",
    title: "Quantum Powerhouse",
    subtitle: "OpenQASM → Braket IR transpiler · Qiskit VQE Suite · NISQ error mitigation",
  });
}
