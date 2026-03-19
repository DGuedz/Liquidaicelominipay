#!/usr/bin/env node

const BASE_URL = process.env.SYN_BASE_URL || "https://synthesis.devfolio.co";

function usage() {
  console.log(`Synthesis CLI (terminal-first submission)

Usage:
  node scripts/synthesis-cli.mjs help
  node scripts/synthesis-cli.mjs checklist
  node scripts/synthesis-cli.mjs tracks [--company Celo] [--name Self]
  node scripts/synthesis-cli.mjs team --team <teamUUID>
  node scripts/synthesis-cli.mjs project --project <projectUUID>
  node scripts/synthesis-cli.mjs create-draft --file <jsonFile>
  node scripts/synthesis-cli.mjs update --project <projectUUID> --file <jsonFile>
  node scripts/synthesis-cli.mjs transfer-init --address <0x...>
  node scripts/synthesis-cli.mjs transfer-confirm --token <tok_...> --address <0x...>
  node scripts/synthesis-cli.mjs publish --project <projectUUID>

Environment:
  SYN_API_KEY   Required for authenticated commands
  SYN_BASE_URL  Optional (default: https://synthesis.devfolio.co)
`);
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function hasAuth() {
  return Boolean(process.env.SYN_API_KEY);
}

function requireAuth() {
  if (!hasAuth()) {
    console.error("Missing SYN_API_KEY in env.");
    process.exit(1);
  }
}

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth) {
    headers.Authorization = `Bearer ${process.env.SYN_API_KEY}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    const message = data?.error?.message || data?.message || JSON.stringify(data);
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${message}`);
  }

  return data;
}

async function cmdTracks() {
  const companyFilter = getArg("--company");
  const nameFilter = getArg("--name");

  const payload = await api("/catalog?page=1&limit=100");
  const items = payload.items || [];

  const filtered = items.filter((item) => {
    const byCompany = companyFilter
      ? (item.company || "").toLowerCase().includes(companyFilter.toLowerCase())
      : true;
    const byName = nameFilter
      ? (item.name || "").toLowerCase().includes(nameFilter.toLowerCase())
      : true;
    return byCompany && byName;
  });

  if (!filtered.length) {
    console.log("No tracks found with current filters.");
    return;
  }

  for (const item of filtered) {
    const total = (item.prizes || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    console.log(`\n${item.company} | ${item.name}`);
    console.log(`  uuid: ${item.uuid}`);
    console.log(`  total: $${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    for (const prize of item.prizes || []) {
      console.log(`  - ${prize.name}: ${prize.amount} ${prize.currency}`);
    }
  }
}

async function cmdTeam() {
  requireAuth();
  const team = getArg("--team");
  if (!team) {
    console.error("Missing --team <teamUUID>");
    process.exit(1);
  }

  const data = await api(`/teams/${team}`, { auth: true });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdProject() {
  const project = getArg("--project");
  if (!project) {
    console.error("Missing --project <projectUUID>");
    process.exit(1);
  }

  const data = await api(`/projects/${project}`);
  console.log(JSON.stringify(data, null, 2));
}

async function cmdCreateDraft() {
  requireAuth();
  const file = getArg("--file");
  if (!file) {
    console.error("Missing --file <jsonFile>");
    process.exit(1);
  }

  const fs = await import("node:fs/promises");
  const body = JSON.parse(await fs.readFile(file, "utf-8"));

  const created = await api("/projects", {
    method: "POST",
    auth: true,
    body,
  });

  console.log("Draft created successfully:");
  console.log(JSON.stringify(created, null, 2));
}

async function cmdUpdateProject() {
  requireAuth();
  const project = getArg("--project");
  const file = getArg("--file");
  if (!project || !file) {
    console.error("Missing --project <projectUUID> and/or --file <jsonFile>");
    process.exit(1);
  }

  const fs = await import("node:fs/promises");
  const body = JSON.parse(await fs.readFile(file, "utf-8"));

  const updated = await api(`/projects/${project}`, {
    method: "POST",
    auth: true,
    body,
  });

  console.log("Project updated successfully:");
  console.log(JSON.stringify(updated, null, 2));
}

async function cmdTransferInit() {
  requireAuth();
  const address = getArg("--address");
  if (!address) {
    console.error("Missing --address <0x...>");
    process.exit(1);
  }

  const data = await api("/participants/me/transfer/init", {
    method: "POST",
    auth: true,
    body: { targetOwnerAddress: address },
  });

  console.log(JSON.stringify(data, null, 2));
  console.log("\nVerify targetOwnerAddress before confirm.");
}

async function cmdTransferConfirm() {
  requireAuth();
  const token = getArg("--token");
  const address = getArg("--address");

  if (!token || !address) {
    console.error("Missing --token <tok_...> and/or --address <0x...>");
    process.exit(1);
  }

  const data = await api("/participants/me/transfer/confirm", {
    method: "POST",
    auth: true,
    body: {
      transferToken: token,
      targetOwnerAddress: address,
    },
  });

  console.log(JSON.stringify(data, null, 2));
}

async function cmdPublish() {
  requireAuth();
  const project = getArg("--project");
  if (!project) {
    console.error("Missing --project <projectUUID>");
    process.exit(1);
  }

  const data = await api(`/projects/${project}/publish`, {
    method: "POST",
    auth: true,
  });

  console.log("Project published:");
  console.log(JSON.stringify(data, null, 2));
}

function cmdChecklist() {
  console.log(`Eligibility checklist (Synthesis)

For DRAFT (today):
  [ ] Registered participant (apiKey issued)
  [ ] Team UUID known
  [ ] At least 1 valid track UUID
  [ ] Required project fields filled:
      - teamUUID
      - name
      - description
      - problemStatement
      - repoURL (public)
      - trackUUIDs
      - conversationLog
      - submissionMetadata (complete)

For PUBLISH (before deadline):
  [ ] All team members transferred to self-custody
  [ ] Project has name
  [ ] Project has >= 1 track
  [ ] Repo is public and up to date
  [ ] Deployed URL works
  [ ] Demo video URL works

Recommended tracks for LiquidAI:
  - Celo: ff26ab4933c84eea856a5c6bf513370b
  - Self: 437781b864994698b2a304227e277b56
  - Zyfai Yield Agents: 58be0ff54518490fb94bf2b0f58bb78c
  - Zyfai Native Wallet: e67bac3ceece40b1a4b55786a7af6b0c
  - Zyfai Programmable: f15ad8a517cf49cfbe6cbf6dc218ec7a
`);
}

async function main() {
  const cmd = process.argv[2] || "help";

  try {
    switch (cmd) {
      case "help":
        usage();
        break;
      case "checklist":
        cmdChecklist();
        break;
      case "tracks":
        await cmdTracks();
        break;
      case "team":
        await cmdTeam();
        break;
      case "project":
        await cmdProject();
        break;
      case "create-draft":
        await cmdCreateDraft();
        break;
      case "update":
        await cmdUpdateProject();
        break;
      case "transfer-init":
        await cmdTransferInit();
        break;
      case "transfer-confirm":
        await cmdTransferConfirm();
        break;
      case "publish":
        await cmdPublish();
        break;
      default:
        usage();
        process.exit(1);
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
