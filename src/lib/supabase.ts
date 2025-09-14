import { Version } from '@/types';

interface StoredVersion extends Version {
  files?: string;
}

export class LocalStorage {
  static getVersions(): Version[] {
    if (typeof window === 'undefined') return [];
    const versions = localStorage.getItem('versions');
    return versions ? JSON.parse(versions) : [];
  }

  static saveVersion(version: Version) {
    if (typeof window === 'undefined') return;
    const versions = this.getVersions();
    const existing = versions.findIndex(v => v.version === version.version);
    if (existing >= 0) {
      versions[existing] = version;
    } else {
      versions.push(version);
    }
    localStorage.setItem('versions', JSON.stringify(versions));
  }

  static getVersion(version: string): Version | null {
    const versions = this.getVersions();
    return versions.find(v => v.version === version) || null;
  }

  static updateVersion(version: string, updates: Partial<Version>) {
    const versions = this.getVersions();
    const index = versions.findIndex(v => v.version === version);
    if (index >= 0) {
      versions[index] = { ...versions[index], ...updates };
      localStorage.setItem('versions', JSON.stringify(versions));
    }
  }

  static deleteExpired() {
    if (typeof window === 'undefined') return;
    const versions = this.getVersions();
    const now = new Date();
    const active = versions.filter(v => {
      if (!v.ttl_at) return true;
      return new Date(v.ttl_at) > now;
    });
    localStorage.setItem('versions', JSON.stringify(active));
  }
}