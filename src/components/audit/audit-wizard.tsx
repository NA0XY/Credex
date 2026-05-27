"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CircleAlert } from "lucide-react";
import { MetricTile, SignalBadge, StepperSegment } from "@/components/editorial/primitives";
import { TOOLS, getPlanById } from "@/data/pricing";
import { formatCurrency, roundCurrency } from "@/lib/format";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
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
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepFeedback, setStepFeedback] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = form;

  const fields = useFieldArray({ control, name: "tools" });
  const watchedTools = useWatch({ control, name: "tools", defaultValue: defaultValues.tools });
  const fullFormState = useWatch({ control });
  const teamSize = useWatch({ control, name: "teamSize" });
  const primaryUseCase = useWatch({ control, name: "primaryUseCase" });

  useEffect(() => {
    const initialDraft = loadInitialDraft();
    if (initialDraft.restored) {
      reset(initialDraft.values);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftRestored(true);
    }
    setDraftLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullFormState));
  }, [draftLoaded, fullFormState]);

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

  useGsapContext(
    (gsap) => {
      gsap.fromTo(
        "[data-step-panel]",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, duration: 0.34, ease: "power2.out", y: 0 }
      );
    },
    {
      dependencies: [step],
      scope: shellRef,
    }
  );

  useGsapContext(
    (gsap) => {
      gsap.fromTo(
        "[data-tool-row]",
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, duration: 0.32, ease: "power2.out", stagger: 0.04, y: 0 }
      );
    },
    {
      dependencies: [step, watchedTools.length],
      disabled: step !== 2,
      scope: shellRef,
    }
  );

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["teamSize", "primaryUseCase"]);
      if (!valid) {
        setStepFeedback("Please enter a valid team size and confirm the primary use case.");
        return;
      }
    }

    if (step === 2) {
      const valid = await trigger("tools");
      if (!valid) {
        setStepFeedback("Please fix tool details before continuing.");
        return;
      }
    }

    setStepFeedback(null);
    setStep((current) => Math.min(current + 1, 3));
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError(null);
    setStepFeedback(null);

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
    <div ref={shellRef} className="mx-auto w-full max-w-[1380px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
          <header className="frame-shell px-6 py-7 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SignalBadge>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                spendlens audit lane
              </SignalBadge>
              <p className="kicker">deterministic pricing diagnostics</p>
            </div>
            <h1 className="cond-display mt-5 text-[clamp(2rem,4.3vw,3.3rem)] leading-[0.97] text-brand-text">
              Audit your AI spend with defensible math.
            </h1>
            <p className="serif-body mt-3 max-w-[64ch] text-sm md:text-base">
              Enter every AI tool your team pays for. The engine checks overlap, plan fit,
              seat right-sizing, and benchmark spread before generating recommendations.
            </p>
          </header>

          <section className="frame-shell px-3 py-3 md:px-4" aria-label="Audit steps">
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { id: 1, label: "Team context" },
                { id: 2, label: "Your tools" },
                { id: 3, label: "Review" },
              ].map((item) => (
                <StepperSegment
                  key={item.id}
                  active={step === item.id}
                  step={step > item.id ? "done" : `0${item.id}`}
                  label={item.label}
                  className={step > item.id ? "!border-brand-ok/35 !bg-brand-ok/10 !text-brand-ok" : ""}
                />
              ))}
            </div>
            <p className="sr-only" aria-live="polite">
              Step {step} of 3
            </p>
          </section>

          <details className="panel px-5 py-4 lg:hidden">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <p className="kicker">Live context</p>
                <SignalBadge>step 0{step}/03</SignalBadge>
              </div>
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricTile label="Step" value={`0${step} / 03`} />
              <MetricTile label="Tools declared" value={`${watchedTools.length}`} />
              <MetricTile label="Current total" value={`${formatCurrency(totalSpend)}/mo`} />
            </div>
          </details>

          {draftRestored && (
            <article className="editorial-card border-brand-accent/35 bg-brand-surface2/80 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SignalBadge tone="ok">draft restored</SignalBadge>
                  <p className="serif-body text-sm">Draft recovered from your last session.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    reset(defaultValues);
                    setStep(1);
                    setDraftRestored(false);
                    setStepFeedback(null);
                    setError(null);
                  }}
                  className="pill-action pill-action-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
                >
                  Start fresh
                </button>
              </div>
            </article>
          )}

          {stepFeedback && (
            <article
              className="editorial-card border-brand-warn/45 bg-brand-warn/10 px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-brand-text">{stepFeedback}</p>
            </article>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

            {step === 1 && (
              <section className="frame-shell p-6 md:p-8" data-step-panel>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
                  <div>
                    <p className="kicker">step 01 / team profile</p>
                    <h2 className="mt-2 text-2xl font-semibold text-brand-text">Tell us about your team</h2>
                    <p className="serif-body mt-2 text-sm">
                      This calibrates seat assumptions and recommendation confidence.
                    </p>
                  </div>
                  <SignalBadge>required</SignalBadge>
                </div>

                <div className="mt-6 grid gap-7">
                  <div className="space-y-2">
                    <label htmlFor="team-size" className="kicker">
                      Team size using AI tools
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        id="team-size"
                        type="number"
                        min={1}
                        max={500}
                        {...register("teamSize", { valueAsNumber: true })}
                        className={`input-field max-w-[190px] text-lg font-semibold ${
                          errors.teamSize ? "border-brand-danger/55 ring-1 ring-brand-danger/35" : ""
                        }`}
                        placeholder="5"
                        aria-invalid={Boolean(errors.teamSize)}
                        aria-describedby={errors.teamSize ? "team-size-error" : undefined}
                      />
                      <p className="serif-body text-sm">
                        Include developers, PMs, writers, researchers, and anyone on a paid seat.
                      </p>
                    </div>
                    {errors.teamSize?.message && (
                      <p id="team-size-error" className="mt-2 text-sm text-brand-danger">
                        {String(errors.teamSize.message)}
                      </p>
                    )}
                  </div>

                  <hr className="ruling" />

                  <fieldset>
                    <legend className="kicker mb-3">Primary use case</legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(USE_CASE_LABELS).map(([value, label]) => {
                        const selected = primaryUseCase === value;
                        return (
                          <label
                            key={value}
                            className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                              selected
                                ? "border-brand-accent bg-brand-surface text-brand-text shadow-[0_10px_24px_-18px_rgba(30,46,32,0.4)]"
                                : "border-brand-border bg-white/70 text-brand-textSub hover:border-brand-borderStrong hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              value={value}
                              {...register("primaryUseCase")}
                              className="sr-only"
                            />
                            <span className="mono-value text-sm font-semibold">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.primaryUseCase?.message && (
                      <p className="mt-2 text-sm text-brand-danger">{String(errors.primaryUseCase.message)}</p>
                    )}
                  </fieldset>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="frame-shell p-5 md:p-6" data-step-panel>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
                  <div>
                    <p className="kicker">step 02 / tool declaration</p>
                    <h2 className="mt-2 text-2xl font-semibold text-brand-text">List every paid tool</h2>
                    <p className="serif-body mt-2 text-sm">
                      Overlap and rightsizing are only reliable when your full stack is declared.
                    </p>
                  </div>
                  <MetricTile label="Total declared spend" value={`${formatCurrency(totalSpend)}/mo`} />
                </div>

                <div className="mb-2 hidden grid-cols-[2fr_1.4fr_90px_110px_44px] gap-3 px-1 md:grid">
                  {["Tool", "Plan", "Seats", "Spend/mo", ""].map((heading) => (
                    <p key={heading} className="kicker">
                      {heading}
                    </p>
                  ))}
                </div>

                <div className="space-y-3">
                  {fields.fields.map((field, index) => {
                    const toolId = watchedTools[index]?.toolId;
                    const meta = TOOL_META[toolId ?? ""] ?? { emoji: "--", cat: "other", catLabel: "Tool" };
                    const plans = TOOLS.find((tool) => tool.id === toolId)?.plans ?? [];
                    const planId = watchedTools[index]?.planId;
                    const seats = Number(watchedTools[index]?.seats ?? 0);
                    const spend = Number(watchedTools[index]?.monthlySpend ?? 0);
                    const expected = expectedCost(toolId ?? "", planId ?? "", seats);
                    const overBudget = spend > expected * 1.1 && expected > 0;
                    const underBudget = spend > 0 && spend < expected * 0.8 && expected > 0;
                    const rowErrors = errors.tools?.[index] as
                      | {
                          toolId?: { message?: string };
                          planId?: { message?: string };
                          seats?: { message?: string };
                          monthlySpend?: { message?: string };
                        }
                      | undefined;
                    const rowErrorMessage =
                      rowErrors?.toolId?.message ??
                      rowErrors?.planId?.message ??
                      rowErrors?.seats?.message ??
                      rowErrors?.monthlySpend?.message;

                    return (
                      <article
                        key={field.id}
                        className={`editorial-card p-4 md:p-5 ${
                          rowErrorMessage ? "border-brand-danger/45 bg-brand-danger/5" : ""
                        }`}
                        data-tool-row
                      >
                        <div className="mb-3 flex items-center justify-between md:hidden">
                          <div className="flex items-center gap-2">
                            <SignalBadge>{meta.catLabel}</SignalBadge>
                            <p className="mono-value text-sm font-semibold">
                              {TOOLS.find((tool) => tool.id === toolId)?.name ?? "Tool"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fields.remove(index)}
                            disabled={fields.fields.length === 1}
                            className="pill-action pill-action-secondary !px-3 !py-1.5 !text-[0.56rem] disabled:pointer-events-none disabled:opacity-40"
                          >
                            remove
                          </button>
                        </div>

                        <div className="grid gap-3 md:hidden">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="kicker mb-1 block">Tool</label>
                              <select {...register(`tools.${index}.toolId`)} className="input-field select-field text-xs">
                                {TOOLS.map((tool) => (
                                  <option key={tool.id} value={tool.id}>
                                    {tool.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="kicker mb-1 block">Plan</label>
                              <select {...register(`tools.${index}.planId`)} className="input-field select-field text-xs">
                                {plans.map((plan) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="kicker mb-1 block">Seats</label>
                              <input
                                type="number"
                                min={1}
                                {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                                className="input-field text-xs"
                                aria-invalid={Boolean(rowErrors?.seats)}
                              />
                            </div>
                            <div>
                              <label className="kicker mb-1 block">Spend/mo</label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                                className="input-field text-xs"
                                aria-invalid={Boolean(rowErrors?.monthlySpend)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="hidden grid-cols-[2fr_1.4fr_90px_110px_44px] items-center gap-3 md:grid">
                          <select {...register(`tools.${index}.toolId`)} className="input-field select-field text-xs">
                            {TOOLS.map((tool) => (
                              <option key={tool.id} value={tool.id}>
                                {tool.name}
                              </option>
                            ))}
                          </select>
                          <select {...register(`tools.${index}.planId`)} className="input-field select-field text-xs">
                            {plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                            className="input-field text-center text-xs"
                            aria-invalid={Boolean(rowErrors?.seats)}
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                            className="input-field text-xs"
                            aria-invalid={Boolean(rowErrors?.monthlySpend)}
                          />
                          <button
                            type="button"
                            onClick={() => fields.remove(index)}
                            disabled={fields.fields.length === 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-xs text-brand-textSub transition hover:border-brand-danger/45 hover:text-brand-danger disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Remove tool row"
                          >
                            x
                          </button>
                        </div>

                        {expected > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-border/70 pt-3">
                            <p className="kicker">
                              List price {formatCurrency(expected)}/mo
                            </p>
                            {overBudget && <SignalBadge tone="warn">Above list</SignalBadge>}
                            {underBudget && <SignalBadge tone="ok">Below list</SignalBadge>}
                          </div>
                        )}
                        {rowErrorMessage && (
                          <p className="mt-2 text-sm text-brand-danger">{String(rowErrorMessage)}</p>
                        )}
                      </article>
                    );
                  })}
                </div>

                {!!errors.tools && (
                  <p className="mt-3 text-sm text-brand-danger">
                    One or more tool rows need fixes. Check highlighted rows.
                  </p>
                )}

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
                  className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-brand-borderStrong bg-brand-surface2/55 px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-textSub transition hover:border-brand-accent hover:bg-brand-surface"
                >
                  + Add tool
                </button>
              </section>
            )}

            {step === 3 && (
              <section className="frame-shell p-6 md:p-7" data-step-panel>
                <div className="border-b border-brand-border pb-5">
                  <p className="kicker">step 03 / pre-flight review</p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-text">Confirm before running audit</h2>
                  <p className="serif-body mt-2 text-sm">
                    Review declaration quality before the engine runs.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile label="Headcount" value={`${teamSize} people`} />
                  <MetricTile label="Use case" value={primaryUseCase.toUpperCase()} />
                  <MetricTile label="Total spend" value={`${formatCurrency(totalSpend)}/mo`} />
                  <MetricTile label="Tools" value={`${watchedTools.length} declared`} />
                </div>

                <div className="mt-5 space-y-3">
                  {watchedTools.map((tool, index) => {
                    const toolMeta = TOOLS.find((item) => item.id === tool.toolId);
                    const planMeta = toolMeta?.plans.find((plan) => plan.id === tool.planId);
                    const meta = TOOL_META[tool.toolId] ?? { catLabel: "Tool" };
                    return (
                      <article
                        key={`${tool.toolId}-${index}`}
                        className="panel-raised flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <SignalBadge>{meta.catLabel}</SignalBadge>
                          <div>
                            <p className="mono-value text-sm font-semibold text-brand-text">
                              {toolMeta?.name ?? tool.toolId}
                            </p>
                            <p className="kicker mt-1">
                              {planMeta?.name} | {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="mono-value text-sm font-semibold">{formatCurrency(tool.monthlySpend)}/mo</p>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="pill-action pill-action-secondary !px-3 !py-1.5 !text-[0.56rem]"
                          >
                            Edit
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <article className="panel mt-5 px-4 py-4">
                  <p className="serif-body text-sm">
                    The audit engine will run {watchedTools.length * 10} rule checks: overlap, plan fit,
                    seat right-sizing, benchmark comparison, and credit arbitrage signals.
                  </p>
                </article>
              </section>
            )}

            {error && (
              <article
                className="editorial-card border-brand-danger/40 bg-brand-danger/10 px-4 py-3"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-2">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-danger" />
                  <div>
                    <p className="kicker !text-brand-danger/90">submission error</p>
                    <p className="mt-1 text-sm text-brand-danger">{error}</p>
                  </div>
                </div>
              </article>
            )}

            <section className="frame-shell px-4 py-4 md:px-5 md:py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(current - 1, 1))}
                  disabled={step === 1 || isSubmitting}
                  className="pill-action pill-action-secondary min-w-[8rem] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
                >
                  Back
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="pill-action pill-action-primary min-w-[9rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="pill-action pill-action-primary min-w-[10rem] disabled:pointer-events-none disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
                  >
                    {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-surface2 border-t-brand-surface" />
                        Running audit...
                        </span>
                      ) : (
                      "Run my audit"
                    )}
                  </button>
                )}
              </div>
              <p className="serif-body mt-3 text-xs" role="status" aria-live="polite">
                Step {step} of 3. Draft autosaves in this browser.
              </p>
            </section>
          </form>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
          <div className="frame-shell p-5">
            <p className="kicker">Live context</p>
            <div className="mt-4 space-y-3">
              <MetricTile label="Step" value={`0${step} / 03`} />
              <MetricTile label="Tools declared" value={`${watchedTools.length}`} />
              <MetricTile label="Current total" value={`${formatCurrency(totalSpend)}/mo`} />
            </div>
            <div className="mt-4 border-t border-brand-border pt-3">
              <p className="serif-body text-xs">
                Keep this card visible while tuning tools and plans.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

