"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { TOOLS, getPlanById } from "@/data/pricing";
import { formatCurrency, roundCurrency } from "@/lib/format";
import { auditFormSchema } from "@/lib/validation";

const STORAGE_KEY = "spendlens_audit_draft";

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
    <div className="mx-auto max-w-5xl px-6 py-10 text-brand-text">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl">Audit your AI spend</h1>
        <p className="text-sm text-brand-textSub">Step {step} of 3</p>
      </div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-brand-surface">
        <div
          className="h-full rounded-full bg-brand-accent transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {initialDraft.restored && (
        <p className="mb-6 rounded-lg border border-brand-border bg-brand-surface p-3 text-sm text-brand-textSub">
          Draft restored from local storage.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        {step === 1 && (
          <section className="space-y-4 rounded-xl border border-brand-border bg-brand-surface p-6">
            <h2 className="text-xl font-semibold">Team context</h2>
            <label className="block text-sm text-brand-textSub">
              Team size
              <input
                type="number"
                min={1}
                max={500}
                {...register("teamSize", { valueAsNumber: true })}
                className="mt-2 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-brand-text"
              />
            </label>

            <label className="block text-sm text-brand-textSub">
              Primary use case
              <select
                {...register("primaryUseCase")}
                className="mt-2 w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-brand-text"
              >
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="data">Data analysis</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4 rounded-xl border border-brand-border bg-brand-surface p-6">
            <h2 className="text-xl font-semibold">Which AI tools does your team pay for?</h2>
            <div className="space-y-4">
              {fields.fields.map((field, index) => {
                const toolId = watchedTools[index]?.toolId;
                const plans = TOOLS.find((tool) => tool.id === toolId)?.plans ?? [];
                const planId = watchedTools[index]?.planId;
                const seats = Number(watchedTools[index]?.seats ?? 0);
                const spend = Number(watchedTools[index]?.monthlySpend ?? 0);
                const expected = expectedCost(toolId ?? "", planId ?? "", seats);

                return (
                  <div key={field.id} className="rounded-lg border border-brand-border bg-brand-bg p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm text-brand-textSub">
                        Tool
                        <select
                          {...register(`tools.${index}.toolId`)}
                          className="mt-2 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2"
                        >
                          {TOOLS.map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm text-brand-textSub">
                        Plan
                        <select
                          {...register(`tools.${index}.planId`)}
                          className="mt-2 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2"
                        >
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm text-brand-textSub">
                        Number of seats
                        <input
                          type="number"
                          min={1}
                          {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                          className="mt-2 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2"
                        />
                      </label>

                      <label className="text-sm text-brand-textSub">
                        Monthly spend (USD)
                        <input
                          type="number"
                          min={1}
                          step="0.01"
                          {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                          className="mt-2 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2"
                        />
                        <p className="mt-1 text-xs text-brand-textSub">Enter your actual monthly bill, or annual total / 12.</p>
                      </label>
                    </div>

                    <p className="mt-3 text-xs text-brand-textSub">
                      Expected cost at list pricing: <span className="text-brand-accent">{formatCurrency(expected)}</span>
                    </p>

                    {spend > expected && expected > 0 && (
                      <p className="mt-1 text-xs text-brand-warning">
                        Warning: Entered spend is above expected list pricing. Annual billing or add-ons may explain this.
                      </p>
                    )}

                    {spend < expected && expected > 0 && (
                      <p className="mt-1 text-xs text-brand-textSub">
                        Info: Entered spend is below expected pricing. Verify for prorated or discounted contracts.
                      </p>
                    )}

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => fields.remove(index)}
                        className="text-sm text-brand-danger hover:underline"
                        disabled={fields.fields.length === 1}
                      >
                        Remove tool
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

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
              className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm hover:border-brand-accent"
            >
              + Add tool
            </button>

            <p className="text-sm text-brand-textSub">
              Current monthly AI spend: <span className="text-brand-accent">{formatCurrency(totalSpend)}</span>
            </p>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4 rounded-xl border border-brand-border bg-brand-surface p-6">
            <h2 className="text-xl font-semibold">Review before running audit</h2>
            <p className="text-sm text-brand-textSub">
              Team size: {teamSize} · Primary use case: {primaryUseCase}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-brand-textSub">
                    <th className="pb-2">Tool</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Seats</th>
                    <th className="pb-2">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {watchedTools.map((tool, index) => {
                    const toolMeta = TOOLS.find((item) => item.id === tool.toolId);
                    const planMeta = toolMeta?.plans.find((plan) => plan.id === tool.planId);

                    return (
                      <tr key={`${tool.toolId}-${index}`} className="border-t border-brand-border">
                        <td className="py-2">{toolMeta?.name ?? tool.toolId}</td>
                        <td className="py-2">{planMeta?.name ?? tool.planId}</td>
                        <td className="py-2">{tool.seats}</td>
                        <td className="py-2">{formatCurrency(tool.monthlySpend)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {error && <p className="text-sm text-brand-danger">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 1))}
            disabled={step === 1 || isSubmitting}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-brand-bg hover:bg-brand-accentDim"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-brand-bg hover:bg-brand-accentDim disabled:opacity-60"
            >
              {isSubmitting ? "Running audit..." : "Run my audit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
