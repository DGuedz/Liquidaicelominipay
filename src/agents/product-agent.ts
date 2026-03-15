/**
 * LiquidAI Product Agent
 * Interprets code changes and maps them to Karma milestones
 * Runs on CI/CD and posts structured updates to Karma protocol
 */

import { createKarmaClient, LIQUIDAI_PROJECT } from './karma';
import milestones from '../../roadmap/milestones.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommitContext {
  message: string;
  files: string[];
  author: string;
  sha: string;
  timestamp: string;
}

export interface MilestoneUpdate {
  milestoneId: string;
  milestoneName: string;
  progressDelta: number;
  description: string;
  proofUrl?: string;
}

// ─── File → Milestone Mapping ─────────────────────────────────────────────────

const FILE_MILESTONE_MAP: { pattern: RegExp; milestoneId: string; impact: number }[] = [
  // Liquidity Map
  { pattern: /liquidity-map|celo-liquidity/i,    milestoneId: "liquidity-map",    impact: 10 },
  { pattern: /agent-pulse|agent\.tsx/i,           milestoneId: "liquidity-map",    impact: 5  },
  // MiniPay UX
  { pattern: /onboarding|minipay|self-verif/i,   milestoneId: "minipay-ux",       impact: 8  },
  { pattern: /bottom-navigation|mobile|scan/i,   milestoneId: "minipay-ux",       impact: 5  },
  { pattern: /icons|toast|page-header/i,          milestoneId: "minipay-ux",       impact: 3  },
  // Yield Router
  { pattern: /savings|yield|aave|morpho|mento/i, milestoneId: "yield-router",     impact: 10 },
  { pattern: /analytics|agent\.tsx|chat/i,        milestoneId: "yield-router",     impact: 5  },
  // Card Infrastructure
  { pattern: /card|pix|transfero|off-ramp/i,     milestoneId: "card-infrastructure", impact: 10 },
  { pattern: /receipt|transfer|numeric-keypad/i, milestoneId: "card-infrastructure", impact: 4  },
];

// ─── Commit Keyword Parser ────────────────────────────────────────────────────

function parseKarmaDirective(commitMessage: string): {
  milestoneId?: string;
  progress?: number;
  note?: string;
} | null {
  // Format: "karma: milestone <id> progress <n>%"
  // Example: "karma: milestone yield-router progress 40%"
  const match = commitMessage.match(/karma:\s*(?:milestone\s+(\S+)\s+)?progress\s+(\d+)%?(?:\s+(.+))?/i);

  if (!match) return null;

  return {
    milestoneId: match[1],
    progress: match[2] ? parseInt(match[2]) : undefined,
    note: match[3],
  };
}

// ─── Milestone Detector ───────────────────────────────────────────────────────

export function detectMilestoneFromFiles(files: string[]): MilestoneUpdate[] {
  const updates = new Map<string, MilestoneUpdate>();

  for (const file of files) {
    for (const { pattern, milestoneId, impact } of FILE_MILESTONE_MAP) {
      if (pattern.test(file)) {
        const milestone = milestones.milestones.find((m) => m.id === milestoneId);
        if (!milestone) continue;

        const existing = updates.get(milestoneId);
        if (existing) {
          existing.progressDelta = Math.min(existing.progressDelta + impact, 20);
        } else {
          updates.set(milestoneId, {
            milestoneId,
            milestoneName: milestone.name,
            progressDelta: impact,
            description: `Updated: ${file}`,
          });
        }
      }
    }
  }

  return Array.from(updates.values());
}

// ─── Product Agent ────────────────────────────────────────────────────────────

export class ProductAgent {
  private apiKey: string;
  private projectUID: string | null = null;
  private chainId: number = 42220; // Celo

  constructor(apiKey: string, projectUID?: string) {
    this.apiKey = apiKey;
    if (projectUID) this.projectUID = projectUID;
  }

  /** Process a commit and post updates to Karma */
  async processCommit(commit: CommitContext): Promise<void> {
    const client = createKarmaClient(this.apiKey);

    console.log(`[ProductAgent] Processing commit: ${commit.sha.slice(0, 7)} — ${commit.message}`);

    // 1. Check for explicit karma directive in commit
    const directive = parseKarmaDirective(commit.message);

    // 2. Auto-detect from changed files
    const autoUpdates = detectMilestoneFromFiles(commit.files);

    // 3. Build the update text
    const changedComponents = commit.files
      .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
      .map((f) => f.split('/').pop()?.replace(/\.(tsx?|json)$/, ''))
      .filter(Boolean)
      .slice(0, 5);

    if (!this.projectUID) {
      console.warn('[ProductAgent] No projectUID set — skipping Karma update. Run setup first.');
      return;
    }

    // 4. Post project update to Karma
    const milestoneNames = [...new Set(autoUpdates.map((u) => u.milestoneName))];
    const updateTitle = directive?.note
      ? directive.note
      : `${milestoneNames.length > 0 ? milestoneNames[0] : 'LiquidAI'} progress update`;

    const updateText = [
      `## ${commit.message.replace(/karma:.*/i, '').trim()}`,
      '',
      `**Commit**: \`${commit.sha.slice(0, 7)}\``,
      `**Author**: ${commit.author}`,
      `**Timestamp**: ${commit.timestamp}`,
      '',
      changedComponents.length > 0
        ? `**Components Updated**:\n${changedComponents.map((c) => `- ${c}`).join('\n')}`
        : '',
      '',
      milestoneNames.length > 0
        ? `**Milestones Affected**:\n${milestoneNames.map((n) => `- ${n}`).join('\n')}`
        : '',
      '',
      directive?.note ? `**Note**: ${directive.note}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await client.createProjectUpdate({
      projectUID: this.projectUID,
      chainId: this.chainId,
      title: updateTitle,
      text: updateText,
    });

    console.log(`[ProductAgent] ✅ Karma update posted: "${updateTitle}"`);
  }

  /** Initialize — find or create the LiquidAI project */
  async initialize(): Promise<string> {
    const client = createKarmaClient(this.apiKey);

    // Try to find existing project
    const results = await client.searchProject("LiquidAI");
    const existing = results.find((r) => r.details.title === "LiquidAI");

    if (existing) {
      this.projectUID = existing.uid;
      console.log(`[ProductAgent] Found existing project: ${existing.uid}`);
      return existing.uid;
    }

    // Create new project
    const response = await client.createProject({
      ...LIQUIDAI_PROJECT,
      chainId: this.chainId,
    });

    if (response.data && typeof response.data === 'object' && 'uid' in response.data) {
      this.projectUID = response.data.uid as string;
    }

    console.log(`[ProductAgent] Created project. TX: ${response.transactionHash}`);
    return this.projectUID || '';
  }
}

export default ProductAgent;
