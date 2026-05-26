"use client";

import { useMemo, useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

interface HeroGlyphDropProps {
  className?: string;
  text: string;
}

export function HeroGlyphDrop({ text, className }: HeroGlyphDropProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const glyphs = useMemo(() => text.split(""), [text]);

  useGsapContext(
    (gsap) => {
      const chars = gsap.utils.toArray<HTMLElement>(".glyph-char");
      if (chars.length === 0) {
        return;
      }

      gsap.fromTo(
        chars,
        {
          autoAlpha: 0,
          rotateX: () => gsap.utils.random(20, 58),
          rotateZ: () => gsap.utils.random(-11, 11),
          transformOrigin: "50% 100%",
          x: () => gsap.utils.random(-14, 14),
          y: () => gsap.utils.random(-82, -42),
        },
        {
          autoAlpha: 1,
          duration: 0.72,
          ease: "power3.out",
          rotateX: 0,
          rotateZ: 0,
          stagger: 0.025,
          x: 0,
          y: 0,
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <span
      ref={rootRef}
      className={className}
      style={{ display: "inline-block", perspective: "700px", transformStyle: "preserve-3d" }}
    >
      {glyphs.map((glyph, index) => (
        <span key={`${glyph}-${index}`} className="glyph-char inline-block will-change-transform">
          {glyph === " " ? "\u00A0" : glyph}
        </span>
      ))}
    </span>
  );
}
