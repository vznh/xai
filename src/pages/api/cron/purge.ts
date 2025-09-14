import { NextApiRequest, NextApiResponse } from 'next';
import { LocalStorage } from '@/lib/supabase';
import { StorageService } from '@/services/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret
  const { key } = req.query;
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || key !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const versions = LocalStorage.getVersions();
    const now = new Date();
    let purgedCount = 0;

    // Find expired versions
    const expiredVersions = versions.filter(version => {
      if (!version.ttl_at) return false; // Promoted versions never expire
      return new Date(version.ttl_at) <= now;
    });

    // Delete expired versions and their files
    for (const version of expiredVersions) {
      try {
        StorageService.deleteFiles(version.version);
        purgedCount++;
      } catch (error) {
        console.error(`Error purging version ${version.version}:`, error);
      }
    }

    // Clean up localStorage
    LocalStorage.deleteExpired();

    // Clean up orphaned images (images without associated versions)
    if (typeof window !== 'undefined') {
      const allKeys = Object.keys(localStorage);
      const imageKeys = allKeys.filter(key => key.startsWith('image_'));
      const versionIds = versions.map(v => v.version);
      
      let orphanedImages = 0;
      imageKeys.forEach(key => {
        const imageId = key.replace('image_', '');
        const hasAssociatedVersion = versionIds.some(versionId => 
          StorageService.getFiles(versionId).some(file => 
            file.contents.includes(imageId)
          )
        );
        
        if (!hasAssociatedVersion) {
          localStorage.removeItem(key);
          orphanedImages++;
        }
      });
    }

    res.status(200).json({
      purged_versions: purgedCount,
      total_expired: expiredVersions.length,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Purge error:', error);
    res.status(500).json({ error: 'Purge failed' });
  }
}