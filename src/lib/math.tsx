import katex from "katex";

/**
 * Server-rendered math via KaTeX. Runs at build time for these static doc
 * pages, so no KaTeX JS is shipped to the client — only the rendered HTML
 * plus katex's stylesheet (imported once in src/app/docs/layout.tsx).
 */
export function Katex({ expr, display = false }: { expr: string; display?: boolean }) {
  const html = katex.renderToString(expr, {
    throwOnError: false,
    displayMode: display,
  });

  if (display) {
    return <div className="my-4 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
