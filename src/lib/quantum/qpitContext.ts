/**
 * QPIT's contextual personality, pure logic, no DOM, no React.
 *
 * Everything here maps *real UI facts* (the current route, the destination of
 * a link the user is hovering) to short personality lines. QPIT never claims
 * knowledge it doesn't have: lines are flavor about real sections of this
 * site, not invented facts, same rule as src/lib/quantum/events.ts.
 *
 * Tested by tests/qpit-context.test.mjs (node --test, native type stripping).
 */

import { ARCADE_GAME_COUNT } from "../../components/arcade/manifest.ts";

export type QpitSection =
  | "home"
  | "research"
  | "claims"
  | "evidence"
  | "sources"
  | "gap-analysis"
  | "prior art"
  | "methodology"
  | "docs"
  | "playground"
  | "learn"
  | "applications"
  | "lab"
  | "hardware"
  | "engineering"
  | "field"
  | "unknown";

/** Longest-prefix-wins route → section mapping. Order matters only for readability. */
const SECTION_PREFIXES: [string, QpitSection][] = [
  ["/research/claims", "claims"],
  ["/research/evidence", "evidence"],
  ["/research/sources", "sources"],
  ["/research/gap-analysis", "gap-analysis"],
  ["/research/prior-art", "prior art"],
  ["/research/methodology", "methodology"],
  ["/research", "research"],
  ["/docs", "docs"],
  ["/playground", "playground"],
  ["/learn", "learn"],
  ["/lab", "lab"],
  ["/hardware", "hardware"],
  ["/engineering", "engineering"],
  ["/applications", "applications"],
  ["/field", "field"],
];

export function sectionForPath(pathname: string): QpitSection {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  for (const [prefix, section] of SECTION_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return section;
  }
  return "unknown";
}

/** Spoken once when QPIT arrives on a page of that section. */
const GREETINGS: Record<QpitSection, string[]> = {
  home: ["Oh, you found me.", "Hey. Want to see something quantum?", "Welcome to the powerhouse."],
  research: ["Ah. Serious stuff.", "Claims get checked here.", "This is the careful part of the site."],
  claims: ["Every claim here got a verdict.", "Statuses, not vibes."],
  evidence: ["Receipts. I like receipts.", "Primary sources only."],
  sources: ["Every one of these was actually opened.", "The reading list. All of it real."],
  "gap-analysis": ["This is where the hypothesis got humbled.", "Honest conclusions live here."],
  "prior art": ["Know what came before.", "Twenty plus systems, all inspected."],
  methodology: ["How the checking got done.", "Rules first, conclusions second."],
  docs: ["Real math ahead.", "The equations match the source code."],
  playground: ["Careful. Things get weird around here.", "Go on, run something.", "You clicked that like you knew what it would do."],
  learn: ["Class is in session. I'm the lab rat.", "Four levels. No slides. You'll be fine."],
  lab: ["The open bench. Try not to entangle me.", "Every click reruns the engine. No mercy."],
  hardware: ["This is where circuits leave the browser.", "Real noise lives here. Respect it."],
  engineering: ["The tradeoffs. Nobody hides these.", "Where the hard parts get admitted."],
  applications: ["The applications map. Some of it will disappoint you.", "Hype goes to die here."],
  field: ["Receipts for the whole industry.", "Every card says what kind of claim it is."],
  unknown: ["Hm. New territory."],
};

/** Spoken when the user hovers a link *pointing at* that section. Cheekier, shorter. */
const HOVER_LINES: Record<QpitSection, string[]> = {
  home: ["Home again?"],
  research: ["Ah. Serious stuff.", "The rigorous bit."],
  claims: ["Verdicts in there.", "Every claim wears its status."],
  evidence: ["Receipts. I like receipts."],
  sources: ["The reading list. Every link was opened."],
  "gap-analysis": ["The humbling. Worth a look."],
  "prior art": ["Now we're getting interesting."],
  methodology: ["Rules of the game."],
  docs: ["Okay, this one gets weird. In a good way."],
  playground: ["I think you should explore that.", "Real simulation in there. Not slides."],
  learn: ["A path through the games. Worth it."],
  lab: ["Build your own circuit in there."],
  hardware: ["Real processor. Real noise."],
  engineering: ["How it was built, and what it cost."],
  applications: ["What I'm actually for. Spoiler: not video."],
  field: ["The scoreboard. Logical qubits, not marketing ones."],
  unknown: [],
};

/** Spoken when the user pokes (clicks/taps) QPIT itself. */
export const POKE_LINES: string[] = [
  "Hm?",
  "Careful, I'm coherent.",
  "You keep hovering around here. Suspicious.",
  "Are you bored?",
  "Poke me again and I decohere.",
  "That tickled, superpositionally speaking.",
];

/**
 * Lines tied to emotional-state transitions and special moments. Keys are
 * moments, not raw states. SLEEPING entry is deliberately silent (absence
 * is personality too). Frequencies are governed by the caller's cooldowns
 * and the chattiness governor in qpitState.ts.
 */
export const MOMENT_LINES: Record<string, string[]> = {
  BORED_ENTER: ["Hey… are you bored?", "So. Quiet in here."],
  WAKE_SURPRISED: ["Oh! You're back.", "I wasn't sleeping. I was decohering."],
  EXCITED_ENTER: ["Whoa.", "Okay okay okay."],
  ORBITING_ENTER: ["Are we orbiting? We're orbiting.", "Stable orbit achieved."],
  SUPERPOSITION_COLLAPSE: ["I picked this universe.", "I preferred the other universe.", "Okay. We're going with this one."],
  TUNNEL_HOME: ["Don't worry about it.", "Shortcut. Totally intentional.", "I tunneled. Probably."],
  OBSERVED: ["I'm observing you observing me.", "You're still watching me."],
  BLACKHOLE_NOTICED: ["Uh-oh.", "That's new.", "Please don't be a singularity."],
  BLACKHOLE_ESCAPED: ["Totally intentional.", "Not today, singularity.", "Escape velocity. Barely."],
  ENTANGLED: ["We're entangled now.", "It felt that. I felt that.", "Spooky action. At this distance."],
  WORMHOLE: ["Don't ask.", "Shortcut through nowhere.", "That tickled the topology."],
  BLACKHOLE_HOVER: [
    "That's a black hole. The artistic kind.",
    "Careful. Tiny singularity. Decorative, mostly.",
    "A black hole, well, a visual metaphor of one.",
  ],
  ROAMING_CHATTER: [
    "Wheee.",
    "Where are we going?",
    "You're fast today.",
    "I like this direction.",
    "Left! No, right!",
    "Try shaking me. Actually, don't.",
    "Still attached. Somehow.",
  ],
};

export function momentLine(moment: keyof typeof MOMENT_LINES | string, rand: Rand = Math.random): string | null {
  const lines = MOMENT_LINES[moment];
  return lines ? pickLine(lines, rand) : null;
}

/**
 * Grounded intents for the QPet Console. "What am I looking at?" and
 * "What next?" are keyed by the real route section; every description is a
 * true statement about what that section actually computes or contains.
 */
export const LOOKING_AT: Record<QpitSection, string> = {
  home: "The front door: a live Bloch sphere, the transpiler terminal, and the project grid. Everything on it computes for real.",
  research: "The research wing, a primary source verified study of the quantum CI/CD testing gap. Claims carry verdicts, not vibes.",
  claims: "The claims table: every hypothesis this research started with, and what checking it actually found.",
  evidence: "The evidence cards: each claim's primary source, what it says, and how confident we are.",
  sources: "Every URL this research opened. Including the ones that failed to load, those are listed too.",
  "gap-analysis": "The synthesis: what's novel, what isn't, and the one gap that survived, cross SDK regression testing.",
  "prior art": "The prior art matrix: two dozen systems, each checked for what it really does and doesn't do.",
  methodology: "How the checking worked: open the primary source, or don't cite it.",
  docs: "Technical docs with server rendered math, written against the actual source code.",
  playground: `A playground. The arcade has ${ARCADE_GAME_COUNT} games and labs; the VQE suite runs a real eigensolver; the transpiler compiles OpenQASM.`,
  learn: "A four level path through the arcade games, in the order that builds intuition.",
  lab: "The Circuit Lab: build any circuit on up to five qubits and watch the exact state, noise, and sampled shots respond.",
  hardware: "The hardware lane: a circuit runs on a real IBM device and comes back beside the exact prediction, or the page says why it can't yet.",
  engineering: "The engineering decisions page: each tradeoff with its problem, the call, the cost, and a link to check it.",
  applications: "The sourced map of what quantum computing is actually good for, and what it isn't.",
  field: "The state of the industry with receipts: hardware scoreboard, post quantum crypto deadlines, the timeline debate, careers.",
  unknown: "Honestly? Somewhere I don't have a map for.",
};

export const NEXT_STEP: Record<QpitSection, { line: string; href: string }> = {
  home: { line: "Go break a Bell inequality. The arcade has a CHSH game.", href: "/playground/arcade" },
  research: { line: "Read the gap analysis, it's where the hypothesis got humbled.", href: "/research/gap-analysis" },
  claims: { line: "See the receipts behind these verdicts.", href: "/research/evidence" },
  evidence: { line: "Now the synthesis of all of it.", href: "/research/gap-analysis" },
  sources: { line: "Back to what those sources decided.", href: "/research/claims" },
  "gap-analysis": { line: "Enough reading. Run something real, the VQE suite.", href: "/playground/vqe-suite" },
  "prior art": { line: "The gap analysis explains what all those systems leave open.", href: "/research/gap-analysis" },
  methodology: { line: "See the method applied: the claims table.", href: "/research/claims" },
  docs: { line: "Watch the math you just read actually run.", href: "/playground/vqe-suite" },
  playground: { line: "Try the arcade's Grover Searchlight, then over search it on purpose.", href: "/playground/arcade" },
  learn: { line: "Start Level 1. Gate Mixer. Press H twice.", href: "/playground/arcade#gate-mixer" },
  lab: { line: "Load the Bell preset, then add noise and watch purity fall.", href: "/playground/arcade#decoherence-dial" },
  hardware: { line: "See what the devices have actually achieved.", href: "/field/hardware" },
  engineering: { line: "Meet the person who made the calls.", href: "/builder" },
  applications: { line: "Now feel the real one: simulate a molecule in the VQE suite.", href: "/playground/vqe-suite" },
  field: { line: "Start with the hardware scoreboard, results first, promises second.", href: "/field/hardware" },
  unknown: { line: "Home is always a safe measurement.", href: "/" },
};

/** Short, true quantum facts QPet can offer. */
export const QUANTUM_FACTS: string[] = [
  "A qubit's state can't be copied. Not 'hard to', provably can't. It's why quantum key exchange is secure.",
  "Measuring in a different basis asks a different question of the same state. Same qubit, different answers.",
  "Grover's search finds one item among N in about the square root of N steps. Keep going and it overshoots.",
  "A Bell pair scores up to 2.83 on the CHSH test. Any classical explanation caps at 2.",
  "Decoherence is the real enemy: the off diagonal terms of a density matrix leaking away into the environment.",
  "Teleportation moves a state, not matter, and it needs two classical bits, so it can't beat light.",
  "The H2 molecule, in the smallest basis, needs just two qubits. This site's VQE solves it in your browser.",
];

/**
 * Superposition answers: QPet replies with two candidate lines and a weight
 * for the first. The console shows both ghosted; 'measure' collapses them
 * via a genuine Born-rule sample over amplitudes (√p, √(1−p)).
 */
export const SUPERPOSED_ANSWERS: Record<string, { a: string; b: string; pA: number }> = {
  alive: { a: "Alive? I'm coherent. Close enough.", b: "Alive is a classical question. Next.", pA: 0.62 },
  favorite: { a: "Entanglement. Two things, one truth.", b: "Interference. Waves that cancel on purpose.", pA: 0.5 },
  scared: { a: "Decoherence. It's how I'd forget you.", b: "Measurement. It's how I'd end.", pA: 0.7 },
  name: { a: "QPet. A tamed quantum thing.", b: "Whatever you call me while observing.", pA: 0.8 },
};

export type Rand = () => number;

export function pickLine(lines: readonly string[], rand: Rand = Math.random): string | null {
  if (lines.length === 0) return null;
  return lines[Math.min(lines.length - 1, Math.floor(rand() * lines.length))];
}

export function greetingForPath(pathname: string, rand: Rand = Math.random): string | null {
  return pickLine(GREETINGS[sectionForPath(pathname)], rand);
}

/**
 * Hover context for an anchor: internal links map through sectionForPath;
 * external/anchor-only links get nothing. `dataQpit`, when present on the
 * element (data-qpit="evidence"), overrides the href-derived section, the
 * scalable escape hatch for non-link hover targets.
 */
export function hoverSectionFor(href: string | null, dataQpit?: string | null): QpitSection | null {
  if (dataQpit && dataQpit in HOVER_LINES) return dataQpit as QpitSection;
  if (!href || !href.startsWith("/")) return null;
  const section = sectionForPath(href);
  return section === "unknown" ? null : section;
}

export function hoverLineFor(section: QpitSection, rand: Rand = Math.random): string | null {
  return pickLine(HOVER_LINES[section], rand);
}

// ---------------------------------------------------------------------------
// Voice commands, a deterministic intent parser (no LLM). Tested.
// ---------------------------------------------------------------------------

export type VoiceIntent =
  | { intent: "navigate"; href: string; label: string }
  | { intent: "looking" }
  | { intent: "next" }
  | { intent: "fact" }
  | { intent: "measure" }
  | { intent: "summon"; kind: "BLACKHOLE" | "WORMHOLE" | "SUPERPOSITION" }
  | { intent: "unknown" };

const NAV_TARGETS: [RegExp, string, string][] = [
  [/\b(bell|chsh)\b/, "/playground/arcade#chsh-beat-the-classical-bound", "the CHSH game"],
  [/\bgrover\b/, "/playground/arcade#grover-searchlight", "Grover"],
  [/\b(teleport)/, "/playground/arcade#teleportation-walkthrough", "teleportation"],
  [/\b(bb84|key exchange|eve)\b/, "/playground/arcade#bb84-catch-eve", "BB84"],
  [/\b(arcade|games?)\b/, "/playground/arcade", "the arcade"],
  [/\b(learn|lessons?|course|path)\b/, "/learn", "the learning path"],
  [/\b(application|good for|uses?)\b/, "/applications", "applications"],
  [/\b(research|claims|evidence|sources)\b/, "/research", "research"],
  [/\b(docs|documentation|math)\b/, "/docs", "the docs"],
  [/\b(builder|who built|author)\b/, "/builder", "the builder"],
  [/\b(vqe|molecule|hydrogen|eigensolver)\b/, "/playground/vqe-suite", "the VQE suite"],
  [/\b(transpiler|qasm|braket|compile)\b/, "/playground/qp-core", "the transpiler"],
  [/\b(home|start|front)\b/, "/", "home"],
];

export function parseVoiceCommand(raw: string): VoiceIntent {
  const text = raw.toLowerCase().trim();
  if (!text) return { intent: "unknown" };
  if (/black\s?hole|singularity/.test(text)) return { intent: "summon", kind: "BLACKHOLE" };
  if (/wormhole|portal/.test(text)) return { intent: "summon", kind: "WORMHOLE" };
  if (/superposition/.test(text)) return { intent: "summon", kind: "SUPERPOSITION" };
  if (/measure|collapse/.test(text)) return { intent: "measure" };
  if (/looking at|what is this|where am i|what am i/.test(text)) return { intent: "looking" };
  if (/what next|what should|recommend|next step/.test(text)) return { intent: "next" };
  if (/\bfact\b|tell me something|teach me/.test(text)) return { intent: "fact" };
  for (const [re, href, label] of NAV_TARGETS) {
    if (re.test(text)) return { intent: "navigate", href, label };
  }
  return { intent: "unknown" };
}

/** Spam pokes or hard flings and QPIT snaps, cutely. Decays on its own. */
export const ANGRY_LINES: string[] = [
  "Hey. Stop that.",
  "Every poke decoheres me a little.",
  "One more and I phase flip.",
  "I bite. In a unitary way.",
  "Grr. I am a superposition of mad and madder.",
];
export const CALMED_LINE = "Fine. We are good again.";
