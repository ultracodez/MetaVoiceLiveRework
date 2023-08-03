const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");
const { defaultUpdatePath, mlVersion, mlUpdateURL } = require("./constants");
const { platform } = require("os");
const { ipcMain } = require("electron");
var http = require("https");

const supportedUpdatePlatforms = ["win32"];

async function setupMvmlUpdates(mvmlUpdate, window) {
  console.log(
    "handling communication between renderer and main for mvmlUpdate live logs"
  );
  return new Promise(async (resolve, reject) => {
    window.webContents.openDevTools();
    window.webContents.on("did-finish-load", async () => {
      try {
        await new Promise((r) => setTimeout(r, 2000));
        window.webContents.send("log-update-preparing");

        const mvmlUpdateDir = path.join(__dirname, "../dist");

        window.webContents.send("log-update", {
          msg: "Downloading update from " + mvmlUpdate.updateURL,
          type: "log",
        });
        window.webContents.send("log-update", {
          msg: "to " + path.join(__dirname, "../dist"),
          type: "log",
        });

        if (!fsSync.existsSync(mvmlUpdateDir)) {
          await fs.mkdir(mvmlUpdateDir);
          window.webContents.send("log-update", {
            msg: "Created dist directory...",
            type: "log",
          });
        }
        if (fsSync.existsSync(mvmlUpdateDir)) {
          await fs.rm(mvmlUpdateDir, { recursive: true, force: true });
          await fs.mkdir(mvmlUpdateDir);

          window.webContents.send("log-update", {
            msg: "Deleted old dist directory...",
            type: "info",
          });
        }

        var out = fsSync.createWriteStream(path.join(mvmlUpdateDir, "tmp.zip"));

        await new Promise((resolve, reject) => {
          var len = 0;
          var lastPercent = 0;

          http.get(mvmlUpdate.updateURL, function (res) {
            res.on("data", function (chunk) {
              out.write(chunk);
              len += chunk.length;

              // percentage downloaded is as follows
              var percent = (len / res.headers["content-length"]) * 100;
              percent = Math.round(percent * 10) / 10;

              if (lastPercent === percent) return;

              lastPercent = percent;

              window.webContents.send("log-update", {
                msg: `Downloading: ${percent}% complete`,
                type: "log",
                extra: { percent },
              });
            });
            res.on("end", function () {
              resolve();
            });
            res.on("error", function (e) {
              reject(e);
            });
          });
        });

        resolve();
      } catch (e) {
        console.log("error:", e);
        window.webContents.send("log-update", {
          msg: "An error occurred while downloading mvml: ",
          type: "error",
        });
        window.webContents.send("log-update", {
          msg: JSON.stringify(e.message),
          type: "error",
        });

        reject();
      }
    });
  });
}

async function checkMvmlUpdates() {
  let currentVersion;
  const currentVersionPath = path.join(
    __dirname,
    "../dist/metavoice/version.txt"
  );
  const updateURL = mlUpdateURL + `mvml-${platform}-` + mlVersion + ".zip";
  console.log("Checking for new Mvml at:", updateURL);
  if (fsSync.existsSync(currentVersionPath))
    currentVersion = await fs.readFile(currentVersionPath);

  if (!fsSync.existsSync(path.join(__dirname, "../dist/.unzip-finished"))) {
    // unzip did not complete
    return {
      needsNewVersion: true,
      reason: "unzip did not finish",
      updateURL: updateURL,
    };
  }

  if (currentVersion === "local") {
    return { needsNewVersion: false, reason: "local version" };
  }
  // current major, minor, patch
  const [cM, cm, cp] = currentVersion.split(".").map(Number);
  // requested major, minor, patch
  const [rM, rm, rp] = mlVersion.split(".").map(Number);

  // major: upgrade or downgrade
  // minor: upgrade only
  // patch: upgrade only
  return {
    needsNewVersion: cM !== rM || cm < rm || (cm === rm && cp < rp),
    reason: `current version ${currentVersion} is not compatible with requested version ${mlVersion}`,
    updateURL: updateURL,
  };
}

async function setupUpdates(updateData) {
  if (platform === "win32") {
    let updateTo;

    try {
      updateTo = fs.readFile(
        path.join(app.getPath("userData"), "updatedir.txt")
      );
    } catch {}

    const updateExe = path.join(updateTo, "update/installer.exe");

    if (fsSync.existsSync(updateExe)) fs.unlink(updateExe);

    fs.copyFile(path.join(__dirname, "../update/installer.exe"), updateExe);

    spawnSync(
      updateExe,
      [
        updateData.updateUrl,
        updateTo || resolveToAbsolutePath(defaultUpdatePath),
        updateData.name,
        path.join(__dirname, "../../.."),
      ],
      {
        detached: true,
      }
    );

    return true;
  } else return false;
}

function checkUpdates(elFeed) {
  if (!supportedUpdatePlatforms.includes(platform)) return undefined;

  return fetch(elFeed)
    .then((res) => {
      if (res.status === 204) {
        return undefined;
      }
      return res.json();
    })
    .then((update) => {
      if (!update) {
        return undefined;
      }

      const { name, notes, url: updateUrl } = update;

      // download zip file to Download folder, with given name
      const url = new URL(updateUrl);
      // e.g. MetaVoice-0.0.0-win32-x64
      const pkgName = url.pathname
        .split("/")
        .pop()
        .split(".")
        .slice(0, -1)
        .join(".");

      return { name, notes, url, pkgName };
    });
}

module.exports = {
  setupUpdates,
  checkUpdates,
  checkMvmlUpdates,
  setupMvmlUpdates,
};
