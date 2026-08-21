"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 24, stiffness: 90 });
  // Only the count-up animation may write to the DOM node. Without this the
  // spring's initial 0 would overwrite the real server-rendered figure.
  const counting = useRef(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    counting.current = true;
    if (ref.current) ref.current.textContent = "0";
    motionValue.set(value);
  }, [inView, value, reduceMotion, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (counting.current && ref.current) ref.current.textContent = String(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  // Render the true value, so crawlers, no-JS visitors, and reduced-motion
  // users all get the real figure rather than a placeholder zero.
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
