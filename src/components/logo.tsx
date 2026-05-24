import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="Credex home">
      <span className="liquid-glass relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-borderStrong bg-brand-surface2/80">
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" className="text-brand-textSub" />
          <circle cx="10" cy="10" r="4.1" stroke="currentColor" strokeWidth="1.4" className="text-brand-accent" />
          <circle cx="10" cy="10" r="1.2" className="fill-brand-accent" />
          <path d="M14.6 5.4L16.5 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" className="text-brand-accent" />
        </svg>
      </span>

      {!compact && (
        <div className="flex items-center gap-2">
          <span
            className="text-sm uppercase tracking-[0.12em] text-brand-text transition-colors group-hover:text-brand-accent"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
          >
            Credex
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent/80" />
        </div>
      )}
    </Link>
  );
}
