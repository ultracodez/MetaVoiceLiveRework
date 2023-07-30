const { app } = require("electron");
const path = require("path");
const { createWindow } = require("./electron/BrowserWindow");
const { setupLifecycles } = require("./electron/Lifecycle");
const { setupIpcHooks } = require("./electron/IpcHooks");
const { setupFrontendServer } = require("./electron/FrontendServer");
const { setupBackendServer } = require("./electron/BackendServer");
const { setupUpdates, checkUpdates } = require("./electron/Updates");

const IS_DEV = process.env.IS_DEV === "dev";

var frontendServer;
var frontendPort;
var backendServer;
var backendPort;
var appVersion = app.getVersion();
const elServer = "/";
const elFeed = `${elServer}/metavoicexyz/MetaVoiceLive/${process.platform}-${
  process.arch
}/${app.getVersion()}`;

app.whenReady().then(async () => {
  const update = checkUpdates(elFeed);

  if (update) setupUpdates(update);

  frontendPort = IS_DEV ? 3000 : undefined;
  if (!IS_DEV) {
    frontendServer = setupFrontendServer(
      path.join(__dirname, "renderer/build")
    );
    frontendPort = frontendServer.address().port;
    console.log(path.join(__dirname, "dist/metavoice/metavoice.exe"));
    backendServer = setupBackendServer(
      path.join(__dirname, "dist/metavoice/metavoice.exe")
    );
  }

  window = createWindow(IS_DEV, frontendPort);

  setupIpcHooks(app, window);

  let options;
  if (!IS_DEV)
    options = { backendServerKillCommand: backendServer.kill, ...options };

  setupLifecycles(app, options);
});
