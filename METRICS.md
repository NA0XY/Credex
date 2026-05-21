# METRICS

## North Star

Audits completed that result in an email capture.

## Input metrics

1. Form completion rate (form start -> audit generated) target: >60%
2. Email capture rate (audit shown -> email submitted) target: >20%
3. Sharing rate (results viewed -> share clicked) target: >8%

## Initial instrumentation

- Vercel Analytics for traffic and path-level engagement
- Custom events: `audit_started`, `audit_completed`, `email_captured`, `share_clicked`, `credex_cta_clicked`
- Supabase dashboard for volume and savings-tier distribution

## Pivot triggers

- If email capture <10% after 200 audits: redesign results value framing
- If audit completion <40%: simplify form and reduce friction
