"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { getGsap } from "@/lib/motion/gsap-runtime";
import { usePrefersReducedMotion } from "@/lib/motion/motion-preferences";

interface UseGsapContextOptions {
  dependencies?: unknown[];
  disabled?: boolean;
  scope?: RefObject<HTMLElement | null>;
}

export function useGsapContext(
  callback: (gsap: ReturnType<typeof getGsap>) => void,
  options: UseGsapContextOptions = {}
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const gsap = getGsap();

  useGSAP(
    () => {
      if (options.disabled || prefersReducedMotion) {
        return;
      }

      callback(gsap);
    },
    {
      dependencies: options.dependencies ?? [],
      revertOnUpdate: true,
      scope: options.scope,
    }
  );

  return {
    prefersReducedMotion,
  };
}
