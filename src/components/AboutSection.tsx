import { BlackHole } from "@/components/three/BlackHole";
import { ARCADE_GAME_COUNT } from "@/components/arcade/manifest";
import { getResearchStats } from "@/lib/research/stats";

/**
 * The About band: what this place actually is, told over the event-horizon
 * scene. Every number in the stat rail is derived from the same data the
 * rest of the site renders — nothing hand-typed that can drift.
 */
export function AboutSection() {
  const stats = getResearchStats();
  const rail = [
    { value: String(ARCADE_GAME_COUNT), label: "playable quantum games" },
    { value: String(stats.totalClaims), label: "research claims, each with a verdict" },
    { value: String(stats.priorArtSystems), label: "prior-art systems inspected" },
    { value: String(stats.uniqueSourcesLinked), label: "primary sources linked" },
  ];

  return (
    <section id="about" className="relative overflow-hidden">
      {/* the resident black hole — decorative, and proud of it */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
        <BlackHole />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <p className="mb-3 font-mono text-sm text-accent">About</p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          A working quantum lab,
          <br />
          not a brochure about one.
        </h2>

        <div className="mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">The one rule</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Nothing renders here that didn&apos;t compute. Every probability bar is a real statevector, every
              convergence curve a real optimizer, every research claim a checked source. Where something is a visual
              metaphor — like the black hole behind this text — it says so.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">The machines</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A from-scratch TypeScript physics engine — statevector and density-matrix simulators, a variational
              eigensolver, zero-noise extrapolation — powering the transpiler terminal, the VQE suite, and every game
              in the arcade. No backend required; your browser is the lab bench.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">The research</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A sustained, primary-source-verified investigation into the quantum CI/CD testing gap — where the
              evidence contradicted the hypothesis, the site says that too. Continuous integration fails the build if
              the rendered claims ever drift from the evidence record.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">The resident</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              QPet — the tamed quantum creature in the corner — follows your cursor on an elastic tether, gets bored,
              sleeps, panics mildly, and occasionally tunnels. Its emotions are a real state machine; its collapses are
              genuine Born-rule samples. Poke it.
            </p>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {rail.map((item) => (
            <div key={item.label} className="flex flex-col">
              <dt className="order-2 mt-1 text-xs leading-snug text-muted">{item.label}</dt>
              <dd className="order-1 font-mono text-3xl text-accent">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
