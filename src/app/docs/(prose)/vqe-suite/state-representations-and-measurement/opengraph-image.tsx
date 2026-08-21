import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "VQE Suite: State Representations & Measurement";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "docs / vqe-suite",
    title: "State Representations & Measurement",
    subtitle: "Amplitudes, reduced density matrix, purity, and a real inverse-CDF measurement sample",
  });
}
