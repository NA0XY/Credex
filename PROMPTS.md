# PROMPTS

The audit engine itself is deterministic. The LLM is used only to turn already-computed audit facts into a short executive summary.

## AI summary prompt

Source: `src/lib/prompts.ts`

```ts
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
- If confidence is medium/low, include one caveat sentence grounded in assumptions.
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
```

## Why it is written this way

- The prompt forces exact numbers from the deterministic engine instead of letting the model invent savings.
- It asks for second-person executive prose because the report is meant to be forwarded to a founder, finance lead, or engineering manager.
- It includes formulas, assumptions, and confidence reasons from `OpportunityV1` so medium-confidence recommendations are framed with the right caveat.
- It caps the output at 90-140 words to keep the results page scannable.

## What did not work

- A looser prompt produced generic "optimize your stack" language with weak next steps.
- Letting the model reason about recommendations directly was rejected because financial decisions need deterministic, testable logic.
- Mentioning Credex in every summary felt sales-heavy, so the final prompt mentions Credex only when savings exceed `$500/mo`.

## Fallback strategy

When Groq fails, times out, or rate-limits:

- Raw API errors are never surfaced to the user.
- `generateFallbackSummary` creates deterministic text from audit totals, top recommendation, and assumptions.
- The report remains readable even when the model provider is unavailable.
