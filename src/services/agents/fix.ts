import { Features, GeneratedFile, ProviderKeys } from '@/types';
import { AgentRouter } from './router';
import fs from 'fs';
import path from 'path';

interface Violation {
  type: string;
  description: string;
  line?: number;
}

export class FixAgent {
  static async fixViolations(
    component: string,
    violations: Violation[],
    providerKeys: ProviderKeys
  ): Promise<GeneratedFile[]> {
    if (violations.length === 0) {
      return [];
    }

    const promptPath = path.join(process.cwd(), 'src/prompts/fix.txt');
    const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
    const prompt = promptTemplate
      .replace('{component}', component)
      .replace('{violations}', JSON.stringify(violations, null, 2));

    const fixedComponent = await AgentRouter.callModel(prompt, providerKeys, 'fix');

    return [{
      path: 'component.tsx',
      contents: fixedComponent
    }];
  }

  static validateComponent(componentCode: string): Violation[] {
    const violations: Violation[] = [];
    const lines = componentCode.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for font-family
      if (line.includes('font-family') || line.includes('fontFamily')) {
        violations.push({
          type: 'font-family',
          description: 'Font family declarations are not allowed',
          line: lineNum
        });
      }

      // Check for external font URLs
      if (line.includes('fonts.google') || line.includes('font-url') || line.includes('@import url')) {
        violations.push({
          type: 'external-fonts',
          description: 'External font URLs are not allowed',
          line: lineNum
        });
      }

      // Check for Next.js Image component without dimensions
      if (line.includes('from "next/image"') || line.includes("from 'next/image'")) {
        violations.push({
          type: 'nextjs-image',
          description: 'Use regular HTML img tags instead of Next.js Image component',
          line: lineNum
        });
      }

      // Check for img tags without width/height
      if (line.includes('<img') && (!line.includes('width=') || !line.includes('height='))) {
        violations.push({
          type: 'missing-dimensions',
          description: 'img tags must include width and height attributes',
          line: lineNum
        });
      }

      // Check for animations
      if (line.includes('animation') || line.includes('transition') || line.includes('animate-')) {
        violations.push({
          type: 'animations',
          description: 'Animations are not allowed in v1',
          line: lineNum
        });
      }

      // Check for global resets
      if (line.includes('* {') || line.includes('html {') || line.includes('body {')) {
        violations.push({
          type: 'global-resets',
          description: 'Global CSS resets are not allowed',
          line: lineNum
        });
      }
    });

    return violations;
  }

  static async validateTypeScript(componentCode: string): Promise<Violation[]> {
    // Simple validation - in a real implementation, you'd use the TypeScript compiler API
    const violations: Violation[] = [];
    
    // Check for basic syntax issues
    if (!componentCode.includes('export')) {
      violations.push({
        type: 'missing-export',
        description: 'Component must have an export statement'
      });
    }

    if (!componentCode.includes('import')) {
      violations.push({
        type: 'missing-imports',
        description: 'Component should include necessary imports'
      });
    }

    return violations;
  }
}