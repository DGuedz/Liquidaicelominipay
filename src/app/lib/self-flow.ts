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

  const normalizedDeepLink = deepLink || qrDeepLinkFromObject || qrEncodedObject || qrString;
  const normalizedQrValue = qrString || qrDeepLinkFromObject || qrEncodedObject || normalizedDeepLink;
  const actionUrl = normalizedDeepLink || normalizedQrValue;

  return {
    actionUrl,
    deepLink: normalizedDeepLink,
    qrValue: normalizedQrValue,
  };
}
