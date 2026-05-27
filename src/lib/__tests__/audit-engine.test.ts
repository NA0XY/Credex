import { describe, expect, it } from "vitest";
import { runAudit } from "@/lib/audit-engine";

describe("Audit Engine", () => {
  it("detects Claude Team plan overkill for small teams", () => {
    const result = runAudit({
      tools: [{ toolId: "claude", planId: "team", seats: 2, monthlySpend: 60, primaryUseCase: "writing" }],
      teamSize: 2,
      primaryUseCase: "writing",
    });

    const claudeResult = result.tools.find((tool) => tool.toolId === "claude");
    expect(claudeResult?.bestRecommendation.type).toBe("downgrade");
    expect(claudeResult?.bestRecommendation.monthlySavings ?? 0).toBeGreaterThan(0);
  });

  it("flags duplicate coverage for Cursor + Copilot on same team", () => {
    const result = runAudit({
      tools: [
        { toolId: "cursor", planId: "pro", seats: 5, monthlySpend: 100, primaryUseCase: "coding" },
        {
          toolId: "github-copilot",
          planId: "individual",
          seats: 5,
          monthlySpend: 50,
          primaryUseCase: "coding",
        },
      ],
      teamSize: 5,
      primaryUseCase: "coding",
    });

    const copilotResult = result.tools.find((tool) => tool.toolId === "github-copilot");
    expect(copilotResult?.bestRecommendation.type).toBe("switch");
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it("returns optimal result for correctly sized stack", () => {
    const result = runAudit({
      tools: [{ toolId: "cursor", planId: "pro", seats: 3, monthlySpend: 60, primaryUseCase: "coding" }],
      teamSize: 3,
      primaryUseCase: "coding",
    });

    expect(result.savingsTier).toBe("optimal");
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("correctly calculates total monthly and annual savings", () => {
    const result = runAudit({
      tools: [
        { toolId: "claude", planId: "team", seats: 2, monthlySpend: 60, primaryUseCase: "writing" },
        { toolId: "chatgpt", planId: "plus", seats: 2, monthlySpend: 40, primaryUseCase: "writing" },
      ],
      teamSize: 2,
      primaryUseCase: "writing",
    });

    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
    expect(result.totalCurrentMonthlyCost).toBe(100);
  });

  it("marks credexRelevant true when savings exceed $500/mo", () => {
    const result = runAudit({
      tools: [
        { toolId: "claude", planId: "max", seats: 10, monthlySpend: 1000, primaryUseCase: "writing" },
        { toolId: "chatgpt", planId: "team", seats: 10, monthlySpend: 300, primaryUseCase: "writing" },
        { toolId: "cursor", planId: "business", seats: 10, monthlySpend: 400, primaryUseCase: "coding" },
      ],
      teamSize: 5,
      primaryUseCase: "mixed",
    });

    expect(result.credexRelevant).toBe(true);
    expect(result.savingsTier).toBe("high");
  });

  it("detects over-seating (more seats than team size)", () => {
    const result = runAudit({
      tools: [{ toolId: "cursor", planId: "pro", seats: 10, monthlySpend: 200, primaryUseCase: "coding" }],
      teamSize: 5,
      primaryUseCase: "coding",
    });

    const cursorResult = result.tools.find((tool) => tool.toolId === "cursor");
    expect(cursorResult?.bestRecommendation.type).toBe("righsize");
    expect(cursorResult?.bestRecommendation.monthlySavings ?? 0).toBeGreaterThan(0);
  });

  it("generates audit result with correct schema shape", () => {
    const result = runAudit({
      tools: [{ toolId: "chatgpt", planId: "plus", seats: 1, monthlySpend: 20, primaryUseCase: "writing" }],
      teamSize: 1,
      primaryUseCase: "writing",
    });

    expect(result).toHaveProperty("tools");
    expect(result).toHaveProperty("totalCurrentMonthlyCost");
    expect(result).toHaveProperty("totalMonthlySavings");
    expect(result).toHaveProperty("totalAnnualSavings");
    expect(result).toHaveProperty("savingsTier");
    expect(result).toHaveProperty("credexRelevant");
    expect(result.tools[0]).toHaveProperty("bestRecommendation");
  });

  it("computeStackScore returns valid grade for well-optimized stack", () => {
    const result = runAudit({
      tools: [{ toolId: "cursor", planId: "pro", seats: 3, monthlySpend: 60, primaryUseCase: "coding" }],
      teamSize: 3,
      primaryUseCase: "coding",
    });

    expect(result.stackScore).toBeDefined();
    expect(["A", "B", "C", "D", "F"]).toContain(result.stackScore.grade);
    expect(result.stackScore.total).toBeGreaterThanOrEqual(0);
    expect(result.stackScore.total).toBeLessThanOrEqual(100);
  });

  it("benchmark comparison returns cohort for team size", () => {
    const result = runAudit({
      tools: [{ toolId: "claude", planId: "pro", seats: 10, monthlySpend: 200, primaryUseCase: "writing" }],
      teamSize: 10,
      primaryUseCase: "writing",
    });

    expect(result.benchmarkComparison).toBeDefined();
    expect(result.benchmarkComparison.yourCpdPerMonth).toBe(20);
    expect(result.benchmarkComparison.cohortLabel).toBeDefined();
    expect(result.benchmarkComparison.p75CpdPerMonth).toBe(65);
  });

  it("adds priceChangeAlert to tools with recent changes", () => {
    const result = runAudit({
      tools: [{ toolId: "cursor", planId: "business", seats: 5, monthlySpend: 200, primaryUseCase: "coding" }],
      teamSize: 5,
      primaryUseCase: "coding",
    });

    const cursorTool = result.tools.find((tool) => tool.toolId === "cursor");
    expect(cursorTool?.bestRecommendation.priceChangeAlert).toBeDefined();
  });

  it("includes confidence reasons and opportunity contract on actionable recommendations", () => {
    const result = runAudit({
      tools: [{ toolId: "claude", planId: "team", seats: 2, monthlySpend: 60, primaryUseCase: "writing" }],
      teamSize: 2,
      primaryUseCase: "writing",
    });

    const rec = result.tools[0]?.bestRecommendation;
    expect(rec.confidenceReasons?.length).toBeGreaterThan(0);
    expect(rec.opportunity).toBeDefined();
    expect(rec.opportunity?.ruleId).toBeDefined();
    expect(rec.opportunity?.monthlySavings).toBe(rec.monthlySavings);
  });

  it("unknown tools stay deterministic with low confidence and no fake savings", () => {
    const result = runAudit({
      tools: [{ toolId: "unknown-tool", planId: "unknown-plan", seats: 3, monthlySpend: 90, primaryUseCase: "coding" }],
      teamSize: 3,
      primaryUseCase: "coding",
    });

    const rec = result.tools[0]?.bestRecommendation;
    expect(rec.confidence).toBe("low");
    expect(result.tools[0]?.recommendations[0]?.confidence).toBe("low");
    expect(result.tools[0]?.recommendations[0]?.monthlySavings).toBe(0);
    expect(result.tools[0]?.recommendations[0]?.opportunity?.action).toBe("none");
  });

  it("duplicate coverage rule does not duplicate the same recommendation entry", () => {
    const result = runAudit({
      tools: [
        { toolId: "cursor", planId: "pro", seats: 6, monthlySpend: 120, primaryUseCase: "coding" },
        { toolId: "github-copilot", planId: "individual", seats: 6, monthlySpend: 60, primaryUseCase: "coding" },
      ],
      teamSize: 6,
      primaryUseCase: "coding",
    });

    const copilotResult = result.tools.find((tool) => tool.toolId === "github-copilot");
    const switchRecs = (copilotResult?.recommendations ?? []).filter(
      (rec) => rec.type === "switch" && rec.targetToolId === "cursor"
    );
    expect(switchRecs.length).toBe(1);
  });

  it("legacy mode strips opportunity payload for backward compatibility", () => {
    const result = runAudit(
      {
        tools: [{ toolId: "claude", planId: "team", seats: 2, monthlySpend: 60, primaryUseCase: "writing" }],
        teamSize: 2,
        primaryUseCase: "writing",
      },
      { mode: "legacy" }
    );

    const rec = result.tools[0]?.bestRecommendation;
    expect(rec).toBeDefined();
    expect(rec?.opportunity).toBeUndefined();
    expect(result.engineMeta?.engineMode).toBe("legacy");
  });

  it("v2 mode keeps opportunity payload by default", () => {
    const result = runAudit(
      {
        tools: [{ toolId: "claude", planId: "team", seats: 2, monthlySpend: 60, primaryUseCase: "writing" }],
        teamSize: 2,
        primaryUseCase: "writing",
      },
      { mode: "v2lite" }
    );

    const rec = result.tools[0]?.bestRecommendation;
    expect(rec).toBeDefined();
    expect(rec?.opportunity).toBeDefined();
    expect(result.engineMeta?.engineMode).toBe("v2lite");
  });
});
