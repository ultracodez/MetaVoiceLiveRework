const pathFS = require("path");

function resolveToAbsolutePath(path) {
  return pathFS.normalize(
    path.replace(/%([^%]+)%/g, function (_, key) {
      return process.env[key];
    })
  );
}
module.exports = { resolveToAbsolutePath };
