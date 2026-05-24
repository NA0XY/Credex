export type BenchmarkCohort = "solo" | "seed" | "series-a" | "growth";

export interface BenchmarkProfile {
  cohort: BenchmarkCohort;
  label: string;
  teamSizeRange: [number, number];
  avgPerDevPerMonth: number;
  p25PerDevPerMonth: number;
  medianPerDevPerMonth: number;
  p75PerDevPerMonth: number;
  commonTools: string[];
  insight: string;
}

export const BENCHMARKS: BenchmarkProfile[] = [
  {
    cohort: "solo",
    label: "Solo / 2-person",
    teamSizeRange: [1, 2],
    avgPerDevPerMonth: 38,
    p25PerDevPerMonth: 20,
    medianPerDevPerMonth: 35,
    p75PerDevPerMonth: 55,
    commonTools: ["cursor", "claude", "chatgpt"],
    insight: "Solo builders often over-index on chat subscriptions. One Pro plan usually covers needs.",
  },
  {
    cohort: "seed",
    label: "Seed Stage (3-8 people)",
    teamSizeRange: [3, 8],
    avgPerDevPerMonth: 52,
    p25PerDevPerMonth: 28,
    medianPerDevPerMonth: 45,
    p75PerDevPerMonth: 72,
    commonTools: ["cursor", "github-copilot", "claude", "chatgpt"],
    insight: "Seed teams frequently add tools as team grows without removing old ones. Overlap is common.",
  },
  {
    cohort: "series-a",
    label: "Series A (9-30 people)",
    teamSizeRange: [9, 30],
    avgPerDevPerMonth: 48,
    p25PerDevPerMonth: 30,
    medianPerDevPerMonth: 42,
    p75PerDevPerMonth: 65,
    commonTools: ["cursor", "claude", "openai-api"],
    insight: "At this stage, API direct spend often outgrows subscription value. Audit both.",
  },
  {
    cohort: "growth",
    label: "Growth (31+ people)",
    teamSizeRange: [31, 9999],
    avgPerDevPerMonth: 35,
    p25PerDevPerMonth: 22,
    medianPerDevPerMonth: 30,
    p75PerDevPerMonth: 48,
    commonTools: ["cursor", "github-copilot", "anthropic-api"],
    insight: "Larger teams typically negotiate enterprise contracts. Retail pricing is rarely competitive.",
  },
];

export function getBenchmarkForTeam(teamSize: number): BenchmarkProfile {
  return (
    BENCHMARKS.find(
      (benchmark) => teamSize >= benchmark.teamSizeRange[0] && teamSize <= benchmark.teamSizeRange[1]
    ) ?? BENCHMARKS[BENCHMARKS.length - 1]
  );
}

export interface BenchmarkComparison {
  cohort: BenchmarkCohort;
  cohortLabel: string;
  yourCpdPerMonth: number;
  medianCpdPerMonth: number;
  p75CpdPerMonth: number;
  percentile: "below-p25" | "p25-median" | "median-p75" | "above-p75";
  verdict: string;
  insight: string;
}

export function compareToBenchmark(teamSize: number, totalMonthlyCost: number): BenchmarkComparison {
  const profile = getBenchmarkForTeam(teamSize);
  const costPerDeveloper = totalMonthlyCost / Math.max(teamSize, 1);

  let percentile: BenchmarkComparison["percentile"];
  if (costPerDeveloper < profile.p25PerDevPerMonth) percentile = "below-p25";
  else if (costPerDeveloper < profile.medianPerDevPerMonth) percentile = "p25-median";
  else if (costPerDeveloper < profile.p75PerDevPerMonth) percentile = "median-p75";
  else percentile = "above-p75";

  const verdictMap: Record<BenchmarkComparison["percentile"], string> = {
    "below-p25": "Well below median - lean stack",
    "p25-median": "Below median - efficient",
    "median-p75": "Above median - room to optimize",
    "above-p75": "Top quartile spend - strong optimization signal",
  };

  return {
    cohort: profile.cohort,
    cohortLabel: profile.label,
    yourCpdPerMonth: Math.round(costPerDeveloper),
    medianCpdPerMonth: profile.medianPerDevPerMonth,
    p75CpdPerMonth: profile.p75PerDevPerMonth,
    percentile,
    verdict: verdictMap[percentile],
    insight: profile.insight,
  };
}
