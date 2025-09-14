import { Features, GeneratedFile, ProviderKeys } from '@/types';
import { AgentRouter } from './router';
import fs from 'fs';
import path from 'path';

export class ComponentAgent {
  static async generateComponent(
    features: Features,
    providerKeys: ProviderKeys
  ): Promise<GeneratedFile[]> {
    const promptPath = path.join(process.cwd(), 'src/prompts/component.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate.replace('{features}', JSON.stringify(features, null, 2));

    const componentCode = await AgentRouter.callModel(prompt, providerKeys, 'component');

    return [{
      path: `src/components/${features.componentName}/index.tsx`,
      contents: componentCode
    }];
  }
}