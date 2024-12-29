import packageJson from '../../../package.json';
import buildInfo from './build-info.json';

const version = packageJson.version;

export interface VersionInfo {
  version: string;
  gitHash: string;
  gitDate: string;
  nextJsVersion: string;
  repoUrl: string;
}

export function getVersionInfo(): VersionInfo {
  const repoUrl = packageJson.repository.url
    .replace('git+', '')  // Remove git+ prefix
    .replace('.git', '')  // Remove .git suffix

  return {
    version: packageJson.version,
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH ?? buildInfo.commitHash,
    gitDate: process.env.NEXT_PUBLIC_GIT_DATE ?? buildInfo.buildTime,
    nextJsVersion: process.env.NEXT_PUBLIC_NEXT_VERSION ?? '',
    repoUrl
  }
}
