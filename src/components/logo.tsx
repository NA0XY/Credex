import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-heading text-brand-text">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-border bg-brand-surface text-sm font-semibold text-brand-accent">
        SL
      </span>
      {!compact && <span className="text-lg font-semibold tracking-tight">SpendLens</span>}
    </Link>
  );
}

