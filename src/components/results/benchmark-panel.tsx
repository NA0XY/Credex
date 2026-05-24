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

  return (
    <div className="panel">
      <div className="border-b border-brand-border px-5 py-3">
        <span className="kicker">BENCHMARK - {cohortLabel.toUpperCase()}</span>
      </div>
      <div className="px-5 py-6">
        <p className="serif-body mb-6 text-sm">
          AI spend per developer per month, compared to {cohortLabel} companies
        </p>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="kicker" style={{ fontSize: "0.6rem", color: "#FF6B00" }}>YOUR STACK</span>
              <span className="font-mono text-sm font-bold text-brand-accent">${yourCpd}/dev/mo</span>
            </div>
            <div className="h-3 w-full overflow-hidden bg-brand-surface2">
              <div className="h-full transition-all duration-700" style={{ width: `${yourPct}%`, background: isAboveMedian ? "#E84337" : "#2E7D52" }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="kicker" style={{ fontSize: "0.6rem" }}>COHORT MEDIAN</span>
              <span className="font-mono text-xs text-brand-textSub">${medianCpd}/dev/mo</span>
            </div>
            <div className="h-2 w-full overflow-hidden bg-brand-surface2">
              <div className="h-full bg-brand-textSub/40 transition-all duration-700" style={{ width: `${medianPct}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="kicker" style={{ fontSize: "0.6rem" }}>75TH PERCENTILE</span>
              <span className="font-mono text-xs text-brand-muted">${p75Cpd}/dev/mo</span>
            </div>
            <div className="h-1 w-full overflow-hidden bg-brand-surface2">
              <div className="h-full bg-brand-muted/40 transition-all duration-700" style={{ width: `${p75Pct}%` }} />
            </div>
          </div>
        </div>

        <div className="panel-raised mt-5 px-4 py-3">
          <span className={`badge ${isAboveMedian ? "badge-switch" : "badge-ok"}`}>{verdict.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
