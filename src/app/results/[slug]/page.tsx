import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedCounter } from "@/components/animated-counter";
import { Logo } from "@/components/logo";
import { EmailCaptureForm } from "@/components/results/email-capture-form";
import { ResultActions } from "@/components/results/result-actions";
import { getAuditBySlug } from "@/lib/audit-store";
import { formatCurrency } from "@/lib/format";
import { generateFallbackSummary } from "@/lib/summary";
import type { ToolAuditResult } from "@/types/audit";

interface ResultPageProps {
  params: Promise<{ slug: string }>;
}

const REC_CONFIG: Record<string, { short: string; cls: string }> = {
  downgrade: { short: "Downgrade", cls: "badge-downgrade" },
  switch: { short: "Switch", cls: "badge-switch" },
  righsize: { short: "Right-size", cls: "badge-righsize" },
  credits: { short: "Credits", cls: "badge-credits" },
  ok: { short: "Optimal", cls: "badge-ok" },
};

const TOOL_META: Record<string, { dot: string }> = {
  cursor: { dot: "bg-sky-300" },
  "github-copilot": { dot: "bg-indigo-300" },
  claude: { dot: "bg-amber-200" },
  chatgpt: { dot: "bg-emerald-300" },
  "anthropic-api": { dot: "bg-orange-300" },
  "openai-api": { dot: "bg-zinc-300" },
  gemini: { dot: "bg-cyan-300" },
  windsurf: { dot: "bg-purple-300" },
};

function SavingsTierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    high: { label: "High savings found", cls: "border-brand-danger/40 bg-brand-danger/10 text-brand-danger" },
    medium: { label: "Savings found", cls: "border-brand-warning/40 bg-brand-warning/10 text-brand-warning" },
    low: { label: "Minor savings", cls: "border-sky-300/40 bg-sky-400/10 text-sky-100" },
    optimal: { label: "Stack optimized", cls: "border-brand-accent/40 bg-brand-accent/10 text-brand-accent" },
  };
  const style = map[tier] ?? map.low;
  return <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${style.cls}`}>{style.label}</span>;
}

function ToolCard({ tool, rank }: { tool: ToolAuditResult; rank: number }) {
  const rec = tool.bestRecommendation;
  const hasSavings = rec.monthlySavings > 0;
  const recConf = REC_CONFIG[rec.type] ?? REC_CONFIG.ok;
  const meta = TOOL_META[tool.toolId] ?? { dot: "bg-white/70" };

  return (
    <article className="orbital-panel p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${meta.dot}`} />
          <div>
            <p className="kicker mb-1">#{rank.toString().padStart(2, "0")} Recommendation</p>
            <h3 className="text-lg font-semibold text-brand-text">{tool.toolName}</h3>
            <p className="text-xs text-brand-muted">
              {tool.currentPlan} - {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono text-3xl font-semibold text-brand-text">{formatCurrency(tool.currentMonthlyCost)}</p>
          <p className="text-xs text-brand-muted">monthly baseline</p>
          {hasSavings ? <p className="mt-1 text-xs text-brand-accent">save {formatCurrency(rec.monthlySavings)}/mo</p> : null}
        </div>
      </div>

      <div className="rounded-xl border border-white/14 bg-black/38 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${recConf.cls}`}>{recConf.short}</span>
          <p className="kicker">Action brief</p>
        </div>
        <p className="text-sm leading-relaxed text-brand-text">{rec.reason}</p>

        {hasSavings ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="kicker">Monthly</p>
              <p className="font-mono text-lg text-brand-accent">{formatCurrency(rec.monthlySavings)}</p>
            </div>
            <div>
              <p className="kicker">Annual</p>
              <p className="font-mono text-lg text-brand-accent">{formatCurrency(rec.annualSavings)}</p>
            </div>
            <div>
              <p className="kicker">Confidence</p>
              <p className="font-mono text-lg capitalize text-brand-textSub">{rec.confidence}</p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) {
    return { title: "Audit not found | Credex", description: "This audit may have expired." };
  }

  return {
    title: `AI Spend Audit - Save $${audit.totalAnnualSavings}/yr | Credex`,
    description: `Found $${audit.totalMonthlySavings}/mo in optimization opportunities across ${audit.auditResult.tools.length} tools.`,
    openGraph: {
      title: `I could save $${audit.totalAnnualSavings}/year on AI tools`,
      description: `Credex audited my stack and found $${audit.totalMonthlySavings}/mo in savings.`,
      images: ["/og-image.svg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit - $${audit.totalAnnualSavings}/yr savings found`,
      images: ["/og-image.svg"],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) notFound();

  const result = audit.auditResult;
  const summary =
    audit.aiSummary ||
    generateFallbackSummary(result, {
      teamSize: audit.teamSize,
      primaryUseCase: audit.primaryUseCase,
      tools: audit.tools,
    });

  const orderedTools = [...result.tools].sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black bg-grid text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_8%,rgba(142,197,255,0.16),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/82" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_12%_22%,rgba(142,197,255,0.12),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(99,152,224,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-24 [background-image:linear-gradient(to_right,rgba(145,180,230,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(145,180,230,0.12)_1px,transparent_1px)] [background-size:40px_40px]" />

      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass frame-edge mx-auto flex w-full max-w-6xl items-center justify-between rounded-full px-6 py-3">
          <Logo />
          <ResultActions slug={slug} />
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6">
        <section className="orbital-panel mb-10 p-8 sm:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <SavingsTierBadge tier={result.savingsTier} />
            <span className="text-sm text-brand-muted">
              {result.tools.length} tools reviewed - {new Date(audit.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="kicker mb-4">Projected annual savings</p>
              <p className="font-mono text-[clamp(3rem,8vw,5.4rem)] font-semibold leading-none text-brand-accent">
                <AnimatedCounter value={result.totalAnnualSavings} prefix="$" suffix="" />
              </p>
              <p className="mt-2 text-2xl text-brand-textSub">per year</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/14 bg-black/38 p-4">
                <p className="kicker mb-2">Monthly savings</p>
                <p className="font-mono text-4xl font-semibold text-brand-accent">{formatCurrency(result.totalMonthlySavings)}</p>
              </div>
              <div className="rounded-xl border border-white/14 bg-black/38 p-4">
                <p className="kicker mb-2">Current monthly spend</p>
                <p className="font-mono text-4xl font-semibold text-brand-text">{formatCurrency(result.totalCurrentMonthlyCost)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-text">Tool-by-tool breakdown</h2>
            <p className="kicker">ranked by monthly impact</p>
          </div>

          <div className="space-y-4">
            {orderedTools.map((tool, index) => (
              <ToolCard key={`${tool.toolId}-${tool.currentPlan}`} tool={tool} rank={index + 1} />
            ))}
          </div>
        </section>

        <section className="orbital-panel mb-10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
            <p className="kicker">AI summary generated by Groq</p>
          </div>
          <p className="leading-relaxed text-brand-textSub">{summary}</p>
        </section>

        {result.totalMonthlySavings > 500 ? (
          <section className="orbital-panel mb-10 p-6 sm:p-8">
            <p className="kicker mb-2">Credex execution support</p>
            <h3 className="mb-3 text-2xl font-semibold text-brand-text">Capture more savings in renewal cycles</h3>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-brand-textSub">
              At {formatCurrency(result.totalCurrentMonthlyCost)}/mo exposure, your team can likely unlock additional value through contract structure, seat policy updates, and strategic credit routes.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-accent/45 bg-brand-accent/14 px-5 py-3 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/24"
            >
              Book a 20-min savings consult
            </a>
          </section>
        ) : null}

        {result.savingsTier === "optimal" ? (
          <section className="orbital-panel mb-10 p-6">
            <p className="kicker mb-2">Status</p>
            <h3 className="mb-2 text-xl font-semibold text-brand-text">Current stack is well aligned</h3>
            <p className="text-sm leading-relaxed text-brand-textSub">
              No major waste patterns were detected. Re-run the audit when team size, billing cadence, or vendor plans change.
            </p>
          </section>
        ) : null}

        <div className="mb-6 text-center">
          <Link href="/audit" className="text-sm text-brand-muted underline underline-offset-2 transition-colors hover:text-brand-text">
            Run a new audit with different inputs
          </Link>
        </div>

        <EmailCaptureForm auditSlug={slug} />
      </main>
    </div>
  );
}
