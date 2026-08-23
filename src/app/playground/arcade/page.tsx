import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  BlochQuiz,
  BornCasino,
  GateMixer,
  InterferenceLab,
  MeasurementDuel,
  RabiTrainer,
  StateMatch,
} from "@/components/arcade/GamesBasics";
import {
  ChshGame,
  EntangledDice,
  EntanglementDial,
  NoCloning,
  PhaseKickback,
  SuperdenseCoding,
  TeleportSteps,
} from "@/components/arcade/GamesEntangle";
import {
  Bb84Game,
  DecoherenceDial,
  DeutschGame,
  GroverSearchlight,
  QuantumRng,
  RepetitionRescue,
  TunnelingCurve,
} from "@/components/arcade/GamesAdvanced";
import { QaoaMaxCut, WalkRace } from "@/components/arcade/GamesFrontier";
import { EngineBenchmark } from "@/components/arcade/EngineBenchmark";
import { HardwareComparison } from "@/components/HardwareComparison";
import { Reveal } from "@/components/Reveal";
import { softwareApplicationSchema } from "@/lib/jsonld";
import { SITE_URL, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Quantum Arcade: 23 Real Interactive Quantum Games & Labs",
  description:
    "Twenty-plus playable quantum games, labs, and demos — Grover search, Bell/CHSH violation, teleportation, BB84 key exchange, decoherence, error correction — every one computed live by a real statevector or density-matrix simulator in your browser.",
  path: "/playground/arcade",
  keywords: [
    "interactive quantum computing games",
    "Grover algorithm visualizer",
    "Bell inequality CHSH simulator",
    "BB84 quantum key distribution demo",
    "quantum error correction game",
    "learn quantum computing interactive",
  ],
  ogTitle: "Quantum Arcade",
});

const SECTIONS: { heading: string; blurb: string; games: React.ComponentType[] }[] = [
  {
    heading: "One qubit, no mercy",
    blurb: "The fundamentals — every widget drives a real statevector.",
    games: [GateMixer, StateMatch, BornCasino, RabiTrainer, InterferenceLab, MeasurementDuel, BlochQuiz],
  },
  {
    heading: "Entanglement & protocols",
    blurb: "Two qubits, one wavefunction — the part with no classical story.",
    games: [EntanglementDial, EntangledDice, ChshGame, TeleportSteps, SuperdenseCoding, PhaseKickback, NoCloning],
  },
  {
    heading: "Algorithms, noise & spies",
    blurb: "Where quantum computing earns its keep — and fights for its life.",
    games: [GroverSearchlight, DeutschGame, QuantumRng, DecoherenceDial, RepetitionRescue, Bb84Game, TunnelingCurve],
  },
  {
    heading: "The frontier",
    blurb: "Where today's research lives — variational optimization and ballistic quantum walks.",
    games: [QaoaMaxCut, WalkRace],
  },
];

export default function ArcadePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-16">
          <p className="mb-2 font-mono text-sm text-accent">Playground</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Quantum Arcade</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Twenty-three games, labs, and demos. Nothing here is a canned animation: every bar, dial, and verdict is
            computed live by the same from-scratch statevector and density-matrix engine that powers the VQE suite.
            One card runs an analytic textbook formula instead of a simulation — it says so on the card.
          </p>
        </div>
        {SECTIONS.map((section) => (
          <section key={section.heading} className="mx-auto max-w-6xl px-6 py-10">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-1 mb-6 text-sm text-muted">{section.blurb}</p>
            <div className="grid gap-5 md:grid-cols-2">
              {section.games.map((Game, i) => (
                <Reveal key={i} delayMs={(i % 2) * 60}>
                  <Game />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="text-xl font-semibold text-foreground">Reality check</h2>
          <p className="mt-1 mb-6 text-sm text-muted">
            How far the browser engine scales on your machine — and how the ideal CHSH result compares with a real
            device&apos;s noise model.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <EngineBenchmark />
            <HardwareComparison />
          </div>
        </section>
      </main>
      <SiteFooter />
      <JsonLd
        data={softwareApplicationSchema({
          name: "Quantum Arcade",
          description:
            "Twenty-plus interactive quantum computing games and labs computed live by an in-browser statevector and density-matrix simulator.",
          applicationCategory: "EducationalApplication",
          url: `${SITE_URL}/playground/arcade`,
          keywords: ["quantum games", "Grover search", "Bell inequality", "BB84", "quantum error correction"],
        })}
      />
    </div>
  );
}
