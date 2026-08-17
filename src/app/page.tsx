import { Hero } from "@/components/Hero";
import { ProjectHighlights } from "@/components/ProjectHighlights";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TranspilerTerminal } from "@/components/TranspilerTerminal";

export default function Home() {
  return (
    <div id="top" className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TranspilerTerminal />
        <ProjectHighlights />
      </main>
      <SiteFooter />
    </div>
  );
}
