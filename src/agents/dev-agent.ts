/**
 * LiquidAI Dev Agent
 * Monitors file changes and feeds context to the ProductAgent
 * Designed for CI/CD (GitHub Actions) and local dev mode
 */

import { detectMilestoneFromFiles, ProductAgent } from './product-agent';

// ─── CI Mode (GitHub Actions) ─────────────────────────────────────────────────

export interface GitHubContext {
  apiKey: string;
  projectUID: string;
  commitSha: string;
  commitMessage: string;
  changedFiles: string[];
  author: string;
  repoUrl: string;
}

export async function runCIUpdate(ctx: GitHubContext): Promise<void> {
  const agent = new ProductAgent(ctx.apiKey, ctx.projectUID);

  await agent.processCommit({
    sha: ctx.commitSha,
    message: ctx.commitMessage,
    files: ctx.changedFiles,
    author: ctx.author,
    timestamp: new Date().toISOString(),
  });
}

// ─── Milestone Progress Report ────────────────────────────────────────────────

export function generateProgressReport(changedFiles: string[]): string {
  const updates = detectMilestoneFromFiles(changedFiles);

  if (updates.length === 0) {
    return "No milestone changes detected in this commit.";
  }

  const lines = [
    "## Milestone Progress Report",
    "",
    ...updates.map(
      (u) =>
        `- **${u.milestoneName}**: +${u.progressDelta}% progress\n  ${u.description}`
    ),
  ];

  return lines.join("\n");
}

// ─── Quick Post (from CLI or agent) ──────────────────────────────────────────

export async function quickPost(params: {
  apiKey: string;
  projectUID: string;
  chainId?: number;
  title: string;
  text: string;
}): Promise<void> {
  const { createKarmaClient } = await import('./karma');
  const client = createKarmaClient(params.apiKey);

  const result = await client.createProjectUpdate({
    projectUID: params.projectUID,
    chainId: params.chainId ?? 42220,
    title: params.title,
    text: params.text,
  });

  console.log(`[DevAgent] ✅ Update posted — TX: ${result.transactionHash}`);
}

export default { runCIUpdate, generateProgressReport, quickPost };
