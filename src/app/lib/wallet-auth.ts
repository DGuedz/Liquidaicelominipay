import {
  apiPost,
  apiGet,
  AuthChallengePayload,
  AuthSessionPayload,
  clearApiAuthToken,
  getApiAuthToken,
  setApiAuthToken,
} from "./api";

export async function ensureWalletAuthSession(
  address: string,
  signWalletMessage: (message: string, expectedAddress?: string) => Promise<string>,
) {
  const existing = getApiAuthToken();
  const normalizedAddress = String(address || "").trim().toLowerCase();
  
  if (existing) {
    try {
      const currentSession = await apiGet<{ address: string; expiresAt: string }>("/api/auth/me");
      if (String(currentSession.address || "").trim().toLowerCase() === normalizedAddress) {
        return existing;
      }
    } catch {
      // Token invalid/expired. We renew below.
    }
    clearApiAuthToken();
  }

  try {
    const challenge = await apiPost<AuthChallengePayload>("/api/auth/challenge", {
      address,
    });
    
    // We pass the address to signWalletMessage to ensure the exact account signs it
    const signature = await signWalletMessage(challenge.message, address);
    
    const session = await apiPost<AuthSessionPayload>("/api/auth/verify", {
      address,
      nonce: challenge.nonce,
      signature,
    });

    const sessionAddress = String((session as { address?: string }).address || "").trim().toLowerCase();
    if (sessionAddress && sessionAddress !== normalizedAddress) {
      clearApiAuthToken();
      throw new Error("Wallet changed while signing session. Reconnect the selected wallet and try again.");
    }
    if (!(session as { token?: string }).token) {
      throw new Error("Auth session token missing from backend response.");
    }

    setApiAuthToken(session.token);
    return session.token;
  } catch (error) {
    // If the user rejects the signature, Wagmi throws a specific UserRejectedRequestError.
    // We must clear the token to not leave the UI in a hung state.
    clearApiAuthToken();
    throw error;
  }
}
