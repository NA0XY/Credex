import Anthropic from "@anthropic-ai/sdk";
import { updateAuditSummary } from "@/lib/audit-store";
import { buildSummaryPrompt } from "@/lib/prompts";
import type { AuditInput, AuditResult } from "@/types/audit";

type MessageWithContent = {
  content: Array<{ type: string; text?: string }>;
};

export function generateFallbackSummary(result: AuditResult, input: AuditInput): string {
  const topTool = [...result.tools].sort(
    (a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings
  )[0];

  if (!topTool) {
    return `Your ${input.teamSize}-person team is currently well-optimized for ${input.primaryUseCase} workflows. Re-run this audit quarterly as vendor pricing changes.`;
  }

  return `Your team is currently spending $${result.totalCurrentMonthlyCost}/month across ${result.tools.length} AI tool${
    result.tools.length > 1 ? "s" : ""
  }. Our audit identified $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) in potential savings. The biggest opportunity is ${
    topTool.toolName
  }: ${topTool.bestRecommendation.reason} ${
    result.credexRelevant
      ? "For teams at your spend level, sourcing through AI credit providers like Credex can unlock additional 20-40% savings on top of these optimizations."
      : "Your stack looks reasonably optimized, so re-auditing after pricing changes is the best next step."
  }`;
}

function extractTextFromAnthropicResponse(response: Awaited<ReturnType<Anthropic["messages"]["create"]>>): string {
  if (!response || typeof response !== "object" || !("content" in response)) {
    return "";
  }

  const content = (response as MessageWithContent).content;
  const block = content.find((item) => item.type === "text");
  return block?.text?.trim() ?? "";
}

export async function generateAiSummary(input: AuditInput, result: AuditResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateFallbackSummary(result, input);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Anthropic request timed out")), 8_000);
    });

    const response = await Promise.race([
      anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 240,
        messages: [{ role: "user", content: buildSummaryPrompt(input, result) }],
      }),
      timeoutPromise,
    ]);

    const summary = extractTextFromAnthropicResponse(response);
    return summary || generateFallbackSummary(result, input);
  } catch {
    return generateFallbackSummary(result, input);
  }
}

export async function generateAndStoreSummary(
  auditId: string,
  input: AuditInput,
  result: AuditResult
): Promise<string> {
  const summary = await generateAiSummary(input, result);
  await updateAuditSummary(auditId, summary);
  return summary;
}
