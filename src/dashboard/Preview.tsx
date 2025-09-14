"use client";
import React from "react";
import { useApp } from "@/stores/app";

export function Preview() {
  const url = useApp((s) => s.v0Url);
  return (
    <div className="border rounded h-full overflow-hidden flex flex-col">
      <div className="p-2 text-sm font-medium">Preview</div>
      <div className="flex-1">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline px-2 text-sm">
            Open generated preview
          </a>
        ) : (
          <div className="px-2 text-xs text-muted-foreground">No preview yet</div>
        )}
      </div>
    </div>
  );
}

