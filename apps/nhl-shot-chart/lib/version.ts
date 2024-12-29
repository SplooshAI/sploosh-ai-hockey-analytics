import rootPackageJson from '../../../package.json';
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
  const repoUrl = rootPackageJson.repository.url
    .replace('git+', '')  // Remove git+ prefix
    .replace('.git', '')  // Remove .git suffix

  return {
    version: rootPackageJson.version,
    gitHash: process.env.NEXT_PUBLIC_GIT_HASH ?? buildInfo.commitHash,
    gitDate: process.env.NEXT_PUBLIC_GIT_DATE ?? buildInfo.buildTime,
    nextJsVersion: appPackageJson.dependencies.next ?? '',
    repoUrl
  }
}
