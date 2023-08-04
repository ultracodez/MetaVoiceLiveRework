const { ipcMain, dialog } = require("electron");
const {
  baseVoices,
  BASE_SERVER_URL,
  defaultUpdatePath,
} = require("./constants");
const { resolveToAbsolutePath } = require("./helpers");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

function setupIpcHooks(app, window, opt = {}) {
  ipcMain.handle("show-update-directory-picker", async (event) => {
    return await dialog
      .showOpenDialog(window, {
        properties: ["showHiddenFiles", "openDirectory"],
        defaultPath: resolveToAbsolutePath(defaultUpdatePath),
        title: "Select a path for MetaVoice Live to update to",
      })
      .then((res) => {
        if (res.canceled) return undefined;
        else {
          const updateToPath = path.join(
            app.getPath("userData"),
            "updatedir.txt"
          );
          if (fsSync.existsSync(updateToPath)) fs.unlink(updateToPath);
          fs.writeFile(updateToPath, res.filePaths[0]);
          return res.filePaths[0];
        }
      });
  });
  ipcMain.handle("request-default-update-path", (event) => {
    return resolveToAbsolutePath(defaultUpdatePath);
  });
  ipcMain.handle("request-app-version", (event) => {
    return app.getVersion();
  });
  ipcMain.handle("request-server-base-url", (event) => {
    return BASE_SERVER_URL;
  });
  ipcMain.handle("request-base-voices", (event) => {
    return baseVoices;
  });
  ipcMain.handle("request-custom-voices", async (event) => {
    const customVoicesPath = path.join(app.getPath("userData"), "speakers");

    if (!fsSync.existsSync(customVoicesPath)) return [];

    const files = await fs.readdir(customVoicesPath);
    const filtered = files.filter((possible) => {
      return possible.includes(".npy");
    });

    let result = [];

    const rememberedVoicesPath = path.join(
      customVoicesPath,
      "rememberedVoices.json"
    );

    if (fsSync.existsSync(rememberedVoicesPath)) {
      const rememberedVoices = JSON.parse(
        await fs.readFile(rememberedVoicesPath)
      );
      await fs.unlink(rememberedVoicesPath);
      result = result.concat(rememberedVoices);
      result = result.filter((voice) => {
        return (
          !baseVoices.map((voice) => voice.id).includes(voice.id) &&
          !voice.isBase
        );
      });
    }

    for (let i = 0; i < filtered.length; i++) {
      const targetFile = filtered[i];
      const name = targetFile
        .replace(".npy", "")
        .replace(new RegExp("^" + targetFile[0]), targetFile[0].toUpperCase());
      const structure = {
        id: baseVoices.length + i + 10001,
        name,
        targetFilePath: path.join(customVoicesPath, targetFile),
        img: {
          src: fsSync.existsSync(
            path.join(customVoicesPath, targetFile.replace(".npy", ".png"))
          )
            ? "file://" +
              path.join(customVoicesPath, targetFile.replace(".npy", ".png"))
            : undefined,
          alt: "Voice: " + name,
        },
      };
      // this ensures an assigned index/id NEVER changes
      if (result.map((voice) => voice.id).includes(structure.id)) continue;
      result.push(structure);
    }

    let json = JSON.stringify(result.concat(baseVoices));
    await fs.writeFile(rememberedVoicesPath, `${json}`);

    return result;
  });
}

module.exports = { setupIpcHooks };
