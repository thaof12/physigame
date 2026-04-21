const { execSync } = require('child_process');

const ports = process.argv.slice(2).filter(Boolean);

if (!ports.length) {
  process.exit(0);
}

const isWindows = process.platform === 'win32';

function getPidsForPort(port) {
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8',
      });

      return output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(/\s+/))
        .filter((parts) => parts.length >= 5 && parts[1].endsWith(`:${port}`))
        .map((parts) => parts[parts.length - 1]);
    }

    const output = execSync(`lsof -ti tcp:${port}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    if (isWindows) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

const uniquePids = new Set();
ports.forEach((port) => {
  getPidsForPort(port).forEach((pid) => uniquePids.add(pid));
});

for (const pid of uniquePids) {
  killPid(pid);
}

process.exit(0);
