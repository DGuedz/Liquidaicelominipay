#!/usr/bin/env node

import { execFileSync } from "child_process";
import fs from "fs";

const IGNORE_FILES = new Set([
  ".husky/pre-commit-vigilante.mjs",
  ".husky/pre-commit",
]);

const PATH_PATTERNS = [
  {
    id: "SENSITIVE_FILE_NAME",
    regex: /(PRIVATE_KEY|AUTH_SECRET|SELF_CALLBACK_SECRET)\s*=/i,
  },
];

const SECRET_PATTERNS = [
  {
    id: "EVM_PRIVATE_KEY_ASSIGNMENT",
    regex:
      /\b(?:ADMIN_|TREASURY_|TEST_USER_[A-Z_]*|RESERVE_)?PRIVATE_KEY\s*[:=]\s*["'`']?(?:0x)?[a-fA-F0-9]{64}\b/g,
  },
  {
    id: "GITHUB_PAT",
    regex: /\bghp_[A-Za-z0-9]{36,}\b/g,
  },
  {
    id: "STRIPE_LIVE_KEY",
    regex: /\bsk_live_[A-Za-z0-9]{20,}\b/g,
  },
  {
    id: "SLACK_TOKEN",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g,
  },
  {
    id: "AWS_ACCESS_KEY_ID",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readInternalCodewordPatterns() {
  const raw = String(process.env.INTERNAL_CODEWORDS || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((word) => ({ id: "INTERNAL_CODEWORD", regex: new RegExp(escapeRegExp(word), "ig") }));
}

function isRepositoryScan() {
  return process.argv.includes("--repo");
}

function listFiles() {
  const args = isRepositoryScan()
    ? ["ls-files", "-z"]
    : ["diff", "--cached", "--name-only", "--diff-filter=ACM", "-z"];
  const raw = execFileSync("git", args, { encoding: "utf8" });
  return raw
    .split("\u0000")
    .map((file) => file.trim())
    .filter((file) => file.length > 0 && !IGNORE_FILES.has(file));
}

function isBinaryBuffer(buffer) {
  return buffer.includes(0);
}

function readFileContent(file) {
  try {
    if (isRepositoryScan()) {
      const buffer = fs.readFileSync(file);
      if (isBinaryBuffer(buffer)) return "";
      return buffer.toString("utf8");
    }

    const content = execFileSync("git", ["show", `:${file}`], { encoding: "utf8" });
    return typeof content === "string" ? content : "";
  } catch {
    return "";
  }
}

function isLikelyPlaceholder(value) {
  return /(YOUR_|REPLACE|CHANGE_THIS|EXAMPLE|PLACEHOLDER|dummy)/i.test(value);
}

function getLineNumber(text, index) {
  return text.slice(0, Math.max(0, index)).split("\n").length;
}

function findMatches(file, content, patterns) {
  const findings = [];
  for (const patternDef of patterns) {
    const regex = new RegExp(patternDef.regex.source, patternDef.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const token = String(match[0] || "");
      if (isLikelyPlaceholder(token)) continue;
      findings.push({
        type: patternDef.id,
        file,
        line: getLineNumber(content, match.index),
      });
    }
  }
  return findings;
}

function runGuard() {
  const mode = isRepositoryScan() ? "repository" : "staged";
  console.log(`\n[sensitive-guard] scanning ${mode} files...`);
  try {
    const files = listFiles();
    const patterns = [...SECRET_PATTERNS, ...readInternalCodewordPatterns()];

    if (files.length === 0) {
      console.log("[sensitive-guard] no files to scan. allowed.");
      process.exit(0);
    }

    const findings = [];

    for (const file of files) {
      for (const pathPattern of PATH_PATTERNS) {
        if (pathPattern.regex.test(file)) {
          findings.push({ type: pathPattern.id, file, line: 1 });
        }
      }
      const content = readFileContent(file);
      if (!content) continue;
      findings.push(...findMatches(file, content, patterns));
    }

    if (findings.length > 0) {
      console.error("\n[sensitive-guard] blocked potential sensitive content:");
      for (const finding of findings) {
        console.error(`- ${finding.type} :: ${finding.file}:${finding.line}`);
      }
      console.error("\n[sensitive-guard] scan failed. remove/rotate secrets before commit or push.\n");
      process.exit(1);
    }

    console.log("[sensitive-guard] scan complete. allowed.\n");
    process.exit(0);
  } catch (error) {
    console.error("[sensitive-guard] execution error:", error);
    process.exit(1);
  }
}

runGuard();
