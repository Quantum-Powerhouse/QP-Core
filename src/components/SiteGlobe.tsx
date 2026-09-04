import Link from "next/link";

const W = 720;
const H = 400;

const ORBITS: { rx: number; ry: number; nodes: { label: string; href: string; angle: number }[] }[] = [
  {
    rx: 300,
    ry: 162,
    nodes: [
      { label: "Arcade", href: "/playground/arcade", angle: -18 },
      { label: "Research", href: "/research", angle: 62 },
      { label: "Field", href: "/field", angle: 168 },
      { label: "Learn", href: "/learn", angle: 248 },
    ],
  },
  {
    rx: 204,
    ry: 106,
    nodes: [
      { label: "Lab", href: "/lab", angle: 28 },
      { label: "Hardware", href: "/hardware", angle: 128 },
      { label: "Docs", href: "/docs", angle: 208 },
      { label: "Engineering", href: "/engineering", angle: 308 },
    ],
  },
];

/**
 * The site as a system: section nodes on two flowing orbits around a central
 * qubit sphere. Works at every viewport: the stage scales down on phones and
 * the tap targets counter scale so they stay readable and pressable. Every
 * node is a plain link; on desktop pointers the zoom navigation turns the
 * click into the collapse and travel move. Reduced motion stops the flow.
 */
export function SiteGlobe() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Site map as an orbital diagram">
      <div className="globe-map relative mx-auto" style={{ width: "100%", maxWidth: W }}>
        <div className="globe-stage relative mx-auto" style={{ width: W, height: H }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
            {ORBITS.map((o, i) => (
              <ellipse
                key={o.rx}
                className={i === 0 ? "globe-orbitline" : "globe-orbitline globe-orbitline-reverse"}
                cx={W / 2}
                cy={H / 2}
                rx={o.rx}
                ry={o.ry}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.2"
              />
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="globe-core flex h-20 w-20 items-center justify-center rounded-full">
              <span className="font-mono text-base text-[#fafaf7]">|ψ⟩</span>
            </div>
          </div>
          {ORBITS.map((o, oi) => (
            <div key={o.rx} className={`absolute inset-0 ${oi === 0 ? "globe-spin" : "globe-spin-reverse"}`}>
              {o.nodes.map((n) => {
                const rad = (n.angle * Math.PI) / 180;
                const x = W / 2 + o.rx * Math.cos(rad);
                const y = H / 2 + o.ry * Math.sin(rad);
                return (
                  <div key={n.href} className="absolute" style={{ left: x, top: y }}>
                    <div className={oi === 0 ? "globe-counter" : "globe-counter-reverse"}>
                      <div className="globe-nodescale">
                        <Link
                          href={n.href}
                          className="globe-node -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-foreground"
                        >
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
                          {n.label}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-center font-mono text-xs text-muted">
        the site as a system · tap a node to travel · the page you leave collapses back into a qubit
      </p>
    </section>
  );
}
