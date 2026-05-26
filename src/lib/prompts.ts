import type { AuditInput, AuditResult, ToolAuditResult } from "@/types/audit";

function sortedBySavings(tools: ToolAuditResult[]): ToolAuditResult[] {
  return [...tools].sort(
    (a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings
  );
}

function topSavingsLines(tools: ToolAuditResult[], limit = 3): string {
  return sortedBySavings(tools)
    .slice(0, limit)
    .map((tool) => {
      const rec = tool.bestRecommendation;
      return `- ${tool.toolName}: ${rec.reason} (saves $${rec.monthlySavings}/mo, confidence ${rec.confidence})`;
    })
    .join("\n");
}

export const buildSummaryPrompt = (input: AuditInput, result: AuditResult): string => `
You are a finance-conscious product operations analyst writing a high-clarity executive summary.

Write one concise brief (4-6 sentences, 90-140 words) for a startup team.

HARD REQUIREMENTS:
- Use second person ("your team", "you").
- Mention exact monthly spend and exact monthly + annual savings from the data.
- Call out the single highest-impact recommendation first.
- Mention one concrete action the team should take in the next 7 days.
- Keep tone direct and non-hype. No emojis, no fluff.
- Do not mention model internals or "AI generated".
- Mention Credex only when savings > $500/mo, and at most one short clause.
- Output plain text only.

TEAM CONTEXT:
- Team size: ${input.teamSize}
- Primary use case: ${input.primaryUseCase}

CURRENT TOOL STACK:
${result.tools
  .map((tool) => `- ${tool.toolName} | ${tool.currentPlan} | ${tool.seats} seats | $${tool.currentMonthlyCost}/mo`)
  .join("\n")}

AUDIT TOTALS:
- Current monthly spend: $${result.totalCurrentMonthlyCost}
- Potential monthly savings: $${result.totalMonthlySavings}
- Potential annual savings: $${result.totalAnnualSavings}
- Savings tier: ${result.savingsTier}

TOP OPPORTUNITIES (sorted by monthly savings):
${topSavingsLines(result.tools)}
`;
