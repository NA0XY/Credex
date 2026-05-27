import { getPlanById, getToolById } from "@/data/pricing";
import { compareToBenchmark } from "@/data/benchmarks";
import type {
  AuditInput,
  AuditResult,
  CompletedAuditResult,
  OpportunityV1,
  Recommendation,
  ToolAuditResult,
} from "@/types/audit";
import {
  computeAnnualSavings,
  computeCreditsSavings,
  computeCurrentMonthlyCost,
  computeRightsizeSavings,
  computeSeatDeltaSavings,
  computeSwitchSavings,
} from "@/lib/cost-model";
import { roundCurrency } from "@/lib/format";
import { computeStackScore } from "@/lib/stack-score";

const ENGINE_VERSION = "v2-lite.1";
const RULESET_VERSION = "rules-2026-05-27";

function toAnnual(monthlySavings: number): number {
  return computeAnnualSavings(monthlySavings);
}

function createRecommendation(
  recommendation: Omit<Recommendation, "annualSavings" | "opportunity"> & {
    annualSavings?: number;
    confidenceReasons?: string[];
    opportunity?: Omit<OpportunityV1, "monthlySavings" | "annualSavings" | "confidenceTier" | "confidenceReasons">;
  }
): Recommendation {
  const monthlySavings = roundCurrency(recommendation.monthlySavings);
  const confidenceReasons =
    recommendation.confidenceReasons ??
    [
      recommendation.confidence === "high"
        ? "Strong pricing delta signal from catalog and submitted usage."
        : recommendation.confidence === "medium"
          ? "Rule triggered with moderate confidence due to assumptions on workload fit."
          : "Limited catalog match or weak deterministic evidence for material savings.",
    ];
  const generatedOpportunityId = recommendation.opportunity?.id
    ? recommendation.opportunity.id
    : `${recommendation.type}:${recommendation.targetToolId ?? "self"}:${recommendation.targetPlanId ?? "current"}`;
  const assumptions =
    recommendation.opportunity?.assumptions ??
    [recommendation.reason];

  return {
    ...recommendation,
    monthlySavings,
    annualSavings: recommendation.annualSavings ?? toAnnual(monthlySavings),
    confidenceReasons,
    opportunity: recommendation.opportunity
      ? {
          ...recommendation.opportunity,
          monthlySavings,
          annualSavings: recommendation.annualSavings ?? toAnnual(monthlySavings),
          confidenceTier: recommendation.confidence,
          confidenceReasons,
        }
      : {
          id: generatedOpportunityId,
          ruleId: "R_GENERIC_RULE",
          action: recommendation.type === "ok" ? "none" : recommendation.type,
          formula: "deterministic rule output",
          inputsUsed: [],
          assumptions,
          monthlySavings,
          annualSavings: recommendation.annualSavings ?? toAnnual(monthlySavings),
          confidenceTier: recommendation.confidence,
          confidenceReasons,
        },
  };
}

function buildOkRecommendation(reason = "This tool is correctly sized for your current team."): Recommendation {
  return createRecommendation({
    type: "ok",
    reason,
    monthlySavings: 0,
    confidence: "high",
    confidenceReasons: ["No deterministic savings rule triggered for this tool in the current configuration."],
    opportunity: {
      id: "none",
      ruleId: "R_OK_STATE",
      action: "none",
      formula: "0",
      inputsUsed: [],
      assumptions: ["Current configuration appears aligned to team context."],
    },
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

export function runAudit(
  input: AuditInput,
  options?: { mode?: "legacy" | "shadow" | "v2lite"; opportunitiesEnabled?: boolean }
): CompletedAuditResult {
  const engineMode = options?.mode ?? "v2lite";
  const opportunitiesEnabled = options?.opportunitiesEnabled ?? engineMode !== "legacy";
  const toolResults: ToolAuditResult[] = input.tools.map((toolInput) => {
    const tool = getToolById(toolInput.toolId);
    const plan = getPlanById(toolInput.toolId, toolInput.planId);

    if (!tool || !plan) {
      const unknownRecommendation = createRecommendation({
        type: "ok",
        reason: "Unable to match this tool against the pricing catalog.",
        monthlySavings: 0,
        confidence: "low",
        confidenceReasons: ["Tool or plan id was not found in the pricing catalog."],
        opportunity: {
          id: `${toolInput.toolId}:R_UNKNOWN_TOOL:none`,
          ruleId: "R_UNKNOWN_TOOL",
          action: "none",
          formula: "0",
          inputsUsed: [{ key: "toolId", value: toolInput.toolId }, { key: "planId", value: toolInput.planId }],
          assumptions: ["No deterministic recommendation can be made without a catalog match."],
        },
      });
      return {
        toolId: toolInput.toolId,
        toolName: toolInput.toolId,
        currentPlan: toolInput.planId,
        currentMonthlyCost: computeCurrentMonthlyCost(toolInput.monthlySpend),
        seats: toolInput.seats,
        recommendations: [unknownRecommendation],
        bestRecommendation: unknownRecommendation,
        isOptimal: true,
      };
    }

    const result: ToolAuditResult = {
      toolId: tool.id,
      toolName: tool.name,
      currentPlan: plan.name,
      currentMonthlyCost: computeCurrentMonthlyCost(toolInput.monthlySpend),
      seats: toolInput.seats,
      recommendations: [],
      bestRecommendation: buildOkRecommendation(),
      isOptimal: true,
    };

    // Rule 1: Claude Team min seat check.
    if (tool.id === "claude" && plan.id === "team" && toolInput.seats < 5) {
      const proPrice = 20;
      const teamPrice = plan.pricePerUserPerMonth;
      const monthlySavings = computeSeatDeltaSavings({
        seats: toolInput.seats,
        currentSeatPrice: teamPrice,
        targetSeatPrice: proPrice,
      });

      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "high",
          confidenceReasons: [
            "Claude Team has a 5-seat minimum and current seat count is below that threshold.",
            "Catalog pricing delta between Team and Pro plans is deterministic.",
          ],
          reason: `Claude Team requires at least 5 seats. With ${toolInput.seats} users, moving to Claude Pro at $20/seat saves $${monthlySavings}/mo with similar capabilities.`,
          opportunity: {
            id: `${tool.id}:R_CLAUDE_TEAM_MIN_SEAT:downgrade`,
            ruleId: "R_CLAUDE_TEAM_MIN_SEAT",
            action: "downgrade",
            formula: "(teamSeatPrice - proSeatPrice) * seats",
            inputsUsed: [
              { key: "teamSeatPrice", value: teamPrice },
              { key: "proSeatPrice", value: proPrice },
              { key: "seats", value: toolInput.seats },
            ],
            assumptions: ["Pro plan capability is sufficient for current collaboration requirements."],
          },
        })
      );
    }

    // Rule 3: ChatGPT Plus for coding-heavy teams.
    if (tool.id === "chatgpt" && plan.id === "plus" && input.primaryUseCase === "coding") {
      const cursorCost = toolInput.seats * 20;
      const monthlySavings = computeSwitchSavings(result.currentMonthlyCost, cursorCost);

      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "cursor",
          targetPlanId: "pro",
          monthlySavings,
          confidence: monthlySavings > 0 ? "high" : "medium",
          confidenceReasons:
            monthlySavings > 0
              ? ["Current chat subscription spend exceeds projected coding-centric tool spend."]
              : ["Workflow fit suggests Cursor, but spend difference is neutral under submitted totals."],
          reason: "ChatGPT Plus is not optimized for inline coding workflows. Cursor Pro keeps model quality while adding in-editor coding assistance.",
          opportunity: {
            id: `${tool.id}:R_CHATGPT_PLUS_CODING_SWITCH:switch`,
            ruleId: "R_CHATGPT_PLUS_CODING_SWITCH",
            action: "switch",
            formula: "currentMonthlyCost - (seats * cursorProSeatPrice)",
            inputsUsed: [
              { key: "currentMonthlyCost", value: result.currentMonthlyCost },
              { key: "seats", value: toolInput.seats },
              { key: "cursorProSeatPrice", value: 20 },
            ],
            assumptions: ["Team is coding-first and can consolidate workflow into Cursor."],
          },
        })
      );
    }

    // Practical team right-size check for ChatGPT Team vs Plus.
    if (tool.id === "chatgpt" && plan.id === "team") {
      const monthlySavings = computeSeatDeltaSavings({
        seats: toolInput.seats,
        currentSeatPrice: plan.pricePerUserPerMonth,
        targetSeatPrice: 20,
      });
      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "chatgpt",
          targetPlanId: "plus",
          monthlySavings,
          confidence: "medium",
          confidenceReasons: [
            "Per-seat catalog delta exists between Team and Plus.",
            "Governance needs are not guaranteed from form inputs and require validation.",
          ],
          reason: `If your team does not need workspace governance controls, moving from ChatGPT Team to Plus can save about $${monthlySavings}/mo.`,
          opportunity: {
            id: `${tool.id}:R_CHATGPT_TEAM_RIGHTSIZE:downgrade`,
            ruleId: "R_CHATGPT_TEAM_RIGHTSIZE",
            action: "downgrade",
            formula: "(teamSeatPrice - plusSeatPrice) * seats",
            inputsUsed: [
              { key: "teamSeatPrice", value: plan.pricePerUserPerMonth },
              { key: "plusSeatPrice", value: 20 },
              { key: "seats", value: toolInput.seats },
            ],
            assumptions: ["Organization does not require Team-only admin controls."],
          },
        })
      );
    }

    // Rule 5: over-seating on premium plans.
    if (toolInput.seats > input.teamSize * 1.2 && plan.pricePerUserPerMonth > 0) {
      const extraSeats = Math.max(toolInput.seats - input.teamSize, 0);
      const monthlySavings = computeRightsizeSavings({
        currentSeats: toolInput.seats,
        targetSeats: input.teamSize,
        currentSeatPrice: plan.pricePerUserPerMonth,
      });

      appendRecommendation(
        result,
        createRecommendation({
          type: "righsize",
          monthlySavings,
          confidence: "high",
          confidenceReasons: [
            "Submitted seats exceed team size threshold by more than 20%.",
            "Savings come directly from removing inactive premium seats.",
          ],
          reason: `You appear to have ${extraSeats} unused seats on ${tool.name} ${plan.name}. Reducing to ${input.teamSize} seats saves $${monthlySavings}/mo immediately.`,
          opportunity: {
            id: `${tool.id}:R_OVERSEAT_PREMIUM:rightsize`,
            ruleId: "R_OVERSEAT_PREMIUM",
            action: "righsize",
            formula: "(currentSeats - teamSize) * currentSeatPrice",
            inputsUsed: [
              { key: "currentSeats", value: toolInput.seats },
              { key: "teamSize", value: input.teamSize },
              { key: "currentSeatPrice", value: plan.pricePerUserPerMonth },
            ],
            assumptions: ["Excess seats are not required for near-term onboarding."],
          },
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
          confidenceReasons: [
            "Rule is based on workflow fit rather than direct price delta.",
            "Gemini and Claude pricing can be similar at the listed tier.",
          ],
          reason: "Gemini Advanced is strongest inside Google Workspace-heavy workflows. For coding-first teams, Claude Pro usually offers stronger coding support at the same headline price.",
          opportunity: {
            id: `${tool.id}:R_GEMINI_CODING_FIT:switch`,
            ruleId: "R_GEMINI_CODING_FIT",
            action: "switch",
            formula: "fit-based recommendation (no direct savings delta)",
            inputsUsed: [
              { key: "primaryUseCase", value: input.primaryUseCase },
              { key: "sourcePlan", value: plan.id },
            ],
            assumptions: ["Coding teams prioritize inline IDE workflows over general assistant usage."],
          },
        })
      );
    }

    // Rule 7: Claude Max overkill for solo non-data usage.
    if (tool.id === "claude" && plan.id === "max" && input.teamSize === 1 && input.primaryUseCase !== "data") {
      const monthlySavings = computeSwitchSavings(result.currentMonthlyCost, 20);

      appendRecommendation(
        result,
        createRecommendation({
          type: "downgrade",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "high",
          confidenceReasons: [
            "Claude Max selected for a solo non-data profile is typically overprovisioned.",
            "Savings use direct plan price delta from submitted spend.",
          ],
          reason: `Claude Max is built for very heavy usage. For a single ${input.primaryUseCase} user, Claude Pro usually covers needs while saving $${monthlySavings}/mo.`,
          opportunity: {
            id: `${tool.id}:R_CLAUDE_MAX_SOLO_DOWNGRADE:downgrade`,
            ruleId: "R_CLAUDE_MAX_SOLO_DOWNGRADE",
            action: "downgrade",
            formula: "currentMonthlyCost - claudeProMonthly",
            inputsUsed: [
              { key: "currentMonthlyCost", value: result.currentMonthlyCost },
              { key: "claudeProMonthly", value: 20 },
            ],
            assumptions: ["Solo non-data workload does not require Max-tier quota."],
          },
        })
      );
    }

    // Rule 8: Credex credits opportunity at high spend.
    if (result.currentMonthlyCost > 200) {
      const monthlySavings = computeCreditsSavings(result.currentMonthlyCost, 0.2);

      appendRecommendation(
        result,
        createRecommendation({
          type: "credits",
          monthlySavings,
          confidence: "medium",
          confidenceReasons: [
            "High monthly spend increases probability of enterprise discount negotiation.",
            "Credit marketplace savings are estimate-based and depend on available inventory.",
          ],
          reason: `At $${result.currentMonthlyCost}/mo on ${tool.name}, sourcing credits via providers like Credex can unlock 20-40% effective savings on enterprise-tier access.`,
          opportunity: {
            id: `${tool.id}:R_CREDITS_HIGH_SPEND:credits`,
            ruleId: "R_CREDITS_HIGH_SPEND",
            action: "credits",
            formula: "currentMonthlyCost * 0.2",
            inputsUsed: [{ key: "currentMonthlyCost", value: result.currentMonthlyCost }],
            assumptions: ["Conservative baseline uses 20% effective savings from credit sourcing."],
          },
        })
      );
    }

    // Rule 9: Cursor vs Windsurf for team pricing.
    if (tool.id === "cursor" && plan.id === "pro" && input.teamSize >= 5) {
      const monthlySavings = computeSeatDeltaSavings({
        seats: toolInput.seats,
        currentSeatPrice: 40,
        targetSeatPrice: 35,
      });

      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "windsurf",
          targetPlanId: "teams",
          monthlySavings,
          confidence: "medium",
          confidenceReasons: [
            "Team size threshold met for comparable alternative pricing.",
            "Assumes feature parity is acceptable for current workflows.",
          ],
          reason: `For teams of 5+, Windsurf Teams at $35/seat can be a lower-cost alternative to Cursor Business at $40/seat, saving about $${monthlySavings}/mo.`,
          opportunity: {
            id: `${tool.id}:R_CURSOR_WINDSURF_TEAM_SWITCH:switch`,
            ruleId: "R_CURSOR_WINDSURF_TEAM_SWITCH",
            action: "switch",
            formula: "(cursorBusinessSeatPrice - windsurfTeamsSeatPrice) * seats",
            inputsUsed: [
              { key: "cursorBusinessSeatPrice", value: 40 },
              { key: "windsurfTeamsSeatPrice", value: 35 },
              { key: "seats", value: toolInput.seats },
            ],
            assumptions: ["Windsurf Teams can satisfy workflow requirements with lower per-seat cost."],
          },
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
    const overlapUnitCost = copilotResult.currentMonthlyCost / Math.max(copilotResult.seats, 1);
    const overlapSpend = computeSwitchSavings(overlapUnitCost * overlappingSeats, 0);

    appendRecommendation(
      copilotResult,
      createRecommendation({
        type: "switch",
        targetToolId: "cursor",
        targetPlanId: "pro",
        monthlySavings: overlapSpend,
        confidence: "high",
        confidenceReasons: [
          "Both tools target overlapping coding-assistant functionality for the same seats.",
          "Savings uses copilot per-seat cost multiplied by overlapping seat count.",
        ],
        reason: `Cursor Pro already covers comparable code completion for the same ${overlappingSeats} developers. Keeping both tools creates $${overlapSpend}/mo in redundant spend.`,
        opportunity: {
          id: `${copilotResult.toolId}:R_DUPLICATE_CODING_COVERAGE:switch`,
          ruleId: "R_DUPLICATE_CODING_COVERAGE",
          action: "switch",
          formula: "copilotPerSeatCost * overlappingSeats",
          inputsUsed: [
            { key: "copilotPerSeatCost", value: roundCurrency(overlapUnitCost) },
            { key: "overlappingSeats", value: overlappingSeats },
          ],
          assumptions: ["Cursor remains the primary coding assistant for overlapping users."],
        },
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
      const monthlySavings = computeSwitchSavings(result.currentMonthlyCost, 20);
      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "claude",
          targetPlanId: "pro",
          monthlySavings,
          confidence: "medium",
          confidenceReasons: [
            "API spend is low enough to consider seat-plan consolidation.",
            "Assumes existing team already maintains Claude subscription access.",
          ],
          reason: "At under $50/mo API usage, consolidating into Claude Pro usually delivers better value and simpler billing than keeping direct API spend active.",
          opportunity: {
            id: `${result.toolId}:R_LOW_API_CLAUDE_CONSOLIDATE:switch`,
            ruleId: "R_LOW_API_CLAUDE_CONSOLIDATE",
            action: "switch",
            formula: "currentMonthlyCost - claudeProMonthly",
            inputsUsed: [
              { key: "currentMonthlyCost", value: result.currentMonthlyCost },
              { key: "claudeProMonthly", value: 20 },
            ],
            assumptions: ["Current API usage can be handled within Claude Pro subscription limits."],
          },
        })
      );
    }

    if (result.toolId === "openai-api" && hasChatGptSubscription) {
      const monthlySavings = computeSwitchSavings(result.currentMonthlyCost, 20);
      appendRecommendation(
        result,
        createRecommendation({
          type: "switch",
          targetToolId: "chatgpt",
          targetPlanId: "plus",
          monthlySavings,
          confidence: "medium",
          confidenceReasons: [
            "Low API spend can often be consolidated into Plus for simpler billing.",
            "Assumes existing ChatGPT subscription supports the required workflows.",
          ],
          reason: "At under $50/mo API usage, ChatGPT Plus often provides enough throughput at lower operational overhead than maintaining separate API costs.",
          opportunity: {
            id: `${result.toolId}:R_LOW_API_OPENAI_CONSOLIDATE:switch`,
            ruleId: "R_LOW_API_OPENAI_CONSOLIDATE",
            action: "switch",
            formula: "currentMonthlyCost - chatgptPlusMonthly",
            inputsUsed: [
              { key: "currentMonthlyCost", value: result.currentMonthlyCost },
              { key: "chatgptPlusMonthly", value: 20 },
            ],
            assumptions: ["Current API usage can be handled within ChatGPT Plus limits."],
          },
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
  const toolsForReturn = opportunitiesEnabled
    ? toolsWithRecommendationContext
    : toolsWithRecommendationContext.map((tool) => ({
        ...tool,
        recommendations: tool.recommendations.map((recommendation) => ({
          ...recommendation,
          opportunity: undefined,
        })),
        bestRecommendation: {
          ...tool.bestRecommendation,
          opportunity: undefined,
        },
      }));

  return {
    tools: toolsForReturn,
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
      p75CpdPerMonth: benchmark.p75CpdPerMonth,
      cohortLabel: benchmark.cohortLabel,
      verdict: benchmark.verdict,
      percentile: benchmark.percentile,
    },
    engineMeta: {
      engineMode,
      engineVersion: ENGINE_VERSION,
      rulesetVersion: RULESET_VERSION,
      generatedAtIso: new Date().toISOString(),
    },
  };
}

