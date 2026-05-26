import { EditorialCard, FrameShell, SignalBadge } from "@/components/editorial/primitives";

interface BenchmarkPanelProps {
  yourCpd: number;
  medianCpd: number;
  p75Cpd: number;
  cohortLabel: string;
  verdict: string;
}

export function BenchmarkPanel({ yourCpd, medianCpd, p75Cpd, cohortLabel, verdict }: BenchmarkPanelProps) {
  const maxVal = Math.max(yourCpd, p75Cpd) * 1.2 || 1;
  const yourPct = Math.min((yourCpd / maxVal) * 100, 100);
  const medianPct = (medianCpd / maxVal) * 100;
  const p75Pct = (p75Cpd / maxVal) * 100;
  const isAboveMedian = yourCpd > medianCpd;
  const verdictTone = isAboveMedian ? "critical" : "ok";

  return (
    <FrameShell>
      <div className="border-b border-brand-border px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker !text-brand-text">Benchmark - {cohortLabel}</span>
          <SignalBadge tone={verdictTone}>{verdict}</SignalBadge>
        </div>
      </div>
      <div className="px-4 py-5 md:px-5">
        <p className="serif-body mb-4 text-sm">
          AI spend per developer per month, compared to {cohortLabel} companies
        </p>

        <div className="space-y-3.5">
          <EditorialCard className="p-3.5 md:p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="kicker text-[0.6rem]">Your stack</span>
              <span className="mono-value text-sm font-bold">${yourCpd}/dev/mo</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-brand-surface2">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${yourPct}%`,
                  background: isAboveMedian ? "var(--color-danger)" : "var(--color-brand)",
                }}
              />
            </div>
          </EditorialCard>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="kicker text-[0.6rem]">Cohort median</span>
              <span className="mono-value text-xs text-brand-textSub">${medianCpd}/dev/mo</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-surface2">
              <div
                className="h-full bg-brand-textSub/40 transition-all duration-700"
                style={{ width: `${medianPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="kicker text-[0.6rem]">75th percentile</span>
              <span className="mono-value text-xs text-brand-muted">${p75Cpd}/dev/mo</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface2">
              <div
                className="h-full bg-brand-muted/40 transition-all duration-700"
                style={{ width: `${p75Pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="panel-raised mt-4 px-4 py-3">
          <p className="serif-body text-xs text-brand-textSub">
            Benchmark verdict reflects spend per developer against this cohort.
          </p>
        </div>
      </div>
    </FrameShell>
  );
}
