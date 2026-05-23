"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CircleAlert, Search, Users } from "lucide-react";
import { TOOLS, getPlanById } from "@/data/pricing";
import { formatCurrency, roundCurrency } from "@/lib/format";
import { auditFormSchema } from "@/lib/validation";
const STORAGE_KEY = "spendlens_audit_draft";

const TOOL_META: Record<string, { emoji: string; cat: string; catLabel: string }> = {
  cursor: { emoji: "KB", cat: "coding", catLabel: "Coding" },
  "github-copilot": { emoji: "GH", cat: "coding", catLabel: "Coding" },
  claude: { emoji: "CL", cat: "chat", catLabel: "Chat" },
  chatgpt: { emoji: "CG", cat: "chat", catLabel: "Chat" },
  "anthropic-api": { emoji: "AN", cat: "api", catLabel: "API" },
  "openai-api": { emoji: "OA", cat: "api", catLabel: "API" },
  gemini: { emoji: "GM", cat: "chat", catLabel: "Chat" },
  windsurf: { emoji: "WS", cat: "coding", catLabel: "Coding" },
};

const USE_CASE_LABELS: Record<string, string> = {
  coding: "Coding",
  writing: "Writing",
  data: "Data Analysis",
  research: "Research",
  mixed: "Mixed",
};

const STEP_LABELS = ["Team context", "Your tools", "Review"];

type AuditFormValues = z.infer<typeof auditFormSchema>;

const defaultValues: AuditFormValues = {
  teamSize: 5,
  primaryUseCase: "coding",
  website: "",
  tools: [
    {
      toolId: "cursor",
      planId: "pro",
      seats: 5,
      monthlySpend: 100,
      primaryUseCase: "coding",
    },
  ],
};

function expectedCost(toolId: string, planId: string, seats: number): number {
  const plan = getPlanById(toolId, planId);
  if (!plan) {
    return 0;
  }

  if (plan.priceFlat !== undefined) {
    return plan.priceFlat;
  }

  return roundCurrency(plan.pricePerUserPerMonth * seats);
}

function loadInitialDraft(): { values: AuditFormValues; restored: boolean } {
  if (typeof window === "undefined") {
    return { values: defaultValues, restored: false };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { values: defaultValues, restored: false };
  }

  try {
    const parsed = JSON.parse(raw);
    const validated = auditFormSchema.safeParse(parsed);
    if (validated.success) {
      return { values: validated.data, restored: true };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return { values: defaultValues, restored: false };
}

export function AuditWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialDraft = useMemo(() => loadInitialDraft(), []);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: initialDraft.values,
    mode: "onChange",
  });

  const { control, register, handleSubmit, trigger } = form;

  const fields = useFieldArray({ control, name: "tools" });
  const watchedTools = useWatch({ control, name: "tools", defaultValue: initialDraft.values.tools });
  const fullFormState = useWatch({ control });
  const teamSize = useWatch({ control, name: "teamSize" });
  const primaryUseCase = useWatch({ control, name: "primaryUseCase" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullFormState));
  }, [fullFormState]);

  useEffect(() => {
    watchedTools.forEach((tool, index) => {
      const selectedTool = TOOLS.find((item) => item.id === tool.toolId);
      if (!selectedTool) {
        return;
      }

      const validPlan = selectedTool.plans.some((plan) => plan.id === tool.planId);
      if (!validPlan) {
        form.setValue(`tools.${index}.planId`, selectedTool.plans[0]?.id ?? "");
      }
    });
  }, [form, watchedTools]);

  const totalSpend = useMemo(
    () => roundCurrency(watchedTools.reduce((sum, tool) => sum + Number(tool.monthlySpend ?? 0), 0)),
    [watchedTools]
  );

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["teamSize", "primaryUseCase"]);
      if (!valid) {
        return;
      }
    }

    if (step === 2) {
      const valid = await trigger("tools");
      if (!valid) {
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 3));
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to complete audit right now.");
      }

      const payload = (await response.json()) as { slug: string };
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/results/${payload.slug}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to complete audit.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-14 pt-6 sm:px-6">

      {/* ─── HEADER ─── */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Audit your AI spend
        </h1>
        <p className="mt-2 text-sm text-white/72">
          Answer a few questions. Get an instant, defensible breakdown of where you&apos;re overspending.
        </p>
      </div>

      {/* ─── STEP PROGRESS ─── */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all
                  ${isDone
                    ? "border-brand-accent bg-brand-accent text-brand-bg"
                    : isActive
                      ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-white/20 bg-black/25 text-white/55"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span className={`hidden text-xs font-medium sm:block ${isActive ? "text-white" : "text-white/72"}`}>
                  {label}
                </span>
                {i < 2 && <div className="mx-2 h-px w-8 bg-brand-border" />}
              </div>
            );
          })}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-brand-accent transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* ─── DRAFT RESTORED TOAST ─── */}
      {initialDraft.restored && (
        <div className="liquid-glass mb-6 flex items-center gap-2 rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 text-sm">
          <span className="text-brand-accent">↩</span>
          <span className="text-white/88">Draft restored from your last session.</span>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }}
            className="ml-auto text-xs text-white/70 underline underline-offset-2 hover:text-white"
          >
            Start fresh
          </button>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        {/* ─── STEP 1: Team Context ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="liquid-glass rounded-2xl border border-brand-border bg-brand-surface/72 p-6">
              <h2 className="mb-1 font-heading text-xl font-semibold">Tell us about your team</h2>
              <p className="mb-6 text-xs text-white/72">This helps calibrate per-seat pricing and plan recommendations.</p>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Team size */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Team size <span className="text-white/72">(people using AI tools)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    {...register("teamSize", { valueAsNumber: true })}
                    className="input-field font-mono"
                    placeholder="e.g. 8"
                  />
                  <p className="mt-1.5 text-[11px] text-white/50">Include devs, PMs, writers, researchers — anyone with a paid seat.</p>
                </div>

                {/* Primary use case */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Primary use case</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(USE_CASE_LABELS).map(([value, label]) => {
                      const isSelected = primaryUseCase === value;
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all
                            ${isSelected
                              ? "border-brand-accent bg-brand-accent/12 text-white"
                              : "border-white/20 bg-black/25 text-white/78 hover:border-brand-accent/40"
                            }`}
                        >
                          <input
                            type="radio"
                            value={value}
                            {...register("primaryUseCase")}
                            className="sr-only"
                          />
                          <span>{label}</span>
                          {isSelected && <span className="ml-auto text-brand-accent text-xs">✓</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Tools ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold">Which AI tools does your team pay for?</h2>
                <p className="mt-0.5 text-xs text-white/72">Add every tool. Overlap detection only works when all tools are present.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/72">Total monthly spend</p>
                <p className="font-mono text-xl font-bold text-brand-accent">{formatCurrency(totalSpend)}</p>
              </div>
            </div>

            {/* Tool rows */}
            <div className="space-y-3">
              {fields.fields.map((field, index) => {
                const toolId = watchedTools[index]?.toolId;
                const meta = TOOL_META[toolId ?? ""] ?? { emoji: "AI", cat: "other", catLabel: "Tool" };
                const plans = TOOLS.find((tool) => tool.id === toolId)?.plans ?? [];
                const planId = watchedTools[index]?.planId;
                const seats = Number(watchedTools[index]?.seats ?? 0);
                const spend = Number(watchedTools[index]?.monthlySpend ?? 0);
                const expected = expectedCost(toolId ?? "", planId ?? "", seats);
                const overBudget = spend > expected && expected > 0;
                const underBudget = spend > 0 && spend < expected * 0.8 && expected > 0;

                return (
                  <div
                    key={field.id}
                    className="liquid-glass group relative rounded-xl border border-brand-border bg-brand-surface/70 p-5 transition hover:border-brand-border/80"
                  >
                    {/* Tool header row */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-brand-accent/35 bg-brand-accent/12 px-1.5 text-[10px] font-semibold text-brand-accent">
                          {meta.emoji}
                        </span>
                        <span className="rounded-full border border-white/20 bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white/72">
                          {meta.catLabel}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {TOOLS.find((t) => t.id === toolId)?.name ?? "Tool"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fields.remove(index)}
                        disabled={fields.fields.length === 1}
                        className="rounded-md p-1 text-white/72 transition hover:bg-brand-danger/10 hover:text-brand-danger disabled:pointer-events-none disabled:opacity-30"
                        title="Remove tool"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Grid of inputs */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="lg:col-span-1">
                        <label className="mb-1.5 block text-xs font-medium text-white/72">Tool</label>
                        <select {...register(`tools.${index}.toolId`)} className="select-field text-xs">
                          {TOOLS.map((tool) => (
                            <option key={tool.id} value={tool.id}>{tool.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-1">
                        <label className="mb-1.5 block text-xs font-medium text-white/72">Plan</label>
                        <select {...register(`tools.${index}.planId`)} className="select-field text-xs">
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/72">Seats</label>
                        <input
                          type="number"
                          min={1}
                          {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                          className="input-field font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/72">
                          Monthly spend (USD)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                          className="input-field font-mono text-xs"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Expected vs actual */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-white/72">
                        List price: <span className="font-mono text-white/78">{formatCurrency(expected)}/mo</span>
                      </span>
                      {overBudget && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                          ⚠ Above list — annual billing?
                        </span>
                      )}
                      {underBudget && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                          ℹ Below list — verify spend
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add tool button */}
            <button
              type="button"
              onClick={() =>
                fields.append({
                  toolId: "chatgpt",
                  planId: "plus",
                  seats: teamSize ?? 1,
                  monthlySpend: 20,
                  primaryUseCase,
                })
              }
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-transparent py-3 text-sm text-white/60 transition hover:border-brand-accent/50 hover:text-brand-accent"
            >
              <span className="text-lg">+</span>
              Add another tool
            </button>
          </div>
        )}

        {/* ─── STEP 3: Review ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="liquid-glass rounded-2xl border border-brand-border bg-brand-surface/72 p-6">
              <h2 className="mb-1 font-heading text-xl font-semibold">Ready to run your audit</h2>
              <p className="mb-6 text-xs text-white/72">Review your inputs. Click Run to get instant results.</p>

              {/* Team summary pills */}
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamSize} people
                  </span>
                </span>
                <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs text-white/90">
                  {USE_CASE_LABELS[primaryUseCase]}
                </span>
                <span className="rounded-full border border-brand-accent/30 bg-brand-accent/5 px-3 py-1 text-xs text-brand-accent font-mono">
                  {formatCurrency(totalSpend)}/mo total
                </span>
              </div>

              {/* Tool rows */}
              <div className="space-y-2">
                {watchedTools.map((tool, index) => {
                  const toolMeta = TOOLS.find((item) => item.id === tool.toolId);
                  const planMeta = toolMeta?.plans.find((plan) => plan.id === tool.planId);
                  const meta = TOOL_META[tool.toolId] ?? { emoji: "AI" };

                  return (
                    <div
                      key={`${tool.toolId}-${index}`}
                      className="liquid-glass flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg/56 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{meta.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{toolMeta?.name ?? tool.toolId}</p>
                          <p className="text-[11px] text-white/72">
                            {planMeta?.name ?? tool.planId} · {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-white">{formatCurrency(tool.monthlySpend)}/mo</p>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-[10px] text-white/72 underline underline-offset-2 hover:text-brand-accent transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimate note */}
              <div className="liquid-glass mt-4 rounded-xl border border-brand-border bg-brand-bg/56 p-3">
                <p className="text-[11px] text-white/72">
                  <span className="inline-flex items-center gap-1.5 text-white/78">
                    <Search className="h-3.5 w-3.5 text-brand-accent" />
                    The audit engine will check for duplicate coverage, plan-size mismatches, over-seating, and credit arbitrage opportunities across all {watchedTools.length} tools.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {error && (
          <div className="mt-4 rounded-xl border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
            <span className="inline-flex items-center gap-2">
              <CircleAlert className="h-4 w-4" />
              {error}
            </span>
          </div>
        )}

        {/* ─── NAV BUTTONS ─── */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((c) => Math.max(c - 1, 1))}
            disabled={step === 1 || isSubmitting}
            className="rounded-xl border border-white/25 px-5 py-2.5 text-sm text-white/78 transition hover:border-brand-accent/50 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-accent px-6 text-sm font-semibold text-brand-bg transition glow-accent-sm hover:bg-brand-accentDim"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-accent px-6 text-sm font-semibold text-brand-bg transition glow-accent hover:bg-brand-accentDim disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-bg/30 border-t-brand-bg" />
                  Running audit...
                </>
              ) : (
                <>Run my audit →</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

