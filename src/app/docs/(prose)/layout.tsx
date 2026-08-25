const DOC_NAV: { group: string; items: { href: string; label: string }[] }[] = [
  {
    group: "QP-Core",
    items: [{ href: "/docs/qp-core/transpiler-pipeline", label: "Transpiler pipeline" }],
  },
  {
    group: "VQE Suite",
    items: [
      { href: "/docs/vqe-suite/hamiltonian-and-ansatz", label: "Hamiltonian & ansatz" },
      { href: "/docs/vqe-suite/state-representations-and-measurement", label: "State representations & measurement" },
      { href: "/docs/vqe-suite/zero-noise-extrapolation", label: "Zero noise extrapolation" },
    ],
  },
  {
    group: "API",
    items: [{ href: "/docs/api-reference", label: "API reference" }],
  },
];

export default function ProseDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <nav className="lg:w-56 lg:shrink-0">
        <a href="/docs" className="font-mono text-sm text-accent">
          Docs
        </a>
        <div className="mt-4 flex flex-col gap-6">
          {DOC_NAV.map((section) => (
            <div key={section.group}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{section.group}</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-muted transition-colors hover:text-foreground">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <article className="min-w-0 flex-1">{children}</article>
    </div>
  );
}
