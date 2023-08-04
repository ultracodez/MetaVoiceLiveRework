const { writeFileSync } = require("fs");

module.exports = {
  hooks: {
    postPackage: async (forgeConfig, options) => {
      console.info("Packages built at:", options.outputPaths);
      for (outputPath in options.outputPaths) {
      }
    },
  },
  packagerConfig: {
    ignore: [
      "renderer/src",
      "renderer/public",
      "renderer/.next",
      "renderer/tailwind.config.js",
      "renderer/README.md",
      "renderer/postcss.config.js",
      "renderer/.eslintrc.json",
      "renderer/next.config.js",
      "renderer/next-env.d.ts",
      "renderer/out",
      "ai/",
      "common/",
      "librosa/",
      "_soundfile_data/",
      "forge.config.js",
      ".gitignore",
      "deploy_electron.py",
      "deploy_ml.py",
      "deploy_remove.py",
      "pyinstallerbuild/",
      "Makefile",
      "Makefile.variable",
      "tsconfig.json",
      "tracking/",
      "server/",
      "dist/",
    ],
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "win32"],
    },
  ],
};
