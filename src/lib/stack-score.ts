import type { AuditInput, AuditResult } from "@/types/audit";

export type StackGrade = "A" | "B" | "C" | "D" | "F";

export interface StackScoreBreakdown {
  redundancy: number;
  planFit: number;
  seatEfficiency: number;
  costPerDeveloper: number;
}

export interface StackScore {
  total: number;
  grade: StackGrade;
  breakdown: StackScoreBreakdown;
  headline: string;
  strengths: string[];
  weaknesses: string[];
}

type ScoreableAuditResult = Pick<AuditResult, "tools" | "totalCurrentMonthlyCost">;

function scoreRedundancy(result: ScoreableAuditResult): number {
  const codingTools = result.tools.filter((tool) =>
    ["cursor", "github-copilot", "windsurf"].includes(tool.toolId)
  );

  if (codingTools.length >= 2) return 10;
  if (codingTools.length === 1) return 28;
  return 20;
}

function scorePlanFit(result: ScoreableAuditResult): number {
  const actionableRecs = result.tools.filter(
    (tool) => tool.bestRecommendation.type !== "ok" && tool.bestRecommendation.type !== "credits"
  );
  const total = result.tools.length;

  if (total === 0) return 25;

  const ratio = 1 - actionableRecs.length / total;
  return Math.round(ratio * 25);
}

function scoreSeatEfficiency(result: ScoreableAuditResult, input: AuditInput): number {
  const overSeated = result.tools.filter((tool) => tool.seats > input.teamSize * 1.1);

  if (overSeated.length === 0) return 25;
  if (overSeated.length === 1) return 15;
  return 8;
}

function scoreCostPerDeveloper(result: ScoreableAuditResult, input: AuditInput): number {
  const teamSize = Math.max(input.teamSize, 1);
  const costPerDeveloper = result.totalCurrentMonthlyCost / teamSize;

  if (costPerDeveloper <= 30) return 20;
  if (costPerDeveloper <= 50) return 16;
  if (costPerDeveloper <= 80) return 10;
  if (costPerDeveloper <= 120) return 5;
  return 2;
}

function gradeFromScore(score: number): StackGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function buildHeadline(
  breakdown: StackScoreBreakdown,
  input: AuditInput,
  result: ScoreableAuditResult
): string {
  if (
    breakdown.redundancy < 20 &&
    result.tools.some((tool) => tool.toolId === "github-copilot") &&
    result.tools.some((tool) => tool.toolId === "cursor")
  ) {
    return "Paying for two coding assistants doing the same job";
  }

  if (breakdown.seatEfficiency < 15) {
    return `Over-provisioned seats across ${result.tools.length} tool${result.tools.length > 1 ? "s" : ""}`;
  }

  if (breakdown.planFit < 15) {
    return "Several tools on wrong-sized plans for your team";
  }

  const costPerDeveloper = result.totalCurrentMonthlyCost / Math.max(input.teamSize, 1);

  if (costPerDeveloper > 80) {
    return `Spending ${costPerDeveloper > 100 ? "significantly " : ""}above benchmark at $${Math.round(
      costPerDeveloper
    )}/dev/mo`;
  }

  return "Stack is well-sized with minor optimizations available";
}

export function computeStackScore(input: AuditInput, result: ScoreableAuditResult): StackScore {
  const redundancy = scoreRedundancy(result);
  const planFit = scorePlanFit(result);
  const seatEfficiency = scoreSeatEfficiency(result, input);
  const costPerDeveloper = scoreCostPerDeveloper(result, input);
  const total = redundancy + planFit + seatEfficiency + costPerDeveloper;
  const grade = gradeFromScore(total);
  const breakdown: StackScoreBreakdown = { redundancy, planFit, seatEfficiency, costPerDeveloper };
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (redundancy >= 25) strengths.push("No duplicate tool coverage");
  else weaknesses.push("Overlapping tool coverage detected");

  if (seatEfficiency >= 20) strengths.push("Seats match headcount well");
  else weaknesses.push("Over-provisioned seats");

  if (planFit >= 20) strengths.push("Plans appropriately sized");
  else weaknesses.push("Plans do not fit actual usage");

  const currentCostPerDeveloper = result.totalCurrentMonthlyCost / Math.max(input.teamSize, 1);

  if (currentCostPerDeveloper <= 40) strengths.push(`Efficient at $${Math.round(currentCostPerDeveloper)}/dev/mo`);
  else if (currentCostPerDeveloper > 80)
    weaknesses.push(`High cost at $${Math.round(currentCostPerDeveloper)}/dev/mo`);

  return {
    total,
    grade,
    breakdown,
    headline: buildHeadline(breakdown, input, result),
    strengths: strengths.slice(0, 2),
    weaknesses: weaknesses.slice(0, 2),
  };
}
