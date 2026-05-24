export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

import type { StackScore } from "@/lib/stack-score";

export interface ToolInput {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
  primaryUseCase: UseCase;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: UseCase;
}

export interface Recommendation {
  type: "downgrade" | "switch" | "righsize" | "ok" | "credits";
  targetToolId?: string;
  targetPlanId?: string;
  reason: string;
  monthlySavings: number;
  annualSavings: number;
  confidence: "high" | "medium" | "low";
  negotiationTip?: string;
  priceChangeAlert?: string;
}

export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentMonthlyCost: number;
  seats: number;
  recommendations: Recommendation[];
  bestRecommendation: Recommendation;
  isOptimal: boolean;
}

export interface BenchmarkAuditComparison {
  yourCpdPerMonth: number;
  medianCpdPerMonth: number;
  cohortLabel: string;
  verdict: string;
  percentile: string;
}

export interface AuditResult {
  tools: ToolAuditResult[];
  totalCurrentMonthlyCost: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsTier: "high" | "medium" | "low" | "optimal";
  credexRelevant: boolean;
  generatedAt: string;
  stackScore?: StackScore;
  benchmarkComparison?: BenchmarkAuditComparison;
}

export interface CompletedAuditResult extends AuditResult {
  stackScore: StackScore;
  benchmarkComparison: BenchmarkAuditComparison;
}

export interface AuditRecord {
  id: string;
  publicSlug: string;
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: UseCase;
  auditResult: AuditResult;
  aiSummary: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  createdAt: string;
  isPublic: boolean;
}

export interface LeadInput {
  auditSlug: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}

