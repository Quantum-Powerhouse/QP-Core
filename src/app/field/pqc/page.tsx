import type { Metadata } from "next";
import Link from "next/link";
import { FieldClaimCard, StatusLegend } from "@/components/field/FieldClaimCard";
import { PQC_STANDARDS, PQC_THREAT, RSA_ESTIMATES } from "@/lib/field/pqc";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Post-Quantum Cryptography — Standards, Deadlines, and the Real Threat Model",
  description:
    "NIST's finalized ML-KEM, ML-DSA and SLH-DSA standards, the 2030/2035 deprecation timeline for RSA and ECC, Mosca's inequality and harvest-now-decrypt-later explained, the falling qubit estimates for breaking RSA-2048 — and why AES and hashes are not the problem.",
  path: "/field/pqc",
  keywords: ["post-quantum cryptography", "FIPS 203 ML-KEM", "NIST IR 8547 2035", "harvest now decrypt later", "Mosca inequality", "RSA-2048 qubits Gidney 2025"],
  ogTitle: "Post-Quantum Cryptography",
});

export default function PqcPage() {
  return (
    <>
      <p className="mb-2 font-mono text-sm text-accent">The field · cryptography</p>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Post-quantum cryptography</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        The first place quantum computing has a deadline attached — and the one section here you can act on this
        quarter. Pair it with the arcade&apos;s{" "}
        <Link href="/playground/arcade#bb84-catch-eve" className="text-accent">BB84 game</Link>, which shows why
        no-cloning makes key exchange detectably secure, and with{" "}
        <a href="https://github.com/sadeqisaidmohaddes-star/pqc-scan" className="text-accent" target="_blank" rel="noopener noreferrer">
          pqc-scan
        </a>
        , which inventories the vulnerable algorithms in a codebase.
      </p>
      <div className="mt-6">
        <StatusLegend />
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The standards</h2>
      <div className="mt-4 flex flex-col gap-4">
        {PQC_STANDARDS.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">The threat model, plainly</h2>
      <div className="mt-4 flex flex-col gap-4">
        {PQC_THREAT.map((c) => (
          <FieldClaimCard key={c.id} claim={c} />
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-foreground">How many qubits to break RSA-2048 — a falling number</h2>
      <p className="mt-1 mb-4 text-sm text-muted">Each point is a named resource estimate. The qubits are noisy physical qubits under each paper&apos;s stated assumptions; the papers differ in assumptions, so compare direction, not decimals.</p>
      <div className="glass-panel overflow-x-auto rounded-xl p-2">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-muted">
              <th className="px-3 py-2">estimate</th>
              <th className="px-3 py-2">physical qubits</th>
              <th className="px-3 py-2">runtime</th>
              <th className="px-3 py-2">source</th>
            </tr>
          </thead>
          <tbody>
            {RSA_ESTIMATES.map((r) => (
              <tr key={r.id} className="border-t border-border/60 align-top">
                <td className="px-3 py-2 text-foreground">{r.title}</td>
                <td className="px-3 py-2 font-mono text-accent">{r.qubits}</td>
                <td className="px-3 py-2 font-mono text-foreground">{r.time}</td>
                <td className="px-3 py-2">
                  <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-accent underline-offset-2 hover:underline">
                    {r.source.label} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {RSA_ESTIMATES.map((c) => (
          <FieldClaimCard key={`card-${c.id}`} claim={c} />
        ))}
      </div>

      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">What to do, in order</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted">
          <li>Inventory every use of RSA, ECDSA, ECDH and DH in your systems (a crypto bill of materials).</li>
          <li>Migrate key exchange first — that is where harvest-now-decrypt-later bites — to ML-KEM, hybrid with classical during transition.</li>
          <li>Then signatures (ML-DSA; SLH-DSA where hash-based conservatism is wanted).</li>
          <li>Leave AES-128/256 and SHA-2/SHA-3 alone; they are not the problem.</li>
          <li>Plan against NIST&apos;s dates: nothing new on 112-bit RSA/ECC after 2030; nothing at all after 2035.</li>
        </ol>
      </section>
      <section className="glass-panel mt-12 rounded-xl p-5">
        <h2 className="font-mono text-xs uppercase tracking-widest text-accent">See also</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <li><Link href="/playground/arcade#bb84-catch-eve" className="text-accent underline-offset-2 hover:underline">Play BB84 — catch the eavesdropper</Link></li>
          <li><Link href="/field/networking" className="text-accent underline-offset-2 hover:underline">Quantum networking — entanglement on real fiber</Link></li>
          <li><Link href="/field/hardware" className="text-accent underline-offset-2 hover:underline">How far the hardware is from breaking RSA</Link></li>
        </ul>
      </section>
    </>
  );
}
