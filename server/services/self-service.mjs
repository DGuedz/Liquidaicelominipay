import { SelfAgent } from "@selfxyz/agent-sdk";
import { env } from "../config/env.mjs";

let initError = null;

// Armazena as sessões ativas em memória
const activeSessions = new Map();

function resolveSelfNetwork() {
  return env.celoChain === "sepolia" ? "testnet" : "mainnet";
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
        const session = await SelfAgent.requestRegistration({
            mode: "linked",
            network: resolveSelfNetwork(),
            humanAddress: humanAddress,
            disclosures: { minimumAge: 18, ofac: true }, // Customize as needed
            agentName: "LiquidAI Agent",
            agentDescription: "Treasury Operating System for your on-chain assets."
        });
        
        // Guarda a sessão na memória para conseguirmos fazer o poll depois
        activeSessions.set(session.sessionToken, session);
        
        // Dispara o waitForCompletion no background para limpar a memória quando terminar
        session.waitForCompletion({ timeoutMs: 10 * 60 * 1000 }).then(result => {
           console.log(`[Self Service] Registration complete for agentId ${result.agentId}`);
           // Não removemos imediatamente para que o próximo poll do frontend ainda pegue sucesso
        }).catch(err => {
           console.warn("[Self Service] Registration session failed or timed out:", err.message);
        });

        return { 
            sessionToken: session.sessionToken,
            deepLink: session.deepLink,
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
        // A API real usa um GET no backend da Vercel. Podemos verificar checando a "stage" da sessão
        // Mas a forma mais segura de saber se terminou é checar se agentsForHuman já tem o agent
        // Porém como a SDK esconde isso, se waitForCompletion já resolveu, stage será "completed" (ou equivalente)
        // Como o waitForCompletion fica rodando no background, a SDK atualiza a session? A SDK em JS geralmente atualiza o objeto.
        
        // Alternativamente, se quisermos ser stateless/robustos:
        // A SDK não expõe um "checkStatus", então se o frontend pedir poll, podemos usar o `waitForCompletion`
        // mas setando um timeout muito baixo para simular um "poll" de 1 segundo!
        const result = await session.waitForCompletion({ timeoutMs: 1000, pollIntervalMs: 1000 });
        
        // Se passar daqui sem throw, significa que completou!
        return { 
            stage: "completed",
            agentId: result.agentId,
            verified: true
        };
    } catch (error) {
        if (error.message.includes("Timeout") || error.message.includes("timeout")) {
            // Ainda pendente
            return { stage: "pending", verified: false };
        }
        console.error("[Self Service] Status check failed:", error);
        throw error;
    }
}

// Kept for backward compatibility if needed, but primary flow is now start -> poll
export async function verifySelfUser(address, proof) {
  // ... legacy or alternative verification logic if passing raw proof manually
  return { verified: false, message: "Use startSelfRegistration flow" }; 
}
