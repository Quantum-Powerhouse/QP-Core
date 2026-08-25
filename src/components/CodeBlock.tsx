"use client";

import { highlightLines, type Lang } from "@/lib/highlight";

export function CodeBlock({
  code,
  lang,
  fit = false,
}: {
  code: string;
  lang: Lang;
  /** Size the block to its content instead of filling a height-constrained parent (e.g. docs pages). */
  fit?: boolean;
}) {
  const lines = highlightLines(code, lang);

  return (
    <pre
      className={`flex ${fit ? "h-auto" : "h-full"} overflow-auto px-0 py-4 font-mono text-[13px] leading-relaxed`}
    >
      <code className="flex-1">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((tokens, i) => (
              <tr key={i}>
                <td className="select-none pr-4 pl-4 text-right align-top text-[#5c5344]">
                  {i + 1}
                </td>
                <td className="w-full whitespace-pre align-top text-foreground">
                  {tokens.map((t, j) => (
                    <span key={j} className={t.className}>
                      {t.text}
                    </span>
                  ))}
                  {tokens.length === 0 ? " " : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </code>
    </pre>
  );
}
