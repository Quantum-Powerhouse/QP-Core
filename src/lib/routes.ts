export type RouteEntry = {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export const ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/playground/qp-core", changeFrequency: "weekly", priority: 0.9 },
  { path: "/playground/vqe-suite", changeFrequency: "weekly", priority: 0.9 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/qp-core/transpiler-pipeline", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs/vqe-suite/hamiltonian-and-ansatz", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs/vqe-suite/state-representations-and-measurement", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs/vqe-suite/zero-noise-extrapolation", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs/api-reference", changeFrequency: "monthly", priority: 0.8 },
  { path: "/research", changeFrequency: "monthly", priority: 0.8 },
  { path: "/research/methodology", changeFrequency: "monthly", priority: 0.6 },
  { path: "/research/claims", changeFrequency: "monthly", priority: 0.7 },
  { path: "/research/prior-art", changeFrequency: "monthly", priority: 0.7 },
  { path: "/research/evidence", changeFrequency: "monthly", priority: 0.6 },
  { path: "/research/sources", changeFrequency: "monthly", priority: 0.5 },
  { path: "/research/gap-analysis", changeFrequency: "monthly", priority: 0.7 },
];
