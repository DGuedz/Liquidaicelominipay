type UnknownRecord = Record<string, unknown>;

function asNonEmptyString(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function findDeepLinkCandidate(source: unknown): string {
  const direct = asNonEmptyString(source);
  if (direct) return direct;

  const record = asRecord(source);
  if (!record) return "";

  const topLevelCandidate = asNonEmptyString(record.deepLink)
    || asNonEmptyString(record.deeplink)
    || asNonEmptyString(record.url)
    || asNonEmptyString(record.actionUrl)
    || asNonEmptyString(record.selfUrl);
  if (topLevelCandidate) return topLevelCandidate;

  return "";
}

function isLikelyActionUrl(value: string): boolean {
  if (!value) return false;
  if (/^self:\/\//i.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function encodeSelfAppJsonString(value: string): string {
  if (!value || !value.trim().startsWith("{")) return "";
  try {
    const parsed = JSON.parse(value);
    const record = asRecord(parsed);
    if (!record) return "";
    return encodeSelfAppPayload(record);
  } catch {
    return "";
  }
}

function encodeSelfAppPayload(payload: UnknownRecord) {
  const selfApp = encodeURIComponent(JSON.stringify(payload));
  return `https://redirect.self.xyz?selfApp=${selfApp}`;
}

export type SelfSessionLike = {
  deepLink?: unknown;
  qrData?: unknown;
};

export type ResolvedSelfSessionLinks = {
  actionUrl: string;
  deepLink: string;
  qrValue: string;
};

export function resolveSelfSessionLinks(session: SelfSessionLike): ResolvedSelfSessionLinks {
  const deepLink = findDeepLinkCandidate(session.deepLink);

  const qrString = asNonEmptyString(session.qrData);
  const qrRecord = asRecord(session.qrData);
  const qrDeepLinkFromObject = findDeepLinkCandidate(qrRecord);
  const qrEncodedObject = qrRecord ? encodeSelfAppPayload(qrRecord) : "";
  const qrStringAsUrl = isLikelyActionUrl(qrString) ? qrString : "";
  const qrStringAsEncodedSelfApp = encodeSelfAppJsonString(qrString);

  // Prefer explicit deep-link style values; only fall back to raw qrString as a last resort.
  const normalizedDeepLink =
    deepLink ||
    qrDeepLinkFromObject ||
    qrEncodedObject ||
    qrStringAsUrl ||
    qrStringAsEncodedSelfApp;
  const normalizedQrValue =
    qrStringAsUrl ||
    qrStringAsEncodedSelfApp ||
    qrDeepLinkFromObject ||
    qrEncodedObject ||
    normalizedDeepLink ||
    qrString;
  const actionUrl = normalizedDeepLink || normalizedQrValue;

  return {
    actionUrl,
    deepLink: normalizedDeepLink,
    qrValue: normalizedQrValue,
  };
}
