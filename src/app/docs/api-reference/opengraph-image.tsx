import { renderOgCard, OG_SIZE } from "@/lib/ogCard";

export const alt = "QP-Core API Reference";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "docs / api",
    title: "API Reference",
    subtitle: "The real OpenAPI schema for QP-Core's FastAPI backend, generated from its Pydantic models",
  });
}
