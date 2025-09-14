import { GeneratedFile, TokenSet } from '@/types';

interface DeploymentResponse {
  url: string;
  deploymentId: string;
}

export class SandboxService {
  private static VERCEL_API = 'https://api.vercel.com';
  
  static async deployToVercel(files: GeneratedFile[], projectName: string): Promise<DeploymentResponse> {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      throw new Error('VERCEL_TOKEN not configured');
    }

    try {
      // Create deployment payload
      const deployment = {
        name: projectName,
        files: files.map(file => ({
          file: file.path,
          data: Buffer.from(file.contents).toString('base64')
        })),
        projectSettings: {
          framework: 'nextjs'
        },
        target: 'preview'
      };

      const response = await fetch(`${this.VERCEL_API}/v13/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deployment)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vercel deployment failed: ${error}`);
      }

      const result = await response.json();
      
      return {
        url: `https://${result.url}`,
        deploymentId: result.uid
      };
    } catch (error) {
      console.error('Deployment error:', error);
      throw error;
    }
  }

  static generateSandboxFiles(componentName: string, componentCode: string, stylesCode: string, tokens: TokenSet): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Package.json
    files.push({
      path: 'package.json',
      contents: JSON.stringify({
        name: componentName.toLowerCase(),
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
          'react-dom': '^18.0.0'
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0',
          postcss: '^8.4.0',
          tailwindcss: '^3.4.0',
          typescript: '^5.0.0'
        }
      }, null, 2)
    });

    // Tailwind config
    files.push({
      path: 'tailwind.config.js',
      contents: `module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        custom: ${JSON.stringify(tokens.colors.reduce((acc: Record<string, string>, color: string, i: number) => {
          acc[`c${i + 1}`] = color;
          return acc;
        }, {}))}
      },
      borderRadius: {
        custom: '${tokens.radii[1]}px'
      },
      spacing: {
        custom: '${tokens.spacing[2]}px'
      }
    }
  },
  plugins: []
}`
    });

    // PostCSS config
    files.push({
      path: 'postcss.config.js',
      contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}`
    });

    // Global styles
    files.push({
      path: 'src/styles/globals.css',
      contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

${stylesCode || ''}`
    });

    // Component file
    files.push({
      path: `src/components/${componentName}/index.tsx`,
      contents: componentCode
    });

    // Preview page
    files.push({
      path: 'src/pages/index.tsx',
      contents: `import ${componentName} from '../components/${componentName}';
import '../styles/globals.css';

export default function Preview() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <${componentName} />
        <p className="text-xs text-gray-500 mt-4 text-center">
          No fonts inferred—set your typography downstream
        </p>
      </div>
    </div>
  );
}`
    });

    // Next.js config
    files.push({
      path: 'next.config.js',
      contents: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
}

module.exports = nextConfig`
    });

    // TypeScript config
    files.push({
      path: 'tsconfig.json',
      contents: JSON.stringify({
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'es6'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          baseUrl: '.',
          paths: { '@/*': ['./src/*'] }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules']
      }, null, 2)
    });

    return files;
  }
}