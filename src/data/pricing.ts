import type { UseCase } from "@/types/audit";

export interface Plan {
  id: string;
  name: string;
  pricePerUserPerMonth: number;
  priceFlat?: number;
  minSeats?: number;
  maxSeats?: number;
  bestFor: UseCase[];
  features: string[];
  apiIncluded: boolean;
  contextWindow?: string;
}

export interface Tool {
  id: string;
  name: string;
  category: "coding" | "chat" | "api";
  plans: Plan[];
  officialPricingUrl: string;
  lastVerified: string;
  recentChanges?: Array<{
    date: string;
    note: string;
  }>;
}

const lastVerified = "2026-05-21";

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    officialPricingUrl: "https://www.cursor.com/pricing",
    lastVerified,
    recentChanges: [
      { date: "2025-09", note: "Business plan increased from $32 to $40/seat/mo" },
    ],
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        pricePerUserPerMonth: 0,
        bestFor: ["coding"],
        features: ["2000 completions/mo", "Limited Claude access"],
        apiIncluded: false,
      },
      {
        id: "pro",
        name: "Pro",
        pricePerUserPerMonth: 20,
        bestFor: ["coding"],
        features: ["Unlimited completions", "GPT and Claude access", "10 o1 uses/day"],
        apiIncluded: false,
      },
      {
        id: "business",
        name: "Business",
        pricePerUserPerMonth: 40,
        bestFor: ["coding"],
        features: ["All Pro features", "Admin dashboard", "SSO"],
        apiIncluded: false,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 0,
        bestFor: ["coding"],
        features: ["Custom pricing", "On-prem option"],
        apiIncluded: false,
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    officialPricingUrl: "https://github.com/features/copilot#pricing",
    lastVerified,
    recentChanges: [
      { date: "2025-12", note: "Individual plan now includes code review features" },
    ],
    plans: [
      {
        id: "individual",
        name: "Individual",
        pricePerUserPerMonth: 10,
        bestFor: ["coding"],
        features: ["Code completion", "Chat"],
        apiIncluded: false,
      },
      {
        id: "business",
        name: "Business",
        pricePerUserPerMonth: 19,
        bestFor: ["coding"],
        features: ["All Individual", "Policy management", "Audit logs"],
        apiIncluded: false,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 39,
        bestFor: ["coding"],
        features: ["All Business", "Fine-tuned models", "Copilot Workspace"],
        apiIncluded: false,
      },
    ],
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    officialPricingUrl: "https://www.anthropic.com/pricing",
    lastVerified,
    recentChanges: [
      { date: "2026-02", note: "Max plan ($100/mo) introduced; Pro usage limits unchanged" },
    ],
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerUserPerMonth: 0,
        bestFor: ["writing", "research", "mixed"],
        features: ["Claude Haiku", "Limited messages"],
        apiIncluded: false,
      },
      {
        id: "pro",
        name: "Pro",
        pricePerUserPerMonth: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["Claude Sonnet", "5x more usage", "Projects"],
        apiIncluded: false,
      },
      {
        id: "max",
        name: "Max",
        pricePerUserPerMonth: 100,
        bestFor: ["writing", "research", "mixed"],
        features: ["5x Pro usage", "Extended thinking"],
        apiIncluded: false,
      },
      {
        id: "team",
        name: "Team",
        pricePerUserPerMonth: 30,
        minSeats: 5,
        bestFor: ["writing", "research", "mixed"],
        features: ["All Pro", "Admin dashboard", "Higher limits"],
        apiIncluded: false,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 0,
        bestFor: ["writing", "research", "mixed", "coding"],
        features: ["Custom pricing", "SSO", "Custom retention"],
        apiIncluded: false,
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    officialPricingUrl: "https://openai.com/chatgpt/pricing/",
    lastVerified,
    recentChanges: [
      { date: "2026-01", note: "Team plan requires minimum 2 seats (was 1)" },
    ],
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerUserPerMonth: 0,
        bestFor: ["writing", "research", "mixed"],
        features: ["GPT-4o mini", "Limited GPT-4o"],
        apiIncluded: false,
      },
      {
        id: "plus",
        name: "Plus",
        pricePerUserPerMonth: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["GPT-4o", "DALL-E 3", "Advanced data analysis"],
        apiIncluded: false,
      },
      {
        id: "team",
        name: "Team",
        pricePerUserPerMonth: 30,
        minSeats: 2,
        bestFor: ["writing", "research", "mixed"],
        features: ["All Plus", "Admin workspace", "Data not used for training"],
        apiIncluded: false,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 0,
        bestFor: ["writing", "research", "mixed", "coding"],
        features: ["Custom", "Unlimited GPT-4", "SSO", "SCIM"],
        apiIncluded: false,
      },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    officialPricingUrl: "https://www.anthropic.com/pricing#api",
    lastVerified,
    plans: [
      {
        id: "api",
        name: "API (Pay-per-use)",
        pricePerUserPerMonth: 0,
        bestFor: ["coding", "data", "mixed"],
        features: ["Claude Haiku", "Claude Sonnet 4", "Claude Opus"],
        apiIncluded: true,
      },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    officialPricingUrl: "https://openai.com/api/pricing/",
    lastVerified,
    plans: [
      {
        id: "api",
        name: "API (Pay-per-use)",
        pricePerUserPerMonth: 0,
        bestFor: ["coding", "data", "mixed"],
        features: ["GPT-4o", "GPT-4o mini", "o1", "Embeddings"],
        apiIncluded: true,
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    officialPricingUrl: "https://gemini.google.com/advanced",
    lastVerified,
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerUserPerMonth: 0,
        bestFor: ["writing", "research", "mixed"],
        features: ["Gemini Flash", "Limited usage"],
        apiIncluded: false,
      },
      {
        id: "advanced",
        name: "Advanced",
        pricePerUserPerMonth: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["Gemini Advanced", "2TB storage", "Workspace integration"],
        apiIncluded: false,
      },
      {
        id: "api",
        name: "API (Pay-per-use)",
        pricePerUserPerMonth: 0,
        bestFor: ["coding", "data", "mixed"],
        features: ["Gemini Pro", "Flash", "Embeddings"],
        apiIncluded: true,
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "coding",
    officialPricingUrl: "https://codeium.com/windsurf/pricing",
    lastVerified,
    plans: [
      {
        id: "free",
        name: "Free",
        pricePerUserPerMonth: 0,
        bestFor: ["coding"],
        features: ["Basic completions", "Limited Cascade"],
        apiIncluded: false,
      },
      {
        id: "pro",
        name: "Pro",
        pricePerUserPerMonth: 15,
        bestFor: ["coding"],
        features: ["Unlimited completions", "Cascade agentic flows", "GPT and Claude access"],
        apiIncluded: false,
      },
      {
        id: "teams",
        name: "Teams",
        pricePerUserPerMonth: 35,
        bestFor: ["coding"],
        features: ["All Pro", "Admin dashboard", "Usage analytics"],
        apiIncluded: false,
      },
    ],
  },
];

export function getToolById(toolId: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === toolId);
}

export function getPlanById(toolId: string, planId: string): Plan | undefined {
  return getToolById(toolId)?.plans.find((plan) => plan.id === planId);
}

export function estimatePlanCost(plan: Plan, seats: number): number {
  if (plan.priceFlat !== undefined) {
    return plan.priceFlat;
  }

  return plan.pricePerUserPerMonth * seats;
}

export function toolLabel(toolId: string): string {
  return getToolById(toolId)?.name ?? toolId;
}

