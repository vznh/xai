import { Features, GeneratedFile, ProviderKeys } from '@/types';
import { AgentRouter } from './router';
import fs from 'fs';
import path from 'path';

export class PreviewAgent {
  static async generatePreview(
    features: Features,
    providerKeys: ProviderKeys
  ): Promise<GeneratedFile[]> {
    const promptPath = path.join(process.cwd(), 'src/prompts/preview.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate.replace('{componentName}', features.componentName);

    const previewCode = await AgentRouter.callModel(prompt, providerKeys, 'preview');

    return [{
      path: 'src/pages/index.tsx',
      contents: previewCode
    }];
  }
}