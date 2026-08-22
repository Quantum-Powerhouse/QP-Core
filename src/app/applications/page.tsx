import type { Metadata } from "next";
import Link from "next/link";
import { MythQuiz } from "@/components/MythQuiz";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "What Quantum Computing Is Actually Good For (2026)",
  description:
    "An honest, sourced map of where quantum computers deliver — chemistry and materials, cryptography, sensing — where they might (finance, optimization, ML), and where they won't (general computation, video generation, robots). Includes a myth-checker.",
  path: "/applications",
  keywords: [
    "quantum computing applications 2026",
    "quantum advantage chemistry materials",
    "quantum computing hype vs reality",
    "post-quantum cryptography migration",
    "quantum machine learning limitations",
  ],
  ogTitle: "What Quantum Is Actually Good For",
});

type Tier = { heading: string; tone: string; items: { title: string; body: string; source: { label: string; href: string } }[] };

const TIERS: Tier[] = [
  {
    heading: "Real — evidence exists",
    tone: "text-accent",
    items: [
      {
        title: "Chemistry & materials simulation",
        body: "Nature is quantum, so simulating strongly-correlated electrons — catalysts, batteries, magnets, drug targets — is the application with the deepest physics behind it. In May 2026 Q-CTRL reported a ~3,000× speedup over performance-optimized classical software on a commercially relevant materials problem on IBM hardware, the first credible 'practical advantage' claim; IBM hardware has also simulated a 300-atom pharmaceutical system. This site's own VQE solves H₂ in your browser — the same idea at toy scale.",
        source: { label: "Q-CTRL, May 2026", href: "https://q-ctrl.com/blog/q-ctrl-delivers-3-000x-speedup-in-materials-discovery-for-the-energy-sector-with-quantum-computing-and-demonstrates-evidence-of-practical-quantum-advantage" },
      },
      {
        title: "Breaking public-key cryptography — and replacing it",
        body: "Shor's algorithm factors and takes discrete logs efficiently; a large fault-tolerant machine would break RSA and elliptic-curve cryptography. The practical consequence is already here: NIST finalized post-quantum standards in 2024 (ML-KEM, ML-DSA, SLH-DSA) and migrations are underway. Quantum key distribution (BB84 — play it in the arcade) is deployed today on real fiber links.",
        source: { label: "Assessing the benefits and risks (arXiv 2401.16317)", href: "https://arxiv.org/abs/2401.16317" },
      },
      {
        title: "Quantum sensing & metrology",
        body: "Not computing, but the nearest-term commercial win: entangled and squeezed states beat classical limits in magnetometry, timing, gravimetry and navigation without GPS. Devices ship now.",
        source: { label: "Myths, realities and futures (arXiv 2412.00987)", href: "https://arxiv.org/abs/2412.00987" },
      },
    ],
  },
  {
    heading: "Promising — unproven at scale",
    tone: "text-[#f59e0b]",
    items: [
      {
        title: "Finance: Monte Carlo via amplitude estimation",
        body: "A genuine quadratic (square-root) speedup for derivative pricing and risk — but fragile: estimates put ~4,700 logical qubits and ~10⁹ T-gates at 45 MHz just to match classical Monte Carlo, roughly 1,000× today's clock rates, while GPUs keep eroding the edge. Banks are piloting; nobody is in production.",
        source: { label: "Quantum computing by 2033 — industry map", href: "https://postquantum.com/quantum-utility-map/quantum-computing-2033-industries/" },
      },
      {
        title: "Optimization: logistics, scheduling, engineering design",
        body: "QAOA and annealing are real, and hybrid pilots exist for routing and scheduling. But careful evaluations on prototypical industrial problems — robot path planning, vehicle options — find no clear advantage yet over strong classical heuristics. Worth watching; not worth promising.",
        source: { label: "Practicality of quantum optimization (arXiv 2311.11621)", href: "https://arxiv.org/abs/2311.11621" },
      },
      {
        title: "Quantum machine learning",
        body: "The hype runs ahead of the evidence: loading classical data into qubits is inefficient, most results are on small or simulated datasets, and even Microsoft places AI-workload advantage 5–10 years out. The opposite direction is already paying: classical ML accelerates quantum simulation.",
        source: { label: "QML survey (arXiv 2310.10315)", href: "https://arxiv.org/abs/2310.10315" },
      },
    ],
  },
  {
    heading: "Not this — and why",
    tone: "text-[#ff6b6b]",
    items: [
      {
        title: "General-purpose speed",
        body: "Quantum computers are not faster computers. For a broad class of problems they offer at most a polynomial speedup, and for most everyday computation none. They cannot solve anything a classical machine cannot; they change the cost of specific structured problems. Most researchers believe NP-complete problems stay hard.",
        source: { label: "The Quantum Frontier (arXiv 1206.0785)", href: "https://arxiv.org/abs/1206.0785" },
      },
      {
        title: "Video and image generation",
        body: "Quantum generative models exist as research on MNIST-scale, low-resolution images; hybrid models need the classical half to reach anything usable. Quantum video processing is at the 'basic research is just beginning' stage. GPUs own this for the foreseeable future.",
        source: { label: "Quantum GANs survey (arXiv 2506.18002)", href: "https://arxiv.org/abs/2506.18002" },
      },
      {
        title: "Robots, construction, 'automating everything'",
        body: "Robots run on classical control and classical AI. Quantum's plausible role is indirect — an optimization sub-routine for path planning or design search. Claims of quantum-driven seismic optimization on construction sites are preprints, not peer-reviewed results. The intelligence people feel from automation comes from AI; quantum doesn't add 'more intellect', it adds specific math.",
        source: { label: "Quantum computing & AI automation perspectives (arXiv 2505.10012)", href: "https://arxiv.org/abs/2505.10012" },
      },
    ],
  },
];

export default function ApplicationsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="mb-2 font-mono text-sm text-accent">Research · applications</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What quantum computing is actually good for</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Not &ldquo;everything, faster.&rdquo; Quantum computers change the cost of <em>specific structured problems</em>
          — and leave most computation exactly where it is. This map sorts the claims by evidence, each with a primary
          source you can open. Same rule as the rest of the site: nothing here is asserted that can&apos;t be traced.
        </p>

        <div className="mt-10">
          <MythQuiz />
        </div>

        {TIERS.map((tier) => (
          <section key={tier.heading} className="mt-14">
            <h2 className={`font-mono text-xs uppercase tracking-widest ${tier.tone}`}>{tier.heading}</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {tier.items.map((item) => (
                <article key={item.title} className="glass-panel flex flex-col gap-3 rounded-xl p-5">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted">{item.body}</p>
                  <a href={item.source.href} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-accent underline-offset-2 hover:underline">
                    source: {item.source.label} ↗
                  </a>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-14 glass-panel rounded-xl p-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">The honest one-liner</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Quantum computing is a <strong className="text-foreground">simulation and number-theory machine</strong> with a
            cryptography deadline attached. Chemistry, materials, and the post-quantum migration are the bets with evidence;
            finance, optimization, and ML are bets with promise; general speed, media generation, and robotics are not
            quantum problems. If you want to feel the difference rather than read it, the{" "}
            <Link href="/playground/arcade" className="text-accent">arcade</Link> runs the real algorithms, and the{" "}
            <Link href="/research" className="text-accent">research wing</Link> shows how claims get checked. For the
            cryptography deadline in practice, see{" "}
            <a href="https://github.com/sadeqisaidmohaddes-star/pqc-scan" className="text-accent" target="_blank" rel="noopener noreferrer">
              pqc-scan
            </a>
            , a tool that inventories quantum-vulnerable cryptography in a codebase.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
