import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "VQE Suite: Hamiltonian & Ansatz";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "docs / vqe-suite",
    title: "Hamiltonian & Ansatz",
    subtitle: "The H2 qubit Hamiltonian, Jordan-Wigner reduction, and why the minimal ansatz is exact",
  });
}
