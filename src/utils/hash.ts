import crypto from "crypto";

export function sha256Base64(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return crypto.createHash("sha256").update(buf).digest("base64");
}

export function base64ToBuffer(b64: string): Buffer {
  // Support data URLs
  const comma = b64.indexOf(",");
  const pure = comma >= 0 ? b64.slice(comma + 1) : b64;
  return Buffer.from(pure, "base64");
}

export async function sha256(data: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashImage(blobBase64: string): Promise<string> {
  return sha256(blobBase64);
}