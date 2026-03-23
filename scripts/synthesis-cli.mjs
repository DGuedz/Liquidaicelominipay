#!/usr/bin/env node

import dotenv from "dotenv";

dotenv.config({ path: ".env.synthesis.local", quiet: true });
dotenv.config({ quiet: true });

const BASE_URL = process.env.SYN_BASE_URL || "https://synthesis.devfolio.co";
const AUTH_TOKEN = process.env.SYN_API_KEY || process.env.SYNTH_API_KEY || "";
const DEFAULT_REQUIRED_TRACKS = [
  "ff26ab4933c84eea856a5c6bf513370b", // Celo
  "437781b864994698b2a304227e277b56", // Self
];

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
  node scripts/synthesis-cli.mjs monitor --project <projectUUID> [--team <teamUUID>] [--required-tracks <uuid,uuid>] [--owner-address <0x...>] [--strict-conversation] [--strict-custody]
  node scripts/synthesis-cli.mjs transfer-init --address <0x...>
  node scripts/synthesis-cli.mjs transfer-confirm --token <tok_...> --address <0x...>
  node scripts/synthesis-cli.mjs publish --project <projectUUID>

Environment:
  SYN_API_KEY   Required for authenticated commands
  SYNTH_API_KEY Alias accepted for backward compatibility
  SYN_BASE_URL  Optional (default: https://synthesis.devfolio.co)
`);
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function hasAuth() {
  return Boolean(AUTH_TOKEN);
}

function requireAuth() {
  if (!hasAuth()) {
    console.error("Missing SYN_API_KEY (or SYNTH_API_KEY) in env.");
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
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
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

  let updated;
  try {
    updated = await api(`/projects/${project}`, {
      method: "POST",
      auth: true,
      body,
    });
  } catch (postError) {
    try {
      updated = await api(`/projects/${project}`, {
        method: "PUT",
        auth: true,
        body,
      });
    } catch (putError) {
      throw new Error(`Update failed with POST and PUT. POST: ${postError.message}; PUT: ${putError.message}`);
    }
  }

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

async function checkUrl(url, timeoutMs = 10_000) {
  const value = String(url || "").trim();
  if (!value) return { ok: false, status: 0, error: "missing-url" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs).unref();
  try {
    const headRes = await fetch(value, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (headRes.ok || (headRes.status >= 300 && headRes.status <= 399)) {
      return { ok: true, status: headRes.status };
    }

    const getRes = await fetch(value, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    return { ok: getRes.ok || (getRes.status >= 300 && getRes.status <= 399), status: getRes.status };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function cmdMonitor() {
  requireAuth();

  const projectUuid = getArg("--project") || process.env.SYN_PROJECT_UUID;
  const teamUuid = getArg("--team") || process.env.SYN_TEAM_UUID || process.env.TEAM_UUID || "";
  const ownerAddress = String(
    getArg("--owner-address") || process.env.TARGET_OWNER_ADDRESS || "",
  ).toLowerCase();
  const strictConversation = hasFlag("--strict-conversation");
  const strictCustody = hasFlag("--strict-custody");

  if (!projectUuid) {
    console.error("Missing --project <projectUUID> (or SYN_PROJECT_UUID env).");
    process.exit(1);
  }

  const requiredTracks = parseCsv(getArg("--required-tracks") || process.env.SYN_REQUIRED_TRACKS);
  const expectedTrackUUIDs = requiredTracks.length ? requiredTracks : DEFAULT_REQUIRED_TRACKS;

  const checks = [];
  const addCheck = (name, ok, details, severity = "error") => {
    checks.push({ name, ok: Boolean(ok), severity, details: details || "" });
  };

  const project = await api(`/projects/${projectUuid}`, { auth: true });
  const projectTracks = Array.isArray(project.tracks) ? project.tracks : [];
  const projectTrackUUIDs = projectTracks.map((track) => String(track?.uuid || "").toLowerCase()).filter(Boolean);

  addCheck("project_exists", Boolean(project?.uuid), `uuid=${project?.uuid || "missing"}`);
  addCheck("status_publish", String(project?.status || "").toLowerCase() === "publish", `status=${project?.status || "unknown"}`);
  addCheck("has_name", Boolean(String(project?.name || "").trim()));
  addCheck("has_repo", Boolean(String(project?.repoURL || "").trim()));
  addCheck("has_deploy", Boolean(String(project?.deployedURL || "").trim()));
  addCheck("has_video", Boolean(String(project?.videoURL || "").trim()));
  addCheck("has_submission_metadata", Boolean(project?.submissionMetadata));
  addCheck(
    "has_conversation_log",
    String(project?.conversationLog || "").trim().length > 0,
    `length=${String(project?.conversationLog || "").trim().length}`,
    strictConversation ? "error" : "warning",
  );

  const missingTracks = expectedTrackUUIDs.filter(
    (requiredUuid) => !projectTrackUUIDs.includes(String(requiredUuid).toLowerCase()),
  );
  addCheck(
    "required_tracks_present",
    missingTracks.length === 0,
    missingTracks.length ? `missing=${missingTracks.join(",")}` : `count=${projectTrackUUIDs.length}`,
  );

  const repoHealth = await checkUrl(project?.repoURL);
  const deployHealth = await checkUrl(project?.deployedURL);
  const videoHealth = await checkUrl(project?.videoURL);
  addCheck("repo_url_reachable", repoHealth.ok, `status=${repoHealth.status}${repoHealth.error ? ` error=${repoHealth.error}` : ""}`);
  addCheck("deployed_url_reachable", deployHealth.ok, `status=${deployHealth.status}${deployHealth.error ? ` error=${deployHealth.error}` : ""}`);
  addCheck("video_url_reachable", videoHealth.ok, `status=${videoHealth.status}${videoHealth.error ? ` error=${videoHealth.error}` : ""}`);

  if (teamUuid) {
    const team = await api(`/teams/${teamUuid}`, { auth: true });
    addCheck(
      "team_project_binding",
      String(team?.project?.uuid || "") === String(projectUuid),
      `teamProject=${team?.project?.uuid || "none"}`,
    );
  } else {
    addCheck("team_uuid_provided", false, "team uuid not provided; skipped binding check", "warning");
  }

  const participant = await api("/participants/me", { auth: true });
  const participantWallet = String(participant?.walletAddress || "").toLowerCase();
  const ownerWallet = String(participant?.ownerWalletAddress || "").toLowerCase();
  const custodyWallet = String(participant?.selfCustodyAddress || "").toLowerCase();
  const hasCustodySignal = Boolean(ownerWallet || custodyWallet);
  addCheck(
    "self_custody_signal",
    hasCustodySignal,
    `wallet=${participantWallet || "none"} owner=${ownerWallet || "none"} selfCustody=${custodyWallet || "none"}`,
    strictCustody ? "error" : "warning",
  );

  if (ownerAddress) {
    const matchesOwner =
      participantWallet === ownerAddress ||
      ownerWallet === ownerAddress ||
      custodyWallet === ownerAddress;
    addCheck("owner_address_matches_participant", matchesOwner, `expected=${ownerAddress}`, strictCustody ? "error" : "warning");
  }

  const errors = checks.filter((check) => !check.ok && check.severity === "error");
  const warnings = checks.filter((check) => !check.ok && check.severity === "warning");
  const passed = checks.filter((check) => check.ok).length;

  const report = {
    monitoredAt: new Date().toISOString(),
    project: {
      uuid: project?.uuid || projectUuid,
      status: project?.status || "unknown",
      updatedAt: project?.updatedAt || null,
    },
    totals: {
      checks: checks.length,
      passed,
      errors: errors.length,
      warnings: warnings.length,
    },
    checks,
  };

  console.log(JSON.stringify(report, null, 2));

  if (errors.length > 0) {
    process.exit(1);
  }
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
      case "monitor":
        await cmdMonitor();
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
