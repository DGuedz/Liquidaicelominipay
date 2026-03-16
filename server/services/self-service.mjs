import { env } from "../config/env.mjs";

let initError = null;

// Armazena as sessões ativas em memória
const activeSessions = new Map();

function resolveSelfNetwork() {
  return env.celoChain === "mainnet" ? "mainnet" : "testnet";
}

export async function initSelfAgent() {
  initError = null;

  if (env.selfMode !== "agent") return;

  try {
    console.log(`[Self Service] Agent service ready in '${env.selfMode}' mode on ${resolveSelfNetwork()}.`);
  } catch (error) {
    initError = error instanceof Error ? error.message : "Unknown Self client initialization error.";
    console.warn("[Self Service] failed to initialize client:", initError);
  }
}

export function getSelfServiceStatus() {
  if (env.selfMode === "mock") {
    return {
      mode: "mock",
      ready: true,
      message: "Mock verification active for demo flow.",
    };
  }

  if (env.selfMode === "agent") {
    return {
      mode: "agent",
      ready: !initError,
      message: initError || "Agent client online.",
    };
  }

  return {
    mode: env.selfMode,
    ready: false,
    message: "Self verification disabled.",
  };
}

/**
 * Initiates a new registration session with Self
 */
export async function startSelfRegistration(humanAddress) {
    if (env.selfMode === "mock") {
        return {
            sessionToken: "mock_session_token",
            deepLink: "https://self.xyz/mock-deep-link",
            qrData: "mock_qr_data",
            mode: "mock"
        };
    }

    try {
        const response = await fetch("https://self-agent-id.vercel.app/api/agent/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                minimumAge: 18, 
                ofac: true,
                network: resolveSelfNetwork()
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Self API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Guarda a sessão na memória para conseguirmos fazer o poll depois
        activeSessions.set(data.sessionId, {
            ...data,
            startedAt: Date.now()
        });
        
        return { 
            sessionToken: data.sessionId,
            deepLink: data.deepLink,
            qrData: data.qrUrl,
            privateKeyHex: data.privateKeyHex,
            mode: "agent" 
        };
    } catch (error) {
        console.error("[Self Service] Registration start failed:", error);
        throw error;
    }
}

/**
 * Polls for registration completion
 */
export async function checkRegistrationStatus(sessionToken) {
    if (env.selfMode === "mock") {
        return { stage: "completed", agentId: 999, verified: true };
    }

    const session = activeSessions.get(sessionToken);
    if (!session) {
        throw new Error("Session not found or expired");
    }

    try {
        const response = await fetch(`https://self-agent-id.vercel.app/api/agent/register/status?token=${sessionToken}`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Self API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === "verified") {
            // Em produção, o privateKey gerado deve ser injetado na session/db do usuário
            console.log(`[Self Service] Agent ${data.agentId} verified successfully!`);
            return { 
                stage: "completed",
                agentId: data.agentId,
                verified: true
            };
        } else if (data.status === "expired") {
            throw new Error("Self registration session expired");
        } else if (data.status === "failed") {
            throw new Error(`Self registration failed: ${data.reason}`);
        }
        
        // Status pending
        return { stage: "pending", verified: false };
    } catch (error) {
        console.error("[Self Service] Status check failed:", error);
        throw error;
    }
}

// Kept for backward compatibility if needed, but primary flow is now start -> poll
export async function verifySelfUser(address, proof) {
  // ... legacy or alternative verification logic if passing raw proof manually
  return { verified: false, message: "Use startSelfRegistration flow" }; 
}
