import { updateAuditSummary } from "@/lib/audit-store";
import { buildSummaryPrompt } from "@/lib/prompts";
import type { AuditInput, AuditResult } from "@/types/audit";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

export function generateFallbackSummary(result: AuditResult, input: AuditInput): string {
  const topTool = [...result.tools].sort(
    (a, b) =>
      (b.bestRecommendation.opportunity?.monthlySavings ?? b.bestRecommendation.monthlySavings) -
      (a.bestRecommendation.opportunity?.monthlySavings ?? a.bestRecommendation.monthlySavings)
  )[0];

  if (!topTool) {
    return `Your ${input.teamSize}-person team is currently well-optimized for ${input.primaryUseCase} workflows. Re-run this audit quarterly as vendor pricing changes.`;
  }

  const topMonthlySavings = topTool.bestRecommendation.opportunity?.monthlySavings ?? topTool.bestRecommendation.monthlySavings;
  const assumptions = topTool.bestRecommendation.opportunity?.assumptions?.[0];

  return `Your team is currently spending $${result.totalCurrentMonthlyCost}/month across ${result.tools.length} AI tool${
    result.tools.length > 1 ? "s" : ""
  }. The audit identified $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) in potential savings. The highest-impact move is on ${
    topTool.toolName
  }, with about $${topMonthlySavings}/month in savings: ${topTool.bestRecommendation.reason} Next step this week: validate active seats and required governance features before applying this change.${
    assumptions ? ` Assumption check: ${assumptions}.` : ""
  } ${
    result.credexRelevant
      ? "For teams at your spend level, sourcing through AI credit providers like Credex can unlock additional 20-40% savings on top of these optimizations."
      : "Your stack looks reasonably optimized, so re-auditing after pricing changes is the best next step."
  }`;
}

function extractTextFromGroqResponse(response: GroqChatCompletionResponse): string {
  const messageContent = response.choices?.[0]?.message?.content;

  if (typeof messageContent === "string") {
    return messageContent.trim();
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => item.text ?? "")
      .join(" ")
      .trim();
  }

  return "";
}

function postProcessSummary(text: string): string {
  return text
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^(summary|executive brief)\s*:\s*/i, "")
    .trim();
}

export async function generateAiSummary(input: AuditInput, result: AuditResult): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

  if (!apiKey) {
    return generateFallbackSummary(result, input);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert B2B SaaS spend analyst. Be precise, concrete, and financially actionable.",
          },
          { role: "user", content: buildSummaryPrompt(input, result) },
        ],
        max_tokens: 320,
        temperature: 0.15,
        top_p: 0.9,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return generateFallbackSummary(result, input);
    }

    const payload = (await response.json()) as GroqChatCompletionResponse;
    const summary = postProcessSummary(extractTextFromGroqResponse(payload));
    return summary || generateFallbackSummary(result, input);
  } catch {
    return generateFallbackSummary(result, input);
  } finally {
    clearTimeout(timeout);
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
