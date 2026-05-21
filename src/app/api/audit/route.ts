import { NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { createAuditRecord } from "@/lib/audit-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateAndStoreSummary } from "@/lib/summary";
import { auditRequestSchema } from "@/lib/validation";
import { getRequestIp } from "@/lib/request";

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

    const auditResult = runAudit(auditInput);
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

