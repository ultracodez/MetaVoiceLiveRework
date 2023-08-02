const { app, dialog } = require("electron");
const path = require("path");
const { createWindow } = require("./electron/BrowserWindow");
const { setupLifecycles } = require("./electron/Lifecycle");
const { setupIpcHooks } = require("./electron/IpcHooks");
const { setupFrontendServer } = require("./electron/FrontendServer");
const { setupBackendServer } = require("./electron/BackendServer");
const {
  setupUpdates,
  setupMvmlUpdates,
  checkUpdates,
  checkMvmlUpdates,
} = require("./electron/Updates");

const IS_DEV = process.env.IS_DEV === "dev";

var frontendServer;
var frontendPort;
var backendServer;
var backendPort;
var appVersion = app.getVersion();
const elServer = "https://update.electronjs.org";
const elFeed = `${elServer}/metavoicexyz/MetaVoiceLive/${process.platform}-${
  process.arch
}/${app.getVersion()}`;

app.whenReady().then(async () => {
  const update = await checkUpdates(elFeed);
  let mvmlUpdate;
  if (!update) {
    mvmlUpdate = await checkMvmlUpdates();
  }

  mvmlUpdate = { needsNewVersion: true };
  let window;

  setupIpcHooks(app, window, { mvmlUpdate });

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

  window = createWindow(IS_DEV, frontendPort, { mvmlUpdate });
  if (update) {
    await dialog.showMessageBox(window, {
      title: "MetaVoice Live needs to update",
      message: "MetaVoice Live has an update available. It will now restart.",
      buttons: ["OK"],
    });
    if (await setupUpdates(update)) app.exit(0);
  }
  if (mvmlUpdate) {
    setupMvmlUpdates(mvmlUpdate, window);
  }

  let options;
  if (!IS_DEV)
    options = { backendServerKillCommand: backendServer?.kill, ...options };

  setupLifecycles(app, options);
});
