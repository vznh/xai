import { NextApiRequest, NextApiResponse } from 'next';
import { LocalStorage } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const versions = LocalStorage.getVersions();
    
    // Filter and format response
    const response = versions.map(version => ({
      version: version.version,
      componentName: version.component_name,
      preview_url: version.preview_url,
      status: version.status,
      created_at: version.created_at,
      ttl_at: version.ttl_at
    }));

    // Sort by created_at descending
    response.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.status(200).json({ versions: response });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}