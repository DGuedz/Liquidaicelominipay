type DependencyPolicy = {
  minVersion?: string;
  blockedVersions?: string[];
};

export type DependencyPolicyResult = {
  dependency: string;
  ok: boolean;
  reason: string;
};

const CRITICAL_DEPENDENCY_POLICIES: Record<string, DependencyPolicy> = {
  "@metamask/sdk": { minVersion: "0.33.1" },
  "@metamask/sdk-communication-layer": { minVersion: "0.33.1" },
  "socket.io-parser": { minVersion: "4.2.6" },
  snarkjs: { blockedVersions: ["0.6.11"] },
};

function parseSemver(version: string) {
  const cleaned = String(version || "").replace(/^[^0-9]*/, "").split("-")[0];
  const [major = "0", minor = "0", patch = "0"] = cleaned.split(".");
  return [Number.parseInt(major, 10), Number.parseInt(minor, 10), Number.parseInt(patch, 10)];
}

function compareSemver(left: string, right: string) {
  const [la, lb, lc] = parseSemver(left);
  const [ra, rb, rc] = parseSemver(right);
  if (la !== ra) return la - ra;
  if (lb !== rb) return lb - rb;
  return lc - rc;
}

export function evaluateDependencyPolicies(versions: Record<string, string>) {
  const results: DependencyPolicyResult[] = [];

  for (const [dependency, policy] of Object.entries(CRITICAL_DEPENDENCY_POLICIES)) {
    const actual = versions[dependency];
    if (!actual) {
      results.push({
        dependency,
        ok: false,
        reason: "Missing dependency version in policy input.",
      });
      continue;
    }

    if (policy.blockedVersions?.includes(actual)) {
      results.push({
        dependency,
        ok: false,
        reason: `Blocked vulnerable version detected (${actual}).`,
      });
      continue;
    }

    if (policy.minVersion && compareSemver(actual, policy.minVersion) < 0) {
      results.push({
        dependency,
        ok: false,
        reason: `Version ${actual} is below required minimum ${policy.minVersion}.`,
      });
      continue;
    }

    results.push({
      dependency,
      ok: true,
      reason: `Version ${actual} passed policy.`,
    });
  }

  return results;
}

export function assertDependencyPolicies(versions: Record<string, string>) {
  const results = evaluateDependencyPolicies(versions);
  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    throw new Error(failed.map((item) => `${item.dependency}: ${item.reason}`).join(" | "));
  }
  return results;
}
