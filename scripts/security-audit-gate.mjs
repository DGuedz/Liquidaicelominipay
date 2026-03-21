import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ALLOWLIST_PATH = path.resolve(process.cwd(), "security/advisory-allowlist.json");

function readAllowlist() {
  try {
    const raw = fs.readFileSync(ALLOWLIST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const advisories = Array.isArray(parsed?.advisories) ? parsed.advisories : [];
    return advisories.map((item) => ({
      id: String(item?.id || "").trim(),
      ghsa: String(item?.ghsa || "").trim(),
      module: String(item?.module || "").trim().toLowerCase(),
      severity: String(item?.severity || "").trim().toLowerCase(),
      pathIncludes: String(item?.pathIncludes || "").trim(),
      expiresOn: String(item?.expiresOn || "").trim(),
      reason: String(item?.reason || "").trim(),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read allowlist at ${ALLOWLIST_PATH}: ${message}`);
  }
}

function extractJson(rawText) {
  const text = String(rawText || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end < start) {
    throw new Error("Could not parse pnpm audit JSON output.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function runAudit() {
  try {
    const stdout = execSync("pnpm audit --prod --json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return extractJson(stdout);
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : "";
    const stderr = error?.stderr ? String(error.stderr) : "";
    if (stdout || stderr) {
      return extractJson(`${stdout}\n${stderr}`);
    }
    throw error;
  }
}

function isAllowlistExpired(expiresOn) {
  if (!expiresOn) return false;
  const parsed = new Date(`${expiresOn}T23:59:59.999Z`);
  if (Number.isNaN(parsed.getTime())) return true;
  return Date.now() > parsed.getTime();
}

function advisoryMatchesAllowlist(advisory, allowEntry) {
  const id = String(advisory?.id || "");
  const ghsa = String(advisory?.github_advisory_id || "");
  const moduleName = String(advisory?.module_name || "").toLowerCase();
  const severity = String(advisory?.severity || "").toLowerCase();
  const paths = Array.isArray(advisory?.findings)
    ? advisory.findings.flatMap((item) => (Array.isArray(item?.paths) ? item.paths : []))
    : [];

  if (allowEntry.id && allowEntry.id !== id) return false;
  if (allowEntry.ghsa && allowEntry.ghsa !== ghsa) return false;
  if (allowEntry.module && allowEntry.module !== moduleName) return false;
  if (allowEntry.severity && allowEntry.severity !== severity) return false;
  if (allowEntry.pathIncludes) {
    const hasPath = paths.some((entry) => String(entry || "").includes(allowEntry.pathIncludes));
    if (!hasPath) return false;
  }
  return true;
}

function main() {
  const allowlist = readAllowlist();
  const audit = runAudit();
  const advisories = Object.values(audit?.advisories || {});

  if (!advisories.length) {
    console.log("[security:audit] No production vulnerabilities reported by pnpm audit.");
    return;
  }

  const failures = [];
  const accepted = [];

  for (const advisory of advisories) {
    const match = allowlist.find((entry) => advisoryMatchesAllowlist(advisory, entry));
    if (!match) {
      failures.push({
        id: advisory.id,
        ghsa: advisory.github_advisory_id,
        module: advisory.module_name,
        severity: advisory.severity,
        reason: "Not present in advisory allowlist.",
      });
      continue;
    }

    if (isAllowlistExpired(match.expiresOn)) {
      failures.push({
        id: advisory.id,
        ghsa: advisory.github_advisory_id,
        module: advisory.module_name,
        severity: advisory.severity,
        reason: `Allowlist entry expired on ${match.expiresOn || "invalid-date"}.`,
      });
      continue;
    }

    accepted.push({
      id: advisory.id,
      ghsa: advisory.github_advisory_id,
      module: advisory.module_name,
      severity: advisory.severity,
      expiresOn: match.expiresOn || "n/a",
      reason: match.reason || "Temporary accepted risk",
    });
  }

  if (accepted.length) {
    console.log("[security:audit] Accepted advisories (temporary allowlist):");
    for (const item of accepted) {
      console.log(
        `- ${item.module} [${item.severity}] id=${item.id} ghsa=${item.ghsa} expires=${item.expiresOn} :: ${item.reason}`,
      );
    }
  }

  if (failures.length) {
    console.error("[security:audit] Blocking vulnerabilities found:");
    for (const item of failures) {
      console.error(
        `- ${item.module} [${item.severity}] id=${item.id} ghsa=${item.ghsa} :: ${item.reason}`,
      );
    }
    process.exit(1);
  }

  console.log("[security:audit] Passed with allowlisted advisories only.");
}

main();
