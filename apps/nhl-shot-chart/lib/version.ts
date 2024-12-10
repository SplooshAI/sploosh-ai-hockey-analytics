import packageJson from '../package.json';
import buildInfo from './build-info.json';

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
    gitHash: buildInfo.commitHash,
    gitDate: buildInfo.buildTime,
    nextJsVersion: packageJson.dependencies.next
  }
}
