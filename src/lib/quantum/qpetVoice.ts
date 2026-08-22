/**
 * QPet's voice — Web Speech synthesis, zero dependencies, zero keys.
 *
 * Strictly opt-in (localStorage "qpet.voice"), enabled only from a user
 * gesture. The slightly synthetic timbre is on-brand: this is a qubit
 * talking, not a person. Emotion drives pitch and rate, so SLEEPING drawls
 * and SURPRISED yelps. Same honesty boundary as everything else — it only
 * ever voices lines the site already decided to say.
 */

import type { QpitEmotion } from "./qpitState";

const STORAGE_KEY = "qpet.voice";

const PROSODY: Record<QpitEmotion, { rate: number; pitch: number }> = {
  IDLE: { rate: 1.02, pitch: 1.15 },
  CURIOUS: { rate: 1.08, pitch: 1.25 },
  EXCITED: { rate: 1.28, pitch: 1.45 },
  SURPRISED: { rate: 1.35, pitch: 1.6 },
  ORBITING: { rate: 1.1, pitch: 1.3 },
  BORED: { rate: 0.88, pitch: 0.95 },
  SLEEPING: { rate: 0.72, pitch: 0.8 },
};

export function voiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function voiceEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setVoiceEnabled(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
  if (!on && voiceSupported()) window.speechSynthesis.cancel();
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

/** Prefer a compact English voice; fall back to the default. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en[-_]/i.test(v.lang) && /Google|Microsoft|Samantha|Daniel/.test(v.name)) ??
    voices.find((v) => /en[-_]/i.test(v.lang)) ??
    voices[0] ??
    null;
  cachedVoice = preferred;
  return preferred;
}

/** Voice a line. No-op unless supported and enabled. Interrupts the previous line. */
export function voiceLine(text: string, emotion: QpitEmotion = "IDLE"): void {
  if (!voiceSupported() || !voiceEnabled()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/[—…]/g, ", "));
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  const p = PROSODY[emotion];
  utter.rate = p.rate;
  utter.pitch = p.pitch;
  utter.volume = 0.85;
  synth.speak(utter);
}
