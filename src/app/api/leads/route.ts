import { NextResponse } from "next/server";
import { createLead, getAuditBySlug } from "@/lib/audit-store";
import { sendLeadEmail } from "@/lib/email";
import { leadCaptureSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json();
    const parsed = leadCaptureSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
    }

    const audit = await getAuditBySlug(parsed.data.auditSlug);
    if (!audit) {
      return NextResponse.json({ error: "Audit not found." }, { status: 404 });
    }

    const highSavings = audit.auditResult.totalMonthlySavings > 500;
    await createLead(parsed.data, audit.id, highSavings);
    await sendLeadEmail(parsed.data, audit);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to capture lead right now." }, { status: 500 });
  }
}

