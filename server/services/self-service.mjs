import { env } from "../config/env.mjs";

let initError = null;
let verifier = null;
let verifierError = null;

// Armazena as sessões ativas em memória
const activeSessions = new Map();

function resolveSelfNetwork() {
  return env.celoChain === "mainnet" ? "mainnet" : "testnet";
}

function resolveSelfVerifyEndpoint() {
  return env.selfVerifyEndpoint || "https://liquidaicelominipay.onrender.com/api/self/verify";
}

async function ensureSelfVerifier() {
  if (verifier) return verifier;
  if (verifierError) return null;

  try {
    const core = await import("@selfxyz/core");
    const { SelfBackendVerifier, DefaultConfigStore, AllIds } = core;

    verifier = new SelfBackendVerifier(
      env.selfScope,
      resolveSelfVerifyEndpoint(),
      env.selfMockPassport,
      AllIds,
      new DefaultConfigStore({
        minimumAge: env.selfMinimumAge,
        excludedCountries: env.selfExcludedCountries,
        ofac: env.selfOfac,
      }),
      env.selfUserIdType === "uuid" ? "uuid" : "hex",
    );

    verifierError = null;
    return verifier;
  } catch (error) {
    verifierError = error instanceof Error ? error.message : "Failed to initialize @selfxyz/core verifier.";
    return null;
  }
}

export async function initSelfAgent() {
  initError = null;

  if (env.selfMode !== "agent") return;

  try {
    await ensureSelfVerifier();
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
      verifier: {
        ready: false,
        endpoint: resolveSelfVerifyEndpoint(),
        message: "SelfBackendVerifier disabled in mock mode.",
      },
    };
  }

  if (env.selfMode === "agent") {
    const verifierReady = Boolean(verifier) && !verifierError;
    return {
      mode: "agent",
      ready: !initError && verifierReady,
      message: initError || verifierError || "Agent client online. Ready for start-registration → poll-registration → self/status flow.",
      verifier: {
        ready: verifierReady,
        endpoint: resolveSelfVerifyEndpoint(),
        message: verifierError || "SelfBackendVerifier online.",
      },
    };
  }

  return {
    mode: env.selfMode,
    ready: false,
    message: "Self verification disabled.",
    verifier: {
      ready: false,
      endpoint: resolveSelfVerifyEndpoint(),
      message: "SelfBackendVerifier disabled.",
    },
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
                mode: env.selfAgentRegisterMode,
                minimumAge: env.selfMinimumAge, 
                ofac: env.selfOfac,
                network: resolveSelfNetwork(),
                walletAddress: humanAddress,
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

export async function verifySelfProofPayload(payload = {}) {
  const current = await ensureSelfVerifier();
  if (!current) {
    throw new Error(verifierError || "Self backend verifier is not available.");
  }

  const {
    attestationId,
    proof,
    publicSignals,
    pubSignals,
    userContextData,
  } = payload;

  const signals = Array.isArray(publicSignals) ? publicSignals : pubSignals;
  if (!proof || !Array.isArray(signals) || !attestationId || !userContextData) {
    throw new Error("Proof, publicSignals, attestationId and userContextData are required.");
  }

  const result = await current.verify(attestationId, proof, signals, userContextData);
  return result;
}

// Kept for backward compatibility if needed, but primary flow is now start -> poll
export async function verifySelfUser(address, proof) {
  // ... legacy or alternative verification logic if passing raw proof manually
  return { verified: false, message: "Use startSelfRegistration flow" }; 
}
