const { spawnSync } = require("child_process");
const { kill } = require("process");

function setupBackendServer(path) {
  const process = spawnSync(path);
  const pid = process.pid;
  return {
    kill: () => {
      killBackendServer(pid);
    },
    pid: pid,
    process: process,
  };
}

function killBackendServer(pid) {
  return kill(pid);
}

module.exports = { setupBackendServer, killBackendServer };
