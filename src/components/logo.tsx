import Link from "next/link";

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      <span className="flex h-7 w-7 items-center justify-center rounded-[0.35rem] border border-brand-text bg-brand-surface">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
      </span>
      {!compact && (
        <span className="font-mono text-[0.78rem] font-medium uppercase tracking-[0.22em] text-brand-text transition-colors group-hover:text-brand-accent">
          SpendLens
        </span>
      )}
    </Link>
  );
}
