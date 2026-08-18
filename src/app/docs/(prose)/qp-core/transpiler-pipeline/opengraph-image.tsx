import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "QP-Core Transpiler Pipeline";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "docs / qp-core",
    title: "Transpiler Pipeline",
    subtitle: "Parsing, optimization, and Amazon Braket IR emission — documented against the real source",
  });
}
