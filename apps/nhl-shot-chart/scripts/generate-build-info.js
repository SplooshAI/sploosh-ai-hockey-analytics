const fs = require('fs');
const { execSync } = require('child_process');

const buildInfo = {
  commitHash: process.env.VERCEL_GIT_COMMIT_SHA || 
    execSync('git rev-parse HEAD').toString().trim(),
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(
  './src/lib/build-info.json',
  JSON.stringify(buildInfo, null, 2)
);