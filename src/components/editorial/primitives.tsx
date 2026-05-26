import Link from "next/link";
import { cn } from "@/lib/utils";

interface FrameShellProps {
  className?: string;
  children: React.ReactNode;
}

export function FrameShell({ className, children }: FrameShellProps) {
  return <section className={cn("frame-shell", className)}>{children}</section>;
}

interface EditorialCardProps {
  className?: string;
  variant?: "default" | "wire" | "media";
  children: React.ReactNode;
}

export function EditorialCard({
  className,
  variant = "default",
  children,
}: EditorialCardProps) {
  return (
    <article
      className={cn(
        "editorial-card",
        variant === "wire" && "editorial-card-wire",
        variant === "media" && "editorial-card-media",
        className
      )}
    >
      {children}
    </article>
  );
}

interface CapsuleNavProps {
  className?: string;
  children: React.ReactNode;
}

export function CapsuleNav({ className, children }: CapsuleNavProps) {
  return <div className={cn("capsule-nav", className)}>{children}</div>;
}

interface PillActionProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}

export function PillAction({
  href,
  className,
  children,
  onClick,
  type = "button",
  variant = "secondary",
}: PillActionProps) {
  const classes = cn(
    "pill-action",
    variant === "primary" ? "pill-action-primary" : "pill-action-secondary",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

interface SignalBadgeProps {
  className?: string;
  tone?: "neutral" | "critical" | "warn" | "ok";
  children: React.ReactNode;
}

export function SignalBadge({
  className,
  tone = "neutral",
  children,
}: SignalBadgeProps) {
  return (
    <span
      className={cn(
        "signal-badge",
        tone === "critical" && "signal-badge-critical",
        tone === "warn" && "signal-badge-warn",
        tone === "ok" && "signal-badge-ok",
        className
      )}
    >
      {children}
    </span>
  );
}

interface MetricTileProps {
  className?: string;
  label: string;
  value: string;
  helper?: string;
}

export function MetricTile({ className, label, value, helper }: MetricTileProps) {
  return (
    <article className={cn("metric-tile", className)}>
      <p className="kicker">{label}</p>
      <p className="mono-value mt-2 text-2xl font-semibold">{value}</p>
      {helper && <p className="serif-body mt-1 text-xs">{helper}</p>}
    </article>
  );
}

interface StepperSegmentProps {
  active?: boolean;
  className?: string;
  step: string;
  label: string;
}

export function StepperSegment({
  active = false,
  className,
  step,
  label,
}: StepperSegmentProps) {
  return (
    <div
      className={cn(
        "stepper-segment flex min-h-14 flex-col justify-center px-4 py-2",
        active && "stepper-segment-active",
        className
      )}
    >
      <span className="mono-value text-xs font-semibold">{step}</span>
      <span className="kicker mt-1">{label}</span>
    </div>
  );
}
