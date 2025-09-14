import { GeneratedFile } from '@/types';

export class StorageService {
  static storeFiles(version: string, files: GeneratedFile[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`files_${version}`, JSON.stringify(files));
    }
  }

  static getFiles(version: string): GeneratedFile[] {
    if (typeof window === 'undefined') return [];
    const files = localStorage.getItem(`files_${version}`);
    return files ? JSON.parse(files) : [];
  }

  static deleteFiles(version: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`files_${version}`);
    }
  }

  static storeImage(imageId: string, blobBase64: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`image_${imageId}`, blobBase64);
    }
  }

  static getImage(imageId: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`image_${imageId}`);
  }

  static deleteImage(imageId: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`image_${imageId}`);
    }
  }
}