import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <span className="liquid-glass flex h-10 w-10 items-center justify-center rounded-[0.82rem] border border-white/40 bg-white/8">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" stroke="#D4E8FF" strokeWidth="1.15" strokeOpacity="0.7" />
          <path d="M15.8 8.2C14.95 7.45 13.84 7 12.62 7C10 7 7.88 9.24 7.88 12C7.88 14.76 10 17 12.62 17C13.84 17 14.95 16.55 15.8 15.8" stroke="#8EC5FF" strokeWidth="1.85" strokeLinecap="round" />
          <circle cx="16.8" cy="12" r="1.05" fill="#8EC5FF" />
        </svg>
      </span>
      {!compact && (
        <span className="font-mono text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-white transition-colors group-hover:text-brand-accent">
          Credex
        </span>
      )}
    </Link>
  );
}
