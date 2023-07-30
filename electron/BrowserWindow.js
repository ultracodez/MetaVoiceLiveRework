const { BrowserWindow } = require("electron");
const path = require("path");

function createWindow(dev, port) {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.maximize();
  win.show();

  console.log("Loading:", "http://localhost:" + port);
  win.loadURL("http://localhost:" + port);

  return win;
}

module.exports = { createWindow };
