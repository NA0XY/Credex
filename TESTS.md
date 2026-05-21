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

## CI checks

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
