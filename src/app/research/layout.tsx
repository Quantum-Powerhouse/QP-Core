const RESEARCH_NAV: { href: string; label: string }[] = [
  { href: "/research", label: "Overview" },
  { href: "/research/methodology", label: "Methodology" },
  { href: "/research/claims", label: "Claims table" },
  { href: "/research/prior-art", label: "Prior-art matrix" },
  { href: "/research/evidence", label: "Evidence & sources" },
  { href: "/research/gap-analysis", label: "Gap analysis" },
];

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-10 lg:flex-row">
        <nav className="lg:w-56 lg:shrink-0">
          <a href="/research" className="font-mono text-sm text-accent">
            Research
          </a>
          <ul className="mt-4 flex flex-col gap-1.5">
            {RESEARCH_NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="min-w-0 flex-1">{children}</article>
      </div>
    </div>
  );
}
