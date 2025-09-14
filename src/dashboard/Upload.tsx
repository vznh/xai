"use client";
import React from "react";
import { useApp } from "@/stores/app";
import type { InspirationImage, AnalyzeRequest } from "@/types";

export function Upload() {
  const images = useApp((s) => s.images);
  const setImages = useApp((s) => s.setImages);
  const appendImages = useApp((s) => s.appendImages);
  const analyses = useApp((s) => s.analyses);
  const appendAnalyses = useApp((s) => s.appendAnalyses);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const cap = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_COUNT || 5);
    const remaining = Math.max(0, cap - images.length);
    if (remaining === 0) return;

    const picked = Array.from(files).slice(0, remaining);
    const newItems: InspirationImage[] = [];
    for (const f of picked) {
      const b64 = await toBase64(f);
      newItems.push({ id: cryptoRandom(), blobBase64: b64, mime: f.type, filename: f.name, tags: [] });
    }
    if (newItems.length === 0) return;

    appendImages(newItems as any);
    try {
      const req: AnalyzeRequest = { provider: "xai", apiKey: "", images: newItems } as any;
      const r = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
      const data = await r.json();
      if (Array.isArray(data)) appendAnalyses(data as any);
    } catch (e) {}
  };

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="text-sm font-medium">Upload</div>
      <input type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} />
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, i) => {
          const a = analyses.find((x) => x.imageId === img.id);
          return (
            <div key={img.id} className="border rounded p-2 space-y-2">
              {img.blobBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.blobBase64} alt={img.filename || img.id} className="w-full h-24 object-cover rounded" />
              ) : null}
              <input className="w-full border rounded px-2 py-1 text-xs" placeholder="comma tags" onChange={(e) => {
                const tags = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                const next = images.slice();
                next[i] = { ...img, tags };
                setImages(next);
              }} />
              <textarea className="w-full border rounded px-2 py-1 text-xs" placeholder="description (optional)" onChange={(e) => {
                const next = images.slice();
                next[i] = { ...img, description: e.target.value };
                setImages(next);
              }} />
              <div className="text-xs text-muted-foreground min-h-[2rem]">{a?.microdesc || ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

