import dotenv from "dotenv";
import { getAddress, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config({ path: ".env.local" });
dotenv.config();

const API_BASE_URL = (process.env.LIQUIDAI_SIM_API_BASE_URL || "http://localhost:8787").replace(/\/$/, "");
const API = `${API_BASE_URL}/api`;
const RETRYABLE_HTTP_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePrivateKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("0x") ? raw : `0x${raw}`;
}

function collectManagedWallets() {
  const candidates = [
    {
      name: "treasury",
      expectedAddress: process.env.TREASURY_ADDRESS,
      privateKey: process.env.TREASURY_PRIVATE_KEY,
    },
    {
      name: "test_user_primary",
      expectedAddress: process.env.TEST_USER_PRIMARY_ADDRESS,
      privateKey: process.env.TEST_USER_PRIMARY_PRIVATE_KEY,
    },
    {
      name: "test_user_secondary",
      expectedAddress: process.env.TEST_USER_SECONDARY_ADDRESS,
      privateKey: process.env.TEST_USER_SECONDARY_PRIVATE_KEY,
    },
    {
      name: "reserve",
      expectedAddress: process.env.RESERVE_ADDRESS,
      privateKey: process.env.RESERVE_PRIVATE_KEY,
    },
    {
      name: "backend_private_key",
      expectedAddress: process.env.TREASURY_ADDRESS,
      privateKey: process.env.PRIVATE_KEY,
    },
    {
      name: "admin_private_key",
      expectedAddress: process.env.ADMIN_ADDRESS,
      privateKey: process.env.ADMIN_PRIVATE_KEY,
    },
  ];

  const deduped = new Map();
  for (const item of candidates) {
    const privateKey = normalizePrivateKey(item.privateKey);
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) continue;
    const account = privateKeyToAccount(privateKey);
    const address = getAddress(account.address);
    if (!deduped.has(address.toLowerCase())) {
      deduped.set(address.toLowerCase(), {
        name: item.name,
        address,
        expectedAddress: item.expectedAddress && isAddress(item.expectedAddress)
          ? getAddress(item.expectedAddress)
          : "",
        privateKey,
        account,
      });
    }
  }
  return Array.from(deduped.values());
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, raw: text };
  }
}

async function authenticateWallet(wallet) {
  const challengeRes = await fetch(`${API}/auth/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: wallet.address }),
  });
  const challengePayload = await readJson(challengeRes);
  if (!challengeRes.ok || !challengePayload?.ok) {
    throw new Error(`[${wallet.name}] auth/challenge failed (${challengeRes.status}).`);
  }

  const signature = await wallet.account.signMessage({ message: challengePayload.data.message });
  const verifyRes = await fetch(`${API}/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: wallet.address,
      nonce: challengePayload.data.nonce,
      signature,
    }),
  });
  const verifyPayload = await readJson(verifyRes);
  if (!verifyRes.ok || !verifyPayload?.ok || !verifyPayload?.data?.token) {
    throw new Error(`[${wallet.name}] auth/verify failed (${verifyRes.status}).`);
  }

  return verifyPayload.data.token;
}

async function callWithToken(path, token, init = {}) {
  const headers = {
    ...(init.headers || {}),
    authorization: `Bearer ${token}`,
  };
  return fetch(`${API}${path}`, { ...init, headers });
}

async function runWalletSmoke(wallet) {
  const token = await authenticateWallet(wallet);

  const meRes = await callWithToken("/auth/me", token);
  const mePayload = await readJson(meRes);
  if (!meRes.ok || !mePayload?.ok) {
    throw new Error(`[${wallet.name}] auth/me failed (${meRes.status}).`);
  }

  const meAddress = getAddress(String(mePayload.data.address || ""));
  if (meAddress !== wallet.address) {
    throw new Error(`[${wallet.name}] auth/me address mismatch.`);
  }

  const settingsRes = await callWithToken(`/profile/settings?address=${wallet.address}`, token);
  const settingsPayload = await readJson(settingsRes);
  if (!settingsRes.ok || !settingsPayload?.ok) {
    throw new Error(`[${wallet.name}] profile/settings GET failed (${settingsRes.status}).`);
  }

  const updateRes = await callWithToken("/profile/settings", token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: wallet.address,
      updates: {
        security: { requireApproval: true },
      },
    }),
  });
  const updatePayload = await readJson(updateRes);
  if (!updateRes.ok || !updatePayload?.ok) {
    throw new Error(`[${wallet.name}] profile/settings POST failed (${updateRes.status}).`);
  }

  return { token };
}

async function runSelfRegistrationProbe(token, walletAddress) {
  let startRes;
  let startPayload;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    startRes = await callWithToken("/self/start-registration", token, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address: walletAddress }),
    });
    startPayload = await readJson(startRes);
    if (startRes.ok && startPayload?.ok && startPayload?.data?.sessionToken) break;

    if (!RETRYABLE_HTTP_STATUS.has(startRes.status) || attempt === 3) {
      throw new Error(`[self] start-registration failed (${startRes.status}).`);
    }
    await sleep(1000 * attempt);
  }

  const session = startPayload.data;
  const deepLink = typeof session.deepLink === "string" ? session.deepLink.trim() : "";
  const qrDataType = session?.qrData === null
    ? "null"
    : Array.isArray(session?.qrData)
      ? "array"
      : typeof session?.qrData;
  const qrValue = typeof session.qrData === "string"
    ? session.qrData.trim()
    : (deepLink || "");

  if (!qrValue && !deepLink) {
    throw new Error("[self] start-registration returned no deepLink/qrData.");
  }

  const query = new URLSearchParams({
    address: walletAddress,
    sessionToken: session.sessionToken,
  });
  let pollRes;
  let pollPayload;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    pollRes = await callWithToken(`/self/poll-registration?${query.toString()}`, token);
    pollPayload = await readJson(pollRes);
    if (pollRes.ok && pollPayload?.ok) break;
    if (!RETRYABLE_HTTP_STATUS.has(pollRes.status) || attempt === 3) {
      throw new Error(`[self] poll-registration failed (${pollRes.status}).`);
    }
    await sleep(1000 * attempt);
  }

  const stage = String(pollPayload?.data?.stage || "unknown");
  return {
    mode: String(session.mode || "unknown"),
    qrDataType,
    hasDeepLink: Boolean(deepLink),
    stage,
  };
}

async function runNegativeGuardTests(token, walletAddress, mismatchAddress) {
  const invalidRes = await callWithToken("/self/start-registration", token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: "0x123" }),
  });
  if (invalidRes.status !== 400) {
    throw new Error(`Expected 400 for invalid guarded address, got ${invalidRes.status}.`);
  }

  const emptyRes = await callWithToken("/self/start-registration", token, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address: "" }),
  });
  if (emptyRes.status !== 400) {
    throw new Error(`Expected 400 for empty guarded address, got ${emptyRes.status}.`);
  }

  if (mismatchAddress) {
    const mismatchRes = await callWithToken(`/profile/settings?address=${mismatchAddress}`, token);
    if (mismatchRes.status !== 403) {
      throw new Error(`Expected 403 for address/token mismatch, got ${mismatchRes.status}.`);
    }
  }

  const allowedRes = await callWithToken(`/profile/settings?address=${walletAddress}`, token);
  if (allowedRes.status !== 200) {
    throw new Error(`Expected 200 for correct address with auth token, got ${allowedRes.status}.`);
  }
}

async function runRateLimitProbe(address) {
  let seen429 = 0;
  const attempts = 25;
  for (let i = 0; i < attempts; i += 1) {
    const response = await fetch(`${API}/auth/challenge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
    if (response.status === 429) {
      seen429 += 1;
    }
  }
  if (seen429 < 1) {
    throw new Error("Rate-limit probe failed: auth/challenge did not return HTTP 429.");
  }
  return { attempts, seen429 };
}

function printWalletRow(wallet, status, detail = "") {
  const addressShort = `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
  const expected = wallet.expectedAddress
    ? (wallet.expectedAddress === wallet.address ? "match" : "mismatch")
    : "n/a";
  console.log(`- ${wallet.name.padEnd(20)} ${status.padEnd(7)} ${addressShort} expected:${expected} ${detail}`.trim());
}

async function main() {
  console.log(`\n[wallet-sim] API target: ${API}`);
  const skipNegativeGuards = process.env.LIQUIDAI_SIM_SKIP_NEGATIVE === "1";
  const wallets = collectManagedWallets();
  if (!wallets.length) {
    throw new Error("No managed wallet private keys found in environment.");
  }
  console.log(`[wallet-sim] Wallets discovered: ${wallets.length}\n`);

  const results = [];
  for (const wallet of wallets) {
    try {
      const smoke = await runWalletSmoke(wallet);
      const self = await runSelfRegistrationProbe(smoke.token, wallet.address);
      results.push({ wallet, ok: true, token: smoke.token, self });
      printWalletRow(wallet, "PASS");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ wallet, ok: false, error: message });
      printWalletRow(wallet, "FAIL", `(${message})`);
    }
  }

  const passed = results.filter((item) => item.ok);
  if (!passed.length) {
    throw new Error("All managed wallet connection simulations failed.");
  }

  const primary = passed[0];
  const mismatch = passed.length > 1 ? passed[1].wallet.address : "";
  if (skipNegativeGuards) {
    console.log("\n[wallet-sim] Guard negative tests: SKIPPED (LIQUIDAI_SIM_SKIP_NEGATIVE=1)");
    console.log("[wallet-sim] Rate-limit probe: SKIPPED (LIQUIDAI_SIM_SKIP_NEGATIVE=1)");
  } else {
    await runNegativeGuardTests(primary.token, primary.wallet.address, mismatch);
    console.log("\n[wallet-sim] Guard negative tests: PASS");

    const limiter = await runRateLimitProbe(primary.wallet.address);
    console.log(`[wallet-sim] Rate-limit probe: PASS (${limiter.seen429}/${limiter.attempts} got 429)`);
  }

  const failures = results.filter((item) => !item.ok).length;
  for (const item of passed) {
    const detail = item.self
      ? `[self mode=${item.self.mode} stage=${item.self.stage} qrData=${item.self.qrDataType} deepLink=${item.self.hasDeepLink ? "yes" : "no"}]`
      : "[self skipped]";
    console.log(`  ${item.wallet.name}: ${detail}`);
  }
  console.log(`\n[wallet-sim] Completed. passed=${passed.length} failed=${failures}`);
  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n[wallet-sim] FAILED: ${message}`);
  process.exit(1);
});
