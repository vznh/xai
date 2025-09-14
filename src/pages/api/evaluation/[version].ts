import { NextApiRequest, NextApiResponse } from 'next';
import { LocalStorage } from '@/lib/supabase';

interface EvaluationResult {
  version: string;
  overall_score: number;
  per_state: {
    default: number;
    hover?: number;
    focus?: number;
    disabled?: number;
  };
  overlay_urls: {
    default: string;
  };
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { version } = req.query;

  if (!version || typeof version !== 'string') {
    return res.status(400).json({ error: 'Version parameter is required' });
  }

  try {
    const existingVersion = LocalStorage.getVersion(version);
    
    if (!existingVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (existingVersion.status !== 'ready') {
      return res.status(400).json({ error: 'Version not ready for evaluation' });
    }

    // Generate basic SSIM score (mock implementation)
    const evaluation: EvaluationResult = {
      version,
      overall_score: Math.random() * 0.3 + 0.7, // Random score between 0.7-1.0
      per_state: {
        default: Math.random() * 0.3 + 0.7
      },
      overlay_urls: {
        default: `https://placeholder.com/evaluation/${version}/default.png`
      },
      created_at: new Date().toISOString()
    };

    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Error evaluating version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}