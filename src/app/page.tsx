import { CircuitTimelineSection } from "@/components/CircuitTimelineSection";
import { ExploreFurther } from "@/components/ExploreFurther";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { ParticleField } from "@/components/three/ParticleField";
import { ProjectHighlights } from "@/components/ProjectHighlights";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TranspilerTerminalStudio } from "@/components/TranspilerTerminalStudio";
import { softwareApplicationSchema } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/seo";

export default function Home() {
  return (
    <div id="top" className="flex flex-1 flex-col">
      <ParticleField />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <CircuitTimelineSection />
        <TranspilerTerminalStudio />
        <ProjectHighlights />
        <ExploreFurther />
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
            "Rust quantum compiler pass",
            "Amazon Braket IR",
          ],
        })}
      />
    </div>
  );
}
