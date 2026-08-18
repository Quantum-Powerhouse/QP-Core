import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "Quantum Powerhouse Documentation";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "quantum.sadeqi.me/docs",
    title: "Documentation",
    subtitle: "QP-Core's transpiler pipeline and the VQE Suite's Hamiltonian, ansatz, and ZNE math",
  });
}
