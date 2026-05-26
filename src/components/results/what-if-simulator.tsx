"use client";

import { useMemo, useState } from "react";
import { FrameShell, SignalBadge } from "@/components/editorial/primitives";
import { formatCurrency } from "@/lib/format";
import type { ToolAuditResult } from "@/types/audit";

interface WhatIfSimulatorProps {
  tools: ToolAuditResult[];
  totalCurrentMonthly: number;
}

function truncateReason(reason: string): string {
  return reason.length > 60 ? `${reason.slice(0, 60)}...` : reason;
}

export function WhatIfSimulator({ tools, totalCurrentMonthly }: WhatIfSimulatorProps) {
  const actionableTools = useMemo(
    () => tools.filter((tool) => tool.bestRecommendation.type !== "ok" && tool.bestRecommendation.monthlySavings > 0),
    [tools]
  );
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const toggleTool = (toolId: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const simulatedSavings = useMemo(
    () => actionableTools.filter((tool) => accepted.has(tool.toolId)).reduce((sum, tool) => sum + tool.bestRecommendation.monthlySavings, 0),
    [accepted, actionableTools]
  );

  const simulatedMonthly = totalCurrentMonthly - simulatedSavings;

  if (actionableTools.length === 0) return null;

  return (
    <FrameShell>
      <div className="border-b border-brand-border px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="kicker">What-if simulator</span>
          <SignalBadge tone="neutral">Client side model</SignalBadge>
        </div>
      </div>
      <div className="px-5 py-5 md:px-6 md:py-6">
        <p className="mb-5 text-sm text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>
          Toggle recommendations to model your savings. Changes are calculated client-side with no API calls.
        </p>

        <div className="space-y-0 divide-y divide-brand-border">
          {actionableTools.map((tool) => {
            const isOn = accepted.has(tool.toolId);
            return (
              <div key={tool.toolId} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTool(tool.toolId)}
                    className="relative flex h-9 w-14 items-center rounded-full border transition-all duration-[220ms]"
                    style={{
                      background: isOn
                        ? "rgba(47, 182, 124, 0.22)"
                        : "rgba(241, 243, 246, 0.9)",
                      borderColor: isOn ? "var(--color-brand)" : "rgba(107, 114, 128, 0.35)",
                    }}
                    aria-pressed={isOn}
                    aria-label={`Toggle ${tool.toolName} recommendation`}
                  >
                    <span
                      className="absolute h-5 w-5 rounded-full transition-all"
                      style={{
                        left: isOn ? "calc(100% - 24px)" : "4px",
                        background: isOn ? "var(--color-brand)" : "var(--color-ink-muted)",
                      }}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-brand-text" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>{tool.toolName}</p>
                    <p className="text-xs text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>{truncateReason(tool.bestRecommendation.reason)}</p>
                    <p
                      className="kicker mt-1"
                      style={{
                        fontSize: "0.54rem",
                        color: isOn ? "var(--color-brand)" : "var(--color-ink-muted)",
                      }}
                    >
                      {isOn ? "Included in scenario" : "Excluded from scenario"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="mono-value text-sm font-bold tabular-nums"
                    style={{ color: isOn ? "var(--color-brand)" : "var(--color-ink-soft)" }}
                  >
                    {isOn ? `-${formatCurrency(tool.bestRecommendation.monthlySavings)}/mo` : `+${formatCurrency(tool.bestRecommendation.monthlySavings)}/mo`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="ruling my-4" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="panel-raised px-4 py-3">
            <span className="kicker" style={{ fontSize: "0.58rem" }}>
              Projected monthly
            </span>
            <p className="mono-value mt-1 text-xl font-bold tabular-nums">{formatCurrency(simulatedMonthly)}</p>
            {simulatedSavings > 0 && (
              <p className="kicker mt-0.5" style={{ fontSize: "0.55rem", color: "var(--color-brand)" }}>
                Down from {formatCurrency(totalCurrentMonthly)}
              </p>
            )}
          </div>
          <div className="panel-raised px-4 py-3">
            <span className="kicker" style={{ fontSize: "0.58rem" }}>
              {accepted.size}/{actionableTools.length} changes accepted
            </span>
            <p className="mono-value mt-1 text-xl font-bold tabular-nums">{simulatedSavings > 0 ? `-${formatCurrency(simulatedSavings)}/mo` : "$0/mo"}</p>
            {simulatedSavings > 0 && (
              <p className="kicker mt-0.5" style={{ fontSize: "0.55rem", color: "var(--color-brand)" }}>
                = {formatCurrency(simulatedSavings * 12)}/year
              </p>
            )}
          </div>
        </div>
      </div>
    </FrameShell>
  );
}
