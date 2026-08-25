"use client";

import dynamic from "next/dynamic";
import "@scalar/api-reference-react/style.css";

const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((mod) => mod.ApiReferenceReact),
  { ssr: false },
);

const CUSTOM_CSS = `
  :root, .light-mode, .dark-mode {
    --scalar-color-1: #ece4d4;
    --scalar-color-2: #a89a80;
    --scalar-color-3: #64748b;
    --scalar-color-accent: #d9a441;
    --scalar-background-1: #171310;
    --scalar-background-2: #1f1a14;
    --scalar-background-3: #272117;
    --scalar-border-color: #3a3226;
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
