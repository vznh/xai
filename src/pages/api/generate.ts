import type { NextApiRequest, NextApiResponse } from "next";
import type { GenerateRequest, InspirationImage, ImageAnalysis } from "@/types";
import { v0 } from "v0-sdk";

export const config = { api: { bodyParser: { sizeLimit: process.env.API_BODY_SIZE || "50mb" } } };

function toV0Image(img: InspirationImage): { mime: string; url?: string; dataUrl?: string } {
  if (img.blobBase64) return { mime: img.mime, dataUrl: img.blobBase64 };
  if (img.url) return { mime: img.mime, url: img.url };
  throw new Error("Image missing data");
}

function buildDetailsForModel(args: {
  appName?: string;
  componentName?: string;
  userPrompt: string;
  negatives: string[];
  images: InspirationImage[];
  analyses: ImageAnalysis[];
}) {
  const { appName = "App", componentName = "Component", userPrompt, negatives, images, analyses } = args;
  const lines: string[] = [];
  lines.push(`Component name: ${componentName}. App: ${appName}.`);
  lines.push(`User prompt (may reference #tags or @img:{id}): ${userPrompt}`);
  if (negatives.length) lines.push(`Negatives: ${negatives.join(", ")}`);
  lines.push(`Images:`);
  for (const img of images) {
    lines.push(`- ${img.id} tags=[${(img.tags||[]).join(", ")}] desc="${img.description||""}"`);
  }
  lines.push(`Surface details per image:`);
  for (const a of analyses) {
    lines.push(`- ${a.imageId} microdesc="${a.microdesc}" layers=${JSON.stringify(a.surfaceLayers)}`);
  }
  return lines.join("\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ url: string } | { error: string }>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body as GenerateRequest;
  const { images, analyses, negatives, userPrompt, appName, componentName } = body || ({} as GenerateRequest);
  if (!analyses || !Array.isArray(analyses) || analyses.length === 0) return res.status(400).json({ error: "Analyses required" });

  try {
    // Build a direct v0 prompt from analyses and user inputs
    const details = buildDetailsForModel({ appName, componentName, userPrompt, negatives: negatives || [], images: [], analyses });
    const v0Prompt = [
      "Build a single headless React + TypeScript + Tailwind component.",
      "White background, center the component on both axes, overflow-hidden, no extra text beyond the component.",
      "No font-family declarations or animations. Tailwind utilities only; minimal CSS if absolutely necessary.",
      details,
    ].join("\n");

    const chat = await v0.chats.create({ message: v0Prompt });
    const url = (chat as any)?.demo || (chat as any)?.webUrl || (chat as any)?.url;
    if (!url) return res.status(502).json({ error: "V0 response missing demo url" });
    const files = (chat as any)?.files || [];
    try { console.log("generate:success", { url, filesCount: Array.isArray(files) ? files.length : 0 }); } catch {}
    return res.status(200).json({ url, files });
  } catch (e: any) {
    try { console.error("generate:exception", { message: e?.message, stack: e?.stack }); } catch {}
    return res.status(500).json({ error: e?.message || "Generate failed" });
  }
}