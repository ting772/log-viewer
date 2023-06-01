module.exports = {
  packagerConfig: {
    ignore:[
      /^\/src/,
      /^\/node_modules\/\.cache/,
      /^\/server/,
      /^\/dist\/.*\.map/,
      /^\/scripts/,
      /^\/config/,
      /^\/\..*/,
      /^\/index\.html/,
      /^\/README\.md/,
      /^\/(babel\.config|jsconfig|package-lock|webpack\.config)\.json/,
      /^\/(webpack\.config|forge\.config)\.js/,
    ],
    asar:true,
    prune:true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
