export function Hero() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
      <a
        href="https://qp-core.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-foreground"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        Live — deployed on Vercel
      </a>
      <p className="mb-4 font-mono text-sm text-accent">Quantum Powerhouse</p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
        Engineering the next generation of{" "}
        <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
          quantum software
        </span>
        .
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Quantum Powerhouse is a research and engineering organization exploring
        quantum mechanics, quantum algorithms, and the tooling that connects
        circuit design to real quantum hardware. We build with Qiskit, design
        error-aware algorithms, and ship infrastructure — like the live
        OpenQASM → Amazon Braket IR transpiler below — that helps quantum
        programs run where they need to run.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="#transpiler"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#04121a] transition-transform hover:scale-105"
        >
          Try the Transpiler
        </a>
        <a
          href="#projects"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/60 hover:text-accent"
        >
          View Projects
        </a>
      </div>
    </section>
  );
}
