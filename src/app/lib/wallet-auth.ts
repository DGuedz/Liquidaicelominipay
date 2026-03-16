import {
  apiPost,
  AuthChallengePayload,
  AuthSessionPayload,
  getApiAuthToken,
  setApiAuthToken,
} from "./api";

export async function ensureWalletAuthSession(
  address: string,
  signWalletMessage: (message: string) => Promise<string>,
) {
  const existing = getApiAuthToken();
  if (existing) return existing;

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
