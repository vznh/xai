import { Features, GeneratedFile, ProviderKeys } from '@/types';
import { AgentRouter } from './router';
import fs from 'fs';
import path from 'path';

export class LayoutAgent {
  static async applyLayout(
    component: string,
    features: Features,
    providerKeys: ProviderKeys
  ): Promise<GeneratedFile[]> {
    const promptPath = path.join(process.cwd(), 'src/prompts/layout.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate
      .replace('{component}', component)
      .replace('{features}', JSON.stringify(features, null, 2));

    const updatedComponent = await AgentRouter.callModel(prompt, providerKeys, 'layout');

    return [{
      path: `src/components/${features.componentName}/index.tsx`,
      contents: updatedComponent
    }];
  }
}