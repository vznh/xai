import type { NextApiRequest, NextApiResponse } from "next";
import { ai } from "@/services/ai";
import type { AnalyzeRequest, AnalyzeResponse, InspirationImage } from "@/types";

export const config = { api: { bodyParser: { sizeLimit: process.env.API_BODY_SIZE || "50mb" } } };

const SYSTEM = `You identify only VISIBLE UI surface details from a single image. No hidden/inferred or typographic guesses. Be precise but conservative.
Return STRICT JSON for the described schema. Do not include prose.`;

function toDataUrl(img: InspirationImage): { mime: string; dataUrl?: string; url?: string } {
  if (img.blobBase64) return { mime: img.mime, dataUrl: img.blobBase64 };
  if (img.url) return { mime: img.mime, url: img.url };
  throw new Error("Image missing data");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AnalyzeResponse | { error: string }>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body as AnalyzeRequest;
  const visionModel = body?.visionModel;
  const apiKey = process.env.XAI_API_KEY_FALLBACK || "";
  const apiBaseUrl = process.env.XAI_API_BASE_URL_FALLBACK || "https://api.x.ai";
  const provider = "xai" as const;
  const images = body?.images;
  if (!apiKey || !images || !Array.isArray(images)) return res.status(400).json({ error: "Invalid request" });
  if (images.length > Number(process.env.API_MAX_IMAGE_COUNT || 5)) return res.status(400).json({ error: "Too many images" });

  try {
    const out: AnalyzeResponse = [];
    for (const img of images) {
      try {
        const userText = `Analyze visible surface-only layers. Tags: ${(img.tags || []).join(", ")}`;
        const text = await ai.visionDescribe({ provider, apiKey, apiBaseUrl, model: visionModel, image: toDataUrl(img), tags: img.tags, system: SYSTEM, userText });
        let microdesc = (text || "").trim();
        let structured: any | null = null;
        try { structured = JSON.parse(text); } catch {}
        if (!structured) {
          const STRUCT_USER = `Return ONLY a JSON object with keys imageId, tags, microdesc, surfaceLayers for imageId=${img.id}. No markdown.`;
          try {
            structured = await ai.visionSurface({ provider, apiKey, apiBaseUrl, model: visionModel, image: toDataUrl(img), tags: img.tags, system: SYSTEM, userText: STRUCT_USER });
          } catch {}
        }
        if (structured && typeof structured?.microdesc === "string") microdesc = structured.microdesc;
        const surfaceLayers = structured?.surfaceLayers || structured || {};
        out.push({ imageId: img.id, tags: img.tags || [], microdesc, surfaceLayers });
      } catch {
        try {
          // Text-only fallback using tags + description; ask for strict JSON
          const jsonText = await ai.compose({
            provider: "xai",
            apiKey,
            apiBaseUrl,
            model: visionModel || "grok-mini",
            prompt: `Return ONLY a JSON object with keys imageId, tags, microdesc, surfaceLayers. No markdown.\nimageId:${img.id}\ntags:${JSON.stringify(img.tags || [])}\ndescription:${img.description || ""}`,
          });
          const structured = JSON.parse(jsonText);
          out.push({ imageId: img.id, tags: img.tags || [], microdesc: structured.microdesc || img.description || `Image ${img.filename || img.id}`, surfaceLayers: structured.surfaceLayers || {} });
        } catch {
          // Final stub
          out.push({ imageId: img.id, tags: img.tags || [], microdesc: img.description || `Image ${img.filename || img.id}`, surfaceLayers: {} });
        }
      }
    }
    try { console.log("analyze:success", { count: out.length }); } catch {}
    return res.status(200).json(out);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Analyze failed" });
  }
}


