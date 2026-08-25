"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { useAnyQuantumEvent } from "@/components/quantum/QuantumEventProvider";
import { createPetVisualState, QpForm, type PetVisualState } from "@/components/quantum/pet/QpForm";
import { petLineFor } from "@/components/quantum/pet/petLines";
import { QpitPhysics, type QpitControl, type QpitMode } from "@/components/quantum/pet/QpitPhysics";
import {
  greetingForPath,
  hoverLineFor,
  hoverSectionFor,
  LOOKING_AT,
  momentLine,
  NEXT_STEP,
  parseVoiceCommand,
  pickLine,
  POKE_LINES,
  ANGRY_LINES,
  CALMED_LINE,
  QUANTUM_FACTS,
  sectionForPath,
  SUPERPOSED_ANSWERS,
} from "@/lib/quantum/qpitContext";
import { chattiness, QPIT_PARAMS, type QpitEmotion, type QpitSpecial } from "@/lib/quantum/qpitState";
import { audioEnabled, playHum, playPop, playShimmer, playWarp, setAudioEnabled } from "@/lib/quantum/qpitAudio";
import { setVoiceEnabled, voiceEnabled, voiceLine, voiceSupported } from "@/lib/quantum/qpetVoice";
import type { QuantumEvent } from "@/lib/quantum/events";
import { sampleMeasurement } from "@/lib/physics/measurement";
import { c } from "@/lib/physics/linalg";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

const SPEECH_COOLDOWN_MS = 2000;
const SPEECH_VISIBLE_MS = 3200;
const HOVER_COOLDOWN_MS = 6500;
const ENTRANCE_GREETING_DELAY_MS = 1400;
const OBSERVED_HOVER_MS = 4000;
const TRANSCRIPT_LEN = 6;

type Basis = "playful" | "rigorous";

function applyEvent(state: PetVisualState, event: QuantumEvent): void {
  switch (event.type) {
    case "STATE_CHANGED": {
      const hue = 190 + ((event.detail.phi % 360) / 360) * 90;
      state.color.setHSL(hue / 360, 0.7, 0.55);
      state.intensity = Math.max(state.intensity, 0.3);
      break;
    }
    case "TRANSPILATION_STARTED":
      state.color.set("#d9a441");
      state.intensity = 1;
      state.spin = 0.6;
      break;
    case "TRANSPILATION_FINISHED":
      state.color.set(event.detail.mock ? "#f59e0b" : "#d9a441");
      state.intensity = 1;
      break;
    case "VQE_STARTED":
      state.color.set("#c25e4c");
      state.intensity = 0.8;
      state.spin = 0.8;
      break;
    case "VQE_ITERATION":
      state.intensity = Math.max(state.intensity, 0.4);
      state.spin = Math.max(state.spin, 0.5);
      break;
    case "VQE_CONVERGED":
      state.color.set("#e6c47a");
      state.intensity = 1;
      state.spin = 0;
      break;
    case "NOISE_APPLIED": {
      const noise = Math.min(1, event.detail.lambda / 5);
      state.color.set("#f59e0b");
      state.intensity = Math.max(state.intensity, 0.3 + noise * 0.5);
      break;
    }
    case "MEASUREMENT":
      state.color.set("#ece4d4");
      state.intensity = 1;
      state.spin = 0;
      break;
    case "ERROR":
      state.color.set("#ff6b6b");
      state.intensity = 1;
      state.spin = 0;
      break;
    case "USER_INTERACTION":
      state.intensity = Math.max(state.intensity, 0.2);
      break;
    case "ARCADE_RESULT":
      state.color.set("#d9a441");
      state.intensity = Math.max(state.intensity, 0.6);
      break;
  }
}

/**
 * The narrator: turns real engine events into one computed sentence. Every
 * number here is read from the event payload, nothing is invented.
 */
function narrate(event: QuantumEvent, basis: Basis): { line: string; force: boolean } | null {
  switch (event.type) {
    case "VQE_CONVERGED": {
      const { finalEnergyHartree: e, exactGroundEnergyHartree: exact } = event.detail;
      const errMilli = Math.abs(e - exact) * 1000;
      const line =
        basis === "rigorous"
          ? `VQE converged: ${e.toFixed(5)} Ha, ${errMilli.toFixed(2)} mHa from exact.`
          : `Ground state found: ${e.toFixed(4)} Ha. ${errMilli < 1.6 ? "Chemical accuracy. Show off." : "Close. Nudge the angle."}`;
      return { line, force: true };
    }
    case "VQE_ITERATION": {
      const { iteration, energyHartree } = event.detail;
      if (iteration % 10 !== 0) return null;
      return { line: `Iteration ${iteration}: ${energyHartree.toFixed(4)} Ha.`, force: false };
    }
    case "TRANSPILATION_FINISHED": {
      const { qubitCount, latencyMs, mock } = event.detail;
      const q = qubitCount === null ? "?" : String(qubitCount);
      return {
        line: `${q} qubits compiled in ${Math.round(latencyMs)} ms${mock ? ", demo endpoint, so the IR is a placeholder" : ""}.`,
        force: true,
      };
    }
    case "NOISE_APPLIED": {
      const { lambda, energyHartree } = event.detail;
      return { line: `Noise λ=${lambda.toFixed(1)}: energy drifted to ${energyHartree.toFixed(4)} Ha.`, force: false };
    }
    case "MEASUREMENT": {
      const { outcomeIndex, probabilities } = event.detail;
      const p = probabilities[outcomeIndex] ?? 0;
      return { line: `Collapsed to |${outcomeIndex}⟩, that branch had ${(p * 100).toFixed(0)}%.`, force: false };
    }
    case "ARCADE_RESULT":
      return { line: event.detail.summary, force: true };
    default:
      return null;
  }
}

function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(pointer: fine)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}

function useLocalFlag(event: string, read: () => boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(event, onChange);
      return () => window.removeEventListener(event, onChange);
    },
    read,
    () => false,
  );
}

const MOMENT_KINDS: QpitSpecial[] = ["BLACKHOLE", "SUPERPOSITION", "TUNNEL", "ENTANGLE", "WORMHOLE"];
const MOMENT_HINTS: Record<QpitSpecial, string> = {
  BLACKHOLE: "shake the cursor hard",
  SUPERPOSITION: "roam calmly for a while",
  TUNNEL: "fling the cursor off the page",
  ENTANGLE: "roam near links, patiently",
  WORMHOLE: "move with some speed",
};

function readMoments(): QpitSpecial[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = sessionStorage.getItem("qpet.moments");
    return raw ? (JSON.parse(raw) as QpitSpecial[]) : [];
  } catch {
    return [];
  }
}

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};
function recognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function readSessionInt(key: string): number {
  try {
    return parseInt(sessionStorage.getItem(key) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function writeSessionInt(key: string, value: number): void {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    /* private mode */
  }
}

export function QuantumPet() {
  const stateRef = useRef<PetVisualState>(createPetVisualState());
  const emotionRef = useRef<QpitEmotion>("IDLE");
  const lastSpokenAtRef = useRef(0);
  const lastHoverAtRef = useRef(0);
  const lastHoverSectionRef = useRef<string | null>(null);
  const lastGreetedSectionRef = useRef<string | null>(null);
  const lastScrollAtRef = useRef(0);
  const hoverShownCountRef = useRef(0);
  const pokesRef = useRef(0);
  const observedRef = useRef(false);
  const observeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basisRef = useRef<Basis>("playful");

  const [speech, setSpeech] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [mode, setMode] = useState<QpitMode>("docked");
  const [pokeSignal, setPokeSignal] = useState(0);
  const [celebrateSignal, setCelebrateSignal] = useState(0);
  const [burst, setBurst] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [basis, setBasis] = useState<Basis>("playful");
  const [pending, setPending] = useState<{ a: string; b: string; pA: number } | null>(null);
  const [moments, setMoments] = useState<QpitSpecial[]>(() => readMoments());
  const [listening, setListening] = useState(false);
  const controlRef = useRef<QpitControl | null>(null);
  const dragRef = useRef({ down: false, moved: false, x0: 0, y0: 0 });
  const suppressClickRef = useRef(false);

  const soundOn = useLocalFlag("qpit-audio-change", audioEnabled);
  const voiceOn = useLocalFlag("qpet-voice-change", voiceEnabled);
  const reduceMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    pokesRef.current = readSessionInt("qpit.pokes");
  }, []);
  useEffect(() => {
    basisRef.current = basis;
  }, [basis]);

  const toggleSound = useCallback(() => {
    const next = !audioEnabled();
    setAudioEnabled(next);
    if (next) playPop();
    window.dispatchEvent(new Event("qpit-audio-change"));
  }, []);
  const toggleVoice = useCallback(() => {
    const next = !voiceEnabled();
    setVoiceEnabled(next);
    window.dispatchEvent(new Event("qpet-voice-change"));
    if (next) voiceLine("Voice on. I sound like this.", emotionRef.current);
  }, []);

  /** Everything QPet says goes through here: bubble, transcript, and voice. */
  const speak = useCallback((line: string | null, { force = false }: { force?: boolean } = {}) => {
    if (!line) return false;
    const now = performance.now();
    if (!force && now - lastSpokenAtRef.current < SPEECH_COOLDOWN_MS) return false;
    lastSpokenAtRef.current = now;
    setSpeech(line);
    setTranscript((t) => [...t.slice(-(TRANSCRIPT_LEN - 1)), line]);
    voiceLine(line, emotionRef.current);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => setSpeech(null), SPEECH_VISIBLE_MS);
    return true;
  }, []);

  const chatOk = useCallback(() => {
    const factor = chattiness({
      msSinceScroll: performance.now() - lastScrollAtRef.current,
      sessionPokes: pokesRef.current,
      ignoredHovers: hoverShownCountRef.current,
    });
    return Math.random() < factor;
  }, []);

  // --- Real engine events: visual reaction + computed narration ----------
  useAnyQuantumEvent((event) => {
    applyEvent(stateRef.current, event);
    if (event.type === "VQE_CONVERGED") setCelebrateSignal((n) => n + 1);
    const narrated = narrate(event, basisRef.current);
    if (narrated) speak(narrated.line, { force: narrated.force });
    else speak(petLineFor(event), { force: event.type === "ERROR" });
  });

  // --- Emotion → glow, prosody, and transition lines ---------------------
  const onEmotionChange = useCallback(
    (next: QpitEmotion, prev: QpitEmotion) => {
      emotionRef.current = next;
      stateRef.current.mood = QPIT_PARAMS[next].glow;
      if (next === "ANGRY") {
        stateRef.current.color.set("#c25e4c");
        stateRef.current.intensity = 1;
        speak(pickLine(ANGRY_LINES), { force: true });
      } else if (prev === "ANGRY") {
        stateRef.current.color.set("#d9a441");
        if (chatOk()) speak(CALMED_LINE);
      }
      if (prev === "SLEEPING" && next === "SURPRISED") speak(momentLine("WAKE_SURPRISED"), { force: true });
      else if (next === "BORED" && chatOk()) speak(momentLine("BORED_ENTER"));
      else if (next === "ORBITING") speak(momentLine("ORBITING_ENTER"));
      else if (next === "EXCITED" && Math.random() < 0.5 && chatOk()) speak(momentLine("EXCITED_ENTER"));
    },
    [speak, chatOk],
  );

  const recordMoment = useCallback((kind: QpitSpecial) => {
    setMoments((prev) => {
      if (prev.includes(kind)) return prev;
      const next = [...prev, kind];
      try {
        sessionStorage.setItem("qpet.moments", JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);

  const onSpecialStart = useCallback(
    (kind: QpitSpecial) => {
      recordMoment(kind);
      if (kind === "BLACKHOLE") {
        speak(momentLine("BLACKHOLE_NOTICED"), { force: true });
        playHum();
      }
    },
    [speak, recordMoment],
  );
  const onAnomalyHover = useCallback(() => speak(momentLine("BLACKHOLE_HOVER"), { force: true }), [speak]);
  const onSpecial = useCallback(
    (kind: QpitSpecial) => {
      recordMoment(kind);
      if (kind === "SUPERPOSITION") {
        speak(momentLine("SUPERPOSITION_COLLAPSE"), { force: true });
        playShimmer();
      } else if (kind === "TUNNEL") {
        speak(momentLine("TUNNEL_HOME"), { force: true });
        playWarp();
      } else if (kind === "BLACKHOLE") speak(momentLine("BLACKHOLE_ESCAPED"), { force: true });
      else if (kind === "ENTANGLE") {
        speak(momentLine("ENTANGLED"), { force: true });
        playShimmer();
      } else if (kind === "WORMHOLE") {
        speak(momentLine("WORMHOLE"), { force: true });
        playWarp();
      }
    },
    [speak, recordMoment],
  );

  // --- Route awareness ---------------------------------------------------
  useEffect(() => {
    const section = sectionForPath(pathname);
    if (lastGreetedSectionRef.current === section) return;
    const firstArrival = lastGreetedSectionRef.current === null;
    lastGreetedSectionRef.current = section;
    const timer = setTimeout(
      () => {
        if (speak(greetingForPath(pathname))) stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.35);
      },
      firstArrival ? ENTRANCE_GREETING_DELAY_MS : 600,
    );
    return () => clearTimeout(timer);
  }, [pathname, speak]);

  // --- Hover context + scripted moments ---------------------------------
  useEffect(() => {
    if (!finePointer) return;
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Element | null;
      const momentEl = target?.closest?.("[data-qpit-moment]");
      if (momentEl) {
        const now2 = performance.now();
        if (now2 - lastHoverAtRef.current < HOVER_COOLDOWN_MS) return;
        const key = momentEl.getAttribute("data-qpit-moment") ?? "";
        const line = momentLine(key) ?? momentEl.getAttribute("data-qpit-line");
        if (line && speak(line)) {
          lastHoverAtRef.current = now2;
          stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.35);
        }
        return;
      }
      const anchor = target?.closest?.("a[href], [data qpit]");
      if (!anchor) return;
      const section = hoverSectionFor(anchor.getAttribute("href"), anchor.getAttribute("data-qpit"));
      if (!section || section === sectionForPath(pathname)) return;
      const now = performance.now();
      if (now - lastHoverAtRef.current < HOVER_COOLDOWN_MS) return;
      if (lastHoverSectionRef.current === section) return;
      if (hoverShownCountRef.current >= 4 && !chatOk()) return;
      if (!speak(hoverLineFor(section))) return;
      lastHoverAtRef.current = now;
      lastHoverSectionRef.current = section;
      hoverShownCountRef.current += 1;
      stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.35);
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => document.removeEventListener("pointerover", onPointerOver);
  }, [finePointer, pathname, speak, chatOk]);

  // --- Roaming chatter ---------------------------------------------------
  useEffect(() => {
    if (mode !== "roaming") return;
    const timer = setInterval(() => {
      if (Math.random() < 0.45 && chatOk()) speak(momentLine("ROAMING_CHATTER"));
    }, 7000);
    return () => clearInterval(timer);
  }, [mode, chatOk, speak]);

  // --- Reading detection -------------------------------------------------
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      lastScrollAtRef.current = now;
      if (now - last < 900) return;
      last = now;
      stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.25);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Observation moment ------------------------------------------------
  const onOrbEnter = useCallback(() => {
    if (observedRef.current || observeTimerRef.current) return;
    observeTimerRef.current = setTimeout(() => {
      observeTimerRef.current = null;
      if (!observedRef.current) {
        observedRef.current = true;
        speak(momentLine("OBSERVED"), { force: true });
      }
    }, OBSERVED_HOVER_MS);
  }, [speak]);
  const onOrbLeave = useCallback(() => {
    if (observeTimerRef.current) {
      clearTimeout(observeTimerRef.current);
      observeTimerRef.current = null;
    }
  }, []);

  // --- Poke: reaction + (when docked) the console ------------------------
  const poke = useCallback(() => {
    stateRef.current.intensity = 1;
    stateRef.current.spin = Math.max(stateRef.current.spin, 0.7);
    pokesRef.current += 1;
    writeSessionInt("qpit.pokes", pokesRef.current);
    setPokeSignal((n) => n + 1);
    setBurst((n) => n + 1);
    playPop();
    speak(pickLine(POKE_LINES), { force: true });
  }, [speak]);
  const onOrbClick = useCallback(() => {
    if (suppressClickRef.current) return; // that click was the end of a drag
    poke();
    setConsoleOpen((o) => !o);
  }, [poke]);

  // --- Grab-and-fling: hold the orb, drag it, let go with momentum -------
  const onOrbPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { down: true, moved: false, x0: e.clientX, y0: e.clientY };
    controlRef.current?.grab(e.clientX, e.clientY);
  }, []);
  const onOrbPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d.down) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 8) d.moved = true;
    if (d.moved) controlRef.current?.drag(e.clientX, e.clientY);
  }, []);
  const onOrbPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current;
      if (!d.down) return;
      d.down = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (d.moved) {
        controlRef.current?.release(NaN, NaN);
        suppressClickRef.current = true;
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 350);
        speak(pickLine(["Wheee, put me down!", "Thrown. Rude. Fun.", "Conservation of momentum, apparently."]), { force: true });
      } else {
        // a plain click: undo the grab without a fling
        controlRef.current?.release(0, 0);
      }
    },
    [speak],
  );

  // --- window.QPet: a console API for demos and the curious --------------
  useEffect(() => {
    const api = {
      trigger: (kind: QpitSpecial) => controlRef.current?.trigger(kind) ?? false,
      say: (text: string) => speak(String(text), { force: true }),
      moments: () => [...moments],
      help: () =>
        "QPet.trigger('BLACKHOLE'|'SUPERPOSITION'|'TUNNEL'|'ENTANGLE'|'WORMHOLE') · QPet.say('…') · QPet.moments()",
    };
    (window as unknown as { QPet?: typeof api }).QPet = api;
    return () => {
      delete (window as unknown as { QPet?: typeof api }).QPet;
    };
  }, [speak, moments]);


  useEffect(() => {
    if (mode !== "roaming") return;
    const onClick = (event: MouseEvent) => {
      const dx = event.clientX - stateRef.current.petX;
      const dy = event.clientY - stateRef.current.petY;
      if (Math.hypot(dx, dy) > 66) return;
      const target = event.target as Element | null;
      if (target?.closest?.("a, button, input, textarea, select, [role='button']")) return;
      poke();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [mode, poke]);

  // --- Console intents (grounded; nothing invented) ----------------------
  const askLookingAt = useCallback(() => speak(LOOKING_AT[sectionForPath(pathname)], { force: true }), [pathname, speak]);
  const askNext = useCallback(() => speak(NEXT_STEP[sectionForPath(pathname)].line, { force: true }), [pathname, speak]);
  const askFact = useCallback(() => speak(pickLine(QUANTUM_FACTS), { force: true }), [speak]);
  const askSuperposed = useCallback((key: keyof typeof SUPERPOSED_ANSWERS) => {
    setPending(SUPERPOSED_ANSWERS[key]);
    voiceLine("Mostly one thing, partly another. Measure me.", emotionRef.current);
  }, []);
  /** Collapse the pending answer with a genuine Born-rule sample over (√pA, √(1−pA)). */
  const measure = useCallback(() => {
    if (!pending) return;
    const outcome = sampleMeasurement([c(Math.sqrt(pending.pA)), c(Math.sqrt(1 - pending.pA))]).outcomeIndex;
    const chosen = outcome === 0 ? pending.a : pending.b;
    setPending(null);
    speak(chosen, { force: true });
    stateRef.current.intensity = 1;
  }, [pending, speak]);

  // --- Voice commands: opt-in, deterministic intents, no LLM -------------
  const listen = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || listening) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      const intent = parseVoiceCommand(transcript);
      if (intent.intent === "navigate") {
        speak(`Taking you to ${intent.label}.`, { force: true });
        router.push(intent.href);
      } else if (intent.intent === "looking") speak(LOOKING_AT[sectionForPath(pathname)], { force: true });
      else if (intent.intent === "next") speak(NEXT_STEP[sectionForPath(pathname)].line, { force: true });
      else if (intent.intent === "fact") speak(pickLine(QUANTUM_FACTS), { force: true });
      else if (intent.intent === "measure") {
        if (pending) measure();
        else speak("Nothing is in superposition right now. Ask me if I'm alive.", { force: true });
      } else if (intent.intent === "summon") {
        const ok = controlRef.current?.trigger(intent.kind) ?? false;
        speak(ok ? "As you wish." : "Not right now, something's already happening.", { force: true });
      } else speak(`Didn't catch that ("${transcript}"). Try: take me to the arcade.`, { force: true });
    };
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [listening, speak, router, pathname, pending, measure]);

  const interactive = finePointer && !reduceMotion;
  const nextStep = NEXT_STEP[sectionForPath(pathname)];

  return (
    <QpitPhysics
      interactive={interactive}
      reduceMotion={reduceMotion}
      pokeSignal={pokeSignal}
      celebrateSignal={celebrateSignal}
      visualRef={stateRef}
      onModeChange={setMode}
      onEmotionChange={onEmotionChange}
      onSpecialStart={onSpecialStart}
      onSpecial={onSpecial}
      onAnomalyHover={onAnomalyHover}
      controlRef={controlRef}
    >
      <div className="relative flex flex-col items-center gap-2">
        {/* ── The QPet Console: transcript, grounded questions, toggles ── */}
        <AnimatePresence>
          {consoleOpen && mode === "docked" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(6px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="glass-panel pointer-events-auto absolute bottom-full right-0 mb-3 flex w-72 flex-col gap-2 rounded-xl p-3 text-xs"
              role="dialog"
              aria-label="QPet console"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">QPet · console</span>
                <button type="button" onClick={() => setConsoleOpen(false)} className="text-muted hover:text-foreground" aria-label="Close console">
                  ✕
                </button>
              </div>

              <ul className="flex max-h-28 flex-col gap-1 overflow-y-auto font-mono text-[11px] text-muted">
                {transcript.length === 0 && <li className="italic">…nothing said yet. Ask me something.</li>}
                {transcript.map((line, i) => (
                  <li key={i} className={i === transcript.length - 1 ? "text-foreground" : ""}>
                    › {line}
                  </li>
                ))}
              </ul>

              {pending && (
                <div className="flex flex-col gap-1 rounded-lg border border-accent/40 bg-surface/60 p-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent">in superposition</p>
                  <p className="text-foreground/70">{pending.a}</p>
                  <p className="text-foreground/70">{pending.b}</p>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-surface-2">
                    <div className="h-full bg-accent" style={{ width: `${pending.pA * 100}%` }} />
                  </div>
                  <button type="button" onClick={measure} className="mt-1 self-start rounded-md bg-accent px-2 py-1 font-mono text-[11px] font-semibold text-[#211603]">
                    measure → collapse
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-surface/40 p-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  moments discovered · {moments.length}/{MOMENT_KINDS.length}
                </p>
                <ul className="flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px]">
                  {MOMENT_KINDS.map((k) => (
                    <li key={k} className={moments.includes(k) ? "text-accent" : "text-muted"}>
                      {moments.includes(k) ? "✓" : "·"} {k.toLowerCase()}
                      {!moments.includes(k) && <span className="opacity-70">, {MOMENT_HINTS[k]}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <ConsoleChip onClick={askLookingAt}>what am I looking at?</ConsoleChip>
                <ConsoleChip onClick={askNext}>what next?</ConsoleChip>
                <ConsoleChip onClick={askFact}>a quantum fact</ConsoleChip>
                <ConsoleChip onClick={() => askSuperposed("alive")}>are you alive?</ConsoleChip>
                <ConsoleChip onClick={() => askSuperposed("scared")}>what scares you?</ConsoleChip>
              </div>
              <button
                type="button"
                onClick={() => router.push(nextStep.href)}
                className="self-start font-mono text-[11px] text-accent underline-offset-2 hover:underline"
              >
                take me there → {nextStep.href}
              </button>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
                <ConsoleChip onClick={toggleVoice} active={voiceOn} disabled={!voiceSupported()}>
                  {voiceSupported() ? (voiceOn ? "voice: on" : "voice: off") : "voice: unsupported"}
                </ConsoleChip>
                <ConsoleChip onClick={toggleSound} active={soundOn}>
                  {soundOn ? "sfx: on" : "sfx: off"}
                </ConsoleChip>
                <ConsoleChip onClick={listen} active={listening} disabled={!recognitionCtor()}>
                  {recognitionCtor() ? (listening ? "listening…" : "🎤 say a command") : "mic: unsupported"}
                </ConsoleChip>
                <ConsoleChip onClick={() => setBasis((b) => (b === "playful" ? "rigorous" : "playful"))} active={basis === "rigorous"}>
                  basis: {basis}
                </ConsoleChip>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {speech && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[280px] rounded-lg border border-border bg-background/90 px-3 py-1.5 text-center font-mono text-xs text-foreground shadow-xl backdrop-blur"
              role="status"
              aria-live="polite"
            >
              {speech}
            </motion.div>
          )}
        </AnimatePresence>

        {burst > 0 && !reduceMotion && (
          <div key={burst} aria-hidden className="pointer-events-none absolute bottom-10 left-1/2 z-0">
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-accent"
                style={{ ["--a" as string]: `${i * 45}deg`, animation: "qpit-burst 0.6s ease-out forwards" }}
              />
            ))}
          </div>
        )}

        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[128px] w-[128px] -translate-x-1/2 sm:h-[148px] sm:w-[148px]" style={{ animation: "qpit spin 9s linear infinite" }}>
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent opacity-70" />
          <span className="absolute bottom-[12%] right-0 h-1 w-1 rounded-full opacity-60" style={{ background: "var(--accent-2)" }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-[10px] left-1/2 z-0 h-[108px] w-[108px] -translate-x-1/2" style={{ animation: "qpit spin 5.5s linear infinite reverse" }}>
          <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent opacity-50" />
        </div>

        <button
          type="button"
          onClick={onOrbClick}
          onPointerDown={onOrbPointerDown}
          onPointerMove={onOrbPointerMove}
          onPointerUp={onOrbPointerUp}
          onPointerCancel={onOrbPointerUp}
          onPointerEnter={onOrbEnter}
          onPointerLeave={onOrbLeave}
          aria-label="Poke QPet, the site's quantum pet, opens its console"
          aria-expanded={consoleOpen}
          className="h-[108px] w-[108px] cursor-pointer overflow-hidden rounded-full border border-border bg-surface/60 backdrop-blur-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-[128px] sm:w-[128px]"
          style={{ pointerEvents: mode === "roaming" ? "none" : undefined }}
        >
          <Canvas camera={{ position: [0, 0, 2.4], fov: 40 }} dpr={[1, 1.5]}>
            <QpForm stateRef={stateRef} reduceMotion={reduceMotion} />
          </Canvas>
        </button>
      </div>
    </QpitPhysics>
  );
}

function ConsoleChip({
  onClick,
  children,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-2 py-0.5 font-mono text-[11px] transition-colors duration-150 ease-out disabled:opacity-40 ${
        active ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:border-accent/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
