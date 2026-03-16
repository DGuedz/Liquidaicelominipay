
import { randomUUID } from "node:crypto";

const BASE_URL = "https://gapapi.karmahq.xyz";
const API_KEY = process.env.KARMA_API_KEY;

if (!API_KEY) {
  console.error("❌ KARMA_API_KEY not found in environment.");
  process.exit(1);
}

const args = process.argv.slice(2);
const projectUID = args[0];
const title = args[1] || "Project Update";
const text = args[2] || "Update via CLI script";

if (!projectUID) {
  console.error("❌ Usage: node scripts/post-karma-update.mjs <projectUID> [title] [text]");
  process.exit(1);
}

async function getProjectChainId(uid) {
  console.log(`🔍 Looking up project ${uid}...`);
  const res = await fetch(`${BASE_URL}/v2/projects/${uid}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "X-Source": "skill:project-manager",
      "X-Invocation-Id": randomUUID(),
      "X-Skill-Version": "1.0.0",
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch project: ${res.status} ${err}`);
  }

  const data = await res.json();
  // Depending on API response shape, it might be data.payload.chainID or data.chainID
  // Based on previous logs: {"payload":[{"uid":..., "chainID":42220...}]} 
  // But /v2/projects/UID usually returns single object or payload array
  
  if (data.payload && Array.isArray(data.payload) && data.payload.length > 0) {
     return data.payload[0].chainID;
  }
  if (data.chainID) return data.chainID;
  
  console.log("⚠️  Could not resolve chainID from project data, defaulting to 42220 (Celo)");
  console.log("   Data received:", JSON.stringify(data).slice(0, 200) + "...");
  return 42220;
}

async function run() {
  try {
    const chainId = await getProjectChainId(projectUID);
    console.log(`✅ Resolved Chain ID: ${chainId}`);

    console.log("🚀 Posting update...");
    const res = await fetch(`${BASE_URL}/v2/agent/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "X-Source": "skill:project-manager",
        "X-Invocation-Id": randomUUID(),
        "X-Skill-Version": "1.0.0",
      },
      body: JSON.stringify({
        action: "createProjectUpdate",
        params: {
          chainId,
          projectUID,
          title,
          text
        }
      })
    });

    const result = await res.json();
    
    if (!res.ok) {
      console.error("❌ API Error:", JSON.stringify(result, null, 2));
      process.exit(1);
    }

    console.log("✨ Success!");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

run();
