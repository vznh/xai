import { NextApiRequest, NextApiResponse } from 'next';
import { LocalStorage } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
      return res.status(400).json({ error: 'Only ready versions can be promoted' });
    }

    // Promote version by removing TTL
    LocalStorage.updateVersion(version, {
      ttl_at: undefined
    });

    res.status(200).json({ 
      message: 'Version promoted successfully',
      version: existingVersion.version
    });
  } catch (error) {
    console.error('Error promoting version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}