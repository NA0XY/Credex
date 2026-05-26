"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/motion-preferences";

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0, scale: 1, cta: false });
  const currentRef = useRef({ x: 0, y: 0, scale: 1 });
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) {
      return undefined;
    }

    const onMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;

      const el = event.target as HTMLElement | null;
      if (!el) {
        targetRef.current.scale = 1;
        targetRef.current.cta = false;
        return;
      }

      const interactive = el.closest("a,button,[role='button'],input,select,textarea");
      if (!interactive) {
        targetRef.current.scale = 1;
        targetRef.current.cta = false;
        return;
      }

      const isCta = interactive.classList.contains("hero-ghost-cta") || interactive.classList.contains("pill-action-primary");
      targetRef.current.cta = isCta;
      targetRef.current.scale = isCta ? 1.9 : 1.42;
    };

    const loop = () => {
      const nextX = currentRef.current.x + (targetRef.current.x - currentRef.current.x) * 0.16;
      const nextY = currentRef.current.y + (targetRef.current.y - currentRef.current.y) * 0.16;
      const nextScale = currentRef.current.scale + (targetRef.current.scale - currentRef.current.scale) * 0.1;
      currentRef.current = { x: nextX, y: nextY, scale: nextScale };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${nextX - 6}px, ${nextY - 6}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${nextX - 19}px, ${nextY - 19}px, 0) scale(${nextScale})`;
        ringRef.current.style.background = targetRef.current.cta ? "rgba(95,122,97,0.15)" : "transparent";
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-3 w-3 rounded-full bg-brand-surface mix-blend-difference [@media(pointer:fine)]:block"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-[38px] w-[38px] rounded-full border border-brand-surface/85 mix-blend-difference transition-colors duration-[160ms] [transition-timing-function:var(--ease-enter)] [@media(pointer:fine)]:block"
      />
    </>
  );
}
