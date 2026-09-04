"use client";

import dynamic from "next/dynamic";

/** The heavy ambient layer (three.js star field, the black hole plate, the
 *  pet), loaded after the page itself so first paint never waits on it. */
const ParticleField = dynamic(() => import("@/components/three/ParticleField").then((m) => m.ParticleField), { ssr: false });
const BlackHole = dynamic(() => import("@/components/three/BlackHole").then((m) => m.BlackHole), { ssr: false });
const QuantumPet = dynamic(() => import("@/components/quantum/pet/QuantumPet").then((m) => m.QuantumPet), { ssr: false });

export function AmbientFx() {
  return (
    <>
      <ParticleField />
      {/* The resident singularity: huge, translucent, behind everything. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-75 [transform:translate(22%,-10%)_scale(1.15)] motion-reduce:opacity-50"
      >
        <BlackHole />
      </div>
      <QuantumPet />
    </>
  );
}
