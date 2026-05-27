# TESTS

## How to run

```bash
npm run test
```

## Test files

- `src/lib/__tests__/audit-engine.test.ts`
  - Detects Claude Team downgrade for small teams
  - Flags duplicate Cursor + Copilot overlap
  - Verifies optimal stack behavior when no savings are present
  - Checks annual/monthly savings consistency
  - Validates high-savings `credexRelevant` classification
  - Detects over-seating recommendations
  - Confirms output schema shape
  - Confirms benchmark P75 is engine-provided, not derived in the UI
  - Verifies structured `OpportunityV1` payloads for actionable recommendations
  - Verifies unknown tools produce low-confidence, zero-savings output
  - Guards duplicate-overlap recommendations from double counting
  - Verifies legacy mode strips opportunity payloads for rollback compatibility
  - Verifies v2-lite mode keeps opportunity payloads by default

## CI checks

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
