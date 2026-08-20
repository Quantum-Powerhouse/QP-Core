const LINKS = [
  {
    title: "QP-Core Playground",
    description: "Paste OpenQASM, watch it compile to Amazon Braket IR, inspect the real metrics.",
    href: "/playground/qp-core",
  },
  {
    title: "VQE Suite Playground",
    description: "Run the real H2 optimizer and the Zero-Noise Extrapolation error-mitigation panel.",
    href: "/playground/vqe-suite",
  },
  {
    title: "Documentation",
    description: "The math and the architecture, written against the real source — not marketing copy.",
    href: "/docs",
  },
  {
    title: "Research",
    description: "A primary-source-verified investigation into the quantum CI/CD regression-testing gap — claims checked, not assumed.",
    href: "/research",
  },
];

export function ExploreFurther() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10">
        <p className="mb-2 font-mono text-sm text-accent">Go Deeper</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From State to Research</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Everything above is a starting point. The playgrounds run the real computation; the docs explain why
          it works.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border bg-surface/60 p-6 backdrop-blur-xl transition-colors hover:border-accent/50"
          >
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">{link.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{link.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
