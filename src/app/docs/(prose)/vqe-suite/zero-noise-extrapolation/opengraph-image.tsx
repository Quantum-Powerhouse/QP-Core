import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "VQE Suite: Zero Noise Extrapolation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "docs / vqe suite",
    title: "Zero Noise Extrapolation",
    subtitle: "Gate folding, depolarizing noise, and Richardson extrapolation, with real measured numbers",
  });
}
