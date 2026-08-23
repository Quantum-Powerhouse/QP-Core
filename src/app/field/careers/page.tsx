import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { CAREER_FACTS, CAREER_ROLES, EMPLOYERS } from "@/lib/field/careers";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Quantum Computing Careers — Roles, Employers, Degrees, Pay (Sourced)",
  description:
    "An honest guide to quantum computing careers: seven real roles mapped to portfolio proof on this site, who is hiring, what degrees are actually required (Hughes et al. 2022), QED-C 2026 workforce numbers, and thin salary data with its caveats.",
  path: "/field/careers",
  keywords: ["quantum computing careers", "quantum software engineer job", "quantum error correction jobs", "post-quantum cryptography engineer", "QED-C workforce 2026", "quantum computing salary"],
  ogTitle: "Quantum Careers",
});

export default function CareersPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · careers</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Careers in quantum computing</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        A small, high-barrier, well-compensated specialist market — roughly sixteen thousand people worldwide, not a
        hiring wave. What follows is what the data says, which roles exist, who hires, and what on this site counts as
        evidence for each role.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {CAREER_FACTS.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">Seven roles — and the proof on this site</h2>
      <p className="mt-1 mb-5 text-sm text-muted">Degree notes follow the Hughes et al. survey above: specialized research skews PhD; engineering roles hire across degree levels.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {CAREER_ROLES.map((r) => (
          <section key={r.role} className="glass-panel flex flex-col gap-2 rounded-xl p-5">
            <h3 className="text-base font-semibold text-foreground">{r.role}</h3>
            <p className="text-sm text-muted">{r.does}</p>
            <p className="text-sm text-muted">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">needs · </span>
              {r.needs}
            </p>
            <p className="font-mono text-[11px] text-muted">degree: {r.typicalDegree}</p>
            <ul className="mt-1 flex flex-col gap-1 border-t border-border/60 pt-2">
              {r.proof.map((p) => (
                <li key={p.href}>
                  {p.href.startsWith("http") ? (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-accent underline-offset-2 hover:underline">
                      proof: {p.label} ↗
                    </a>
                  ) : (
                    <Link href={p.href} className="font-mono text-[11px] text-accent underline-offset-2 hover:underline">
                      proof: {p.label} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">Who is hiring</h2>
      <p className="mt-1 mb-4 text-sm text-muted">Organizations with active quantum programs; links go to their official quantum pages. Openings change weekly — the QED-C report above counted 8,261 in 2025.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {EMPLOYERS.map((e) => (
          <li key={e.name} className="glass-panel flex items-baseline justify-between gap-3 rounded-lg px-4 py-2.5 text-sm">
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
              {e.name} ↗
            </a>
            <span className="shrink-0 font-mono text-[10px] text-muted">{e.kind}</span>
          </li>
        ))}
      </ul>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">The honest summary</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The market is real but small; the barrier is real but not uniform. Research and device roles are PhD
          territory. Software, systems, applications engineering and post-quantum cryptography hire across degrees and
          reward demonstrated work — which is what this site is: a transpiler, a VQE, an error-mitigation toolkit, a
          verified research study, a published pytest plugin. If you are choosing an entry point, post-quantum
          cryptography is the most accessible and the most immediately in demand, because its deadline is already on
          the calendar.
        </p>
      </section>
      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/field/tooling" className="text-accent underline-offset-2 hover:underline">The tools these roles use</Link></li>
          <li><Link href="/lab" className="text-accent underline-offset-2 hover:underline">Build a circuit — the software-engineer artifact</Link></li>
          <li><Link href="/field/strategies" className="text-accent underline-offset-2 hover:underline">Where the public money is going</Link></li>
        </ul>
      </section>
    </>
  );
}
