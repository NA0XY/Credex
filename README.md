# Credex

SpendLens is a production-ready AI spend audit tool for startup teams. It audits paid AI tooling usage (Cursor, Copilot, Claude, ChatGPT, APIs, and more), identifies overlap and over-seating, and surfaces concrete monthly/annual savings opportunities.

Built for founders, finance leads, and engineering managers, the app is designed to show value before lead capture: users complete an audit first, then optionally save/share their report.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Postgres (with local in-memory fallback)
- Groq API (optional, fallback summary supported)
- Resend (lead follow-up emails)
- Vitest + GitHub Actions CI

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create environment file from template:

```bash
cp .env.example .env.local
```

3. Run dev server:

```bash
npm run dev
```

4. Open key routes:

- `http://localhost:3000` (landing)
- `http://localhost:3000/audit` (multi-step audit form)
- `http://localhost:3000/results/demo` (demo report)

## Screenshots / Recording

- Capture checklist:
- Landing hero + method timeline
- Audit wizard flow (team, tools, review)
- Results report with recommendation breakdown
- Optional 30-second Loom walkthrough

## Decisions (5 key trade-offs)

1. Deterministic audit math over AI-generated recommendations.
2. AI only for summary copy with hard fallback.
3. Email gate after value display.
4. Next.js App Router with route handlers.
5. Supabase + in-memory fallback.

## Deployed URL

- Local preview: http://localhost:3000
- Production deployment: not configured in this repository snapshot.

## Quality checks

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

## Repo notes

- SQL schema is in `supabase/schema.sql`.
- Assignment documentation artifacts are at repo root (`ARCHITECTURE.md`, `DEVLOG.md`, `PRICING_DATA.md`, etc.).
- `GROQ_API_KEY` is optional; fallback summaries are generated when absent.

