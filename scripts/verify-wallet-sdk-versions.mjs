import { execSync } from "node:child_process";

const POLICIES = {
  "@metamask/sdk": { minVersion: "0.33.1" },
  "@metamask/sdk-communication-layer": { minVersion: "0.33.1" },
  "socket.io-parser": { minVersion: "4.2.6" },
  snarkjs: { blockedMaxVersion: "0.6.11" },
};

function parseSemver(input) {
  const sanitized = String(input || "").replace(/^[^0-9]*/, "").split("-")[0];
  const [major = "0", minor = "0", patch = "0"] = sanitized.split(".");
  return [
    Number.parseInt(major, 10) || 0,
    Number.parseInt(minor, 10) || 0,
    Number.parseInt(patch, 10) || 0,
  ];
}

function compareSemver(left, right) {
  const [la, lb, lc] = parseSemver(left);
  const [ra, rb, rc] = parseSemver(right);
  if (la !== ra) return la - ra;
  if (lb !== rb) return lb - rb;
  return lc - rc;
}

function collectVersions(node, target, out) {
  if (!node || typeof node !== "object") return;

  if (node.name === target && typeof node.version === "string") {
    out.add(node.version);
  }

  const deps = node.dependencies;
  if (!deps || typeof deps !== "object") return;

  for (const [name, dep] of Object.entries(deps)) {
    if (!dep || typeof dep !== "object") continue;
    if (name === target && typeof dep.version === "string") {
      out.add(dep.version);
    }
    collectVersions(dep, target, out);
  }
}

function readDependencyTreeForPackage(pkg) {
  const stdout = execSync(`pnpm ls ${pkg} --json --depth 20`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const parsed = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function main() {
  const failures = [];

  for (const [pkg, policy] of Object.entries(POLICIES)) {
    const versions = new Set();
    const trees = readDependencyTreeForPackage(pkg);
    for (const tree of trees) {
      collectVersions(tree, pkg, versions);
    }

    if (!versions.size) {
      failures.push(`${pkg}: package not found in dependency tree.`);
      continue;
    }

    for (const version of versions) {
      if (policy.minVersion && compareSemver(version, policy.minVersion) < 0) {
        failures.push(`${pkg}@${version} is below minimum ${policy.minVersion}.`);
      }
      if (policy.blockedMaxVersion && compareSemver(version, policy.blockedMaxVersion) <= 0) {
        failures.push(`${pkg}@${version} is blocked (<= ${policy.blockedMaxVersion}).`);
      }
    }
  }

  if (failures.length) {
    console.error("[security:deps] Policy failures detected:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("[security:deps] All critical wallet SDK dependency policies passed.");
}

main();
