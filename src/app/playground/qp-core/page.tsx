import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TranspilerTerminalStudio } from "@/components/TranspilerTerminalStudio";
import { softwareApplicationSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "QP-Core: OpenQASM to Amazon Braket IR Transpiler Playground",
  description:
    "Live QP-Core playground, paste an OpenQASM 2.0 or 3.0 circuit and transpile it to Amazon Braket IR in the browser, with generated Qiskit Python, optimized IR, and real circuit metrics.",
  path: "/playground/qp-core",
  keywords: [
    "OpenQASM to Amazon Braket transpiler",
    "OpenQASM 3.0 parser",
    "Amazon Braket IR",
    "Qiskit transpiler playground",
  ],
  ogTitle: "QP-Core Transpiler Playground",
});

export default function QpCorePlaygroundPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16">
          <p className="mb-2 font-mono text-sm text-accent">Playground</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            QP-Core Transpiler
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            QP-Core parses OpenQASM 2.0 and 3.0 circuits and compiles them
            into Amazon Braket IR. Run it live below, paste a circuit,
            transpile it, and inspect the generated Qiskit Python, optimized
            IR, and real circuit metrics computed from what you paste in.
          </p>
        </div>
        <TranspilerTerminalStudio />
      </main>
      <SiteFooter />
      <JsonLd
        data={softwareApplicationSchema({
          name: "QP-Core",
          description:
            "A transpiler that parses OpenQASM 2.0/3.0 circuits and compiles them into Amazon Braket IR.",
          applicationCategory: "DeveloperApplication",
          url: `${SITE_URL}/playground/qp-core`,
          keywords: [
            "OpenQASM to Amazon Braket transpiler",
            "Amazon Braket IR",
          ],
        })}
      />
    </div>
  );
}
