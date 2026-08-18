"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useQuantumEventBus } from "@/components/quantum/QuantumEventProvider";

const RADIUS = 2;

function latitudeRing(thetaDeg: number, segments = 64) {
  const theta = (thetaDeg * Math.PI) / 180;
  const r = Math.sin(theta) * RADIUS;
  const y = Math.cos(theta) * RADIUS;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(r * Math.cos(phi), y, r * Math.sin(phi)));
  }
  return points;
}

function longitudeRing(phiDeg: number, segments = 64) {
  const phi = (phiDeg * Math.PI) / 180;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.sin(t) * Math.cos(phi) * RADIUS,
        Math.cos(t) * RADIUS,
        Math.sin(t) * Math.sin(phi) * RADIUS,
      ),
    );
  }
  return points;
}

function GridRings() {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.LineBasicMaterial[]>([]);

  const latitudes = useMemo(() => [30, 60, 90, 120, 150], []);
  const longitudes = useMemo(() => [0, 45, 90, 135], []);

  useFrame(({ clock }) => {
    const pulse = 0.45 + Math.sin(clock.elapsedTime * 0.9) * 0.15;
    materialsRef.current.forEach((mat) => {
      if (mat) mat.opacity = pulse;
    });
  });

  return (
    <group ref={groupRef}>
      {latitudes.map((deg) => {
        const points = latitudeRing(deg);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`lat-${deg}`}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial
              ref={(m) => {
                if (m) materialsRef.current.push(m);
              }}
              attach="material"
              color="#06b6d4"
              transparent
              opacity={0.25}
            />
          </line>
        );
      })}
      {longitudes.map((deg) => {
        const points = longitudeRing(deg);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`lon-${deg}`}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial
              ref={(m) => {
                if (m) materialsRef.current.push(m);
              }}
              attach="material"
              color="#7c3aed"
              transparent
              opacity={0.25}
            />
          </line>
        );
      })}
    </group>
  );
}

function StateVector({ theta, phi }: { theta: number; phi: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const current = useRef(new THREE.Vector3(0, 1, 0));

  useFrame(() => {
    const t = (theta * Math.PI) / 180;
    const p = (phi * Math.PI) / 180;
    const target = new THREE.Vector3(
      Math.sin(t) * Math.cos(p),
      Math.cos(t),
      Math.sin(t) * Math.sin(p),
    );

    current.current.lerp(target, 0.12).normalize();

    if (groupRef.current) {
      groupRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        current.current,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, RADIUS * 0.42, 0]}>
        <cylinderGeometry args={[0.018, 0.018, RADIUS * 0.84, 12]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#06b6d4"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={coneRef} position={[0, RADIUS * 0.86, 0]}>
        <coneGeometry args={[0.09, 0.22, 16]} />
        <meshStandardMaterial
          color="#a5f3fc"
          emissive="#06b6d4"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, RADIUS * 0.86, 0]} color="#06b6d4" intensity={4} distance={2.5} />
    </group>
  );
}

function Scene({
  theta,
  phi,
  autoRotate,
}: {
  theta: number;
  phi: number;
  autoRotate: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={0.6} />

      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      <GridRings />
      <StateVector theta={theta} phi={phi} />

      <Text position={[0, RADIUS + 0.32, 0]} fontSize={0.22} color="#e6ecff">
        |0⟩
      </Text>
      <Text position={[0, -RADIUS - 0.32, 0]} fontSize={0.22} color="#e6ecff">
        |1⟩
      </Text>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

export function BlochSphere() {
  const [theta, setTheta] = useState(60);
  const [phi, setPhi] = useState(45);
  const [autoRotate, setAutoRotate] = useState(true);
  const eventBus = useQuantumEventBus();

  useEffect(() => {
    const id = setTimeout(() => {
      eventBus.emit("STATE_CHANGED", { theta, phi, source: "bloch-demo" });
    }, 120);
    return () => clearTimeout(id);
  }, [theta, phi, eventBus]);

  const thetaRad = (theta * Math.PI) / 180;
  const alpha = Math.cos(thetaRad / 2);
  const betaMag = Math.sin(thetaRad / 2);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      <div className="relative h-[420px] overflow-hidden rounded-xl border border-border bg-surface/60 backdrop-blur-xl sm:h-[480px]">
        <Canvas camera={{ position: [3.2, 2, 3.2], fov: 45 }} dpr={[1, 1.5]}>
          <Scene theta={theta} phi={phi} autoRotate={autoRotate} />
        </Canvas>
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-border bg-background/70 px-3 py-2 font-mono text-xs text-muted backdrop-blur">
          |Ψ⟩ = {alpha.toFixed(2)}|0⟩ + e<sup>iφ</sup>·{betaMag.toFixed(2)}|1⟩
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface/60 p-5 backdrop-blur-xl">
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-muted">
            <span>θ (theta)</span>
            <span className="text-accent">{theta.toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={180}
            value={theta}
            onChange={(e) => setTheta(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-muted">
            <span>φ (phi)</span>
            <span className="text-accent-2">{phi.toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={phi}
            onChange={(e) => setPhi(Number(e.target.value))}
            className="w-full accent-violet-400"
          />
        </div>

        <button
          onClick={() => setAutoRotate((v) => !v)}
          className={`rounded-lg border px-3 py-2 font-mono text-xs transition-colors ${
            autoRotate
              ? "border-accent/50 bg-accent/10 text-accent"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          {autoRotate ? "⏸ Pause orbit" : "▶ Auto-rotate"}
        </button>

        <div className="mt-auto space-y-1 border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-muted">
          <p>α = cos(θ/2) = {alpha.toFixed(3)}</p>
          <p>|β| = sin(θ/2) = {betaMag.toFixed(3)}</p>
          <p>arg(β) = φ = {phi.toFixed(0)}°</p>
        </div>
      </div>
    </div>
  );
}
