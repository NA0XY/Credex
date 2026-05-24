"use client";

import { useMemo, useState } from "react";
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
    <div className="panel">
      <div className="border-b border-brand-border px-5 py-3">
        <span className="kicker">WHAT-IF SIMULATOR</span>
      </div>
      <div className="px-5 py-5">
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
                    className="relative flex h-9 w-14 items-center rounded-full border transition-all"
                    style={{ background: isOn ? "rgba(255,138,61,0.2)" : "rgba(20,30,42,0.7)", borderColor: isOn ? "#FF8A3D" : "rgba(181,194,210,0.26)" }}
                    aria-pressed={isOn}
                    aria-label={`Toggle ${tool.toolName} recommendation`}
                  >
                    <span
                      className="absolute h-5 w-5 rounded-full transition-all"
                      style={{ left: isOn ? "calc(100% - 24px)" : "4px", background: isOn ? "#FF8A3D" : "#6F86A2" }}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-brand-text" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>{tool.toolName}</p>
                    <p className="text-xs text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>{truncateReason(tool.bestRecommendation.reason)}</p>
                    <p className="kicker mt-1" style={{ fontSize: "0.54rem", color: isOn ? "#FF6B00" : "#877B6B" }}>
                      {isOn ? "Included in scenario" : "Excluded from scenario"}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-bold tabular-nums" style={{ color: isOn ? "#FF6B00" : "#504840" }}>
                    {isOn ? `-${formatCurrency(tool.bestRecommendation.monthlySavings)}/mo` : `+${formatCurrency(tool.bestRecommendation.monthlySavings)}/mo`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="ruling my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div className="panel-raised px-4 py-3">
            <span className="kicker" style={{ fontSize: "0.58rem" }}>PROJECTED MONTHLY</span>
            <p className="mono-value mt-1 text-xl font-bold tabular-nums">{formatCurrency(simulatedMonthly)}</p>
            {simulatedSavings > 0 && <p className="kicker mt-0.5" style={{ fontSize: "0.55rem", color: "#2E7D52" }}>DOWN FROM {formatCurrency(totalCurrentMonthly)}</p>}
          </div>
          <div className="panel-raised px-4 py-3">
            <span className="kicker" style={{ fontSize: "0.58rem" }}>{accepted.size}/{actionableTools.length} CHANGES ACCEPTED</span>
            <p className="mono-value mt-1 text-xl font-bold tabular-nums">{simulatedSavings > 0 ? `-${formatCurrency(simulatedSavings)}/mo` : "$0/mo"}</p>
            {simulatedSavings > 0 && <p className="kicker mt-0.5" style={{ fontSize: "0.55rem", color: "#2E7D52" }}>= {formatCurrency(simulatedSavings * 12)}/YEAR</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
