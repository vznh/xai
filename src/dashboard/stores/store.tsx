import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ImageUpload {
  id: string
  file: File
  url: string
  tag: string
  description: string
  loaded: boolean
}

interface ApiKeys {
  grok: string
  gpt: string
  claude: string
  gemini: string
}

interface GeneratedFile {
  name: string
  content: string
  path: string
}

interface AppState {
  images: ImageUpload[]
  positiveConstraints: string
  negativeConstraints: string
  apiKeys: ApiKeys
  generatedFiles: GeneratedFile[]
  previewUrl: string
  isGenerating: boolean
  hasChanges: boolean

  addImage: (file: File) => void
  removeImage: (id: string) => void
  updateImageTag: (id: string, tag: string) => void
  updateImageDescription: (id: string, description: string) => void
  setImageLoaded: (id: string) => void
  setPositiveConstraints: (constraints: string) => void
  setNegativeConstraints: (constraints: string) => void
  updateApiKey: (provider: keyof ApiKeys, key: string) => void
  setGeneratedFiles: (files: GeneratedFile[]) => void
  setPreviewUrl: (url: string) => void
  setIsGenerating: (generating: boolean) => void
  markChanges: () => void
  clearChanges: () => void
  reset: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      images: [],
      positiveConstraints: "",
      negativeConstraints: "",
      apiKeys: { grok: "", gpt: "", claude: "", gemini: "" },
      generatedFiles: [],
      previewUrl: "",
      isGenerating: false,
      hasChanges: false,

      addImage: (file: File) => {
        const id = crypto.randomUUID()
        const url = URL.createObjectURL(file)
        set((state) => ({
          images: [...state.images, { id, file, url, tag: "", description: "", loaded: false }],
          hasChanges: true,
        }))
      },

      removeImage: (id: string) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
          hasChanges: true,
        }))
      },

      updateImageTag: (id: string, tag: string) => {
        set((state) => ({
          images: state.images.map((img) => (img.id === id ? { ...img, tag } : img)),
          hasChanges: true,
        }))
      },

      updateImageDescription: (id: string, description: string) => {
        set((state) => ({
          images: state.images.map((img) => (img.id === id ? { ...img, description } : img)),
          hasChanges: true,
        }))
      },

      setImageLoaded: (id: string) => {
        set((state) => ({
          images: state.images.map((img) => (img.id === id ? { ...img, loaded: true } : img)),
        }))
      },

      setPositiveConstraints: (constraints: string) => {
        set({ positiveConstraints: constraints, hasChanges: true })
      },

      setNegativeConstraints: (constraints: string) => {
        set({ negativeConstraints: constraints, hasChanges: true })
      },

      updateApiKey: (provider: keyof ApiKeys, key: string) => {
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
          hasChanges: true,
        }))
      },

      setGeneratedFiles: (files: GeneratedFile[]) => {
        set({ generatedFiles: files })
      },

      setPreviewUrl: (url: string) => {
        set({ previewUrl: url })
      },

      setIsGenerating: (generating: boolean) => {
        set({ isGenerating: generating })
      },

      markChanges: () => {
        set({ hasChanges: true })
      },

      clearChanges: () => {
        set({ hasChanges: false })
      },

      reset: () => {
        set({
          images: [],
          positiveConstraints: "",
          negativeConstraints: "",
          generatedFiles: [],
          previewUrl: "",
          hasChanges: false,
        })
      },
    }),
    {
      name: "inspiration-board-storage",
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        positiveConstraints: state.positiveConstraints,
        negativeConstraints: state.negativeConstraints,
      }),
    },
  ),
)
