import { FrameShell, SignalBadge } from "@/components/editorial/primitives";
import type { StackScore } from "@/lib/stack-score";

interface StackScoreDisplayProps {
  score: StackScore;
}

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: "rgba(47, 182, 124, 0.1)", border: "rgba(47, 182, 124, 0.3)", text: "var(--color-brand)" },
  B: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.32)", text: "var(--color-accent)" },
  C: { bg: "rgba(140, 106, 42, 0.12)", border: "rgba(140, 106, 42, 0.34)", text: "var(--color-warn)" },
  D: { bg: "rgba(212, 24, 61, 0.1)", border: "rgba(212, 24, 61, 0.35)", text: "var(--color-danger)" },
  F: { bg: "rgba(212, 24, 61, 0.15)", border: "rgba(212, 24, 61, 0.42)", text: "var(--color-danger)" },
};

export function StackScoreDisplay({ score }: StackScoreDisplayProps) {
  const style = GRADE_STYLES[score.grade] ?? GRADE_STYLES.C;
  const breakdown = [
    { label: "REDUNDANCY", max: 30, value: score.breakdown.redundancy },
    { label: "PLAN FIT", max: 25, value: score.breakdown.planFit },
    { label: "SEAT EFF.", max: 25, value: score.breakdown.seatEfficiency },
    { label: "COST/DEV", max: 20, value: score.breakdown.costPerDeveloper },
  ];
  const gradeTone =
    score.grade === "A" || score.grade === "B"
      ? "ok"
      : score.grade === "C"
        ? "warn"
        : "critical";

  return (
    <FrameShell>
      <div className="border-b border-brand-border px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker">Stack health score</span>
          <SignalBadge tone={gradeTone}>{score.total}/100 points</SignalBadge>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(170px,210px)_1fr] md:p-6">
        <article
          className="editorial-card flex flex-col items-center justify-center p-5 md:p-7"
          style={{ background: style.bg, borderColor: style.border }}
        >
          <span
            className="cond-display text-[4.6rem] leading-none md:text-[5.8rem]"
            style={{ color: style.text }}
          >
            {score.grade}
          </span>
          <p className="kicker mt-2" style={{ color: style.text }}>
            Grade
          </p>
          <p className="kicker mt-1 text-center text-[0.6rem] text-brand-muted">
            {score.headline}
          </p>
        </article>

        <div className="divide-y divide-brand-border rounded-2xl border border-brand-border bg-brand-surface">
          {breakdown.map((item) => {
            const ratio = item.value / item.max;
            return (
              <div key={item.label} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="kicker text-[0.6rem]">{item.label}</span>
                  <span className="mono-value text-xs text-brand-textSub">
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface2">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${ratio * 100}%`,
                      background:
                        ratio > 0.75
                          ? "var(--color-brand)"
                          : ratio > 0.5
                            ? "var(--color-warn)"
                            : "var(--color-danger)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 divide-x divide-brand-border">
            <div className="px-5 py-4">
              <span className="kicker mb-2 block text-[0.6rem] text-brand-ok">
                Strengths
              </span>
              {score.strengths.map((strength) => (
                <p key={strength} className="serif-body text-xs">+ {strength}</p>
              ))}
            </div>
            <div className="px-5 py-4">
              <span className="kicker mb-2 block text-[0.6rem] text-brand-danger">
                Issues
              </span>
              {score.weaknesses.map((weakness) => (
                <p key={weakness} className="serif-body text-xs">- {weakness}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FrameShell>
  );
}
