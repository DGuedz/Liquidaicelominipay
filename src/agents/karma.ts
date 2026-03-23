/**
 * LiquidAI × Karma API Client
 * Wrapper for Karma project management skills
 * API Docs: https://gapapi.karmahq.xyz/v2/docs/static/index.html
 */

import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_KARMA_API_URL || "https://gapapi.karmahq.xyz";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KarmaProject {
  uid?: string;
  title: string;
  description: string;
  chainId: number; // 42220 = Celo
  imageURL?: string;
  links?: { type: "github" | "website" | "twitter" | "discord"; url: string }[];
  tags?: string[];
  problem?: string;
  solution?: string;
  missionSummary?: string;
  stageIn?: "Idea" | "MVP" | "Beta" | "Production" | "Growth" | "Mature";
  raisedMoney?: string;
  pathToTake?: string;
}

export interface KarmaProjectUpdate {
  projectUID: string;
  chainId: number;
  title: string;
  text: string;
}

export interface KarmaMilestone {
  grantUID: string;
  chainId: number;
  title: string;
  description: string;
  endsAt: number; // Unix timestamp in seconds
  priority?: number; // 0-4
}

export interface KarmaExecuteResponse {
  success: boolean;
  transactionHash?: string;
  chainId?: number;
  chainName?: string;
  data?: unknown;
  error?: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

class KarmaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private getTrackingHeaders(invocationId?: string) {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "X-Source": "skill:project-manager",
      "X-Invocation-Id": invocationId || uuidv4(),
      "X-Skill-Version": "1.0.0",
    };
  }

  /** Register a new agent (no account needed) */
  async registerAgent(): Promise<{ apiKey: string }> {
    const res = await fetch(`${this.baseUrl}/v2/agent/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Source": "skill:project-manager",
        "X-Invocation-Id": uuidv4(),
        "X-Skill-Version": "1.0.0",
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      throw new Error(`Registration failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  /** Verify API key is valid */
  async verifyAgent(): Promise<{ walletAddress: string; supportedActions: string[] }> {
    const res = await fetch(`${this.baseUrl}/v2/agent/info`, {
      headers: this.getTrackingHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Verification failed: ${res.status}`);
    }

    return res.json();
  }

  /** Execute a Karma action */
  private async execute(
    action: string,
    params: Record<string, unknown>
  ): Promise<KarmaExecuteResponse> {
    const invocationId = uuidv4();

    const res = await fetch(`${this.baseUrl}/v2/agent/execute`, {
      method: "POST",
      headers: this.getTrackingHeaders(invocationId),
      body: JSON.stringify({ action, params }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Action '${action}' failed: ${res.status} — ${errorText}`);
    }

    return res.json();
  }

  // ─── Project Actions ───────────────────────────────────────────────────────

  /** Create a new project on Karma */
  async createProject(project: KarmaProject): Promise<KarmaExecuteResponse> {
    return this.execute("createProject", {
      chainId: project.chainId ?? 42220, // Default: Celo
      title: project.title,
      description: project.description,
      imageURL: project.imageURL,
      links: project.links,
      tags: project.tags,
      problem: project.problem,
      solution: project.solution,
      missionSummary: project.missionSummary,
      stageIn: project.stageIn,
      raisedMoney: project.raisedMoney,
      pathToTake: project.pathToTake,
    });
  }

  /** Post a progress update to a project */
  async createProjectUpdate(update: KarmaProjectUpdate): Promise<KarmaExecuteResponse> {
    return this.execute("createProjectUpdate", {
      chainId: update.chainId,
      projectUID: update.projectUID,
      title: update.title,
      text: update.text,
    });
  }

  /** Add a milestone to a grant */
  async createMilestone(milestone: KarmaMilestone): Promise<KarmaExecuteResponse> {
    return this.execute("createMilestone", {
      chainId: milestone.chainId,
      grantUID: milestone.grantUID,
      title: milestone.title,
      description: milestone.description,
      endsAt: milestone.endsAt,
      priority: milestone.priority ?? 1,
    });
  }

  /** Mark a milestone as completed */
  async completeMilestone(params: {
    chainId: number;
    milestoneUID: string;
    reason: string;
    proofOfWork?: string;
  }): Promise<KarmaExecuteResponse> {
    return this.execute("completeMilestone", params);
  }

  // ─── Search & Lookup ───────────────────────────────────────────────────────

  /** Search for a project by name */
  async searchProject(query: string): Promise<{ uid: string; chainID: number; details: { title: string; slug: string; description: string } }[]> {
    const res = await fetch(
      `${this.baseUrl}/v2/projects?q=${encodeURIComponent(query)}&limit=5&page=1`,
      { headers: this.getTrackingHeaders() }
    );

    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();
    return data.projects || data.items || [];
  }

  /** Get project details by UID or slug */
  async getProject(uidOrSlug: string) {
    const res = await fetch(
      `${this.baseUrl}/v2/projects/${uidOrSlug}`,
      { headers: this.getTrackingHeaders() }
    );

    if (!res.ok) throw new Error(`Get project failed: ${res.status}`);
    return res.json();
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createKarmaClient(apiKey: string): KarmaClient {
  return new KarmaClient(apiKey);
}

// ─── LiquidAI Project Preset ──────────────────────────────────────────────────

export const LIQUIDAI_PROJECT: KarmaProject = {
  chainId: 42220, // Celo
  title: "LiquidAI",
  description:
    "Agentic Treasury OS for MiniPay users on Celo. LiquidAI turns idle stablecoins into productive capital with mobile-first UX and policy-gated autonomous execution.",
  imageURL: "https://liquidai.vercel.app/og-image.png",
  links: [
    { type: "github", url: "https://github.com/DGuedz/Liquidaicelominipay" },
    { type: "website", url: "https://liquidai-app.vercel.app/" },
    { type: "website", url: "https://synthesis.devfolio.co/projects/faa5281797514ddfa17d950f5c2b102a" },
    { type: "website", url: "https://drive.google.com/file/d/19fUEtTRC5IUodulmQvjdOGb99CuNQPmG/view?usp=sharing" },
    { type: "twitter", url: "https://x.com/dg_doublegreen/status/2035746225337639250" },
  ],
  tags: ["defi", "celo", "minipay", "treasury", "ai-agent", "mobile-first", "emerging-markets"],
  problem:
    "MiniPay users and stablecoin holders in emerging markets keep funds idle due to DeFi complexity and execution friction, losing purchasing power over time.",
  solution:
    "Autonomous treasury routing with identity and safety controls, simple mobile UX, and continuous liquidity optimization on Celo.",
  missionSummary: "Make DeFi yield automatic, invisible, and accessible for everyday MiniPay users.",
  stageIn: "Beta",
  pathToTake:
    "Ship resilient mobile treasury automation on Celo, scale route intelligence, then expand to institutional treasury workflows.",
};

export type { KarmaClient };
