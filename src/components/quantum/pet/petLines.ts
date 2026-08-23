import type { QuantumEvent } from "@/lib/quantum/events";

/**
 * Short reaction lines, keyed by real event type. Every line here describes
 * something the event payload actually reports, no invented state, no
 * claims about hardware or physical measurement. A few variants per type so
 * the Pet doesn't repeat itself; petLineFor() picks one at random.
 */
const LINES: Record<string, string[]> = {
  STATE_CHANGED: ["New state, noted.", "I like this phase.", "Nice angle."],
  TRANSPILATION_STARTED: ["Parsing your QASM.", "Let's see this circuit.", "Compiling…"],
  TRANSPILATION_FINISHED_MOCK: ["Demo mode, no backend configured.", "That's the mock endpoint talking."],
  TRANSPILATION_FINISHED_LIVE: ["Braket IR, done.", "Compiled clean."],
  VQE_STARTED: ["Optimizing…", "Let's find that ground state.", "Here we go."],
  VQE_ITERATION: ["Energy's dropping.", "Getting closer."],
  VQE_CONVERGED: ["Converged.", "Ground state, found.", "That's about as low as it goes."],
  NOISE_APPLIED: ["I don't like this noise.", "Feeling the depolarizing channel.", "That's noisier than I'd like."],
  MEASUREMENT: ["Measured.", "Collapsed.", "That's the one we got."],
  ERROR: ["That didn't work.", "Something broke.", "Circuit's unhappy."],
  USER_INTERACTION: ["Hm?"],
};

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function petLineFor(event: QuantumEvent): string | null {
  switch (event.type) {
    case "STATE_CHANGED":
      return pick(LINES.STATE_CHANGED);
    case "TRANSPILATION_STARTED":
      return pick(LINES.TRANSPILATION_STARTED);
    case "TRANSPILATION_FINISHED":
      return pick(event.detail.mock ? LINES.TRANSPILATION_FINISHED_MOCK : LINES.TRANSPILATION_FINISHED_LIVE);
    case "VQE_STARTED":
      return pick(LINES.VQE_STARTED);
    case "VQE_ITERATION":
      return pick(LINES.VQE_ITERATION);
    case "VQE_CONVERGED":
      return pick(LINES.VQE_CONVERGED);
    case "NOISE_APPLIED":
      return pick(LINES.NOISE_APPLIED);
    case "MEASUREMENT":
      return pick(LINES.MEASUREMENT);
    case "ERROR":
      return pick(LINES.ERROR);
    case "USER_INTERACTION":
      return pick(LINES.USER_INTERACTION);
    default:
      return null;
  }
}
