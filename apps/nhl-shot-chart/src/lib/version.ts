import packageJson from '../../package.json';
const version = packageJson.version;

export interface VersionInfo {
  version: string;
  gitHash: string;
  gitDate: string;
  nextJsVersion: string;
}


export function getVersionInfo(): VersionInfo {
  return {
    version: version,
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH || 'unknown',
    gitDate: process.env.NEXT_PUBLIC_GIT_DATE || 'unknown',
    nextJsVersion: packageJson.dependencies.next
  }
}
