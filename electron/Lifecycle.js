function setupLifecycles(app, options) {
  app.on("window-all-closed", () => {
    if (options && options.backendServerKillCommand)
      options.backendServerKillCommand();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

module.exports = { setupLifecycles };
