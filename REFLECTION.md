# REFLECTION

## 1) Hardest bug
The hardest bug this week was a race condition between deterministic audit generation and asynchronous summary generation. The visible symptom was inconsistent results rendering: sometimes users saw the recommendation cards immediately, and sometimes they hit a state where the report route loaded with partial metadata and looked “broken” even though the core calculation had completed. My first hypothesis was that the bug came from the client-side state machine in the wizard, so I instrumented step transitions and payload snapshots. That did not reproduce the issue consistently. My second hypothesis was that our API response contract was unstable during provider failures. I added server logging with request IDs around `/api/audit`, DB persistence, summary invocation, and results fetch. That exposed the real issue: the route occasionally waited on summary generation too long, then returned before fallback text was persisted.

I tested three fixes: strict timeout inline, optimistic UI polling, and background summary with guaranteed fallback persistence. Inline timeout still caused flaky behavior under transient model delays; polling increased complexity and stale-state edge cases. The fix that worked was decoupling summary generation from audit completion entirely, returning deterministic results first, then writing summary or fallback afterward. I also tightened null-guards in results rendering. After this, the route behavior became predictable and user-visible failures disappeared.

## 2) A decision reversed
Mid-week I reversed a structural decision: I had started by placing recommendation logic close to route handlers because it was fast to wire while building the MVP. That shortcut became painful quickly. As soon as I needed to compare overlap scenarios (for example Cursor + Copilot, or ChatGPT Team vs Plus based on governance constraints), the route files started mixing validation, pricing logic, and response shaping. Changes became risky because a copy tweak could accidentally affect recommendation behavior.

I moved core decision logic into a dedicated audit engine module with strongly typed input and output. The reversal was triggered by two concrete signals: tests were harder to write against route handlers, and recommendation consistency across demo/live flows was drifting. Once the engine was separated, I could write focused unit tests for edge cases (over-seating, duplicate subscriptions, no-savings conditions) without booting the app server. It also made docs easier to defend because every recommendation now has deterministic provenance.

The biggest lesson was speed versus durability. Route-level logic felt faster for day one, but it slowed everything by day three. Refactoring early paid off in cleaner testing, clearer architecture, and better confidence when iterating UI and copy later in the week.

## 3) What I would build in week 2
If I had another week, I would prioritize retention and sales-readiness over adding more surface-level features. First, I would ship scheduled re-audits with threshold alerts (email/Slack): if projected monthly waste increases by a configurable amount, the team gets a summary and recommended actions. This turns SpendLens from a one-time calculator into an ongoing finance workflow. Second, I would add cohort benchmarks using aggregated anonymized data, so users can compare spend per seat against similar company sizes and use cases. Benchmark context increases trust and makes recommendations easier to justify internally.

Third, I would add a “what changed” diff view between audits, highlighting seat growth, plan shifts, and new overlap risks. Decision-makers care about trend deltas, not just one snapshot. Fourth, I would strengthen handoff to Credex consultation with a short executive brief auto-generated from deterministic findings, so operators can forward it directly to founders or finance leads.

Finally, I would instrument funnel diagnostics deeply (step-level completion, recommendation engagement, CTA conversion by segment) and run two positioning experiments: one value prop around “burn reduction,” another around “procurement clarity.” Week 2 success would be defined by stronger repeat usage and higher consultation-booking conversion, not just more visits.

## 4) How I used AI tools
I used AI tools mainly for acceleration in scaffolding, copy iteration, and implementation brainstorming, but I did not trust them for final business logic or pricing decisions without manual verification. For coding, AI helped with repetitive scaffolding tasks: creating component shells, standardizing route handler shapes, and drafting documentation structure. For writing, AI was useful for first-pass narratives in GTM and reflection drafts, which I then edited to match real implementation details and assignment constraints.

I intentionally kept deterministic audit math outside AI generation. Recommendations in this project drive financial decisions, so they must be explainable, testable, and reproducible. I relied on unit tests and code inspection for that part.

One specific case where AI was wrong: an early suggestion implied ChatGPT Team and Plus were always interchangeable cost-wise for small teams. That ignored governance/admin constraints and led to overconfident downgrade advice. I caught it by reviewing the recommendation rationale and comparing it against plan feature intent. I fixed it by adding conditional logic and lowering confidence where governance needs are ambiguous.

The overall pattern that worked: AI for speed in non-critical drafting and scaffolding; human review plus tests for logic, pricing assumptions, and decision quality.

## 5) Self-ratings
Discipline: **8/10** — I maintained momentum across code, UI iteration, and documentation while still running lint/test/build checks before finalization.

Code quality: **8/10** — The deterministic engine separation, typed contracts, and test coverage are strong, but there is still room to tighten some lint warnings and component complexity.

Design sense: **7/10** — I delivered a cohesive visual system and improved consistency across routes, though a few sections still need higher-fidelity polish to feel fully premium.

Problem-solving: **8/10** — I handled multi-layer issues (logic, rendering, motion, and docs compliance) by isolating failures and fixing root causes rather than patching symptoms.

Entrepreneurial thinking: **7/10** — I translated product output into GTM and economics framing, but stronger evidence would come from more real user interviews and live conversion data.

Overall, this week shows strong execution under ambiguity with honest trade-offs: reliable core logic, meaningful UX progress, and a clear next-step roadmap, while acknowledging remaining work around live market validation and proof metrics.
