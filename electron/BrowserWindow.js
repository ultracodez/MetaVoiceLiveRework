const { BrowserWindow } = require("electron");
const path = require("path");

function createWindow(dev, port, opt = {}) {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.maximize();
  win.show();

  if (opt.mvmlUpdate && opt.mvmlUpdate.needsNewVersion) {
    console.log("Loading:", "http://localhost:" + port + "/mvml-update");
    win.loadURL("http://localhost:" + port + "/mvml-update");
  } else {
    console.log("Loading:", "http://localhost:" + port);
    win.loadURL("http://localhost:" + port);
  }

  return win;
}

module.exports = { createWindow };
