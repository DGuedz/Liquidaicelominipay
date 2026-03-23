import { spawn, spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DEFAULT_PROD_API = "https://liquidaicelominipay.onrender.com";
const DEFAULT_TEST_ADDRESS = process.env.TEST_USER_PRIMARY_ADDRESS || "";
const DEFAULT_STEP_TIMEOUT_MS = Number.parseInt(process.env.LIQUIDAI_GATE_STEP_TIMEOUT_MS || "240000", 10);

function parseArgs(argv) {
  const args = {
    prodApi: process.env.LIQUIDAI_GATE_PROD_API || DEFAULT_PROD_API,
    testAddress: process.env.LIQUIDAI_GATE_TEST_ADDRESS || DEFAULT_TEST_ADDRESS,
    skipLocal: false,
    skipProd: false,
    allowProdStrictFail: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--prod-api") {
      args.prodApi = String(argv[index + 1] || "").trim() || args.prodApi;
      index += 1;
      continue;
    }
    if (token === "--test-address") {
      args.testAddress = String(argv[index + 1] || "").trim() || args.testAddress;
      index += 1;
      continue;
    }
    if (token === "--skip-local") args.skipLocal = true;
    if (token === "--skip-prod") args.skipProd = true;
    if (token === "--allow-prod-strict-fail") args.allowProdStrictFail = true;
  }

  return args;
}

function runStep(title, command, options = {}) {
  console.log(`\n[gate] ${title}`);
  console.log(`[gate] $ ${command}`);
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? Number(options.timeoutMs)
    : DEFAULT_STEP_TIMEOUT_MS;
  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
    timeout: Math.max(15_000, timeoutMs),
    env: {
      ...process.env,
      ...(options.env || {}),
    },
  });
  if (result.error && result.error.code === "ETIMEDOUT") {
    console.error(`[gate] Step timed out after ${Math.max(15_000, timeoutMs)}ms: ${title}`);
  }
  const code = Number(result.status ?? 1);
  return { ok: code === 0, code };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApiReady(baseUrl, timeoutMs = 20_000) {
  const startedAt = Date.now();
  const target = `${baseUrl.replace(/\/+$/, "")}/api/health`;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(target, { method: "GET" });
      if (response.ok) return true;
    } catch {}
    await sleep(500);
  }
  return false;
}

async function withLocalApi(task) {
  console.log("\n[gate] Starting local API for wallet simulation...");
  const gateStateFile = `.data/security-state-gate-${Date.now()}-${process.pid}.json`;
  const server = spawn("node", ["server/index.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      SECURITY_STATE_STORE: "file",
      SECURITY_STATE_FILE: gateStateFile,
    },
  });

  const ready = await waitForApiReady("http://localhost:8787");
  if (!ready) {
    server.kill("SIGTERM");
    throw new Error("Local API did not become ready on http://localhost:8787.");
  }

  try {
    return await task();
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
      await sleep(300);
    }
    await rm(gateStateFile, { force: true }).catch(() => {});
    await rm(`${gateStateFile}.lock`, { force: true }).catch(() => {});
  }
}

async function checkSelfStatus(prodApi, testAddress) {
  if (!testAddress) {
    console.log("[gate] Skipping self/status probe: no test address configured.");
    return { ok: true, skipped: true };
  }
  const target = `${prodApi.replace(/\/+$/, "")}/api/self/status?address=${encodeURIComponent(testAddress)}`;
  console.log(`\n[gate] Probing ${target}`);
  const response = await fetch(target, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  const ok = Boolean(response.ok && payload?.ok);
  if (!ok) {
    console.error(`[gate] self/status failed with HTTP ${response.status}.`);
    return { ok: false, skipped: false };
  }
  const data = payload.data || {};
  const ready = Boolean(data.ready);
  console.log(
    `[gate] self/status mode=${String(data.mode || "unknown")} ready=${String(ready)} verified=${String(Boolean(data.verified))}`,
  );
  if (!ready) {
    console.error(`[gate] self/status not ready: ${String(data.message || "missing message")}`);
    return { ok: false, skipped: false };
  }
  return { ok: true, skipped: false };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];

  console.log("[gate] Wallet + Self Release Gate");
  console.log(`[gate] prodApi=${args.prodApi}`);
  if (args.testAddress) {
    console.log(`[gate] testAddress=${args.testAddress}`);
  }

  if (!args.skipLocal) {
    const localSteps = [
      { title: "Local build", command: "npm run build" },
      { title: "Security checks", command: "pnpm run security:check" },
    ];
    for (const step of localSteps) {
      const result = runStep(step.title, step.command);
      if (!result.ok) {
        failures.push(`${step.title} (exit ${result.code})`);
      }
    }

    if (!failures.length) {
      try {
        await withLocalApi(async () => {
          const result = runStep("Local wallet/self simulation", "node scripts/simulate-managed-wallet-connections.mjs");
          if (!result.ok) {
            failures.push(`Local wallet/self simulation (exit ${result.code})`);
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`Local API startup/simulation failed (${message})`);
      }
    }
  } else {
    console.log("[gate] Skipping local checks (--skip-local).");
  }

  if (!args.skipProd) {
    const prodConnectivity = runStep(
      "Prod connectivity simulation (skip strict negatives)",
      "node scripts/simulate-managed-wallet-connections.mjs",
      {
        env: {
          LIQUIDAI_SIM_API_BASE_URL: args.prodApi,
          LIQUIDAI_SIM_SKIP_NEGATIVE: "1",
        },
      },
    );
    if (!prodConnectivity.ok) {
      failures.push(`Prod connectivity simulation (exit ${prodConnectivity.code})`);
    }

    const statusProbe = await checkSelfStatus(args.prodApi, args.testAddress);
    if (!statusProbe.ok) {
      failures.push("Prod self/status probe");
    }

    const prodStrict = runStep(
      "Prod strict simulation (includes negative guard checks)",
      "node scripts/simulate-managed-wallet-connections.mjs",
      {
        env: {
          LIQUIDAI_SIM_API_BASE_URL: args.prodApi,
          LIQUIDAI_SIM_SKIP_RATE_LIMIT: "1",
        },
      },
    );
    if (!prodStrict.ok && !args.allowProdStrictFail) {
      failures.push(`Prod strict simulation (exit ${prodStrict.code})`);
    }
    if (!prodStrict.ok && args.allowProdStrictFail) {
      console.warn("[gate] Prod strict simulation failed but allowed by --allow-prod-strict-fail.");
    }
  } else {
    console.log("[gate] Skipping prod checks (--skip-prod).");
  }

  if (failures.length) {
    console.error("\n[gate] FAILED");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\n[gate] PASSED");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[gate] FAILED: ${message}`);
  process.exit(1);
});
