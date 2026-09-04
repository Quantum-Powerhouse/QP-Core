import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ARCADE_GAME_COUNT } from "@/components/arcade/manifest";
import { RepoPulse } from "@/components/RepoPulse";
import { getResearchStats } from "@/lib/research/stats";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "The Builder: Said Mohaddes Sadeqi",
  description:
    "Who built Quantum Powerhouse and how: a quantum engine written from scratch, a research study checked against primary sources, and an open source pytest plugin.",
  path: "/builder",
  keywords: ["Said Mohaddes Sadeqi", "quantum software engineer", "portfolio", "quantum computing portfolio"],
  ogTitle: "The Builder",
});

export default function BuilderPage() {
  const stats = getResearchStats();
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">The builder</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Said Mohaddes Sadeqi</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          I build quantum software. The numbers on this site come out of calculations that run in your browser, the
          research claims link to the primary sources I read, and the tools are things another engineer can install from source.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a href="https://github.com/Quantum-Powerhouse/QP-Core" className="rounded-full border border-border px-4 py-2 font-mono text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
            this site&apos;s source
          </a>
          <a href="https://github.com/sadeqisaidmohaddes-star/pytest-qequiv" className="rounded-full border border-border px-4 py-2 font-mono text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
            pytest-qequiv
          </a>
          <a href="https://github.com/sadeqisaidmohaddes-star/quantum-cicd-research" className="rounded-full border border-border px-4 py-2 font-mono text-foreground hover:border-accent/60" target="_blank" rel="noopener noreferrer">
            research repository
          </a>
          <a href="https://sadeqi.me" className="rounded-full bg-accent px-4 py-2 font-mono font-semibold text-[#faf8f3]" target="_blank" rel="noopener noreferrer">
            CV &amp; contact → sadeqi.me
          </a>
        </div>

        <section className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent">What I decided</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted">
              <li>I wrote the physics myself: a statevector and density matrix engine in TypeScript, a parameter shift VQE and Richardson extrapolated zero noise extrapolation. The browser does the computing, so nothing on the site is a recording.</li>
              <li>I made the checks part of the build. CI fails if a research claim on the site drifts from the evidence record, every arcade card says what computes its numbers, and the pet cannot state a number the engine did not produce.</li>
              <li>I let the research correct me. I set out to show a gap, found QUTest and Benchpress, narrowed the claim in public, and then built the tool the remaining gap called for.</li>
            </ul>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent">How I work</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Rules first, then code: nothing fake, every claim sourced, tests before merge. Unit and end to end suites
              run on every push, the research record is cross checked in CI, and I only cite sources I opened. The
              physics and the research judgment are mine. Ask me why the parameter shift rule gives an exact gradient,
              or why the pet uses a semi implicit Euler integrator.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">By the numbers</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { v: String(ARCADE_GAME_COUNT), l: "interactive quantum games & labs" },
              { v: String(stats.totalClaims), l: "research claims with verdicts" },
              { v: String(stats.priorArtSystems), l: "prior art systems inspected" },
              { v: "3", l: "SDKs bridged by pytest-qequiv" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col">
                <dd className="font-mono text-3xl text-accent">{s.v}</dd>
                <dt className="mt-1 text-xs text-muted">{s.l}</dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-10">
          <RepoPulse />
        </div>

        <section className="mt-10 glass-panel rounded-xl p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">What&apos;s next</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
            <li>· Run the CHSH experiment on real IBM hardware and publish the device column.</li>
            <li>· Archive the research record with a DOI and submit the gap analysis as a short paper.</li>
            <li>· Push the engine past 16 qubits with workers/WebGPU and benchmark it in public.</li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Start with the <Link href="/playground/arcade" className="text-accent">arcade</Link>, read the{" "}
            <Link href="/research" className="text-accent">research</Link>, then poke the pet.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
