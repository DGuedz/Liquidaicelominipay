# Karma Update — LiquidAI AI Product Manager

Use this command to post project updates, advance milestones, or track progress on the Karma protocol directly from Claude.

## Usage

```
/karma-update <title> [milestone] [progress%] [notes]
```

## Examples

Post a feature update:
```
/karma-update "Interactive Liquidity Map completed" liquidity-map 90% "SVG components, real-time animation, AgentPulse"
```

Complete a milestone:
```
/karma-update "MiniPay UX optimized" minipay-ux 100% "Sub-12s onboarding, Self Protocol integration live"
```

Manual release note:
```
/karma-update "v2.0.0 released" "" "" "AI Liquidity Map + AgentPulse + Self Protocol + 32 premium icons"
```

## Milestone IDs

| ID | Name | Current Progress |
|----|------|-----------------|
| `liquidity-map` | AI Liquidity Map | 90% |
| `minipay-ux` | MiniPay UX + Mobile Optimization | 85% |
| `yield-router` | Yield Router + AMM Integrations | 60% |
| `card-infrastructure` | Card Infrastructure + PIX Off-ramp | 40% |

## Karma API Reference

- **Base URL**: `https://gapapi.karmahq.xyz`
- **Chain**: Celo (42220)
- **Docs**: https://gapapi.karmahq.xyz/v2/docs/static/index.html

## Required Environment Variables

```bash
KARMA_API_KEY=karma_...      # Set via: npx skills add show-karma/skills
KARMA_PROJECT_UID=0x...      # From: karma.createProject() or Karma dashboard
```

## Auto-Trigger via Commit

Add `karma:` to your commit message:
```
feat: add interactive liquidity map
karma: milestone liquidity-map progress 90% SVG chart system complete
```

The GitHub Action `.github/workflows/karma-sync.yml` will automatically detect and post the update.
