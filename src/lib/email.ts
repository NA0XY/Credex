import { Resend } from "resend";
import type { AuditRecord, LeadInput } from "@/types/audit";
import { formatCurrency } from "@/lib/format";

interface EmailResponse {
  sent: boolean;
  error?: string;
}

function topRecommendations(record: AuditRecord): string[] {
  return [...record.auditResult.tools]
    .sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings)
    .filter((item) => item.bestRecommendation.type !== "ok")
    .slice(0, 3)
    .map(
      (item) =>
        `<li><strong>${item.toolName}:</strong> ${item.bestRecommendation.reason} (${formatCurrency(
          item.bestRecommendation.monthlySavings
        )}/mo)</li>`
    );
}

export async function sendLeadEmail(lead: LeadInput, record: AuditRecord): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, error: "Missing RESEND_API_KEY" };
  }

  const resend = new Resend(apiKey);
  const recommendations = topRecommendations(record);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resultUrl = `${appUrl}/results/${record.publicSlug}`;
  const from = process.env.RESEND_FROM || "SpendLens <onboarding@resend.dev>";

  const credexCta =
    record.auditResult.totalMonthlySavings > 500
      ? `<p style="margin-top:20px"><a href="https://credex.rocks" style="background:#00FF88;color:#0A0A0F;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Book a free Credex consultation</a></p>`
      : "";

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0A0A0F;color:#F8F8F8;padding:24px;line-height:1.5;">
      <h1 style="margin:0 0 8px;color:#00FF88;">SpendLens</h1>
      <p style="margin:0 0 20px;color:#9CA3AF;">Here is your AI spend audit report.</p>
      <div style="border:1px solid #1E1E2E;background:#13131A;padding:16px;border-radius:12px;">
        <p style="margin:0 0 8px;color:#9CA3AF;">Estimated savings</p>
        <p style="font-size:32px;margin:0;color:#00FF88;font-weight:700;">${formatCurrency(
          record.auditResult.totalAnnualSavings
        )}/year</p>
        <p style="margin:8px 0 0;color:#9CA3AF;">Current spend: ${formatCurrency(
          record.auditResult.totalCurrentMonthlyCost
        )}/month</p>
      </div>
      <h2 style="margin-top:24px;margin-bottom:8px;">Top recommendations</h2>
      <ul>${recommendations.join("") || "<li>Your stack looks optimized right now.</li>"}</ul>
      <p><a href="${resultUrl}" style="color:#00FF88;">Open full report</a></p>
      ${credexCta}
      <p style="margin-top:24px;color:#6B7280;font-size:12px;">You received this because you requested an AI spend audit from SpendLens.</p>
    </div>
  `;

  try {
    const response = await resend.emails.send({
      from,
      to: lead.email,
      subject: "Your AI spend audit from SpendLens",
      html,
    });

    if ((response as { error?: { message?: string } }).error) {
      const providerError = (response as { error?: { message?: string } }).error;
      return {
        sent: false,
        error: providerError?.message || "Email provider rejected the request.",
      };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

