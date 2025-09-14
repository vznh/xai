"use client";
import React from "react";
import { useApp } from "@/stores/app";

export function Generate() {
  const images = useApp((s) => s.images);
  const analyses = useApp((s) => s.analyses);
  const apiKey = useApp((s) => s.apiKey);
  const userPrompt = useApp((s) => s.userPrompt);
  const setPrompt = useApp((s) => s.setPrompt);
  const setV0Url = useApp((s) => s.setV0Url);
  const [loading, setLoading] = React.useState(false);

  const onGenerate = async () => {
    if (!images.length || !analyses.length) return;
    setLoading(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ images, analyses, userPrompt, negatives: [], apiKey, provider: "xai" }),
      });
      const data = await r.json();
      if (data?.url) setV0Url(data.url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="text-sm font-medium">Prompt</div>
      <textarea
        className="w-full border rounded px-2 py-1 text-sm min-h-[80px]"
        placeholder="Describe what to build; reference #tags or @img:{id}"
        value={userPrompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="px-3 py-1 rounded bg-black text-white disabled:opacity-50"
        disabled={loading || !images.length || !analyses.length}
        onClick={onGenerate}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}

