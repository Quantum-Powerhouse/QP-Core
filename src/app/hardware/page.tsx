import type { Metadata } from "next";
import Link from "next/link";
import { HardwareComparison } from "@/components/HardwareComparison";
import { HardwareLane } from "@/components/hardware/HardwareLane";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Real Hardware — Run a Circuit on an IBM Quantum Device",
  description:
    "Submit a small OpenQASM circuit to real IBM Quantum hardware and see the measured counts beside the exact Born-rule prediction, with the device's real noise. Guardrailed: size caps, a monthly shot budget, one job at a time — and an honest inactive state when no token is configured.",
  path: "/hardware",
  keywords: ["run quantum circuit real hardware", "IBM Quantum free tier", "Qiskit Runtime sampler", "real vs simulated quantum", "quantum noise real device"],
  ogTitle: "Real Hardware",
});

export default function HardwarePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Hardware</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Real quantum hardware</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Everything else on this site is exact simulation. This page is where a circuit leaves the browser and runs on
          a physical processor — and comes back with the noise that simulation doesn&apos;t have. The lane is built the
          way the rest of the site is: it never shows a device result that did not come from a device.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Two things are already real here today: the exact prediction, and the comparison below against a real
          device&apos;s published calibration noise model. The third — a live run — switches on with a token; the
          status panel says exactly where it stands. Read{" "}
          <Link href="/field/hardware" className="text-accent">the hardware scoreboard</Link> for what these devices
          have and haven&apos;t achieved.
        </p>

        <div className="mt-10">
          <HardwareLane />
        </div>

        <div className="mt-10">
          <HardwareComparison />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
