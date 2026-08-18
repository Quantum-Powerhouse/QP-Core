import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "QP-Core Transpiler Playground";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "qasm-to-braket-ir — zsh",
    title: "QP-Core Transpiler",
    subtitle: "Live OpenQASM 2.0/3.0 → Amazon Braket IR playground with real circuit metrics",
  });
}
