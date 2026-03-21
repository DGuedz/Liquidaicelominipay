import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const DEFAULT_ENV_FILE = ".env.local";
const SECURITY_DIR = ".data";

const MANAGED_WALLETS = [
  { prefix: "TREASURY" },
  { prefix: "TEST_USER_PRIMARY" },
  { prefix: "TEST_USER_SECONDARY" },
  { prefix: "RESERVE" },
  { prefix: "ADMIN" },
];

function nowLabel() {
  const iso = new Date().toISOString(); // 2026-03-21T12:00:00.000Z
  return iso.replace(/[-:T.Z]/g, "").slice(0, 14);
}

function parseArgs(argv) {
  const args = {
    envFile: DEFAULT_ENV_FILE,
    rotateSecrets: true,
    resetState: true,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--env-file") {
      args.envFile = String(argv[i + 1] || "").trim() || args.envFile;
      i += 1;
      continue;
    }
    if (token === "--no-rotate-secrets") {
      args.rotateSecrets = false;
      continue;
    }
    if (token === "--no-reset-state") {
      args.resetState = false;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
  }

  return args;
}

function parseEnv(content) {
  const map = new Map();
  const lines = String(content || "").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    map.set(match[1], match[2]);
  }
  return map;
}

function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function buildWalletSet() {
  const entries = {};
  for (const item of MANAGED_WALLETS) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    entries[`${item.prefix}_PRIVATE_KEY`] = privateKey;
    entries[`${item.prefix}_ADDRESS`] = account.address;
  }
  return entries;
}

function applyUpdatesToEnvText(existingText, updates, label) {
  const keys = new Set(Object.keys(updates));
  const existingLines = String(existingText || "").split(/\r?\n/);
  const retained = existingLines.filter((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match) return true;
    return !keys.has(match[1]);
  });

  while (retained.length > 0 && retained[retained.length - 1].trim() === "") {
    retained.pop();
  }

  const updateLines = [
    "",
    `# Rotated by scripts/reset-wallet-security-wall.mjs at ${new Date().toISOString()}`,
    ...Object.entries(updates).map(([key, value]) => `${key}=${value}`),
    `# Reset marker: ${label}`,
    "",
  ];

  return `${retained.join("\n")}${updateLines.join("\n")}`;
}

async function removeSecurityStateFiles() {
  const dir = path.resolve(process.cwd(), SECURITY_DIR);
  try {
    await fs.mkdir(dir, { recursive: true });
    const files = await fs.readdir(dir);
    let removed = 0;
    for (const file of files) {
      if (!file.startsWith("security-state")) continue;
      await fs.unlink(path.join(dir, file)).catch(() => {});
      removed += 1;
    }
    return removed;
  } catch {
    return 0;
  }
}

async function writeRenderSnippet(label, updates) {
  const dir = path.resolve(process.cwd(), SECURITY_DIR);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `wallet-reset-${label}.env`);
  const keys = [
    "TREASURY_ADDRESS",
    "TREASURY_PRIVATE_KEY",
    "TEST_USER_PRIMARY_ADDRESS",
    "TEST_USER_PRIMARY_PRIVATE_KEY",
    "TEST_USER_SECONDARY_ADDRESS",
    "TEST_USER_SECONDARY_PRIVATE_KEY",
    "RESERVE_ADDRESS",
    "RESERVE_PRIVATE_KEY",
    "ADMIN_ADDRESS",
    "ADMIN_PRIVATE_KEY",
    "PRIVATE_KEY",
    "AUTH_SECRET",
    "SELF_CALLBACK_SECRET",
    "SECURITY_STATE_FILE",
  ];

  const lines = [
    `# Generated ${new Date().toISOString()}`,
    "# Paste these values in Render Environment and redeploy.",
  ];
  for (const key of keys) {
    if (Object.hasOwn(updates, key)) {
      lines.push(`${key}=${updates[key]}`);
    }
  }
  lines.push("");
  await fs.writeFile(filePath, `${lines.join("\n")}`, "utf8");
  return filePath;
}

function maskAddress(address) {
  const safe = String(address || "");
  if (safe.length < 12) return safe;
  return `${safe.slice(0, 8)}...${safe.slice(-6)}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const marker = nowLabel();
  const envPath = path.resolve(process.cwd(), args.envFile);

  let currentText = "";
  try {
    currentText = await fs.readFile(envPath, "utf8");
  } catch (error) {
    if (!error || typeof error !== "object" || error.code !== "ENOENT") {
      throw error;
    }
  }

  const currentEnv = parseEnv(currentText);
  const generatedWallets = buildWalletSet();
  const securityStateFile = `.data/security-state-${marker}.json`;

  const authSecret = args.rotateSecrets || !currentEnv.get("AUTH_SECRET")
    ? randomHex(32)
    : String(currentEnv.get("AUTH_SECRET"));
  const callbackSecret = args.rotateSecrets || !currentEnv.get("SELF_CALLBACK_SECRET")
    ? randomHex(32)
    : String(currentEnv.get("SELF_CALLBACK_SECRET"));

  const updates = {
    ...generatedWallets,
    PRIVATE_KEY: generatedWallets.TREASURY_PRIVATE_KEY,
    AUTH_SECRET: authSecret,
    SELF_CALLBACK_SECRET: callbackSecret,
    SECURITY_STATE_STORE: "file",
    SECURITY_STATE_FILE: securityStateFile,
  };

  const nextText = applyUpdatesToEnvText(currentText, updates, marker);

  if (!args.dryRun) {
    if (currentText) {
      const backupPath = `${envPath}.backup-${marker}`;
      await fs.writeFile(backupPath, currentText, "utf8");
      console.log(`[reset] Backup created: ${path.relative(process.cwd(), backupPath)}`);
    }
    await fs.writeFile(envPath, nextText, "utf8");
  }

  let removed = 0;
  if (args.resetState && !args.dryRun) {
    removed = await removeSecurityStateFiles();
  }

  const renderSnippetPath = args.dryRun
    ? ""
    : await writeRenderSnippet(marker, updates);

  console.log("");
  console.log("[reset] Managed wallets rotated.");
  for (const item of MANAGED_WALLETS) {
    const key = `${item.prefix}_ADDRESS`;
    console.log(`- ${item.prefix.padEnd(20)} ${maskAddress(updates[key])}`);
  }
  console.log(`[reset] Env file: ${path.relative(process.cwd(), envPath)}`);
  console.log(`[reset] SECURITY_STATE_FILE: ${updates.SECURITY_STATE_FILE}`);
  console.log(`[reset] Local security-state files removed: ${removed}`);
  if (renderSnippetPath) {
    console.log(`[reset] Render snippet: ${path.relative(process.cwd(), renderSnippetPath)}`);
  }
  console.log("");
  console.log("[next] 1) Update Render env with snippet values and redeploy.");
  console.log("[next] 2) Run gate with lowercase address:");
  console.log(
    `npm run release:wallet-self:gate -- --skip-local --test-address ${String(updates.TEST_USER_PRIMARY_ADDRESS).toLowerCase()}`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[reset] FAILED: ${message}`);
  process.exit(1);
});
