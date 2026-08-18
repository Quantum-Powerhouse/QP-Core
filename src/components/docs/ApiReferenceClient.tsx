"use client";

import dynamic from "next/dynamic";
import "@scalar/api-reference-react/style.css";

const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((mod) => mod.ApiReferenceReact),
  { ssr: false },
);

const CUSTOM_CSS = `
  :root, .light-mode, .dark-mode {
    --scalar-color-1: #e6ecff;
    --scalar-color-2: #8b97b8;
    --scalar-color-3: #64748b;
    --scalar-color-accent: #06b6d4;
    --scalar-background-1: #020617;
    --scalar-background-2: #0b1120;
    --scalar-background-3: #0f172a;
    --scalar-border-color: #1e293b;
    --scalar-radius: 0.5rem;
    --scalar-radius-lg: 0.75rem;
    --scalar-font: var(--font-geist-sans), sans-serif;
    --scalar-font-code: var(--font-jetbrains-mono), monospace;
  }
`;

export function ApiReferenceClient({ specUrl }: { specUrl: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ colorScheme: "dark" }}>
      <ApiReferenceReact
        configuration={{
          url: specUrl,
          theme: "deepSpace",
          darkMode: true,
          forceDarkModeState: "dark",
          hideDarkModeToggle: true,
          customCss: CUSTOM_CSS,
          hideClientButton: false,
        }}
      />
    </div>
  );
}
