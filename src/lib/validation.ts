import { z } from "zod";

export const useCaseSchema = z.enum(["coding", "writing", "data", "research", "mixed"]);

export const toolInputSchema = z.object({
  toolId: z.string().min(1),
  planId: z.string().min(1),
  seats: z.coerce.number().int().positive().max(10000),
  monthlySpend: z.coerce.number().positive().max(1000000),
  primaryUseCase: useCaseSchema,
});

export const toolInputFormSchema = z.object({
  toolId: z.string().min(1),
  planId: z.string().min(1),
  seats: z.number().int().positive().max(10000),
  monthlySpend: z.number().positive().max(1000000),
  primaryUseCase: useCaseSchema,
});

export const auditRequestSchema = z.object({
  teamSize: z.coerce.number().int().min(1).max(500),
  primaryUseCase: useCaseSchema,
  website: z.string().optional().default(""),
  tools: z.array(toolInputSchema).min(1),
});

export const auditFormSchema = z.object({
  teamSize: z.number().int().min(1).max(500),
  primaryUseCase: useCaseSchema,
  website: z.string(),
  tools: z.array(toolInputFormSchema).min(1),
});

export const leadCaptureSchema = z.object({
  auditSlug: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  teamSize: z.coerce.number().int().positive().max(5000).optional(),
});

export const summaryRequestSchema = z.object({
  auditId: z.string().min(1).optional(),
  input: z
    .object({
      teamSize: z.coerce.number().int().min(1).max(500),
      primaryUseCase: useCaseSchema,
      tools: z.array(toolInputSchema).min(1),
    })
    .optional(),
  auditResult: z
    .object({
      tools: z.array(z.any()),
      totalCurrentMonthlyCost: z.coerce.number(),
      totalMonthlySavings: z.coerce.number(),
      totalAnnualSavings: z.coerce.number(),
      savingsTier: z.enum(["high", "medium", "low", "optimal"]),
      credexRelevant: z.boolean(),
      generatedAt: z.string(),
    })
    .optional(),
});

