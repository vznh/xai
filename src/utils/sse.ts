import type { NextApiResponse } from "next";

export type SseSender = {
  send: (event: string, data: unknown) => void;
  close: () => void;
};

export function initSse(res: NextApiResponse): SseSender {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const send = (event: string, data: unknown) => {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    res.write(`event: ${event}\n`);
    res.write(`data: ${payload}\n\n`);
  };

  const close = () => {
    res.end();
  };

  return { send, close };
}

import { NextApiResponse } from 'next';
import { SSEEvent } from '@/types';

export class SSEStream {
  private res: NextApiResponse;

  constructor(res: NextApiResponse) {
    this.res = res;
    this.setupHeaders();
  }

  private setupHeaders() {
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
  }

  write(event: SSEEvent) {
    const data = JSON.stringify(event.data);
    this.res.write(`event: ${event.type}\n`);
    this.res.write(`data: ${data}\n\n`);
    this.res.flushHeaders();
  }

  progress(step: string, note: string) {
    this.write({ type: 'progress', data: { step, note } });
  }

  file(path: string, contents: string) {
    this.write({ type: 'file', data: { path, contents } });
  }

  preview(url: string) {
    this.write({ type: 'preview', data: { url } });
  }

  done(version: string, componentName: string, files: any[], previewEntry: string, tokensSummary: any) {
    this.write({ type: 'done', data: { version, componentName, files, previewEntry, tokensSummary } });
  }

  close() {
    this.res.end();
  }
}