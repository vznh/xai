import type { ProviderName } from "@/types";

export type AiClient = {
  visionDescribe: (args: {
    provider: ProviderName;
    apiKey: string;
    apiBaseUrl?: string;
    model?: string;
    image: { mime: string; dataUrl?: string; url?: string };
    tags?: string[];
    system?: string;
    userText?: string;
  }) => Promise<string>;
  visionSurface: (args: {
    provider: ProviderName;
    apiKey: string;
    apiBaseUrl?: string;
    model?: string;
    image: { mime: string; dataUrl?: string; url?: string };
    tags?: string[];
    system?: string;
    userText?: string;
  }) => Promise<any>;
  generateFiles: (args: {
    provider: ProviderName;
    apiKey: string;
    apiBaseUrl?: string;
    model?: string;
    prompt: string;
  }) => Promise<{ files: { path: string; contents: string }[] }>;
  compose: (args: {
    provider: ProviderName;
    apiKey: string;
    apiBaseUrl?: string;
    model?: string;
    prompt: string;
  }) => Promise<string>;
};

function anthropicHeaders(key: string) {
  return {
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  } as const;
}

async function anthropicVision({
  apiKey,
  model = "claude-3-opus-20240229",
  image,
  tags,
  system,
  userText,
}: {
  apiKey: string;
  model?: string;
  image: { mime: string; dataUrl?: string; url?: string };
  tags?: string[];
  system?: string;
  userText?: string;
}) {
  const content: any[] = [];
  if (userText) content.push({ type: "text", text: userText });
  content.push({ type: "text", text: `Tags: ${(tags || []).join(", ")}` });
  if (image.url) content.push({ type: "image", source: { type: "url", url: image.url } });
  if (image.dataUrl) content.push({ type: "image", source: { type: "base64", media_type: image.mime, data: image.dataUrl.split(",")[1] } });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0,
      system,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic vision error: ${res.status}`);
  const json: any = await res.json();
  const text = json?.content?.[0]?.text || "";
  return text as string;
}

async function anthropicText({ apiKey, model = "claude-3-opus-20240229", prompt }: { apiKey: string; model?: string; prompt: string }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({ model, max_tokens: 4000, temperature: 0, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic text error: ${res.status}`);
  const json: any = await res.json();
  const text = json?.content?.[0]?.text || "";
  return text as string;
}

function openaiHeaders(key: string) {
  return { Authorization: `Bearer ${key}`, "content-type": "application/json" } as const;
}

function getXaiVisionModels(): string[] {
  const env = process.env.XAI_VISION_MODELS;
  if (env && env.trim().length > 0) return env.split(",").map((s) => s.trim()).filter(Boolean);
  return ["grok-3", "grok-3-mini", "grok-2-vision", "grok-1.5v"];
}

async function openaiChat({
  apiKey,
  apiBaseUrl = "https://api.x.ai",
  model = "grok-3",
  messages,
}: {
  apiKey: string;
  apiBaseUrl?: string;
  model?: string;
  messages: any[];
}) {
  const res = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: openaiHeaders(apiKey),
    body: JSON.stringify({ model, messages, temperature: 0, response_format: { type: "text" } }),
  });
  if (!res.ok) throw new Error(`XAI error ${res.status}`);
  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    // Some providers return array content parts
    try {
      return (json?.choices?.[0]?.message?.content || []).map((p: any) => (typeof p === "string" ? p : p?.text)).join(" ");
    } catch {
      return "";
    }
  }
  return content as string;
}

async function xaiVision({
  apiKey,
  apiBaseUrl = process.env.XAI_API_BASE_URL_FALLBACK || "https://api.x.ai",
  model = "grok-3",
  image,
  tags,
  system,
  userText,
}: {
  apiKey: string;
  apiBaseUrl?: string;
  model?: string;
  image: { mime: string; dataUrl?: string; url?: string };
  tags?: string[];
  system?: string;
  userText?: string;
}) {
  const content: any[] = [];
  if (userText) content.push({ type: "text", text: userText });
  if (tags && tags.length) content.push({ type: "text", text: `Tags: ${(tags || []).join(", ")}` });
  if (image.url) content.push({ type: "image_url", image_url: { url: image.url } });
  if (image.dataUrl) content.push({ type: "image_url", image_url: { url: image.dataUrl } });

  const messages = [system ? { role: "system", content: system } : undefined, { role: "user", content }].filter(Boolean);

  const models = [model, ...getXaiVisionModels().filter((m) => m !== model)];
  let lastErr: any = null;
  for (const m of models) {
    try {
      const out = await openaiChat({ apiKey, apiBaseUrl, model: m, messages });
      try { console.log("xaiVision:model", m); } catch {}
      return out;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error("All XAI vision models failed");
}

async function xaiText({ apiKey, apiBaseUrl = "https://api.x.ai", model = "grok-4", prompt }: { apiKey: string; apiBaseUrl?: string; model?: string; prompt: string }) {
  const messages = [{ role: "user", content: prompt }];
  return openaiChat({ apiKey, apiBaseUrl, model, messages });
}

export const ai: AiClient = {
  visionDescribe: async ({ provider, apiKey, apiBaseUrl, model, image, tags, system, userText }) => {
    if (provider === "anthropic") return anthropicVision({ apiKey, model, image, tags, system, userText });
    if (provider === "xai") return xaiVision({ apiKey, apiBaseUrl, model, image, tags, system, userText });
    throw new Error("Provider not implemented");
  },
  visionSurface: async ({ provider, apiKey, apiBaseUrl, model, image, tags, system, userText }) => {
    if (provider === "anthropic") return JSON.parse(await anthropicVision({ apiKey, model, image, tags, system, userText }));
    if (provider === "xai") return JSON.parse(await xaiVision({ apiKey, apiBaseUrl, model, image, tags, system, userText }));
    throw new Error("Provider not implemented");
  },
  generateFiles: async ({ provider, apiKey, apiBaseUrl, model, prompt }) => {
    if (provider === "anthropic") {
      const out = await anthropicText({ apiKey, model, prompt });
      try {
        const parsed = JSON.parse(out);
        if (!Array.isArray(parsed?.files)) throw new Error("Missing files array");
        return parsed;
      } catch (e) {
        throw new Error("Claude output was not valid JSON files");
      }
    }
    if (provider === "xai") {
      const out = await xaiText({ apiKey, apiBaseUrl, model, prompt });
      try {
        const parsed = JSON.parse(out);
        if (!Array.isArray(parsed?.files)) throw new Error("Missing files array");
        return parsed;
      } catch (e) {
        throw new Error("XAI output was not valid JSON files");
      }
    }
    throw new Error("Provider not implemented");
  },
  compose: async ({ provider, apiKey, apiBaseUrl, model, prompt }) => {
    if (provider === "anthropic") return anthropicText({ apiKey, model, prompt });
    if (provider === "xai") return xaiText({ apiKey, apiBaseUrl, model, prompt });
    throw new Error("Provider not implemented");
  },
};


