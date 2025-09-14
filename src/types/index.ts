export type ProviderName = "anthropic" | "openai" | "google" | "xai" | "openai-compatible";

export type InspirationImage = {
  id: string;
  url?: string;
  blobBase64?: string;
  filename?: string;
  mime: string;
  width?: number;
  height?: number;
  tags?: string[];
  description?: string;
  weight?: number;
};

export type SurfaceLayers = {
  palette?: { background?: string; surface?: string; border?: string; accent?: string };
  gradients?: Array<{
    present: boolean;
    type?: "linear" | "radial";
    angleDeg?: number;
    stops?: Array<{ color: string; pos: number }>;
  }>;
  radii?: { buckets?: number[]; dominant?: number; notes?: string };
  spacing?: { scale?: number[]; dominant?: number; gaps?: number[] };
  shadows?: Array<{ tier: 1 | 2 | 3; approx: string }>;
  strokes?: { thicknessPx?: number[]; dominant?: number; style?: "solid" | "dashed" };
  layout?: { kind?: "flex" | "grid" | "stack"; columns?: number | null; gutters?: number | null; align?: string; notes?: string };
  boxes?: Array<{
    role: "button" | "input" | "card" | "nav" | "tabs" | "table" | "modal" | "unknown";
    rect: { x: number; y: number; w: number; h: number };
    radiiPx?: number;
    shadowTier?: 0 | 1 | 2 | 3;
    strokePx?: number;
  }>;
  negativesSeen?: string[];
};

export type ImageAnalysis = {
  imageId: string;
  tags: string[];
  microdesc: string;
  surfaceLayers: SurfaceLayers;
};

export type AnalyzeRequest = {
  images: InspirationImage[];
  visionModel?: string;
};

export type AnalyzeResponse = ImageAnalysis[];

export type GenerateRequest = {
  images: InspirationImage[];
  negatives: string[];
  userPrompt: string;
  analyses: ImageAnalysis[];
  componentName?: string;
  appName?: string;
  textModel?: string;
};

export type GeneratedFile = { path: string; contents: string };

export type GenerateResponse = {
  files: GeneratedFile[];
};

export interface ImageInput {
  id: string;
  url?: string;
  blobBase64?: string;
  filename?: string;
  mime: string;
  width?: number;
  height?: number;
  tags?: string[];
  description?: string;
  weight?: number;
}

export interface BlendConfig {
  paletteFromImageId: string | null;
  layoutFromImageId: string | null;
}

export interface UserTypography {
  family?: string;
  scale?: number[];
}

export interface ProviderKeys {
  openai?: string;
  grok?: string;
  gemini?: string;
  claude?: string;
}

export interface GenerateRequest {
  images: ImageInput[];
  blend: BlendConfig;
  negatives: string[];
  userTypography?: UserTypography | null;
  providerKeys?: ProviderKeys;
}

export interface TokenSet {
  colors: string[];
  radii: number[];
  spacing: number[];
  shadows: string[];
}

export interface LayoutHints {
  type: 'flex' | 'grid';
  columns?: number;
  gutters?: number;
  align?: string;
}

export interface Box {
  id: string;
  role?: 'button' | 'input' | 'card' | 'nav' | 'tabs' | 'table' | 'modal' | 'unknown';
  rect: { x: number; y: number; w: number; h: number };
  tags?: string[];
}

export interface Features {
  tokens: TokenSet;
  layout: LayoutHints;
  boxes: Box[];
  negatives: string[];
  blend: BlendConfig;
  componentName: string;
}

export interface GeneratedFile {
  path: string;
  contents: string;
}

export interface Version {
  version: string;
  org_id?: string;
  user_id?: string;
  component_name: string;
  preview_url?: string;
  status: 'pending' | 'ready' | 'failed';
  ttl_at?: string;
  created_at: string;
}

export interface SSEEvent {
  type: 'progress' | 'file' | 'preview' | 'done';
  data: any;
}

export interface ProgressEvent {
  step: string;
  note: string;
}

export interface FileEvent {
  path: string;
  contents: string;
}

export interface PreviewEvent {
  url: string;
}

export interface DoneEvent {
  version: string;
  componentName: string;
  files: GeneratedFile[];
  previewEntry: string;
  tokensSummary: TokenSet;
}