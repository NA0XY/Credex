import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase";

interface MemoryRateLimitRow {
  windowStartMs: number;
  auditCount: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_AUDITS_PER_WINDOW = 5;
const memoryRateLimits = new Map<string, MemoryRateLimitRow>();

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function decideWithMemory(ipHash: string, nowMs: number): RateLimitDecision {
  const current = memoryRateLimits.get(ipHash);

  if (!current || nowMs - current.windowStartMs >= WINDOW_MS) {
    memoryRateLimits.set(ipHash, { windowStartMs: nowMs, auditCount: 1 });
    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_AUDITS_PER_WINDOW - 1 };
  }

  if (current.auditCount >= MAX_AUDITS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (nowMs - current.windowStartMs)) / 1000);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  current.auditCount += 1;
  memoryRateLimits.set(ipHash, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(MAX_AUDITS_PER_WINDOW - current.auditCount, 0),
  };
}

export async function enforceRateLimit(ipAddress: string): Promise<RateLimitDecision> {
  const normalizedIp = ipAddress.trim() || "0.0.0.0";
  const ipHash = hashIp(normalizedIp);
  const nowMs = Date.now();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return decideWithMemory(ipHash, nowMs);
  }

  const { data, error } = await supabase
    .from("rate_limits")
    .select("ip_hash,audit_count,window_start")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return decideWithMemory(ipHash, nowMs);
  }

  if (!data) {
    await supabase.from("rate_limits").upsert({
      ip_hash: ipHash,
      audit_count: 1,
      window_start: new Date(nowMs).toISOString(),
    });

    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_AUDITS_PER_WINDOW - 1 };
  }

  const windowStartMs = new Date(data.window_start as string).getTime();

  if (nowMs - windowStartMs >= WINDOW_MS) {
    await supabase
      .from("rate_limits")
      .update({ audit_count: 1, window_start: new Date(nowMs).toISOString() })
      .eq("ip_hash", ipHash);

    return { allowed: true, retryAfterSeconds: 0, remaining: MAX_AUDITS_PER_WINDOW - 1 };
  }

  const currentCount = Number(data.audit_count ?? 0);

  if (currentCount >= MAX_AUDITS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (nowMs - windowStartMs)) / 1000);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  await supabase
    .from("rate_limits")
    .update({ audit_count: currentCount + 1 })
    .eq("ip_hash", ipHash);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(MAX_AUDITS_PER_WINDOW - (currentCount + 1), 0),
  };
}

