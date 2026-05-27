import { NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { createAuditRecord } from "@/lib/audit-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateAndStoreSummary } from "@/lib/summary";
import { auditRequestSchema } from "@/lib/validation";
import { getRequestIp } from "@/lib/request";

type EngineMode = "legacy" | "shadow" | "v2lite";

function resolveEngineMode(rawMode: string | undefined): EngineMode {
  const mode = (rawMode ?? "v2lite").toLowerCase();
  if (mode === "legacy" || mode === "shadow" || mode === "v2lite") {
    return mode;
  }
  return "v2lite";
}

function resolveBooleanFlag(rawValue: string | undefined, defaultValue: boolean): boolean {
  if (rawValue === undefined) {
    return defaultValue;
  }
  const value = rawValue.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "yes" || value === "on") {
    return true;
  }
  if (value === "0" || value === "false" || value === "no" || value === "off") {
    return false;
  }
  return defaultValue;
}

function summarizeShadowDiff(
  legacyResult: ReturnType<typeof runAudit>,
  v2liteResult: ReturnType<typeof runAudit>
) {
  const toolSavingsDelta = v2liteResult.tools.map((tool) => {
    const legacyTool = legacyResult.tools.find((candidate) => candidate.toolId === tool.toolId);
    return {
      toolId: tool.toolId,
      legacyMonthlySavings: legacyTool?.bestRecommendation.monthlySavings ?? 0,
      v2liteMonthlySavings: tool.bestRecommendation.monthlySavings,
      delta: tool.bestRecommendation.monthlySavings - (legacyTool?.bestRecommendation.monthlySavings ?? 0),
    };
  });

  return {
    totals: {
      legacyMonthlySavings: legacyResult.totalMonthlySavings,
      v2liteMonthlySavings: v2liteResult.totalMonthlySavings,
      delta: v2liteResult.totalMonthlySavings - legacyResult.totalMonthlySavings,
    },
    benchmark: {
      legacyP75: legacyResult.benchmarkComparison?.p75CpdPerMonth,
      v2liteP75: v2liteResult.benchmarkComparison?.p75CpdPerMonth,
    },
    toolSavingsDelta,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = auditRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid audit payload.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (parsed.data.website?.trim()) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const rateLimit = await enforceRateLimit(getRequestIp(request.headers));
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429 }
      );
    }

    const auditInput = {
      teamSize: parsed.data.teamSize,
      primaryUseCase: parsed.data.primaryUseCase,
      tools: parsed.data.tools,
    };

    const engineMode = resolveEngineMode(process.env.ENGINE_MODE);
    const opportunitiesEnabled = resolveBooleanFlag(process.env.ENGINE_V2_OPPORTUNITIES, true);
    let auditResult: ReturnType<typeof runAudit>;

    if (engineMode === "shadow") {
      const legacyResult = runAudit(auditInput, { mode: "legacy", opportunitiesEnabled: false });
      const v2liteResult = runAudit(auditInput, { mode: "v2lite", opportunitiesEnabled });
      auditResult = legacyResult;

      if (process.env.ENGINE_SHADOW_LOG === "1") {
        const shadowDiff = summarizeShadowDiff(legacyResult, v2liteResult);
        console.info(
          JSON.stringify({
            msg: "audit.shadow_diff",
            teamSize: auditInput.teamSize,
            toolCount: auditInput.tools.length,
            mode: "shadow",
            diff: shadowDiff,
          })
        );
      }
    } else {
      auditResult =
        engineMode === "legacy"
          ? runAudit(auditInput, { mode: "legacy", opportunitiesEnabled: false })
          : runAudit(auditInput, { mode: engineMode, opportunitiesEnabled });
    }

    const record = await createAuditRecord(auditInput, auditResult);

    void generateAndStoreSummary(record.id, auditInput, auditResult);

    return NextResponse.json({
      slug: record.publicSlug,
      auditResult,
      summaryPending: true,
    });
  } catch {
    return NextResponse.json({ error: "Unable to generate audit right now." }, { status: 500 });
  }
}

