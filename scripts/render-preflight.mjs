import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

async function read(relPath) {
  const abs = path.join(ROOT, relPath);
  return fs.readFile(abs, "utf8");
}

function fail(message) {
  console.error(`[render-preflight] FAIL: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`[render-preflight] WARN: ${message}`);
}

async function main() {
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] || "0", 10);
  if (nodeMajor !== 22) {
    warn(`Expected Node 22 on Render, got ${process.versions.node}.`);
  }

  const agentSquad = await read("server/services/agent-squad.mjs");
  if (agentSquad.includes("../store/security-state-store.mjs")) {
    fail("agent-squad imports security-state-store. Use ../store/self-store.mjs for isSelfVerified.");
  }
  if (!agentSquad.includes("../store/self-store.mjs")) {
    fail("agent-squad is missing ../store/self-store.mjs import.");
  }

  const serverIndex = await read("server/index.mjs");
  if (!serverIndex.includes('process.env.HOST || "0.0.0.0"')) {
    fail('server/index.mjs must bind host from process.env.HOST with fallback "0.0.0.0".');
  }

  console.log("[render-preflight] PASS");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
});
