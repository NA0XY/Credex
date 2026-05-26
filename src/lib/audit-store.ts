import { nanoid } from "nanoid";
import { runAudit } from "@/lib/audit-engine";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { AuditInput, AuditRecord, AuditResult, LeadInput, Recommendation, ToolInput } from "@/types/audit";

const memoryAuditsBySlug = new Map<string, AuditRecord>();
const memoryAuditsById = new Map<string, AuditRecord>();
const memoryLeadKeys = new Set<string>();

const demoInput: AuditInput = {
  teamSize: 5,
  primaryUseCase: "mixed",
  tools: [
    { toolId: "cursor", planId: "pro", seats: 5, monthlySpend: 100, primaryUseCase: "coding" },
    { toolId: "chatgpt", planId: "team", seats: 5, monthlySpend: 150, primaryUseCase: "writing" },
    {
      toolId: "github-copilot",
      planId: "individual",
      seats: 5,
      monthlySpend: 50,
      primaryUseCase: "coding",
    },
    { toolId: "claude", planId: "pro", seats: 5, monthlySpend: 100, primaryUseCase: "writing" },
  ],
};

function sortByPotentialSavings(
  tools: { toolName: string; bestRecommendation: Recommendation }[]
): { toolName: string; bestRecommendation: Recommendation }[] {
  return [...tools].sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings);
}

function buildDemoRecord(): AuditRecord {
  const result = runAudit(demoInput);
  const topRecommendations = sortByPotentialSavings(result.tools)
    .slice(0, 2)
    .map((item) => `${item.toolName}: ${item.bestRecommendation.reason}`)
    .join(" ");

  return {
    id: "demo-audit",
    publicSlug: "demo",
    tools: demoInput.tools,
    teamSize: demoInput.teamSize,
    primaryUseCase: demoInput.primaryUseCase,
    auditResult: result,
    aiSummary: `Your team is spending $${result.totalCurrentMonthlyCost}/month across ${result.tools.length} tools. The largest savings opportunity is in overlapping coding assistants and chat subscriptions. ${topRecommendations}`,
    totalMonthlySavings: result.totalMonthlySavings,
    totalAnnualSavings: result.totalAnnualSavings,
    createdAt: new Date().toISOString(),
    isPublic: true,
  };
}

const DEMO_RECORD = buildDemoRecord();
memoryAuditsBySlug.set(DEMO_RECORD.publicSlug, DEMO_RECORD);
memoryAuditsById.set(DEMO_RECORD.id, DEMO_RECORD);

function mapDbRowToRecord(row: Record<string, unknown>): AuditRecord {
  return {
    id: String(row.id),
    publicSlug: String(row.public_slug),
    tools: (row.tools as ToolInput[]) ?? [],
    teamSize: Number(row.team_size ?? 0),
    primaryUseCase: String(row.primary_use_case ?? "mixed") as AuditInput["primaryUseCase"],
    auditResult: row.audit_result as AuditResult,
    aiSummary: String(row.ai_summary ?? ""),
    totalMonthlySavings: Number(row.total_monthly_savings ?? 0),
    totalAnnualSavings: Number(row.total_annual_savings ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    isPublic: Boolean(row.is_public ?? true),
  };
}

export async function createAuditRecord(input: AuditInput, auditResult: AuditResult): Promise<AuditRecord> {
  const slug = nanoid(10);
  const record: AuditRecord = {
    id: nanoid(12),
    publicSlug: slug,
    tools: input.tools,
    teamSize: input.teamSize,
    primaryUseCase: input.primaryUseCase,
    auditResult,
    aiSummary: "",
    totalMonthlySavings: auditResult.totalMonthlySavings,
    totalAnnualSavings: auditResult.totalAnnualSavings,
    createdAt: new Date().toISOString(),
    isPublic: true,
  };

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("audits")
      .insert({
        public_slug: record.publicSlug,
        tools: record.tools,
        team_size: record.teamSize,
        primary_use_case: record.primaryUseCase,
        audit_result: record.auditResult,
        ai_summary: record.aiSummary,
        total_monthly_savings: record.totalMonthlySavings,
        total_annual_savings: record.totalAnnualSavings,
        is_public: record.isPublic,
      })
      .select("*")
      .single();

    if (!error && data) {
      const persisted = mapDbRowToRecord(data as Record<string, unknown>);
      memoryAuditsBySlug.set(persisted.publicSlug, persisted);
      memoryAuditsById.set(persisted.id, persisted);
      return persisted;
    }
  }

  memoryAuditsBySlug.set(record.publicSlug, record);
  memoryAuditsById.set(record.id, record);
  return record;
}

export async function getAuditBySlug(slug: string): Promise<AuditRecord | null> {
  if (slug === "demo") {
    return DEMO_RECORD;
  }

  const local = memoryAuditsBySlug.get(slug);
  if (local) {
    return local;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const record = mapDbRowToRecord(data as Record<string, unknown>);
  memoryAuditsBySlug.set(record.publicSlug, record);
  memoryAuditsById.set(record.id, record);
  return record;
}

export async function getAuditById(id: string): Promise<AuditRecord | null> {
  const local = memoryAuditsById.get(id);
  if (local) {
    return local;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("audits").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return null;
  }

  const record = mapDbRowToRecord(data as Record<string, unknown>);
  memoryAuditsBySlug.set(record.publicSlug, record);
  memoryAuditsById.set(record.id, record);
  return record;
}

export async function updateAuditSummary(auditId: string, summary: string): Promise<void> {
  const local = memoryAuditsById.get(auditId);
  if (local) {
    const updated = { ...local, aiSummary: summary };
    memoryAuditsById.set(auditId, updated);
    memoryAuditsBySlug.set(updated.publicSlug, updated);
  }

  if (DEMO_RECORD.id === auditId) {
    DEMO_RECORD.aiSummary = summary;
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await supabase.from("audits").update({ ai_summary: summary }).eq("id", auditId);
  }
}

export async function createLead(input: LeadInput, auditId: string, highSavings: boolean): Promise<void> {
  const leadKey = `${auditId}:${input.email.toLowerCase()}`;
  if (memoryLeadKeys.has(leadKey)) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("leads")
      .select("id")
      .eq("audit_id", auditId)
      .eq("email", input.email)
      .maybeSingle();

    if (!data) {
      await supabase.from("leads").insert({
        audit_id: auditId,
        email: input.email,
        company_name: input.companyName,
        role: input.role,
        team_size: input.teamSize,
        high_savings: highSavings,
        email_sent: false,
      });
    }
  }

  memoryLeadKeys.add(leadKey);
}

export async function updateLeadEmailSentStatus(
  auditId: string,
  email: string,
  emailSent: boolean
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  await supabase
    .from("leads")
    .update({ email_sent: emailSent })
    .eq("audit_id", auditId)
    .eq("email", email);
}

