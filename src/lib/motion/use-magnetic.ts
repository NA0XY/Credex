"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { getGsap } from "@/lib/motion/gsap-runtime";
import { usePrefersReducedMotion } from "@/lib/motion/motion-preferences";

interface UseMagneticOptions {
  disabled?: boolean;
  maxOffset?: number;
}

export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseMagneticOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const gsap = getGsap();
  const maxOffset = options.maxOffset ?? 8;

  useGSAP(
    () => {
      const node = ref.current;
      if (!node || options.disabled || prefersReducedMotion) {
        return;
      }

      const setX = gsap.quickTo(node, "x", {
        duration: 0.25,
        ease: "power3.out",
      });
      const setY = gsap.quickTo(node, "y", {
        duration: 0.25,
        ease: "power3.out",
      });
      const setScale = gsap.quickTo(node, "scale", {
        duration: 0.2,
        ease: "power2.out",
      });

      const onMove = (event: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setX(x * maxOffset * 2);
        setY(y * maxOffset * 2);
      };

      const onLeave = () => {
        setX(0);
        setY(0);
        setScale(1);
      };

      const onEnter = () => setScale(1.02);

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", onLeave);
      node.addEventListener("pointerenter", onEnter);

      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", onLeave);
        node.removeEventListener("pointerenter", onEnter);
        gsap.set(node, { clearProps: "transform" });
      };
    },
    {
      dependencies: [maxOffset, options.disabled, prefersReducedMotion],
      scope: ref,
      revertOnUpdate: true,
    }
  );
}
