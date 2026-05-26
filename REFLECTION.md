# REFLECTION

## 1) Hardest bug
The hardest bug in this build was balancing deterministic audit logic with asynchronous AI summaries without making the user wait. The symptom was that early versions either blocked the `/api/audit` response waiting for the LLM provider, or returned incomplete results where summary text could be missing and the UI looked broken. My first hypothesis was that we could simply call the summary model inline with a short timeout and still keep acceptable latency, but that still caused inconsistent behavior under transient API failures and rate-limits.

I then tried client-side polling for summary generation, but that introduced extra complexity and state drift when records were persisted in different stores during local development (in-memory fallback vs Supabase). The actual fix was to treat summary generation as non-blocking and deterministic fallback-first: audit is computed and returned immediately, then summary generation runs in the background with strict timeout, and on failure we persist a templated fallback summary that uses existing audit numbers. This removed user-visible failure states and made API behavior predictable.

## 2) A decision reversed
I initially leaned toward putting all recommendation rules directly in route handlers because it felt fast while wiring the API. I reversed that quickly and moved to a dedicated `audit-engine.ts` module with strongly typed input/output and unit tests. The reason was maintainability: rules like duplicate coverage, API/subscription consolidation, and over-seating should be testable in isolation from request/response concerns.

That reversal was important for three reasons. First, it let me add tests that assert behavior for edge cases without booting a server. Second, it made explanation copy on the results page more reliable because recommendation objects are always normalized. Third, it reduced the risk of AI-overreach because deterministic logic is explicit and versionable. If I kept logic in route handlers, future changes would have been slower and harder to verify. The separation now makes the product feel much closer to production quality.

## 3) Week 2 build
Week 2 should prioritize leverage features that improve retention, not just acquisition. The first feature would be benchmark mode using aggregate audit data once sample size is large enough. Users should see "your spend per developer" versus peers by team size and use case. That gives recurring reason to return and turns one-off audits into monitoring.

Second, I would add scheduled re-audits with email or Slack alerts when new savings opportunities appear due to vendor pricing or plan changes. Spend optimization is not one-and-done, so automation creates real ongoing value. Third, I would build an embeddable public widget for founders to share audit snapshots, which also creates organic distribution. Finally, I would tighten attribution and event instrumentation so we can identify where conversion drops between audit completion, email capture, and consultation intent.

## 4) AI tool usage
AI tools were used heavily for scaffolding speed, API boilerplate, and documentation drafts. I used them to accelerate repetitive setup work (component scaffolds, schema templates, CI skeletons), and to draft first-pass copy for non-core docs. I did not trust AI for the core audit recommendation logic or savings math without explicit review and tests. That portion was implemented deterministically and validated with unit tests.

One specific AI mistake I encountered: an earlier generated recommendation flow treated ChatGPT Team and Plus as globally interchangeable without considering governance needs, which could produce overconfident suggestions. I corrected it by lowering confidence and framing it as conditional on whether admin controls are required. This reinforced the rule that AI output can suggest structure, but core business logic and defensibility still require human judgment and explicit constraints.

## 5) Self-ratings
- Discipline: 8/10
- Code quality: 8/10
- Design sense: 8/10
- Problem-solving: 8/10
- Entrepreneurial thinking: 7/10

Rationale (short): I shipped a full end-to-end MVP with deterministic engine, tests, CI, and clean UX in one build pass, but still need production evidence tasks (real interviews, multi-day commit cadence, and live deployment validation) to claim a complete internship submission.


