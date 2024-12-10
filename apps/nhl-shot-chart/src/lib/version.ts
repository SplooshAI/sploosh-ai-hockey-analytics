export interface VersionInfo {
  version: string;
  gitHash: string;
  gitDate: string;
  nextJsVersion: string;
}

// Read package.json using require
const pkgJson = require('../../package.json');

export function getVersionInfo(): VersionInfo {
  return {
    version: pkgJson.version,
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH || 'unknown',
    gitDate: process.env.NEXT_PUBLIC_GIT_DATE || 'unknown',
    nextJsVersion: pkgJson.dependencies.next
  }
}
