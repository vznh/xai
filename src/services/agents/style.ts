import { Features, GeneratedFile, ProviderKeys } from '@/types';
import { AgentRouter } from './router';
import fs from 'fs';
import path from 'path';

export class StyleAgent {
  static async applyStyles(
    component: string,
    features: Features,
    providerKeys: ProviderKeys
  ): Promise<GeneratedFile[]> {
    const promptPath = path.join(process.cwd(), 'src/prompts/style.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate
      .replace('{component}', component)
      .replace('{features}', JSON.stringify(features, null, 2));

    const response = await AgentRouter.callModel(prompt, providerKeys, 'style');
    
    const files: GeneratedFile[] = [];
    
    // Parse response to separate component code and styles
    const parts = response.split('---STYLES---');
    
    files.push({
      path: `src/components/${features.componentName}/index.tsx`,
      contents: parts[0].trim()
    });

    if (parts[1]) {
      files.push({
        path: 'src/styles/styles.css',
        contents: parts[1].trim()
      });
    }

    return files;
  }
}