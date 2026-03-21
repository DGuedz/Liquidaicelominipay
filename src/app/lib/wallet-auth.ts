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
  signWalletMessage: (message: string) => Promise<string>,
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

  const challenge = await apiPost<AuthChallengePayload>("/api/auth/challenge", {
    address,
  });
  const signature = await signWalletMessage(challenge.message);
  const session = await apiPost<AuthSessionPayload>("/api/auth/verify", {
    address,
    nonce: challenge.nonce,
    signature,
  });

  setApiAuthToken(session.token);
  return session.token;
}
