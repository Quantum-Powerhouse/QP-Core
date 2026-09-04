import Link from "next/link";

const ORBITS: { rx: number; ry: number; nodes: { label: string; href: string; angle: number }[] }[] = [
  {
    rx: 260,
    ry: 132,
    nodes: [
      { label: "Arcade", href: "/playground/arcade", angle: -18 },
      { label: "Research", href: "/research", angle: 62 },
      { label: "Field", href: "/field", angle: 168 },
      { label: "Learn", href: "/learn", angle: 248 },
    ],
  },
  {
    rx: 176,
    ry: 88,
    nodes: [
      { label: "Lab", href: "/lab", angle: 28 },
      { label: "Hardware", href: "/hardware", angle: 128 },
      { label: "Docs", href: "/docs", angle: 208 },
      { label: "Engineering", href: "/engineering", angle: 308 },
    ],
  },
];

/**
 * The site as a system: section nodes on two slow orbits around a central
 * qubit sphere. Every node is a plain link; on desktop the zoom navigation
 * turns the click into the collapse and travel move. Reduced motion stops
 * the orbits; the links keep working everywhere.
 */
export function SiteGlobe() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4 pt-2" aria-label="Site map as an orbital diagram">
      <div className="globe-map relative mx-auto hidden h-[340px] max-w-[620px] sm:block">
        {/* orbit lines */}
        <svg viewBox="0 0 620 340" className="absolute inset-0 h-full w-full" aria-hidden>
          {ORBITS.map((o) => (
            <ellipse key={o.rx} cx="310" cy="170" rx={o.rx} ry={o.ry} fill="none" stroke="var(--border)" strokeWidth="1" />
          ))}
        </svg>
        {/* the central qubit */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="globe-core flex h-16 w-16 items-center justify-center rounded-full">
            <span className="font-mono text-sm text-[#fafaf7]">|ψ⟩</span>
          </div>
        </div>
        {/* nodes on their orbits; the group turns, each label counter turns */}
        {ORBITS.map((o, oi) => (
          <div key={o.rx} className={`absolute inset-0 ${oi === 0 ? "globe-spin" : "globe-spin-reverse"}`}>
            {o.nodes.map((n) => {
              const rad = (n.angle * Math.PI) / 180;
              const x = 310 + o.rx * Math.cos(rad);
              const y = 170 + o.ry * Math.sin(rad);
              return (
                <div key={n.href} className="absolute" style={{ left: x, top: y }}>
                  <div className={oi === 0 ? "globe-counter" : "globe-counter-reverse"}>
                    <Link
                      href={n.href}
                      className="globe-node -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-foreground"
                    >
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
                      {n.label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-1 hidden text-center font-mono text-[11px] text-muted sm:block">
        the site as a system · click a node to travel · the page you leave collapses back into a qubit
      </p>
    </section>
  );
}
