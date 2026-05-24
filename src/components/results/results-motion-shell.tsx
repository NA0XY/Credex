"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

interface ResultsMotionShellProps {
  children: ReactNode;
}

export function ResultsMotionShell({ children }: ResultsMotionShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    (gsap) => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-results-reveal]");
      if (nodes.length === 0) {
        return;
      }

      gsap.set(nodes, {
        autoAlpha: 0,
        y: 18,
      });

      gsap.to(nodes, {
        autoAlpha: 1,
        duration: 0.56,
        ease: "power2.out",
        stagger: 0.08,
        y: 0,
      });
    },
    { scope: rootRef }
  );

  return <div ref={rootRef}>{children}</div>;
}
