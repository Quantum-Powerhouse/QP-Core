"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

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

function WavefunctionCloud({
  count,
  radius,
  color,
  size,
  speed,
}: {
  count: number;
  radius: number;
  color: string;
  size: number;
  speed: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => randomInSphere(count, radius), [count, radius]);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!ref.current) return;
    if (!reduceMotion) {
      ref.current.rotation.y += delta * speed;
      ref.current.rotation.x += delta * speed * 0.3;
    }
    const { x, y } = state.pointer;
    ref.current.rotation.y += x * 0.0006;
    ref.current.rotation.x += y * 0.0006;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}

export function ParticleField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(6,182,212,0.16), transparent 60%), " +
            "radial-gradient(ellipse 60% 45% at 85% 20%, rgba(124,58,237,0.18), transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(6,182,212,0.08), transparent 60%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <WavefunctionCloud count={1400} radius={6} color="#06b6d4" size={0.028} speed={0.03} />
        <WavefunctionCloud count={900} radius={4.5} color="#7c3aed" size={0.024} speed={-0.045} />
      </Canvas>
    </div>
  );
}
