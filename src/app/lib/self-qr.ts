import QRCode from "qrcode";

type SelfQrInput = {
  actionUrl?: string;
  deepLink?: string;
  qrValue?: string;
};

export type SelfQrResult = {
  dataUrl: string;
  payload: string;
};

function asNonEmptyString(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
}

function uniqueCandidates(values: string[]) {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    ordered.push(value);
  }
  return ordered;
}

export async function generateSelfQrDataUrl(input: SelfQrInput): Promise<SelfQrResult | null> {
  const candidates = uniqueCandidates([
    asNonEmptyString(input.actionUrl),
    asNonEmptyString(input.deepLink),
    asNonEmptyString(input.qrValue),
  ]);

  console.group("[Self QA] QR Generator Diagnostics");
  console.log("Input payloads:", { actionUrl: input.actionUrl, deepLink: input.deepLink, qrValue: input.qrValue });
  console.log("Unique candidates to attempt:", candidates);

  for (const payload of candidates) {
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 220,
        margin: 1,
        // Lower correction level increases max payload capacity for long Self URLs.
        errorCorrectionLevel: "L",
      });
      console.log("✅ Successfully generated QR code using payload:", payload);
      console.groupEnd();
      return { dataUrl, payload };
    } catch (err) {
      console.warn("⚠️ Failed to generate QR code for payload:", payload, err);
      // Try next payload candidate.
    }
  }

  console.error("❌ Exhausted all QR candidates. Could not generate QR.");
  console.groupEnd();
  return null;
}
