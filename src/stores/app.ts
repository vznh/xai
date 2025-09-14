import { create } from "zustand";
import type { InspirationImage, ImageAnalysis } from "@/types";

export type Img = InspirationImage & { previewUrl?: string };

type State = {
  images: Img[];
  analyses: ImageAnalysis[];
  userPrompt: string;
  v0Url?: string;
  codeFiles: Array<{ name: string; content: string; path?: string }>;
};

type Actions = {
  setImages: (imgs: Img[]) => void;
  appendImages: (imgs: Img[]) => void;
  setAnalyses: (a: ImageAnalysis[]) => void;
  appendAnalyses: (a: ImageAnalysis[]) => void;
  setPrompt: (p: string) => void;
  setV0Url: (u?: string) => void;
  setCodeFiles: (files: Array<{ name: string; content: string; path?: string }>) => void;
  clear: () => void;
};

export const useApp = create<State & Actions>((set) => ({
  images: [],
  analyses: [],
  userPrompt: "",
  v0Url: undefined,
  codeFiles: [],
  setImages: (imgs) => set({ images: imgs }),
  appendImages: (imgs) => set((s) => ({ images: [...s.images, ...imgs] })),
  setAnalyses: (a) => set({ analyses: a }),
  appendAnalyses: (a) => set((s) => ({ analyses: [...s.analyses, ...a] })),
  setPrompt: (p) => set({ userPrompt: p }),
  setV0Url: (u) => set({ v0Url: u }),
  setCodeFiles: (files) => set({ codeFiles: files }),
  clear: () => set({ images: [], analyses: [], userPrompt: "", v0Url: undefined }),
}));


