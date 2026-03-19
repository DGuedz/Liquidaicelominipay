#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "docs/templates/synthesis-draft.template.json");
const outPath = process.argv[2] || "/tmp/synthesis-draft.json";

const requiredEnv = ["SYN_TEAM_UUID"];

const missing = requiredEnv.filter((k) => !process.env[k]);

const raw = await fs.readFile(templatePath, "utf-8");
const data = JSON.parse(raw);

if (process.env.SYN_TEAM_UUID) data.teamUUID = process.env.SYN_TEAM_UUID;
if (process.env.SYN_DEPLOYED_URL) data.deployedURL = process.env.SYN_DEPLOYED_URL;
if (process.env.SYN_REPO_URL) data.repoURL = process.env.SYN_REPO_URL;

if (process.env.SYN_TRACK_UUIDS) {
  data.trackUUIDs = process.env.SYN_TRACK_UUIDS
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function setOptionalUrl(field, envKey) {
  const envValue = process.env[envKey];
  if (envValue && envValue.trim()) {
    data[field] = envValue.trim();
    return;
  }
  const current = String(data[field] || "");
  const looksLikePlaceholder =
    current.includes("REPLACE") ||
    current.includes("example.com") ||
    current.trim() === "";
  if (looksLikePlaceholder) delete data[field];
}

setOptionalUrl("videoURL", "SYN_VIDEO_URL");
setOptionalUrl("pictures", "SYN_PICTURES_URL");
setOptionalUrl("coverImageURL", "SYN_COVER_IMAGE_URL");

await fs.writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");

console.log(`Draft payload generated: ${outPath}`);
if (missing.length) {
  console.log("Missing required env vars:");
  for (const key of missing) console.log(`  - ${key}`);
  process.exitCode = 2;
} else {
  console.log("All required env vars present.");
}

console.log("\nNext:");
console.log(`  export SYN_API_KEY='sk-synth-...'`);
console.log(`  pnpm synth create-draft --file ${outPath}`);
