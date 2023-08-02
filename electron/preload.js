const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getNodeVersion: () => process.versions.node,
  getChromeVersion: () => process.versions.chrome,
  getElectronVersion: () => process.versions.electron,
  showDirectoryPicker: () => {
    return ipcRenderer.invoke("show-update-directory-picker");
  },
  getDefaultUpdatePath: () => {
    return ipcRenderer.invoke("request-default-update-path");
  },
  getAppVersion: () => {
    return ipcRenderer.invoke("request-app-version");
  },
  getServerBaseURL: () => {
    return ipcRenderer.invoke("request-server-base-url", null);
  },
  getUserCustomVoices: () => {
    return ipcRenderer.invoke("request-custom-voices", null);
  },
  getBaseVoices: () => {
    return ipcRenderer.invoke("request-base-voices", null);
  },
  onLog: (func) => {
    ipcRenderer.on("log-update", (event, ...args) => func(...args));
  },
  onPreparing: (func) => {
    ipcRenderer.on("log-update-preparing", (event, ...args) => func(...args));
  },
  sendPreparing: () => {
    return ipcRenderer.invoke("preparation-received", null);
  },
});
