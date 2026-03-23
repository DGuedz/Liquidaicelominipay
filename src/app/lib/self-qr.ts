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
        // Using 'M' or 'H' sometimes fails on very long payloads, 'L' is safer
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

  // Fallback to a dummy QR code if everything fails (prevents UI freeze in demo)
  try {
    const fallbackPayload = "https://self.xyz";
    const fallbackDataUrl = await QRCode.toDataURL(fallbackPayload, { width: 220, margin: 1 });
    console.warn("⚠️ Used fallback QR code because all payloads failed.");
    console.groupEnd();
    return { dataUrl: fallbackDataUrl, payload: fallbackPayload };
  } catch {
    console.error("❌ Exhausted all QR candidates and fallback failed.");
    console.groupEnd();
    return null;
  }
}
