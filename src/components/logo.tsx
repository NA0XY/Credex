import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="Credex home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-brand-dark shadow-[0_8px_20px_-14px_rgba(15,23,42,0.35)]">
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" className="stroke-brand-surface" strokeWidth="1.7" />
          <circle cx="10" cy="10" r="1.8" className="fill-brand-surface" />
        </svg>
      </span>

      {!compact && (
        <div className="flex items-center gap-2">
          <span
            className="text-sm tracking-[-0.02em] text-brand-text transition-colors group-hover:text-brand-accent"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}
          >
            SpendLens
          </span>
          <span className="kicker !text-[0.58rem]">
            by Credex
          </span>
        </div>
      )}
    </Link>
  );
}
