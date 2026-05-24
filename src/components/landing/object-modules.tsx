"use client";

import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

function ObjectTag({ children }: { children: string }) {
  return (
    <span className="kicker inline-flex rounded-full border border-brand-borderStrong bg-brand-surface/80 px-2.5 py-1 text-brand-textSub">
      {children}
    </span>
  );
}

export function HeroObjectCluster() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    (gsap) => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-object-card]");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            duration: 0.58,
            ease: "power2.out",
            stagger: 0.09,
            y: 0,
          }
        );
      }

      gsap.to("[data-orbit-group]", {
        duration: 20,
        ease: "none",
        repeat: -1,
        rotate: 360,
        transformOrigin: "50% 50%",
      });

      gsap.to("[data-route-line]", {
        duration: 2.6,
        ease: "none",
        repeat: -1,
        strokeDashoffset: -120,
      });

      gsap.to("[data-pulse-dot]", {
        autoAlpha: 0.4,
        duration: 1.25,
        ease: "sine.inOut",
        repeat: -1,
        scale: 1.18,
        stagger: 0.18,
        yoyo: true,
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="space-y-4">
      <article data-object-card className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <ObjectTag>Coverage orbit</ObjectTag>
          <span className="kicker text-brand-accent">12 tools tracked</span>
        </div>
        <svg viewBox="0 0 420 230" className="h-[176px] w-full rounded-xl border border-brand-border bg-brand-surface/70">
          <defs>
            <linearGradient id="orbit-ring" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(120,170,236,0.15)" />
              <stop offset="50%" stopColor="rgba(255,138,61,0.85)" />
              <stop offset="100%" stopColor="rgba(120,170,236,0.14)" />
            </linearGradient>
          </defs>
          <rect width="420" height="230" fill="rgba(13,18,24,0.72)" />
          <g transform="translate(115,115)">
            <circle r="72" fill="none" stroke="rgba(181,194,210,0.2)" />
            <circle r="48" fill="none" stroke="rgba(181,194,210,0.14)" />
            <circle r="22" fill="rgba(255,138,61,0.14)" stroke="rgba(255,138,61,0.7)" />
            <g data-orbit-group>
              <circle cx="0" cy="-72" r="5.5" fill="#ff8a3d" />
              <circle cx="62" cy="-34" r="4" fill="#6ea6ec" />
              <circle cx="-54" cy="46" r="4.5" fill="#d4deeb" />
            </g>
          </g>
          <g transform="translate(250,40)">
            <rect x="0" y="0" width="150" height="150" fill="none" stroke="rgba(181,194,210,0.2)" />
            <path
              d="M4 138 L42 94 L74 98 L100 66 L130 60 L146 22"
              fill="none"
              stroke="url(#orbit-ring)"
              strokeDasharray="4 7"
              strokeWidth="2"
              data-route-line
            />
            <circle cx="42" cy="94" r="4.2" fill="#ff8a3d" data-pulse-dot />
            <circle cx="100" cy="66" r="4.2" fill="#6ea6ec" data-pulse-dot />
            <circle cx="130" cy="60" r="4.2" fill="#d4deeb" data-pulse-dot />
          </g>
        </svg>
      </article>

      <article data-object-card className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <ObjectTag>Seat lattice</ObjectTag>
          <span className="kicker text-brand-textSub">21 seats mapped</span>
        </div>
        <svg viewBox="0 0 420 165" className="h-[132px] w-full rounded-xl border border-brand-border bg-brand-surface/70">
          <rect width="420" height="165" fill="rgba(13,18,24,0.68)" />
          {[0, 1, 2, 3, 4, 5, 6].map((col) => (
            <line
              key={`c-${col}`}
              x1={20 + col * 58}
              y1={16}
              x2={20 + col * 58}
              y2={150}
              stroke="rgba(181,194,210,0.12)"
            />
          ))}
          {[0, 1, 2, 3].map((row) => (
            <line
              key={`r-${row}`}
              x1={20}
              y1={24 + row * 34}
              x2={368}
              y2={24 + row * 34}
              stroke="rgba(181,194,210,0.12)"
            />
          ))}
          {[
            [0, 0, "#d6e0ed"],
            [1, 2, "#ff8a3d"],
            [2, 1, "#6ea6ec"],
            [3, 3, "#ff8a3d"],
            [4, 2, "#6ea6ec"],
            [5, 0, "#d6e0ed"],
            [6, 1, "#ff8a3d"],
          ].map(([col, row, color], index) => (
            <circle
              key={`n-${index}`}
              cx={20 + Number(col) * 58}
              cy={24 + Number(row) * 34}
              r="6.2"
              fill={String(color)}
              data-pulse-dot
            />
          ))}
          <path
            d="M20 24 L78 92 L136 58 L194 126 L252 92 L310 24 L368 58"
            fill="none"
            stroke="rgba(255,138,61,0.76)"
            strokeDasharray="8 9"
            strokeWidth="1.9"
            data-route-line
          />
        </svg>
      </article>
    </div>
  );
}

export function SystemArtifactGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="panel p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ObjectTag>Overlap map</ObjectTag>
          <span className="kicker text-brand-textSub">Cross-vendor duplication</span>
        </div>
        <svg viewBox="0 0 520 260" className="w-full rounded-xl border border-brand-border bg-brand-surface/70">
          <defs>
            <linearGradient id="overlap-edge" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(181,194,210,0.24)" />
              <stop offset="60%" stopColor="rgba(255,138,61,0.8)" />
              <stop offset="100%" stopColor="rgba(255,138,61,0.2)" />
            </linearGradient>
          </defs>
          <rect width="520" height="260" fill="rgba(13,18,24,0.64)" />
          {[
            [74, 80, "Chat"],
            [170, 50, "Coding"],
            [182, 172, "Docs"],
            [300, 90, "Search"],
            [402, 54, "API"],
            [430, 184, "Agents"],
          ].map(([x, y, label], idx) => (
            <g key={`node-${idx}`} transform={`translate(${x},${y})`}>
              <circle r="22" fill="rgba(255,138,61,0.14)" stroke="rgba(255,138,61,0.58)" />
              <text
                y="4"
                textAnchor="middle"
                fill="#d7e1ee"
                fontSize="10"
                fontFamily="var(--font-mono)"
                style={{ letterSpacing: "0.08em" }}
              >
                {label}
              </text>
            </g>
          ))}
          <path d="M74 80 L170 50 L300 90 L402 54" fill="none" stroke="url(#overlap-edge)" strokeWidth="2" />
          <path d="M170 50 L182 172 L430 184 L300 90" fill="none" stroke="url(#overlap-edge)" strokeWidth="2" />
          <path d="M74 80 L182 172 L430 184" fill="none" stroke="rgba(181,194,210,0.32)" strokeWidth="1.4" />
        </svg>
      </article>

      <article className="panel p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ObjectTag>Savings route</ObjectTag>
          <span className="kicker text-brand-accent">Priority queue</span>
        </div>
        <svg viewBox="0 0 380 260" className="w-full rounded-xl border border-brand-border bg-brand-surface/70">
          <rect width="380" height="260" fill="rgba(13,18,24,0.66)" />
          {[0, 1, 2, 3, 4].map((line) => (
            <line key={`h-${line}`} x1={20} y1={40 + line * 44} x2={360} y2={40 + line * 44} stroke="rgba(181,194,210,0.09)" />
          ))}
          <polyline
            points="22,216 86,184 132,166 188,144 248,122 312,80 356,52"
            fill="none"
            stroke="rgba(255,138,61,0.88)"
            strokeWidth="3"
          />
          {[
            [86, 184, "50/mo"],
            [188, 144, "42/mo"],
            [312, 80, "28/mo"],
          ].map(([x, y, text], index) => (
            <g key={`point-${index}`} transform={`translate(${x},${y})`}>
              <circle r="7" fill="#ff8a3d" />
              <text
                x="11"
                y="4"
                fill="#d7e1ee"
                fontSize="10"
                fontFamily="var(--font-mono)"
                style={{ letterSpacing: "0.07em" }}
              >
                {text}
              </text>
            </g>
          ))}
        </svg>
      </article>
    </div>
  );
}
