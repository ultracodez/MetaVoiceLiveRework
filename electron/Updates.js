const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");
const { defaultUpdatePath } = require("./constants");
const { platform } = require("os");

const supportedUpdatePlatforms = ["win32"];

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

module.exports = { setupUpdates, checkUpdates };
