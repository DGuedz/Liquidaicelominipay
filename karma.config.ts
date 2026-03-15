/**
 * LiquidAI × Karma Integration Config
 * AI Product Manager — Automated milestone & progress tracking
 * 
 * Install skills: npx skills add show-karma/skills
 * API Docs: https://gapapi.karmahq.xyz/v2/docs/static/index.html
 */

export const karmaConfig = {
  project: "LiquidAI",
  workspace: "hackathon",
  description: "Treasury OS for MiniPay users — Autonomous DeFi liquidity optimization on Celo",

  // Karma API endpoint
  apiUrl: process.env.KARMA_API_URL || "https://gapapi.karmahq.xyz",
  apiKey: process.env.KARMA_API_KEY || "",

  // On-chain config — Celo mainnet (native chain for MiniPay)
  chain: {
    id: 42220,
    name: "Celo",
  },

  // Hackathon context
  hackathon: {
    name: "Build Agents for the Real World V2",
    organizer: "Celo",
    deadline: "2026-04-15",
  },

  // Auto-update settings
  autoUpdateMilestones: true,
  updateFromCommits: true,
  commitKeyword: "karma:", // Trigger keyword in commit messages

  // Skill tracking headers
  skillHeaders: {
    "X-Source": "skill:project-manager",
    "X-Skill-Version": "1.0.0",
  },
} as const;

export default karmaConfig;
