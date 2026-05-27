# DEVLOG

## Day 1 — 2026-05-21
**Hours worked:** 7
**What I did:** Scaffolded the Next.js app, configured shadcn and Tailwind brand theming, implemented pricing catalog, built deterministic audit engine and tests, added API routes (`/api/audit`, `/api/summary`, `/api/leads`), and shipped initial landing/audit/results flow.
**What I learned:** Keeping deterministic recommendation logic separate from AI summary generation makes the product explainable and resilient.
**Blockers / what I'm stuck on:** Live deployment evidence and richer assignment narrative docs still pending.
**Plan for tomorrow:** Expand UI polish, wire provider-specific pricing improvements, and improve reporting UX.

## Day 2 — 2026-05-22
**Hours worked:** 9
**What I did:** Switched summary generation path to Groq, updated env/config wiring, redesigned landing + audit + results surfaces, and added editorial brand assets with improved motion.
**What I learned:** Model-provider flexibility is easier when summary generation is abstracted and fallback-first.
**Blockers / what I'm stuck on:** Maintaining visual consistency while rapidly iterating across all routes.
**Plan for tomorrow:** Unify theme tokens and refine audit/report readability.

## Day 3 — 2026-05-23
**Hours worked:** 6
**What I did:** Refined Credex visual system, aligned wizard/report components, tightened copy, and improved interaction states.
**What I learned:** Shared primitives reduce design drift faster than per-page tweaks.
**Blockers / what I'm stuck on:** Needed better alignment between reference-inspired layout and data-heavy UI constraints.
**Plan for tomorrow:** Reserve time for cleanup, docs consistency, and regression checks.

## Day 4 — 2026-05-24
**Hours worked:** 2
**What I did:** Reviewed codebase for submission-gaps, updated docs skeletons, and validated test coverage around audit logic.
**What I learned:** Early documentation structure prevents late-stage scramble.
**Blockers / what I'm stuck on:** Some assignment-facing docs needed stronger specificity.
**Plan for tomorrow:** Push premium motion and finalize landing structure quality.

## Day 5 — 2026-05-25
**Hours worked:** 8
**What I did:** Implemented advanced GSAP choreography on landing and executed a broad UI overhaul pass across key user-facing pages.
**What I learned:** Motion quality depends more on sequencing discipline than animation quantity.
**Blockers / what I'm stuck on:** Timeline SVG labels and alignment required several iterative fixes.
**Plan for tomorrow:** Continue artifact cleanup and ensure deterministic behavior under edge states.

## Day 6 — 2026-05-26
**Hours worked:** 3
**What I did:** Audited assignment deliverables, checked root-level required files, and reconciled architecture/prompt docs with current Groq-based implementation.
**What I learned:** Submission compliance is partly a documentation systems problem.
**Blockers / what I'm stuck on:** Needed one more pass to align timeline SVG visuals with intended style.
**Plan for tomorrow:** Finalize SVG alignment, run verification suite, and prepare commit/push.

## Day 7 — 2026-05-27
**Hours worked:** 7
**What I did:** Fixed timeline SVG issues, shipped the v2-lite deterministic opportunity contract, added engine rollback flags, expanded tests, updated required assignment artifacts, and prepared Cloudflare deployment for `credex.harshsinghal.dev`.
**What I learned:** The audit becomes much easier to defend when every recommendation carries formula, inputs, assumptions, and confidence reasons alongside the user-facing sentence.
**Blockers / what I'm stuck on:** I was unable to complete three real user interviews before submission, so `USER_INTERVIEWS.md` documents that honestly.
**Plan for tomorrow:** If shortlisted or continuing the project, complete user interviews first, then instrument conversion analytics and run a small launch test.