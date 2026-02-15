"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * High-performance cursor-following gradient glow.
 * Respects prefers-reduced-motion for accessibility.
 */
export function CursorGlow() {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!ticking) {
        const rafId = requestAnimationFrame(() => {
          setPos({ ...posRef.current });
          ticking = false;
        });
        rafRef.current = rafId;
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-0"
      aria-hidden
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
        width: "min(800px, 80vw)",
        height: "500px",
        background:
          "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0, 113, 188, 0.07), transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
