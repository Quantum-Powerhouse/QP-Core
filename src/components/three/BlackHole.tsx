"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/quantum/usePrefersReducedMotion";

function randomInShell(count: number, innerRadius: number, outerRadius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = innerRadius + (outerRadius - innerRadius) * Math.random();
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function DustField({ count, innerRadius, outerRadius, color, size, speed }: { count: number; innerRadius: number; outerRadius: number; color: string; size: number; speed: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => randomInShell(count, innerRadius, outerRadius), [count, innerRadius, outerRadius]);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!ref.current) return;
    if (!reduceMotion) {
      ref.current.rotation.y += delta * speed;
    }
    const { x, y } = state.pointer;
    ref.current.rotation.y += x * 0.0004;
    ref.current.rotation.x += y * 0.0003;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color={color} size={size} sizeAttenuation depthWrite={false} opacity={0.65} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

/** Flattened, glowing ring standing in for an accretion disk, additive-blended, not lit. */
function AccretionDisk() {
  const ref = useRef<THREE.Group>(null);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!ref.current) return;
    if (!reduceMotion) ref.current.rotation.z += delta * 0.06;
    const { x } = state.pointer;
    ref.current.rotation.y = 1.15 + x * 0.08;
  });

  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(1.15, 2.9, 128, 24);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const inner = new THREE.Color("#e6ecff");
    const mid = new THREE.Color("#06b6d4");
    const outer = new THREE.Color("#7c3aed");
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const r = Math.sqrt(vx * vx + vy * vy);
      const t = (r - 1.15) / (2.9 - 1.15);
      const c = t < 0.5 ? inner.clone().lerp(mid, t / 0.5) : mid.clone().lerp(outer, (t - 0.5) / 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <group ref={ref} rotation={[1.15, 0, 0.15]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors transparent opacity={0.85} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Unlit dark core plus an additive fresnel-style rim glow, the "event horizon." */
function EventHorizon(props: ThreeElements["group"]) {
  const rimMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          color: { value: new THREE.Color("#06b6d4") },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          uniform vec3 color;
          void main() {
            float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
            float glow = pow(rim, 2.6);
            gl_FragColor = vec4(color, glow * 0.9);
          }
        `,
      }),
    [],
  );

  return (
    <group {...props}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 48, 48]} />
        <primitive object={rimMaterial} attach="material" />
      </mesh>
    </group>
  );
}

function Scene({ particleScale }: { particleScale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (!groupRef.current || reduceMotion) return;
    groupRef.current.rotation.y += delta * 0.015;
  });

  return (
    <group ref={groupRef}>
      <EventHorizon />
      <AccretionDisk />
      <DustField count={Math.round(900 * particleScale)} innerRadius={3.2} outerRadius={7.5} color="#7c3aed" size={0.03} speed={0.02} />
      <DustField count={Math.round(600 * particleScale)} innerRadius={5} outerRadius={9} color="#06b6d4" size={0.024} speed={-0.014} />
    </group>
  );
}

export function BlackHole() {
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 768;
  const lowPower =
    typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const particleScale = isNarrow || lowPower ? 0.45 : 1;

  return (
    <Canvas
      camera={{ position: [0, 1.4, 8], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, isNarrow ? 1.25 : 1.5]}
    >
      <Scene particleScale={particleScale} />
    </Canvas>
  );
}
