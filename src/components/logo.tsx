import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      {/* Lens icon: two overlapping circles */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="16" r="9" stroke="#00FF88" strokeWidth="2" fill="none" />
        <circle cx="19" cy="16" r="9" stroke="#00FF88" strokeWidth="2" fill="none" opacity="0.4" />
        {/* Dollar sign inside the lens */}
        <text x="14" y="21" fontSize="10" fontWeight="700" fill="#00FF88" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">$</text>
      </svg>
      {!compact && (
        <span className="font-heading text-lg font-semibold tracking-tight text-brand-text group-hover:text-brand-accent transition-colors">
          SpendLens
        </span>
      )}
    </Link>
  );
}
