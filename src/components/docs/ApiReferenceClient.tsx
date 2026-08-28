"use client";

import dynamic from "next/dynamic";
import "@scalar/api-reference-react/style.css";

const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((mod) => mod.ApiReferenceReact),
  { ssr: false },
);

const CUSTOM_CSS = `
  :root, .light-mode, .dark-mode {
    --scalar-color-1: #1c1917;
    --scalar-color-2: #a89a80;
    --scalar-color-3: #64748b;
    --scalar-color-accent: #20507c;
    --scalar-background-1: #faf8f3;
    --scalar-background-2: #f3efe4;
    --scalar-background-3: #ebe5d6;
    --scalar-border-color: #d9d1bf;
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
