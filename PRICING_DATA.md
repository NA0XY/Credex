# PRICING_DATA

Verified on: 2026-05-27
Canonical source in code: `src/data/pricing.ts`

## Cursor
- Hobby: $0/user/month — https://cursor.com/pricing — verified 2026-05-27
- Pro: $20/user/month — https://cursor.com/pricing — verified 2026-05-27
- Business (Teams): $40/user/month — https://cursor.com/pricing — verified 2026-05-27
- Enterprise: Custom pricing — https://cursor.com/pricing — verified 2026-05-27

## GitHub Copilot
- Individual (Pro): $10/user/month — https://github.com/features/copilot/plans — verified 2026-05-27
- Business: $19/user/month — https://github.com/features/copilot/plans — verified 2026-05-27
- Enterprise/Pro+: $39/user/month reference tier — https://github.com/features/copilot/plans — verified 2026-05-27

## Claude (Anthropic)
- Free: $0/user/month — https://claude.com/pricing — verified 2026-05-27
- Pro: $20/user/month — https://claude.com/pricing — verified 2026-05-27
- Max: $100/user/month — https://claude.com/pricing — verified 2026-05-27
- Team: $30/user/month (min seat rules apply) — https://claude.com/pricing — verified 2026-05-27
- Enterprise: Custom pricing — https://claude.com/pricing — verified 2026-05-27

## ChatGPT (OpenAI)
- Free: $0/user/month — https://chatgpt.com/pricing/ — verified 2026-05-27
- Plus: $20/user/month — https://chatgpt.com/pricing/ — verified 2026-05-27
- Team/Business tier used by this engine: $30/user/month (monthly equivalent) — https://chatgpt.com/pricing/ — verified 2026-05-27
- Enterprise: Custom pricing — https://chatgpt.com/pricing/ — verified 2026-05-27

## Anthropic API
- API: pay-per-use (no fixed seat fee) — https://platform.claude.com/docs/en/about-claude/pricing — verified 2026-05-27

## OpenAI API
- API: pay-per-use (no fixed seat fee) — https://openai.com/api/pricing/ — verified 2026-05-27

## Gemini (Google)
- Free: $0/user/month — https://gemini.google.com/advanced — verified 2026-05-27
- Advanced: $20/user/month — https://gemini.google.com/advanced — verified 2026-05-27
- API: pay-per-use (no fixed seat fee) — https://ai.google.dev/pricing — verified 2026-05-27

## Windsurf
- Free: $0/user/month — https://windsurf.com/pricing — verified 2026-05-27
- Pro: $15/user/month — https://windsurf.com/pricing — verified 2026-05-27
- Teams: $35/user/month — https://windsurf.com/pricing — verified 2026-05-27

## Notes on interpretation
- This file mirrors prices currently encoded in `src/data/pricing.ts` so every engine number has a direct vendor source URL.
- Some vendors now present quota/usage-based or region-dependent tiers; where that applies, this project uses the fixed monthly-equivalent values shown above for deterministic comparisons.
- For Enterprise/API plans with no fixed seat fee, the engine stores `0` and treats them as custom/pay-per-use rather than direct seat-price recommendations.
