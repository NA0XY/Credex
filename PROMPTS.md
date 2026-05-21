# PROMPTS

## AI summary prompt

```ts
export const buildSummaryPrompt = (input: AuditInput, result: AuditResult): string => `
You are a concise, plain-speaking financial analyst reviewing an AI tool spend audit for a startup team.

AUDIT DATA:
- Team size: ${input.teamSize} people
- Primary use case: ${input.primaryUseCase}
- Tools being used: ${result.tools.map(t => `${t.toolName} (${t.currentPlan}, ${t.seats} seats, $${t.currentMonthlyCost}/mo)`).join(', ')}
- Total monthly AI spend: $${result.totalCurrentMonthlyCost}
- Total monthly savings identified: $${result.totalMonthlySavings}
- Top recommendation: ${result.tools[0]?.bestRecommendation?.reason ?? 'Stack appears optimized'}

Write a ~100-word personalized paragraph summarizing:
1. What this team is spending and on what
2. The single biggest opportunity they have
3. One concrete next step they should take this week

Rules:
- Write in second person ("Your team...", "You're paying...")
- Be specific with numbers from the data above
- Don't be sycophantic or use filler phrases like "Great news!"
- If savings are $0, be honest: "Your stack looks optimized."
- Do not mention Credex unless savings > $500/mo (then one natural mention)
- Output ONLY the paragraph. No headers, no bullet points, no preamble.
`;
```

## Fallback strategy

When Anthropic fails, times out, or rate-limits:

- Never surface raw API errors to the user.
- Generate deterministic fallback text from audit totals and top recommendation.
- Persist fallback summary to keep the results page stable.
