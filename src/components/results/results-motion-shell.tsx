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
      const heroNodes = gsap.utils.toArray<HTMLElement>(
        "[data-results-stage='hero']"
      );
      const cardStageNodes = gsap.utils.toArray<HTMLElement>(
        "[data-results-stage='cards']"
      );
      const cardItems = gsap.utils.toArray<HTMLElement>("[data-results-card]");
      const secondaryNodes = gsap.utils.toArray<HTMLElement>(
        "[data-results-stage='secondary']"
      );

      const allNodes = [
        ...heroNodes,
        ...cardStageNodes,
        ...cardItems,
        ...secondaryNodes,
      ];

      if (allNodes.length === 0) {
        return;
      }

      gsap.set(allNodes, {
        autoAlpha: 0,
        y: 14,
      });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroNodes.length > 0) {
        intro.to(heroNodes, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.08,
        });
      }

      if (cardStageNodes.length > 0) {
        intro.to(
          cardStageNodes,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
          },
          "-=0.14"
        );
      }

      if (cardItems.length > 0) {
        intro.to(
          cardItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.07,
          },
          "-=0.08"
        );
      }

      if (secondaryNodes.length > 0) {
        intro.to(
          secondaryNodes,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.44,
            stagger: 0.09,
          },
          "-=0.06"
        );
      }
    },
    { scope: rootRef }
  );

  return <div ref={rootRef}>{children}</div>;
}
