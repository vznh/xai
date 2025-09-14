import { v0 } from "v0-sdk";
type V0Image = { mime: string; url?: string; dataUrl?: string };

export async function v0Generate(args: { prompt: string; timeoutMs?: number }): Promise<{ url: string; id?: string }>
{
  if (!process.env.V0_API_KEY) throw new Error("Missing V0_API_KEY");
  const abort = new AbortController();
  const t = setTimeout(() => abort.abort(), args.timeoutMs || Number(process.env.AI_TIMEOUT_MS || 120000));
  try {
    const chat = await v0.chats.create({ message: args.prompt });
    try { console.log("v0-sdk:create-chat success", chat); } catch {}
    const url = (chat as any)?.demo || (chat as any)?.webUrl || (chat as any)?.url;
    if (!url) throw new Error("V0 SDK response missing demo url");
    return { url, id: (chat as any)?.id };
  } finally {
    clearTimeout(t);
  }
}


