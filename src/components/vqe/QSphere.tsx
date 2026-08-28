"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { RepresentsTag } from "@/components/quantum/RepresentsTag";
import { probabilitiesOf } from "@/lib/physics/measurement";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";
import { runH2AnsatzStatevector } from "@/lib/physics/vqe";

const RADIUS = 2;

/** Basis index = 2*q1 + q0. Hamming weight determines latitude (0 -> top pole, 2 -> bottom pole). */
const BASIS_STATES = [
  { index: 0, label: "|00⟩", weight: 0, longitudeDeg: 0 },
  { index: 1, label: "|01⟩", weight: 1, longitudeDeg: 0 },
  { index: 2, label: "|10⟩", weight: 1, longitudeDeg: 180 },
  { index: 3, label: "|11⟩", weight: 2, longitudeDeg: 0 },
];

function positionFor(weight: number, longitudeDeg: number): [number, number, number] {
  const latitude = (weight / 2) * Math.PI; // 0 (top) -> pi (bottom)
  const longitude = (longitudeDeg * Math.PI) / 180;
  return [
    RADIUS * Math.sin(latitude) * Math.cos(longitude),
    RADIUS * Math.cos(latitude),
    RADIUS * Math.sin(latitude) * Math.sin(longitude),
  ];
}

function Scene({ theta, autoRotate }: { theta: number; autoRotate: boolean }) {
  const state = useMemo(() => runH2AnsatzStatevector(theta), [theta]);
  const probabilities = useMemo(() => probabilitiesOf(state), [state]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={0.6} />

      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial color="#a06b1f" wireframe transparent opacity={0.14} />
      </mesh>

      {BASIS_STATES.map(({ index, label, weight, longitudeDeg }) => {
        const position = positionFor(weight, longitudeDeg);
        const probability = probabilities[index];
        const amp = state[index];
        const isNegative = amp.re < 0;
        const pointRadius = 0.06 + Math.sqrt(probability) * 0.32;
        const color = isNegative ? "#8f2d23" : "#a06b1f";

        return (
          <group key={index}>
            <mesh position={position}>
              <sphereGeometry args={[pointRadius, 20, 20]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
            <Text
              position={[position[0] * 1.28, position[1] * 1.28, position[2] * 1.28]}
              fontSize={0.16}
              color="#8a7f6a"
              anchorX="center"
              anchorY="middle"
            >
              {label}
            </Text>
          </group>
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
      />
    </>
  );
}

export function QSphere({ theta }: { theta: number }) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <RepresentsTag docsHref="/docs/vqe-suite/state-representations-and-measurement">
        how probability (point size) and phase sign (color) are distributed across the 4 computational basis
        states of the same VQE statevector, brass = positive real amplitude, crimson = negative
      </RepresentsTag>
      <div className="h-[360px] overflow-hidden rounded-xl border border-border bg-surface/60 backdrop-blur-xl sm:h-[420px]">
        <Canvas camera={{ position: [3.2, 2, 3.2], fov: 45 }} dpr={[1, 1.5]}>
          <Scene theta={theta} autoRotate={!reduceMotion} />
        </Canvas>
      </div>
      <p className="font-mono text-[11px] leading-relaxed text-muted">
        Point size ∝ √probability (so area, not radius, encodes probability). Basis states are placed by
        Hamming weight, |00⟩ at the top pole, |11⟩ at the bottom pole, |01⟩/|10⟩ on the equator, the same
        convention Qiskit&apos;s own QSphere uses.
      </p>
    </div>
  );
}
