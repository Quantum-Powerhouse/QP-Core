"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 24, stiffness: 90 });

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = String(value);
      return;
    }
    motionValue.set(value);
  }, [inView, value, reduceMotion, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = String(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
