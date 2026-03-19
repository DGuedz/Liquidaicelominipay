# Synthesis Terminal Runbook (LiquidAI)

This runbook is optimized for fast execution under deadline pressure.

## 0) One-time setup

```bash
export SYN_BASE_URL="https://synthesis.devfolio.co"
export SYN_API_KEY="sk-synth-REPLACE"
```

## 1) Confirm eligibility quickly

```bash
pnpm synth checklist
```

Draft eligibility (can do today):
- registered participant + api key
- team UUID
- valid track UUID(s)
- required project fields

Publish eligibility (before final lock):
- all team members in self-custody
- project has name + track(s)
- public repo
- working deploy + video

## 2) Discover/confirm tracks

```bash
pnpm synth tracks --company Celo
pnpm synth tracks --company Self
pnpm synth tracks --company Zyfai
pnpm synth tracks --company "Status"
```

Recommended baseline for LiquidAI:
- Celo: `ff26ab4933c84eea856a5c6bf513370b`
- Self: `437781b864994698b2a304227e277b56`
- Zyfai Yield Agents: `58be0ff54518490fb94bf2b0f58bb78c`

Optional add-ons:
- Zyfai Native Wallet: `e67bac3ceece40b1a4b55786a7af6b0c`
- Zyfai Programmable: `f15ad8a517cf49cfbe6cbf6dc218ec7a`
- Status Gasless: `877cd61516a14ad9a199bf48defec1c1`

## 3) Prepare draft payload

Fast path (recommended):

```bash
export SYN_TEAM_UUID="REPLACE_TEAM_UUID"
export SYN_VIDEO_URL="https://www.youtube.com/watch?v=REPLACE"
export SYN_PICTURES_URL="https://REPLACE"
export SYN_COVER_IMAGE_URL="https://REPLACE"
pnpm synth:prepare /tmp/synthesis-draft.json
```

Optional overrides:

```bash
export SYN_DEPLOYED_URL="https://app.liquidai.ai"
export SYN_REPO_URL="https://github.com/DGuedz/Liquidaicelominipay"
export SYN_TRACK_UUIDS="ff26ab4933c84eea856a5c6bf513370b,437781b864994698b2a304227e277b56,58be0ff54518490fb94bf2b0f58bb78c"
```

The command generates `/tmp/synthesis-draft.json` from the template.

## 4) Create project draft

```bash
pnpm synth create-draft --file /tmp/synthesis-draft.json
```

Save returned `projectUUID`.

## 5) Verify project state

```bash
pnpm synth project --project REPLACE_PROJECT_UUID
```

## 6) Self-custody transfer (required for publish)

```bash
pnpm synth transfer-init --address 0xYOUR_OWNER_WALLET
```

Copy returned `transferToken`, then:

```bash
pnpm synth transfer-confirm --token tok_xxx --address 0xYOUR_OWNER_WALLET
```

## 7) Publish

```bash
pnpm synth publish --project REPLACE_PROJECT_UUID
```

## 8) Final validation

```bash
pnpm synth project --project REPLACE_PROJECT_UUID
```

Check:
- `status` is publish
- tracks are correct
- repo/deploy/video URLs are valid

## Notes
- Draft can be created before self-custody.
- Publish fails until all team members complete self-custody.
- Keep secrets out of git (`SYN_API_KEY` only in shell/env manager).
