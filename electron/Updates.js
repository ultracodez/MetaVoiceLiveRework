function setupUpdates(updateData) {}

function checkUpdates(elFeed) {
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
