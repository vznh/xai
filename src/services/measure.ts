import { ImageInput, Features, TokenSet, LayoutHints, Box } from '@/types';

interface ColorCluster {
  color: string;
  count: number;
  pixels: number[];
}

export class MeasureService {
  static async analyzeImages(images: ImageInput[]): Promise<Features> {
    const colors: string[] = [];
    const boxes: Box[] = [];
    let layout: LayoutHints = { type: 'flex' };

    for (const image of images) {
      try {
        const imageColors = await this.extractColors(image);
        colors.push(...imageColors);

        const imageBoxes = await this.detectBoxes(image);
        boxes.push(...imageBoxes);

        const imageLayout = await this.detectLayout(image);
        if (imageLayout.type === 'grid') layout = imageLayout;
      } catch (error) {
        console.error('Error analyzing image:', image.id, error);
      }
    }

    const tokens: TokenSet = {
      colors: this.dedupeColors(colors).slice(0, 8),
      radii: [0, 6, 12, 9999],
      spacing: [4, 8, 12, 16, 24, 32],
      shadows: ['none', 'sm', 'md']
    };

    return {
      tokens,
      layout,
      boxes,
      negatives: [],
      blend: { paletteFromImageId: null, layoutFromImageId: null },
      componentName: 'GeneratedComponent'
    };
  }

  private static async extractColors(image: ImageInput): Promise<string[]> {
    // Server-side fallback - generate colors based on image metadata and tags
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']; // Blue, red, green, amber
    
    if (image.tags?.includes('blue')) return ['#3b82f6', '#1e40af', '#93c5fd'];
    if (image.tags?.includes('red')) return ['#ef4444', '#dc2626', '#fca5a5'];
    if (image.tags?.includes('green')) return ['#10b981', '#059669', '#6ee7b7'];
    if (image.tags?.includes('dark')) return ['#1f2937', '#374151', '#6b7280'];
    if (image.tags?.includes('light')) return ['#f9fafb', '#f3f4f6', '#e5e7eb'];
    
    // Return default palette
    return defaultColors;
  }

  private static clusterColors(data: Uint8ClampedArray): string[] {
    const colorMap = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue;

      // Quantize to reduce similar colors
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;

      const hex = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`;
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([color]) => color);
  }

  private static dedupeColors(colors: string[]): string[] {
    return Array.from(new Set(colors));
  }

  private static async detectBoxes(image: ImageInput): Promise<Box[]> {
    const boxes: Box[] = [];
    const width = image.width || 400;
    const height = image.height || 300;

    // Generate boxes based on tags and common UI patterns
    if (image.tags?.includes('button')) {
      boxes.push({
        id: `box_${image.id}_btn`,
        role: 'button',
        rect: { x: Math.floor(width * 0.1), y: Math.floor(height * 0.1), w: Math.floor(width * 0.3), h: 40 },
        tags: ['button']
      });
    }

    if (image.tags?.includes('card')) {
      boxes.push({
        id: `box_${image.id}_card`,
        role: 'card',
        rect: { x: 0, y: 0, w: width, h: height },
        tags: ['card']
      });
    }

    if (image.tags?.includes('input')) {
      boxes.push({
        id: `box_${image.id}_input`,
        role: 'input',
        rect: { x: Math.floor(width * 0.1), y: Math.floor(height * 0.3), w: Math.floor(width * 0.8), h: 44 },
        tags: ['input']
      });
    }

    if (image.tags?.includes('nav')) {
      boxes.push({
        id: `box_${image.id}_nav`,
        role: 'nav',
        rect: { x: 0, y: 0, w: width, h: Math.floor(height * 0.1) },
        tags: ['nav']
      });
    }

    return boxes;
  }

  private static async detectLayout(image: ImageInput): Promise<LayoutHints> {
    // Simple layout detection based on tags and aspect ratio
    const aspectRatio = (image.width || 1) / (image.height || 1);

    if (image.tags?.includes('grid') || aspectRatio > 2) {
      return {
        type: 'grid',
        columns: aspectRatio > 2 ? Math.ceil(aspectRatio) : 2,
        gutters: 16,
        align: 'start'
      };
    }

    return {
      type: 'flex',
      align: 'center'
    };
  }
}