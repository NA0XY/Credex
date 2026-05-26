import { getPlanById, getToolById } from "@/data/pricing";
import { compareToBenchmark } from "@/data/benchmarks";
import type { AuditInput, AuditResult, CompletedAuditResult, Recommendation, ToolAuditResult } from "@/types/audit";
import { roundCurrency } from "@/lib/format";
import { computeStackScore } from "@/lib/stack-score";

const MONTHS_PER_YEAR = 12;

function toAnnual(monthlySavings: number): number {
  return roundCurrency(monthlySavings * MONTHS_PER_YEAR);
}

function createRecommendation(
  recommendation: Omit<Recommendation, "annualSavings"> & { annualSavings?: number }
): Recommendation {
  const monthlySavings = roundCurrency(recommendation.monthlySavings);

  return {
    ...recommendation,
    monthlySavings,
    annualSavings: recommendation.annualSavings ?? toAnnual(monthlySavings),
  };
}

function buildOkRecommendation(reason = "This tool is correctly sized for your current team."): Recommendation {
  return createRecommendation({
    type: "ok",
    reason,
    monthlySavings: 0,
    confidence: "high",
  });
}

function appendRecommendation(tool: ToolAuditResult, recommendation: Recommendation): void {
  const exists = tool.recommendations.some(
    (existing) =>
      existing.type === recommendation.type &&
      existing.reason === recommendation.reason &&
      existing.targetToolId === recommendation.targetToolId &&
      existing.targetPlanId === recommendation.targetPlanId
  );

  if (!exists) {
    tool.recommendations.push(recommendation);
  }
}

function sortRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return [...recommendations].sort((a, b) => {
    if (b.monthlySavings !== a.monthlySavings) {
      return b.monthlySavings - a.monthlySavings;
    }

    if (a.type === "ok" && b.type !== "ok") {
      return 1;
    }

    if (b.type === "ok" && a.type !== "ok") {
      return -1;
    }

    return a.reason.localeCompare(b.reason);
  });
}

export function runAudit(input: AuditInput): CompletedAuditResult {
  const toolResults: ToolAuditResult[] = input.tools.map((toolInput) => {
    const tool = getToolById(toolInput.toolId);
    const plan = getPlanById(toolInput.toolId, toolInput.planId);

    if (!tool || !plan) {
      return {
        toolId: toolInput.toolId,
        toolName: toolInput.toolId,
        currentPlan: toolInput.planId,
        currentMonthlyCost: roundCurrency(toolInput.monthlySpend),
        seats: toolInput.seats,
        recommendations: [
          createRecommendation({
            type: "ok",
            reason: "Unable to match this tool against the pricing catalog.",
            monthlySavings: 0,
            confidence: "low",
          }),
        ],
        bestRecommendation: buildOkRecommendation(),
        isOptimal: true,
      };
    }

    const result: ToolAuditResult = {
      toolId: tool.id,
      toolName: tool.name,
      currentPlan: plan.name,
      currentMonthlyCost: roundCurrency(toolInput.monthlySpend),
      seats: toolInput.seats,
      recommendations: [],
      bestRecommendation: buildOkRecommendation(),
      isOptimal: true,
    };

    // Rule 1: Claude Team min seat check.
    if (tool.id === "claude" && plan.id === "team" && toolInput.seats < 5) {
      const proPrice = 20;
      const teamPrice = plan.pricePerUserPerMonth;
      const monthlySavings = roundCurrency(Math.max((teamPrice - proPrice) * toolInput.seats, 0));

      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "high",
          reason: `Claude Team requires at least 5 seats. With ${toolInput.seats} users, moving to Claude Pro at $20/seat saves $${monthlySavings}/mo with similar capabilities.`,
        })
      );
    }

    // Rule 3: ChatGPT Plus for coding-heavy teams.
    if (tool.id === "chatgpt" && plan.id === "plus" && input.primaryUseCase === "coding") {
      const cursorCost = toolInput.seats * 20;
      const monthlySavings = roundCurrency(Math.max(result.currentMonthlyCost - cursorCost, 0));

      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "cursor",
          targetPlanId: "pro",
          monthlySavings,
          confidence: monthlySavings > 0 ? "high" : "medium",
          reason: "ChatGPT Plus is not optimized for inline coding workflows. Cursor Pro keeps model quality while adding in-editor coding assistance.",
        })
      );
    }

    // Practical team right-size check for ChatGPT Team vs Plus.
    if (tool.id === "chatgpt" && plan.id === "team") {
      const monthlySavings = roundCurrency(Math.max(toolInput.seats * (plan.pricePerUserPerMonth - 20), 0));
      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "chatgpt",
          targetPlanId: "plus",
          monthlySavings,
          confidence: "medium",
          reason: `If your team does not need workspace governance controls, moving from ChatGPT Team to Plus can save about $${monthlySavings}/mo.`,
        })
      );
    }

    // Rule 5: over-seating on premium plans.
    if (toolInput.seats > input.teamSize * 1.2 && plan.pricePerUserPerMonth > 0) {
      const extraSeats = toolInput.seats - input.teamSize;
      const monthlySavings = roundCurrency(Math.max(extraSeats * plan.pricePerUserPerMonth, 0));

      appendRecommendation(
        result,
        createRecommendation({
          type: "righsize",
          monthlySavings,
          confidence: "high",
          reason: `You appear to have ${extraSeats} unused seats on ${tool.name} ${plan.name}. Reducing to ${input.teamSize} seats saves $${monthlySavings}/mo immediately.`,
        })
      );
    }

    // Rule 6: Gemini Advanced fit.
    if (tool.id === "gemini" && plan.id === "advanced" && input.primaryUseCase === "coding") {
      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings: 0,
          confidence: "medium",
          reason: "Gemini Advanced is strongest inside Google Workspace-heavy workflows. For coding-first teams, Claude Pro usually offers stronger coding support at the same headline price.",
        })
      );
    }

    // Rule 7: Claude Max overkill for solo non-data usage.
    if (tool.id === "claude" && plan.id === "max" && input.teamSize === 1 && input.primaryUseCase !== "data") {
      const monthlySavings = roundCurrency(Math.max(result.currentMonthlyCost - 20, 0));

      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "high",
          reason: `Claude Max is built for very heavy usage. For a single ${input.primaryUseCase} user, Claude Pro usually covers needs while saving $${monthlySavings}/mo.`,
        })
      );
    }

    // Rule 8: Credex credits opportunity at high spend.
    if (result.currentMonthlyCost > 200) {
      const monthlySavings = roundCurrency(result.currentMonthlyCost * 0.2);

      appendRecommendation(
        result,
        createRecommendation({
          type: "credits",
          monthlySavings,
          confidence: "medium",
          reason: `At $${result.currentMonthlyCost}/mo on ${tool.name}, sourcing credits via providers like Credex can unlock 20-40% effective savings on enterprise-tier access.`,
        })
      );
    }

    // Rule 9: Cursor vs Windsurf for team pricing.
    if (tool.id === "cursor" && plan.id === "pro" && input.teamSize >= 5) {
      const monthlySavings = roundCurrency(Math.max(toolInput.seats * (40 - 35), 0));

      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "windsurf",
          targetPlanId: "teams",
          monthlySavings,
          confidence: "medium",
          reason: `For teams of 5+, Windsurf Teams at $35/seat can be a lower-cost alternative to Cursor Business at $40/seat, saving about $${monthlySavings}/mo.`,
        })
      );
    }

    return result;
  });

  const copilotResult = toolResults.find((tool) => tool.toolId === "github-copilot");
  const cursorResult = toolResults.find((tool) => tool.toolId === "cursor");

  // Rule 2: duplicate coding coverage (Cursor + Copilot).
  if (copilotResult && cursorResult) {
    const overlappingSeats = Math.min(copilotResult.seats, cursorResult.seats);
    const overlapSpend = roundCurrency((copilotResult.currentMonthlyCost / Math.max(copilotResult.seats, 1)) * overlappingSeats);

    appendRecommendation(
      copilotResult,
      createRecommendation({
        type: "switch",
        targetToolId: "cursor",
        targetPlanId: "pro",
        monthlySavings: overlapSpend,
        confidence: "high",
        reason: `Cursor Pro already covers comparable code completion for the same ${overlappingSeats} developers. Keeping both tools creates $${overlapSpend}/mo in redundant spend.`,
      })
    );
  }

  const hasClaudeSubscription = input.tools.some((tool) => tool.toolId === "claude" && tool.planId !== "free");
  const hasChatGptSubscription = input.tools.some((tool) => tool.toolId === "chatgpt" && tool.planId !== "free");

  // Rule 4: low API usage consolidation.
  for (const [index, result] of toolResults.entries()) {
    const matchingInput = input.tools[index];

    if (!matchingInput || matchingInput.monthlySpend >= 50) {
      continue;
    }

    if (result.toolId === "anthropic-api" && hasClaudeSubscription) {
      const monthlySavings = roundCurrency(Math.max(result.currentMonthlyCost - 20, 0));
      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "medium",
          reason: "At under $50/mo API usage, consolidating into Claude Pro usually delivers better value and simpler billing than keeping direct API spend active.",
        })
      );
    }

    if (result.toolId === "openai-api" && hasChatGptSubscription) {
      const monthlySavings = roundCurrency(Math.max(result.currentMonthlyCost - 20, 0));
      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "chatgpt",
          targetPlanId: "plus",
          monthlySavings,
          confidence: "medium",
          reason: "At under $50/mo API usage, ChatGPT Plus often provides enough throughput at lower operational overhead than maintaining separate API costs.",
        })
      );
    }
  }

  const finalizedTools = toolResults.map((tool) => {
    const recommendations =
      tool.recommendations.length > 0 ? sortRecommendations(tool.recommendations) : [buildOkRecommendation()];
    const bestRecommendation = recommendations[0] ?? buildOkRecommendation();

    return {
      ...tool,
      recommendations,
      bestRecommendation,
      isOptimal: bestRecommendation.type === "ok" || bestRecommendation.monthlySavings === 0,
    };
  });

  const totalCurrentMonthlyCost = roundCurrency(
    finalizedTools.reduce((sum, tool) => sum + tool.currentMonthlyCost, 0)
  );

  const totalMonthlySavings = roundCurrency(
    finalizedTools.reduce((sum, tool) => sum + Math.max(tool.bestRecommendation.monthlySavings, 0), 0)
  );
  const totalAnnualSavings = toAnnual(totalMonthlySavings);

  const savingsTier: AuditResult["savingsTier"] =
    totalMonthlySavings === 0
      ? "optimal"
      : totalMonthlySavings > 500
        ? "high"
        : totalMonthlySavings >= 100
          ? "medium"
          : "low";

  const credexRelevant = savingsTier === "high" || savingsTier === "medium";
  const toolsWithRecommendationContext = finalizedTools.map<ToolAuditResult>((toolResult) => {
    const tool = getToolById(toolResult.toolId);
    const recommendationContext: Pick<Recommendation, "negotiationTip" | "priceChangeAlert"> = {};

    if (tool?.recentChanges?.length) {
      const [latestChange] = tool.recentChanges;
      recommendationContext.priceChangeAlert = `${tool.name} price change (${latestChange.date}): ${latestChange.note}`;
    }

    if (toolResult.currentMonthlyCost > 200) {
      recommendationContext.negotiationTip = `At $${toolResult.currentMonthlyCost}/mo, you have leverage to request annual billing discount (typically 15-20%). Contact the vendor's sales team.`;
    }

    if (!recommendationContext.negotiationTip && !recommendationContext.priceChangeAlert) {
      return toolResult;
    }

    const addContext = (recommendation: Recommendation): Recommendation => ({
      ...recommendation,
      ...recommendationContext,
    });

    return {
      ...toolResult,
      recommendations: toolResult.recommendations.map((recommendation, index) =>
        index === 0 ? addContext(recommendation) : recommendation
      ),
      bestRecommendation: addContext(toolResult.bestRecommendation),
    };
  });

  const benchmark = compareToBenchmark(input.teamSize, totalCurrentMonthlyCost);
  const stackScore = computeStackScore(input, {
    tools: toolsWithRecommendationContext,
    totalCurrentMonthlyCost,
  });

  return {
    tools: toolsWithRecommendationContext,
    totalCurrentMonthlyCost,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsTier,
    credexRelevant,
    generatedAt: new Date().toISOString(),
    stackScore,
    benchmarkComparison: {
      yourCpdPerMonth: benchmark.yourCpdPerMonth,
      medianCpdPerMonth: benchmark.medianCpdPerMonth,
      cohortLabel: benchmark.cohortLabel,
      verdict: benchmark.verdict,
      percentile: benchmark.percentile,
    },
  };
}

