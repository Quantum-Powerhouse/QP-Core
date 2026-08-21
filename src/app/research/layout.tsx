import Link from "next/link";
import { PageTransition } from "@/components/research/PageTransition";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const RESEARCH_NAV: { href: string; label: string }[] = [
  { href: "/research", label: "Overview" },
  { href: "/research/methodology", label: "Methodology" },
  { href: "/research/claims", label: "Claims table" },
  { href: "/research/prior-art", label: "Prior-art matrix" },
  { href: "/research/evidence", label: "Evidence" },
  { href: "/research/sources", label: "Sources" },
  { href: "/research/gap-analysis", label: "Gap analysis" },
];

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-10 lg:flex-row">
        <nav className="glass-panel rounded-xl p-4 lg:sticky lg:top-24 lg:h-fit lg:w-56 lg:shrink-0">
          <Link href="/research" className="font-mono text-sm text-accent">
            Research
          </Link>
          <ul className="mt-4 flex flex-col gap-1.5">
            {RESEARCH_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="min-w-0 flex-1">
          <PageTransition>{children}</PageTransition>
        </article>
      </div>
      </div>
      <SiteFooter />
    </div>
  );
}
