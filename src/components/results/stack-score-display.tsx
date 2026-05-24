import type { StackScore } from "@/lib/stack-score";

interface StackScoreDisplayProps {
  score: StackScore;
}

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: "rgba(46,125,82,0.10)", border: "rgba(46,125,82,0.40)", text: "#4CAF7A" },
  B: { bg: "rgba(100,150,220,0.10)", border: "rgba(100,150,220,0.40)", text: "#7BAEE8" },
  C: { bg: "rgba(212,160,23,0.10)", border: "rgba(212,160,23,0.40)", text: "#D4A017" },
  D: { bg: "rgba(232,67,55,0.08)", border: "rgba(232,67,55,0.35)", text: "#E84337" },
  F: { bg: "rgba(232,67,55,0.12)", border: "rgba(232,67,55,0.40)", text: "#E84337" },
};

export function StackScoreDisplay({ score }: StackScoreDisplayProps) {
  const style = GRADE_STYLES[score.grade] ?? GRADE_STYLES.C;
  const breakdown = [
    { label: "REDUNDANCY", max: 30, value: score.breakdown.redundancy },
    { label: "PLAN FIT", max: 25, value: score.breakdown.planFit },
    { label: "SEAT EFF.", max: 25, value: score.breakdown.seatEfficiency },
    { label: "COST/DEV", max: 20, value: score.breakdown.costPerDeveloper },
  ];

  return (
    <div className="panel" style={{ borderColor: style.border }}>
      <div className="border-b border-brand-border px-5 py-3">
        <span className="kicker">STACK HEALTH SCORE</span>
      </div>
      <div className="grid divide-y divide-brand-border md:grid-cols-[auto_1fr] md:divide-x md:divide-y-0">
        <div className="flex flex-col items-center justify-center p-6 md:p-8" style={{ background: style.bg }}>
          <span className="font-black leading-none" style={{ fontFamily: "var(--font-barlow)", fontSize: "7rem", fontWeight: 900, color: style.text, lineHeight: 0.9 }}>
            {score.grade}
          </span>
          <p className="kicker mt-2" style={{ color: style.text }}>{score.total}/100 POINTS</p>
          <p className="kicker mt-1 text-center text-brand-muted" style={{ fontSize: "0.6rem" }}>{score.headline}</p>
        </div>

        <div className="divide-y divide-brand-border">
          {breakdown.map((item) => {
            const ratio = item.value / item.max;
            return (
              <div key={item.label} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="kicker" style={{ fontSize: "0.6rem" }}>{item.label}</span>
                  <span className="font-mono text-xs text-brand-textSub">{item.value}/{item.max}</span>
                </div>
                <div className="h-1 w-full overflow-hidden bg-brand-surface2">
                  <div className="h-full transition-all duration-700" style={{ width: `${ratio * 100}%`, background: ratio > 0.75 ? "#2E7D52" : ratio > 0.5 ? "#D4A017" : "#E84337" }} />
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 divide-x divide-brand-border">
            <div className="px-5 py-4">
              <span className="kicker mb-2 block" style={{ fontSize: "0.6rem", color: "#2E7D52" }}>STRENGTHS</span>
              {score.strengths.map((strength) => (
                <p key={strength} className="serif-body text-xs">+ {strength}</p>
              ))}
            </div>
            <div className="px-5 py-4">
              <span className="kicker mb-2 block" style={{ fontSize: "0.6rem", color: "#E84337" }}>ISSUES</span>
              {score.weaknesses.map((weakness) => (
                <p key={weakness} className="serif-body text-xs">- {weakness}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
