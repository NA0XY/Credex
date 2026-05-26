# METRICS

## North Star metric

**North Star: Qualified Audit Completions (QAC) per week**

Definition: an audit is counted only when the user completes the full flow and reaches a results page with at least one actionable recommendation and non-zero confidence metadata.

Why this is the right metric: SpendLens is a B2B lead-generation product where value is created when a user reaches a credible decision output, not when they merely visit the landing page. QAC captures both intent (they finished the workflow) and product value delivery (a usable recommendation set), making it a stronger signal than raw traffic or DAU.

## Three input metrics that drive the North Star

1. **Audit Start Rate** (landing sessions -> audit started)
- Indicates if messaging and CTA clarity are strong enough.
- If low, top-of-funnel positioning is wrong even if product quality is high.

2. **Audit Completion Rate** (audit started -> audit completed)
- Measures friction in the multi-step form, perceived effort, and trust.
- This is the most direct operational lever for QAC growth.

3. **Recommendation Trust Signal Rate** (completed audits -> users who expand at least one recommendation detail, export, or share)
- Measures whether output feels credible enough for decision-making.
- High trust signal predicts downstream consultation intent.

## What to instrument first

Highest-priority events:
- `landing_view`
- `audit_started`
- `audit_step_submitted` (with step number and validation errors)
- `audit_completed`
- `recommendation_expanded`
- `report_shared`
- `consultation_cta_clicked`
- `email_captured`

Key dimensions to attach:
- team size bucket
- primary use case
- tools selected count
- estimated monthly spend bucket
- recommendation count and savings tier

This allows rapid segmentation to identify where high-intent users drop off and which audience segments produce the strongest economic outcomes.

## Pivot trigger

Pivot if, after **300 completed audits**, both of these hold true:
- consultation CTA click-through is below 8%, and
- consultation booking conversion from results page is below 3%

That combination means users may find the audit interesting but not decision-critical. At that point, we should pivot from "free audit lead-gen" toward either a deeper continuous monitoring product or a narrower ICP with higher urgency (for example, 20-100 seat engineering-heavy startups with visible AI spend leakage).
