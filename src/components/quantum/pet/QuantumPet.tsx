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
  pickLine,
  POKE_LINES,
  sectionForPath,
} from "@/lib/quantum/qpitContext";
import type { QuantumEvent } from "@/lib/quantum/events";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

const SPEECH_COOLDOWN_MS = 3500;
const SPEECH_VISIBLE_MS = 2600;
const HOVER_COOLDOWN_MS = 9000;
const ENTRANCE_GREETING_DELAY_MS = 1400;

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

export function QuantumPet() {
  const stateRef = useRef<PetVisualState>(createPetVisualState());
  const lastSpokenAtRef = useRef(0);
  const lastHoverAtRef = useRef(0);
  const lastHoverSectionRef = useRef<string | null>(null);
  const lastGreetedSectionRef = useRef<string | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [mode, setMode] = useState<QpitMode>("docked");
  const reduceMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const pathname = usePathname();

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

  // --- Real quantum events (behavior preserved from the original pet) ----
  useAnyQuantumEvent((event) => {
    applyEvent(stateRef.current, event);
    speak(petLineFor(event), { force: event.type === "ERROR" });
  });

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
      const anchor = target?.closest?.("a[href], [data-qpit]");
      if (!anchor) return;
      const section = hoverSectionFor(anchor.getAttribute("href"), anchor.getAttribute("data-qpit"));
      if (!section || section === sectionForPath(pathname)) return;
      const now = performance.now();
      if (now - lastHoverAtRef.current < HOVER_COOLDOWN_MS) return;
      if (lastHoverSectionRef.current === section) return;
      if (!speak(hoverLineFor(section))) return;
      lastHoverAtRef.current = now;
      lastHoverSectionRef.current = section;
      stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.35);
    };
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => document.removeEventListener("pointerover", onPointerOver);
  }, [finePointer, pathname, speak]);

  // --- Gentle scroll reaction (visual pulse only, never speech) ----------
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - last < 900) return;
      last = now;
      stateRef.current.intensity = Math.max(stateRef.current.intensity, 0.25);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Poke: click/tap/keyboard on QPIT itself ---------------------------
  const onPoke = useCallback(() => {
    stateRef.current.intensity = 1;
    stateRef.current.spin = Math.max(stateRef.current.spin, 0.7);
    speak(pickLine(POKE_LINES), { force: true });
  }, [speak]);

  const interactive = finePointer && !reduceMotion;

  return (
    <QpitPhysics interactive={interactive} onModeChange={setMode}>
      <div className="flex flex-col items-center gap-2">
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

        <button
          type="button"
          onClick={onPoke}
          aria-label="Poke QPIT, the site's quantum companion"
          className="h-[84px] w-[84px] cursor-pointer overflow-hidden rounded-full border border-border bg-surface/60 backdrop-blur-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-[100px] sm:w-[100px]"
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
