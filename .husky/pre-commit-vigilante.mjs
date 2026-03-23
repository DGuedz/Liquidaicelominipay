#!/usr/bin/env node

import { execSync } from "child_process";

const SENSITIVE_PATTERNS = [
  /(sk-)[a-zA-Z0-9]{20,}/,
  /SELF_CALLBACK_SECRET\s*[:=]\s*["'`]?.+/i,
  /karma_[a-zA-Z0-9]{20,}/,
  /private_key/i,
  /seed phrase/i,
  /0x[a-fA-F0-9]{64}/,
];

const IGNORE_FILES = [
  ".husky/pre-commit-vigilante.mjs",
  ".husky/pre-commit",
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
    .map((word) => new RegExp(escapeRegExp(word), "i"));
}

function listStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
  return output
    .trim()
    .split("\n")
    .map((file) => file.trim())
    .filter((file) => file.length > 0 && !IGNORE_FILES.includes(file));
}

function readStagedFileContent(file) {
  try {
    return execSync(`git show :${file}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function runGuard() {
  console.log("\n[sensitive-guard] scanning staged files...");

  try {
    const filesInStaging = listStagedFiles();
    const patterns = [...SENSITIVE_PATTERNS, ...readInternalCodewordPatterns()];

    if (filesInStaging.length === 0) {
      console.log("[sensitive-guard] no staged files. commit allowed.");
      process.exit(0);
    }

    let leakDetected = false;

    for (const file of filesInStaging) {
      const content = readStagedFileContent(file);
      if (!content) continue;

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          console.error("\n[sensitive-guard] blocked potential sensitive content.");
          console.error(`file: ${file}`);
          console.error(`pattern: ${pattern.toString()}`);
          leakDetected = true;
        }
      }
    }

    if (leakDetected) {
      console.error("\n[sensitive-guard] commit blocked. remove sensitive content first.\n");
      process.exit(1);
    }

    console.log("[sensitive-guard] scan complete. commit allowed.\n");
    process.exit(0);
  } catch (error) {
    console.error("[sensitive-guard] execution error:", error);
    process.exit(1);
  }
}

runGuard();
