"use client";

import { useReducedMotion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/**
 * Returns animation props that respect prefers-reduced-motion.
 * Use: <motion.div {...useAnimatedProps(0.1)} />
 */
export function useAnimatedProps(delay = 0) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {};
  }

  return {
    initial: fadeInUp.initial,
    animate: fadeInUp.animate,
    transition: { ...fadeInUp.transition, delay },
  };
}
