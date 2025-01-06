const fs = require('fs');
const { execSync } = require('child_process');

const getBuildInfo = () => {
  // First try Vercel environment variables
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return {
      commitHash: process.env.VERCEL_GIT_COMMIT_SHA,
      buildTime: new Date().toISOString(),
    };
  }

  // If not on Vercel, try local git info
  try {
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    return {
      commitHash,
      buildTime: new Date().toISOString(),
    };
  } catch (error) {
    // Fallback if git command fails
    return {
      commitHash: 'development',
      buildTime: new Date().toISOString(),
    };
  }
};

const buildInfo = getBuildInfo();

fs.writeFileSync(
  './lib/build-info.json',
  JSON.stringify(buildInfo, null, 2)
);