import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GLOSSARY } from "@/lib/glossary";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Glossary: Every Term Links to Where It Is Computed",
  description:
    "A quantum computing glossary with receipts: forty plus terms from amplitude to zero noise extrapolation, each linking to the live instrument on this site that computes or demonstrates it.",
  path: "/glossary",
  keywords: ["quantum computing glossary", "qubit definition", "Born rule explained", "entanglement definition", "quantum terms"],
  ogTitle: "Glossary",
});

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Glossary</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {sorted.length} terms, each with a receipt: where a term names something computable, it links to the live
          instrument on this site that computes it. If a definition and its instrument ever disagree, the instrument
          wins and the definition gets fixed.
        </p>
        <dl className="mt-10 flex flex-col gap-5">
          {sorted.map((e) => (
            <div key={e.term} className="glass-panel rounded-xl p-4">
              <dt className="font-semibold text-foreground">{e.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">
                {e.def}
                {e.where && (
                  <>
                    {" "}
                    <Link href={e.where.href} className="whitespace-nowrap font-mono text-xs text-accent underline-offset-2 hover:underline">
                      computed: {e.where.label}
                    </Link>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </main>
      <SiteFooter />
    </div>
  );
}
