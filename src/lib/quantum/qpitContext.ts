/**
 * QPIT's contextual personality — pure logic, no DOM, no React.
 *
 * Everything here maps *real UI facts* (the current route, the destination of
 * a link the user is hovering) to short personality lines. QPIT never claims
 * knowledge it doesn't have: lines are flavor about real sections of this
 * site, not invented facts — same honesty boundary as src/lib/quantum/events.ts.
 *
 * Tested by tests/qpit-context.test.mjs (node --test, native type stripping).
 */

export type QpitSection =
  | "home"
  | "research"
  | "claims"
  | "evidence"
  | "sources"
  | "gap-analysis"
  | "prior-art"
  | "methodology"
  | "timeline"
  | "docs"
  | "playground"
  | "unknown";

/** Longest-prefix-wins route → section mapping. Order matters only for readability. */
const SECTION_PREFIXES: [string, QpitSection][] = [
  ["/research/claims", "claims"],
  ["/research/evidence", "evidence"],
  ["/research/sources", "sources"],
  ["/research/gap-analysis", "gap-analysis"],
  ["/research/prior-art", "prior-art"],
  ["/research/methodology", "methodology"],
  ["/research/timeline", "timeline"],
  ["/research", "research"],
  ["/docs", "docs"],
  ["/playground", "playground"],
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
  "prior-art": ["Know what came before.", "Twenty-plus systems, all inspected."],
  methodology: ["How the checking got done.", "Rules first, conclusions second."],
  timeline: ["The whole story, in order."],
  docs: ["Real math ahead.", "The equations match the source code."],
  playground: ["Careful. Things get weird around here.", "Go on, run something.", "You clicked that like you knew what it would do."],
  unknown: ["Hm. New territory."],
};

/** Spoken when the user hovers a link *pointing at* that section. Cheekier, shorter. */
const HOVER_LINES: Record<QpitSection, string[]> = {
  home: ["Home again?"],
  research: ["Ah. Serious stuff.", "The rigorous bit."],
  claims: ["Verdicts in there.", "Every claim wears its status."],
  evidence: ["Receipts. I like receipts."],
  sources: ["A very honest reading list."],
  "gap-analysis": ["The humbling. Worth a look."],
  "prior-art": ["Now we're getting interesting."],
  methodology: ["Rules of the game."],
  timeline: ["A short saga."],
  docs: ["Okay, this one gets weird. In a good way."],
  playground: ["I think you should explore that.", "Real simulation in there. Not slides."],
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
 * moments, not raw states — SLEEPING entry is deliberately silent (absence
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
    "A black hole — well, a visual metaphor of one.",
  ],
  ROAMING_CHATTER: [
    "Wheee.",
    "Where are we going?",
    "You're fast today.",
    "I like this direction.",
    "Left! No — right!",
    "Try shaking me. Actually, don't.",
    "Still attached. Somehow.",
  ],
};

export function momentLine(moment: keyof typeof MOMENT_LINES | string, rand: Rand = Math.random): string | null {
  const lines = MOMENT_LINES[moment];
  return lines ? pickLine(lines, rand) : null;
}

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
 * element (data-qpit="evidence"), overrides the href-derived section — the
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
