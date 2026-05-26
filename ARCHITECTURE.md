# ARCHITECTURE

```mermaid
flowchart LR
    A[User] --> B[Landing Page]
    B --> C[Audit Form]
    C --> D[/api/audit]
    D --> E[(Supabase or In-Memory Fallback)]
    D --> F[/api/summary]
    F --> G[Groq API Optional]
    E --> H[Results Page]
    H --> I[/api/leads]
    I --> J[Resend]
```

## Data flow narrative

A user enters team context and tool spend inputs in the multi-step audit form. The payload is validated server-side and processed by a deterministic audit engine. The result is stored with a public slug and rendered in a shareable report route. AI summary generation runs with timeout protection and fallback text to prevent user-facing failures. If a user submits an email, a lead record is stored and a transactional email is sent with top recommendations.

## Why Next.js App Router

- Route handlers make API + UI composition straightforward.
- Server components support SEO-friendly metadata and sharable result pages.
- File-based routing keeps landing, form, results, and API endpoints clean.
- Vercel deployment path is simple and well-supported.

## Why Supabase

- Postgres schema supports auditable structured data.
- Free tier is enough for MVP volume.
- RLS support provides future privacy controls.
- Easy path to add realtime and analytics views later.

## Scaling to 10k audits/day

- Move rate limiting to Redis for low-latency counters.
- Queue summary generation with worker jobs.
- Cache static assets and report shells with CDN.
- Add read replicas and partitioning for audit-result analytics.
