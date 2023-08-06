const { fork } = require("child_process");
const path = require("path");
let { getPorts } = require("./helpers/get-port");

async function setupFrontendServer(servePath) {
  const port = await getPorts();
  const process = fork(servePath, {
    env: {
      PORT: port,
    },
    stdio: "pipe",
  });

  console.log("Waiting for UI thread to start...");

  await new Promise((resolve, reject) => {
    process.stdout.on("data", (chunk) => {
      line = chunk.toString();
      console.log("Recieved data from child process:", line);
      if (line.includes("Listening on port")) resolve();
    });
  });

  return port;
}

module.exports = { setupFrontendServer };
