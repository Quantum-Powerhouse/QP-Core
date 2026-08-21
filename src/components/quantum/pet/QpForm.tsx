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
  /** Gaze direction (-1..1 each axis), written by the physics layer. */
  gazeX: number;
  gazeY: number;
  /** QPIT's current viewport position, written by the physics layer. */
  petX: number;
  petY: number;
};

export function createPetVisualState(): PetVisualState {
  return { color: new THREE.Color("#06b6d4"), intensity: 0, spin: 0, mood: 1, gazeX: 0, gazeY: 0, petX: 0, petY: 0 };
}

export function QpForm({
  stateRef,
  reduceMotion,
}: {
  stateRef: MutableRefObject<PetVisualState>;
  reduceMotion: boolean;
}) {
  const shellRef = useRef<THREE.Mesh>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Mesh>(null);
  const eyeRRef = useRef<THREE.Mesh>(null);
  const noseRef = useRef<THREE.Mesh>(null);
  const noseMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const blinkRef = useRef({ nextAt: 0, until: 0 }); // nextAt seeded on first frame
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

    // Eyes: drift toward the gaze direction; blink now and then.
    if (eyesRef.current) {
      const gx = reduceMotion ? 0 : s.gazeX;
      const gy = reduceMotion ? 0 : s.gazeY;
      eyesRef.current.position.x += (gx * 0.22 - eyesRef.current.position.x) * Math.min(1, delta * 8);
      eyesRef.current.position.y += (-gy * 0.18 - eyesRef.current.position.y) * Math.min(1, delta * 8);
    }
    const blink = blinkRef.current;
    const elapsed = performance.now() / 1000;
    if (blink.nextAt === 0) blink.nextAt = elapsed + 2 + Math.random() * 4;
    if (!reduceMotion && elapsed > blink.nextAt && blink.until === 0) {
      blink.until = elapsed + 0.12;
      blink.nextAt = elapsed + 2.5 + Math.random() * 5;
    }
    if (blink.until !== 0 && elapsed > blink.until) blink.until = 0;
    const eyeScaleY = blink.until !== 0 ? 0.12 : 1;
    for (const eye of [eyeLRef.current, eyeRRef.current]) {
      if (eye) eye.scale.y += (eyeScaleY - eye.scale.y) * Math.min(1, delta * 22);
    }

    // Direction pointer: a small cone riding the rim, aimed where QPIT is
    // headed. Grows with movement, melts away at rest.
    if (noseRef.current) {
      const gx = s.gazeX;
      const gy = s.gazeY;
      const mag = Math.min(1, Math.hypot(gx, gy));
      const ang = Math.atan2(-gy, gx); // screen-y is down; three-y is up
      const k = Math.min(1, delta * 10);
      const targetX = Math.cos(ang) * 0.95;
      const targetY = Math.sin(ang) * 0.95;
      noseRef.current.position.x += (targetX - noseRef.current.position.x) * k;
      noseRef.current.position.y += (targetY - noseRef.current.position.y) * k;
      noseRef.current.position.z = 0.35;
      noseRef.current.rotation.z = Math.atan2(noseRef.current.position.y, noseRef.current.position.x) - Math.PI / 2;
      const targetScale = reduceMotion ? 0 : 0.25 + mag * 1.05;
      const sNow = noseRef.current.scale.x;
      const sNext = sNow + (targetScale - sNow) * k;
      noseRef.current.scale.setScalar(sNext);
      if (noseMaterialRef.current) {
        noseMaterialRef.current.color = s.color;
        noseMaterialRef.current.opacity = Math.min(0.95, 0.25 + mag * 0.75);
      }
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

      {/* Eyes: two bright dots riding the front of the form, following the gaze. */}
      <group ref={eyesRef} position={[0, 0, 0.8]}>
        <mesh ref={eyeLRef} position={[-0.2, 0.08, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#e6ecff" toneMapped={false} />
        </mesh>
        <mesh ref={eyeRRef} position={[0.2, 0.08, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#e6ecff" toneMapped={false} />
        </mesh>
      </group>

      {/* Direction pointer: a glowing cone on the rim, aimed at the heading. */}
      <mesh ref={noseRef} position={[0.95, 0, 0.35]} scale={0.25}>
        <coneGeometry args={[0.14, 0.34, 10]} />
        <meshBasicMaterial ref={noseMaterialRef} transparent toneMapped={false} />
      </mesh>

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
