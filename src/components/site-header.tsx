"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ScrollTrigger } from "@/lib/motion/gsap-runtime";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { useMagnetic } from "@/lib/motion/use-magnetic";

interface SiteHeaderLink {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  links?: SiteHeaderLink[];
  rightSlot?: ReactNode;
  compactLogo?: boolean;
}

function isActiveLink(currentPath: string, href: string) {
  if (href.startsWith("#")) {
    return false;
  }

  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(href);
}

export function SiteHeader({ links = [], rightSlot, compactLogo = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useMagnetic(actionsRef, { maxOffset: 5 });
  useMagnetic(navRef, { maxOffset: 3 });

  useGsapContext(
    (gsap) => {
      const shell = shellRef.current;
      if (!shell) {
        return;
      }

      const trigger = ScrollTrigger.create({
        end: 99999,
        start: 10,
        onToggle: (self) => {
          gsap.to(shell, {
            backdropFilter: self.isActive ? "blur(18px)" : "blur(10px)",
            borderColor: self.isActive ? "rgba(255, 235, 200, 0.22)" : "rgba(255, 235, 200, 0.14)",
            duration: 0.25,
            ease: "power2.out",
            scale: self.isActive ? 0.99 : 1,
            y: self.isActive ? -2 : 0,
          });
        },
      });

      return () => trigger.kill();
    },
    {
      scope: rootRef,
    }
  );

  const resolvedLinks = useMemo(
    () =>
      links.map((link) => ({
        ...link,
        active: isActiveLink(pathname, link.href),
      })),
    [links, pathname]
  );

  return (
    <header ref={rootRef} className="sticky top-3 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          ref={shellRef}
          className="liquid-glass flex items-center justify-between gap-4 rounded-[22px] border border-brand-borderStrong bg-brand-surface/75 px-4 py-2.5 shadow-[0_20px_50px_-36px_rgba(2,6,15,0.95)] md:rounded-full"
        >
          <Logo compact={compactLogo} />

          <nav ref={navRef} className="magnetic-target hidden items-center gap-2 md:flex">
            {resolvedLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.09em] transition ${
                  link.active
                    ? "border-brand-borderStrong bg-brand-surface2/80 text-brand-text"
                    : "border-transparent text-brand-textSub hover:border-brand-border hover:text-brand-text"
                }`}
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div ref={actionsRef} className="magnetic-target shrink-0">
            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
