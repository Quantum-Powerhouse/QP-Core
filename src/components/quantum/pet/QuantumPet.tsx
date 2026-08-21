"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { useAnyQuantumEvent } from "@/components/quantum/QuantumEventProvider";
import { createPetVisualState, QpForm, type PetVisualState } from "@/components/quantum/pet/QpForm";
import { petLineFor } from "@/components/quantum/pet/petLines";
import { QpitPhysics, type QpitMode } from "@/components/quantum/pet/QpitPhysics";
import {
  greetingForPath,
  hoverLineFor,
  hoverSectionFor,
  momentLine,
  pickLine,
  POKE_LINES,
  sectionForPath,
} from "@/lib/quantum/qpitContext";
import { chattiness, QPIT_PARAMS, type QpitEmotion, type QpitSpecial } from "@/lib/quantum/qpitState";
import { audioEnabled, playHum, playPop, playShimmer, playWarp, setAudioEnabled } from "@/lib/quantum/qpitAudio";
import type { QuantumEvent } from "@/lib/quantum/events";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

const SPEECH_COOLDOWN_MS = 2600;
const SPEECH_VISIBLE_MS = 2600;
const HOVER_COOLDOWN_MS = 6500;
const ENTRANCE_GREETING_DELAY_MS = 1400;
const OBSERVED_HOVER_MS = 4000;

function applyEvent(state: PetVisualState, event: QuantumEvent): void {
  switch (event.type) {
    case "STATE_CHANGED": {
      const hue = 190 + ((event.detail.phi % 360) / 360) * 90;
      state.color.setHSL(hue / 360, 0.7, 0.55);
      state.intensity = Math.max(state.intensity, 0.3);
      break;
    }
    case "TRANSPILATION_STARTED":
      state.color.set("#06b6d4");
      state.intensity = 1;
      state.spin = 0.6;
      break;
    case "TRANSPILATION_FINISHED":
      state.color.set(event.detail.mock ? "#f59e0b" : "#06b6d4");
      state.intensity = 1;
      break;
    case "VQE_STARTED":
      state.color.set("#7c3aed");
      state.intensity = 0.8;
      state.spin = 0.8;
      break;
    case "VQE_ITERATION":
      state.intensity = Math.max(state.intensity, 0.4);
      state.spin = Math.max(state.spin, 0.5);
      break;
    case "VQE_CONVERGED":
      state.color.set("#2dd4bf");
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
      state.color.set("#e6ecff");
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
  }
}

/** True once we know the device has a fine pointer (mouse/trackpad). */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(pointer: fine)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false, // server: assume no fine pointer until hydrated
  );
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
    /* private mode — session memory is optional */
  }
}

export function QuantumPet() {
  const stateRef = useRef<PetVisualState>(createPetVisualState());
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
  const [speech, setSpeech] = useState<string | null>(null);
  const [mode, setMode] = useState<QpitMode>("docked");
  const [pokeSignal, setPokeSignal] = useState(0);
  const [celebrateSignal, setCelebrateSignal] = useState(0);
  const [burst, setBurst] = useState(0);
  const soundOn = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("qpit-audio-change", onChange);
      return () => window.removeEventListener("qpit-audio-change", onChange);
    },
    () => audioEnabled(),
    () => false,
  );
  const reduceMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const pathname = usePathname();

  useEffect(() => {
    pokesRef.current = readSessionInt("qpit.pokes");
  }, []);

  const toggleSound = useCallback(() => {
    const next = !audioEnabled();
    setAudioEnabled(next);
    if (next) playPop(); // audible confirmation on enable
    window.dispatchEvent(new Event("qpit-audio-change"));
  }, []);

  const speak = useCallback((line: string | null, { force = false }: { force?: boolean } = {}) => {
    if (!line) return false;
    const now = performance.now();
    if (!force && now - lastSpokenAtRef.current < SPEECH_COOLDOWN_MS) return false;
    lastSpokenAtRef.current = now;
    setSpeech(line);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => setSpeech(null), SPEECH_VISIBLE_MS);
    return true;
  }, []);

  /** The governor: QPIT knows when not to talk. */
  const chatOk = useCallback(() => {
    const factor = chattiness({
      msSinceScroll: performance.now() - lastScrollAtRef.current,
      sessionPokes: pokesRef.current,
      ignoredHovers: hoverShownCountRef.current,
    });
    return Math.random() < factor;
  }, []);

  // --- Real quantum events (behavior preserved from the original pet) ----
  useAnyQuantumEvent((event) => {
    applyEvent(stateRef.current, event);
    if (event.type === "VQE_CONVERGED") setCelebrateSignal((n) => n + 1);
    speak(petLineFor(event), { force: event.type === "ERROR" });
  });

  // --- Emotional state → mood glow + transition lines --------------------
  const onEmotionChange = useCallback(
    (next: QpitEmotion, prev: QpitEmotion) => {
      stateRef.current.mood = QPIT_PARAMS[next].glow;
      if (prev === "SLEEPING" && next === "SURPRISED") {
        speak(momentLine("WAKE_SURPRISED"), { force: true });
      } else if (next === "BORED" && chatOk()) {
        speak(momentLine("BORED_ENTER"));
      } else if (next === "ORBITING") {
        speak(momentLine("ORBITING_ENTER"));
      } else if (next === "EXCITED" && Math.random() < 0.35 && chatOk()) {
        speak(momentLine("EXCITED_ENTER"));
      }
    },
    [speak, chatOk],
  );

  // --- Special moments (rare, already cooldown-gated by the physics) -----
  const onSpecialStart = useCallback(
    (kind: QpitSpecial) => {
      if (kind === "BLACKHOLE") {
        speak(momentLine("BLACKHOLE_NOTICED"), { force: true });
        playHum();
      }
    },
    [speak],
  );
  const onAnomalyHover = useCallback(() => {
    speak(momentLine("BLACKHOLE_HOVER"), { force: true });
  }, [speak]);

  const onSpecial = useCallback(
    (kind: QpitSpecial) => {
      if (kind === "SUPERPOSITION") {
        speak(momentLine("SUPERPOSITION_COLLAPSE"), { force: true });
        playShimmer();
      } else if (kind === "TUNNEL") {
        speak(momentLine("TUNNEL_HOME"), { force: true });
        playWarp();
      } else if (kind === "BLACKHOLE") {
        speak(momentLine("BLACKHOLE_ESCAPED"), { force: true });
      } else if (kind === "ENTANGLE") {
        speak(momentLine("ENTANGLED"), { force: true });
        playShimmer();
      } else if (kind === "WORMHOLE") {
        speak(momentLine("WORMHOLE"), { force: true });
        playWarp();
      }
    },
    [speak],
  );

  // --- Route awareness: greet each section once on arrival ---------------
  useEffect(() => {
    const section = sectionForPath(pathname);
    if (lastGreetedSectionRef.current === section) return;
    const firstArrival = lastGreetedSectionRef.current === null;
    lastGreetedSectionRef.current = section;
    const delay = firstArrival ? ENTRANCE_GREETING_DELAY_MS : 600;
    const timer = setTimeout(() => {
      if (speak(greetingForPath(pathname))) {
        stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.35);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [pathname, speak]);

  // --- Hover context: delegated, scalable, mouse-only --------------------
  useEffect(() => {
    if (!finePointer) return;
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Element | null;
      // Scripted beats: any element can request a specific moment line.
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
      const anchor = target?.closest?.("a[href], [data-qpit]");
      if (!anchor) return;
      const section = hoverSectionFor(anchor.getAttribute("href"), anchor.getAttribute("data-qpit"));
      if (!section || section === sectionForPath(pathname)) return;
      const now = performance.now();
      if (now - lastHoverAtRef.current < HOVER_COOLDOWN_MS) return;
      if (lastHoverSectionRef.current === section) return;
      // After the first few hover lines, QPIT gets progressively quieter.
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

  // --- Roaming chatter: occasional travel commentary, governor-gated ------
  useEffect(() => {
    if (mode !== "roaming") return;
    const timer = setInterval(() => {
      if (Math.random() < 0.35 && chatOk()) speak(momentLine("ROAMING_CHATTER"));
    }, 9000);
    return () => clearInterval(timer);
  }, [mode, chatOk, speak]);

  // --- Reading detection (scroll): visual pulse, and silences dialogue ---
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

  // --- Observation moment: hovering the docked orb for a while -----------
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

  // --- Poke: click/tap/keyboard on QPIT itself ---------------------------
  const onPoke = useCallback(() => {
    stateRef.current.intensity = 1;
    stateRef.current.spin = Math.max(stateRef.current.spin, 0.7);
    pokesRef.current += 1;
    writeSessionInt("qpit.pokes", pokesRef.current);
    setPokeSignal((n) => n + 1);
    setBurst((n) => n + 1);
    playPop();
    speak(pickLine(POKE_LINES), { force: true });
  }, [speak]);

  // While roaming QPIT's body has pointer-events: none (so it never blocks
  // the page) — but a click that lands on its body and NOT on an interactive
  // element beneath should still count as a poke. Manual hit-test.
  useEffect(() => {
    if (mode !== "roaming") return;
    const onClick = (event: MouseEvent) => {
      const dx = event.clientX - stateRef.current.petX;
      const dy = event.clientY - stateRef.current.petY;
      if (Math.hypot(dx, dy) > 66) return;
      const target = event.target as Element | null;
      if (target?.closest?.("a, button, input, textarea, select, [role='button']")) return;
      onPoke();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [mode, onPoke]);

  const interactive = finePointer && !reduceMotion;

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
    >
      <div className="relative flex flex-col items-center gap-2">
        <AnimatePresence>
          {speech && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap rounded-lg border border-border bg-background/90 px-3 py-1.5 font-mono text-xs text-foreground shadow-xl backdrop-blur"
              role="status"
              aria-live="polite"
            >
              {speech}
            </motion.div>
          )}
        </AnimatePresence>

        {/* poke particle burst — 8 sparks, pure CSS, remounts per poke */}
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

        {mode === "docked" && (
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Mute QPIT sounds" : "Enable QPIT sounds (off by default)"}
            aria-pressed={soundOn}
            className="absolute -left-1 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface/80 font-mono text-[10px] text-muted backdrop-blur transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {soundOn ? "♪" : "∅"}
          </button>
        )}
        {/* orbital particles: constant slow motion so QPIT reads alive at rest */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[128px] w-[128px] -translate-x-1/2 sm:h-[148px] sm:w-[148px]" style={{ animation: "qpit-spin 9s linear infinite" }}>
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent opacity-70" />
          <span className="absolute bottom-[12%] right-0 h-1 w-1 rounded-full opacity-60" style={{ background: "var(--accent-2)" }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-[10px] left-1/2 z-0 h-[108px] w-[108px] -translate-x-1/2" style={{ animation: "qpit-spin 5.5s linear infinite reverse" }}>
          <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent opacity-50" />
        </div>
        <button
          type="button"
          onClick={onPoke}
          onPointerEnter={onOrbEnter}
          onPointerLeave={onOrbLeave}
          aria-label="Poke QPIT, the site's quantum companion"
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
