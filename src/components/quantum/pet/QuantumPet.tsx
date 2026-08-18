"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { useAnyQuantumEvent } from "@/components/quantum/QuantumEventProvider";
import { createPetVisualState, QpForm, type PetVisualState } from "@/components/quantum/pet/QpForm";
import { petLineFor } from "@/components/quantum/pet/petLines";
import type { QuantumEvent } from "@/lib/quantum/events";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

const SPEECH_COOLDOWN_MS = 3500;
const SPEECH_VISIBLE_MS = 2600;

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

export function QuantumPet() {
  const stateRef = useRef<PetVisualState>(createPetVisualState());
  const lastSpokenAtRef = useRef(0);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useAnyQuantumEvent((event) => {
    applyEvent(stateRef.current, event);

    const now = performance.now();
    const isCritical = event.type === "ERROR";
    if (!isCritical && now - lastSpokenAtRef.current < SPEECH_COOLDOWN_MS) return;

    const line = petLineFor(event);
    if (!line) return;

    lastSpokenAtRef.current = now;
    setSpeech(line);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => setSpeech(null), SPEECH_VISIBLE_MS);
  });

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-border bg-background/90 px-3 py-1.5 font-mono text-xs text-foreground shadow-xl backdrop-blur"
            role="status"
            aria-live="polite"
          >
            {speech}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto h-[84px] w-[84px] overflow-hidden rounded-full border border-border bg-surface/60 backdrop-blur-xl sm:h-[100px] sm:w-[100px]">
        <Canvas camera={{ position: [0, 0, 2.4], fov: 40 }} dpr={[1, 1.5]}>
          <QpForm stateRef={stateRef} reduceMotion={reduceMotion} />
        </Canvas>
      </div>
    </div>
  );
}
