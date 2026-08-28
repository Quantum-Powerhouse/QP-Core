"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useAnyQuantumEvent } from "@/components/quantum/QuantumEventProvider";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

function randomInSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/**
 * Decays the shared excitation value each frame. Owned by a single component
 * so two WavefunctionCloud instances don't double-decay the same ref.
 */
function FieldExcitationDecay({ excitationRef }: { excitationRef: MutableRefObject<number> }) {
  useFrame((_, delta) => {
    excitationRef.current = Math.max(0, excitationRef.current - delta / 1.5);
  });
  return null;
}

function WavefunctionCloud({
  count,
  radius,
  color,
  size,
  speed,
  excitationRef,
}: {
  count: number;
  radius: number;
  color: string;
  size: number;
  speed: number;
  excitationRef: MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const positions = useMemo(() => randomInSphere(count, radius), [count, radius]);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!ref.current) return;
    const excitement = excitationRef.current;

    if (!reduceMotion) {
      const speedBoost = 1 + excitement * 1.8;
      ref.current.rotation.y += delta * speed * speedBoost;
      ref.current.rotation.x += delta * speed * 0.3 * speedBoost;
    }
    const { x, y } = state.pointer;
    ref.current.rotation.y += x * 0.0006;
    ref.current.rotation.x += y * 0.0006;

    if (materialRef.current) {
      materialRef.current.size = size * (1 + excitement * 0.8);
      materialRef.current.opacity = 0.7 + excitement * 0.25;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        ref={(m) => {
          materialRef.current = m;
        }}
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/**
 * Events that count as "the system just did something real" for the ambient
 * field's excitation pulse. Anything not in this set is either too frequent
 * (STATE_CHANGED, dragged continuously) or not yet meaningful visually.
 */
const EXCITING_EVENTS = new Set(["TRANSPILATION_FINISHED", "VQE_CONVERGED", "NOISE_APPLIED"]);

export function ParticleField() {
  const excitationRef = useRef(0);
  const reduceMotion = usePrefersReducedMotion();

  useAnyQuantumEvent((event) => {
    if (EXCITING_EVENTS.has(event.type)) {
      excitationRef.current = 1;
    }
  });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(160,107,31,0.07), transparent 60%), " +
            "radial-gradient(ellipse 60% 45% at 85% 20%, rgba(143,45,35,0.06), transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(160,107,31,0.04), transparent 60%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        {!reduceMotion && <FieldExcitationDecay excitationRef={excitationRef} />}
        <WavefunctionCloud
          count={1400}
          radius={6}
          color="#a06b1f"
          size={0.028}
          speed={0.03}
          excitationRef={excitationRef}
        />
        <WavefunctionCloud
          count={900}
          radius={4.5}
          color="#8f2d23"
          size={0.024}
          speed={-0.045}
          excitationRef={excitationRef}
        />
      </Canvas>
    </div>
  );
}
