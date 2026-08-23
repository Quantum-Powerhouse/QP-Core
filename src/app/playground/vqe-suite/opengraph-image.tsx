import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "VQE Suite + ZNE Playground";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "h2-vqe-zne, zsh",
    title: "VQE Suite",
    subtitle: "Live H2 variational eigensolver, chemical-accuracy convergence, and ZNE error mitigation",
  });
}
