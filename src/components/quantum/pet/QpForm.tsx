"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
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

export type PetVisualState = {
  color: THREE.Color;
  /** 0-1, decays toward 0 each frame — a reaction pulse, not a sustained level. */
  intensity: number;
  /** 0-1, sustained while "thinking" (e.g. a VQE run in progress). */
  spin: number;
  /** Sustained glow multiplier from QPIT's emotional state (1 = neutral). */
  mood: number;
};

export function createPetVisualState(): PetVisualState {
  return { color: new THREE.Color("#06b6d4"), intensity: 0, spin: 0, mood: 1 };
}

export function QpForm({
  stateRef,
  reduceMotion,
}: {
  stateRef: MutableRefObject<PetVisualState>;
  reduceMotion: boolean;
}) {
  const shellRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const shellMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const pointMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const positions = useMemo(() => randomInSphere(70, 0.55), []);

  useFrame((_, delta) => {
    const s = stateRef.current;
    s.intensity = Math.max(0, s.intensity - delta / 1.2);
    s.spin = Math.max(0, s.spin - delta / 1.8);

    if (!reduceMotion) {
      const speed = 0.25 + s.spin * 1.4;
      if (shellRef.current) shellRef.current.rotation.y += delta * speed;
      if (groupRef.current) groupRef.current.rotation.y -= delta * speed * 0.6;
    }

    if (coreLightRef.current) coreLightRef.current.color = s.color;
    if (coreLightRef.current) coreLightRef.current.intensity = (1.5 + s.intensity * 3) * s.mood;
    if (shellMaterialRef.current) shellMaterialRef.current.color = s.color;
    if (coreMaterialRef.current) {
      coreMaterialRef.current.color = s.color;
      coreMaterialRef.current.emissive = s.color;
      coreMaterialRef.current.emissiveIntensity = (1.4 + s.intensity * 2) * s.mood;
    }
    if (pointMaterialRef.current) {
      pointMaterialRef.current.color = s.color;
      pointMaterialRef.current.size = 0.03 + s.intensity * 0.02;
      pointMaterialRef.current.opacity = Math.min(1, (0.6 + s.intensity * 0.3) * (0.5 + 0.5 * s.mood));
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial ref={shellMaterialRef} wireframe transparent opacity={0.55} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial ref={coreMaterialRef} toneMapped={false} />
      </mesh>
      <pointLight ref={coreLightRef} distance={3} />

      <group ref={groupRef}>
        <Points positions={positions} stride={3} frustumCulled>
          <PointMaterial
            ref={(m) => {
              pointMaterialRef.current = m;
            }}
            transparent
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Points>
      </group>
    </>
  );
}
