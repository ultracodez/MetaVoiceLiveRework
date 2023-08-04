const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");
const { defaultUpdatePath, mlVersion, mlUpdateURL } = require("./constants");
const { platform } = require("os");
const { ipcMain } = require("electron");
const http = require("https");
const extract = require("extract-zip");
const sha256File = require("sha256-file");

const supportedUpdatePlatforms = ["win32"];

async function setupMvmlUpdates(mvmlUpdate, window, app, opt = {}, x = 0) {
  console.log(
    "handling communication between renderer and main for mvmlUpdate live logs"
  );
  let error = false;
  if (x > 0) {
    try {
      await new Promise((r) => setTimeout(r, 2000));
      window.webContents.send("log-update-preparing", { retry: true });

      const mvmlUpdateDir = path.join(__dirname, "../dist");

      window.webContents.send("log-update", {
        msg:
          "Downloading update from " +
          mvmlUpdate.updateURL +
          " to " +
          mvmlUpdateDir,
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
          type: "log",
        });
      }

      let out = fsSync.createWriteStream(path.join(mvmlUpdateDir, "tmp.zip"));

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
              msg: `Downloading: ${percent.toFixed(1)}% complete`,
              type: "percent",
              extra: { percent },
            });
          });
          res.on("end", function () {
            window.webContents.send("log-update", {
              msg: "Download: Finished!",
              type: "success",
            });
            resolve();
          });
          res.on("error", function (e) {
            reject(e);
          });
        });
      });

      out.close();

      window.webContents.send("log-update", {
        msg: "Downloading sha256 signature...",
        type: "log",
      });

      // we don't need progress for sha256
      const sha256 = await (
        await fetch(mvmlUpdate.updateURL + ".sha256")
      ).text();

      window.webContents.send("log-update", {
        msg: "Download sha256 signature: Finished!",
        type: "success",
      });

      window.webContents.send("log-update", {
        msg: "Checking sha256 signature against downloaded mvml...",
        type: "log",
      });

      window.webContents.send("log-update", {
        msg: "Server hash: " + sha256,
        type: "log",
      });

      const updateSha256 = await new Promise((resolve, reject) => {
        sha256File(path.join(mvmlUpdateDir, "tmp.zip"), function (error, sum) {
          if (error) reject(error);
          resolve(sum);
        });
      });

      window.webContents.send("log-update", {
        msg: "Update hash: " + updateSha256,
        type: "log",
      });

      if (
        sha256.normalize().toLowerCase().trim() !=
        updateSha256.normalize().toLowerCase().trim()
      ) {
        window.webContents.send("log-update", {
          msg: "Fatal Error: sha256 mismatch. Please contact gm@themetavoice.xyz ",
          type: "error",
        });

        error = true;

        throw new Error("sha256");
        //app.exit(1);
        //reject();
      } else {
        window.webContents.send("log-update", {
          msg: "Sha256 hash verified",
          type: "success",
        });
      }

      window.webContents.send("log-update", {
        msg: "Beginning unzip... (this will take some time)",
        type: "log",
      });

      await extract(path.join(mvmlUpdateDir, "tmp.zip"), {
        dir: mvmlUpdateDir,
      });

      window.webContents.send("log-update", {
        msg: "Unzip completed.",
        type: "success",
      });

      window.webContents.send("log-update", {
        msg: "Update completed, now starting server...",
        type: "prepare",
      });

      opt.onFinish && opt.onFinish();
    } catch (e) {
      if (e?.message === "sha256") {
      } else {
        console.log("error:", e);
        window.webContents.send("log-update", {
          msg: "An error occurred while downloading mvml: ",
          type: "error",
        });
        window.webContents.send("log-update", {
          msg: JSON.stringify(e.message),
          type: "error",
        });
      }
      error = true;
      //app.exit();
      //reject();
    }

    if (error) {
      window.webContents.send("log-update", {
        msg: `An error occurred while downloading mvml. Attempt ${x}/5. ${
          x === 5 ? "MetaVoice will exit in 25 seconds." : "Retrying..."
        }`,
        type: "error",
      });
      if (x >= 5) {
        await new Promise((r) => setTimeout(r, 25000));
        await app.exit(1);
      } else {
        setupMvmlUpdates(mvmlUpdate, window, app, x + 1);
      }
    }
  } else
    return new Promise(async (resolve, reject) => {
      window.webContents.on("did-finish-load", async () => {
        try {
          await new Promise((r) => setTimeout(r, 2000));
          window.webContents.send("log-update-preparing");

          const mvmlUpdateDir = path.join(__dirname, "../dist");

          window.webContents.send("log-update", {
            msg:
              "Downloading update from " +
              mvmlUpdate.updateURL +
              " to " +
              mvmlUpdateDir,
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
              type: "log",
            });
          }

          let out = fsSync.createWriteStream(
            path.join(mvmlUpdateDir, "tmp.zip")
          );

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
                  msg: `Downloading: ${percent.toFixed(1)}% complete`,
                  type: "percent",
                  extra: { percent },
                });
              });
              res.on("end", function () {
                window.webContents.send("log-update", {
                  msg: "Download: Finished!",
                  type: "success",
                });
                resolve();
              });
              res.on("error", function (e) {
                reject(e);
              });
            });
          });

          out.close();

          window.webContents.send("log-update", {
            msg: "Downloading sha256 signature...",
            type: "log",
          });

          // we don't need progress for sha256
          const sha256 = await (
            await fetch(mvmlUpdate.updateURL + ".sha256")
          ).text();

          window.webContents.send("log-update", {
            msg: "Download sha256 signature: Finished!",
            type: "success",
          });

          window.webContents.send("log-update", {
            msg: "Checking sha256 signature against downloaded mvml...",
            type: "log",
          });

          window.webContents.send("log-update", {
            msg: "Server hash: " + sha256,
            type: "log",
          });

          const updateSha256 = await new Promise((resolve, reject) => {
            sha256File(
              path.join(mvmlUpdateDir, "tmp.zip"),
              function (error, sum) {
                if (error) reject(error);
                resolve(sum);
              }
            );
          });

          window.webContents.send("log-update", {
            msg: "Update hash: " + updateSha256,
            type: "log",
          });

          if (
            sha256.normalize().toLowerCase().trim() !=
            updateSha256.normalize().toLowerCase().trim()
          ) {
            window.webContents.send("log-update", {
              msg: "Fatal Error: sha256 mismatch. Please contact gm@themetavoice.xyz ",
              type: "error",
            });

            error = true;

            throw new Error("sha256");
            //app.exit(1);
            //reject();
          } else {
            window.webContents.send("log-update", {
              msg: "Sha256 hash verified",
              type: "success",
            });
          }

          window.webContents.send("log-update", {
            msg: "Beginning unzip... (this will take some time)",
            type: "log",
          });

          await extract(path.join(mvmlUpdateDir, "tmp.zip"), {
            dir: mvmlUpdateDir,
          });

          window.webContents.send("log-update", {
            msg: "Unzip completed.",
            type: "success",
          });

          window.webContents.send("log-update", {
            msg: "Update completed, now starting server...",
            type: "prepare",
          });

          opt.onFinish && opt.onFinish();

          resolve();
        } catch (e) {
          if (e?.message === "sha256") {
          } else {
            console.log("error:", e);
            window.webContents.send("log-update", {
              msg: "An error occurred while downloading mvml: ",
              type: "error",
            });
            window.webContents.send("log-update", {
              msg: JSON.stringify(e.message),
              type: "error",
            });
          }
          error = true;
          //app.exit();
          //reject();
        }

        if (error) {
          window.webContents.send("log-update", {
            msg: `An error occurred while downloading mvml. Attempt ${x}/5. ${
              x === 5 ? "MetaVoice will exit in 25 seconds." : "Retrying..."
            }`,
            type: "error",
          });
          if (x >= 5) {
            await new Promise((r) => setTimeout(r, 25000));

            await app.exit(1);
            reject();
          } else {
            setupMvmlUpdates(mvmlUpdate, window, app, x + 1);
          }
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
