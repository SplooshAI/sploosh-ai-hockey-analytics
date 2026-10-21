import appPackageJson from '../package.json';
import buildInfo from './build-info.json';

export interface VersionInfo {
  version: string;
  gitHash: string;
  gitDate: string;
  nextJsVersion: string;
  repoUrl: string;
}

export function getVersionInfo(): VersionInfo {
  // Repository linked from the version line
  const repoUrl = 'https://github.com/SplooshAI/sploosh-ai-hockey-analytics';

  return {
    version: appPackageJson.version,
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH ?? buildInfo.commitHash,
    gitDate: process.env.NEXT_PUBLIC_GIT_DATE ?? buildInfo.buildTime,
    nextJsVersion: appPackageJson.dependencies.next ?? '',
    repoUrl
  }
}
