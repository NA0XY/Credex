import { NextResponse } from "next/server";
import { getAuditById } from "@/lib/audit-store";
import { generateAiSummary, generateAndStoreSummary, generateFallbackSummary } from "@/lib/summary";
import { summaryRequestSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = summaryRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid summary payload." }, { status: 400 });
    }

    if (parsed.data.auditId) {
      const audit = await getAuditById(parsed.data.auditId);
      if (!audit) {
        return NextResponse.json({ error: "Audit not found." }, { status: 404 });
      }

      const summary = await generateAndStoreSummary(
        audit.id,
        {
          teamSize: audit.teamSize,
          primaryUseCase: audit.primaryUseCase,
          tools: audit.tools,
        },
        audit.auditResult
      );

      return NextResponse.json({ summary });
    }

    if (!parsed.data.input || !parsed.data.auditResult) {
      return NextResponse.json({ error: "Either auditId or both input and auditResult are required." }, { status: 400 });
    }

    const summary = await generateAiSummary(parsed.data.input, parsed.data.auditResult);
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      {
        summary: generateFallbackSummary(
          {
            tools: [],
            totalCurrentMonthlyCost: 0,
            totalMonthlySavings: 0,
            totalAnnualSavings: 0,
            savingsTier: "optimal",
            credexRelevant: false,
            generatedAt: new Date().toISOString(),
          },
          {
            tools: [],
            teamSize: 1,
            primaryUseCase: "mixed",
          }
        ),
      },
      { status: 200 }
    );
  }
}
