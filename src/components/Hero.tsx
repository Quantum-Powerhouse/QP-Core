import { BlochSphere } from "@/components/three/BlochSphere";
import { ARCADE_GAME_COUNT } from "@/components/arcade/manifest";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a
          href="/playground/arcade"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur-xl transition-colors hover:border-accent/50 hover:text-foreground"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Engine live. {ARCADE_GAME_COUNT} games run on it
        </a>
      </div>

      <p className="mb-4 font-mono text-sm text-accent">Quantum Powerhouse</p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Quantum software that <span className="text-accent">runs</span>.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        An OpenQASM to Amazon Braket IR transpiler, a variational quantum
        eigensolver built from scratch, and a zero noise extrapolation engine,
        all computed live in your browser. Rotate the Bloch sphere below, or
        go straight to the transpiler terminal.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href="#transpiler"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#211603] transition-colors hover:bg-[#e6c47a]"
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
          Interactive Bloch Sphere, |Ψ⟩ = α|0⟩ + β|1⟩
        </p>
        <BlochSphere />
      </div>
    </section>
  );
}
