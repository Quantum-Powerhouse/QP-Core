"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AnimatedCounter } from "@/components/research/AnimatedCounter";
import { ResearchHeroFallback } from "@/components/research/ResearchHeroFallback";
import { useWebglSupported } from "@/lib/quantum/useWebglSupported";
import type { ResearchStats } from "@/lib/research/stats";

const BlackHole = dynamic(() => import("@/components/three/BlackHole").then((m) => m.BlackHole), {
  ssr: false,
  loading: () => <ResearchHeroFallback />,
});

export function ResearchHero({ stats }: { stats: ResearchStats }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const webglSupported = useWebglSupported();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const sceneOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const showScene = !reduceMotion && webglSupported !== false;

  return (
    <div
      ref={containerRef}
      className="relative mb-16 h-[70vh] min-h-[460px] overflow-hidden rounded-2xl border border-border/60"
    >
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { opacity: sceneOpacity, scale: sceneScale }}
      >
        {showScene ? <BlackHole /> : <ResearchHeroFallback />}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={reduceMotion ? undefined : { y: contentY }}
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">Quantum Powerhouse Research</p>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Is there a real gap in quantum CI/CD regression testing?
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          A primary-source-verified investigation, every finding traced back to an official repository, an
          arXiv paper, or an independently-resolved citation.
        </p>

        <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Claims verified" value={stats.totalClaims} />
          <Stat label="Confirmed / partial" value={stats.confirmedOrPartial} />
          <Stat label="Prior-art systems" value={stats.priorArtSystems} />
          <Stat label="Sources linked" value={stats.uniqueSourcesLinked} />
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-4 backdrop-blur-sm">
      <AnimatedCounter value={value} className="block font-mono text-2xl font-semibold text-foreground sm:text-3xl" />
      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
