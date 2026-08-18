import { BlochSphere } from "@/components/three/BlochSphere";

export function Hero() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a
          href="https://qp-core.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-950/60 px-3 py-1 text-xs text-muted backdrop-blur-xl transition-colors hover:border-accent/50 hover:text-foreground"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          ● System Live — WebGL Engine Active
        </a>
      </div>

      <p className="mb-4 font-mono text-sm text-accent">Quantum Powerhouse</p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Engineering the next generation of{" "}
        <span className="animate-gradient-x bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-500 bg-clip-text text-transparent">
          quantum software
        </span>
        .
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        Quantum Powerhouse is a quantum computing developer studio exploring
        quantum mechanics, quantum algorithms, and the tooling that connects
        circuit design to real quantum hardware. Rotate the Bloch sphere
        below, or drop straight into the transpiler terminal.
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

      <div className="mt-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
          Interactive Bloch Sphere — |Ψ⟩ = α|0⟩ + β|1⟩
        </p>
        <BlochSphere />
      </div>
    </section>
  );
}
