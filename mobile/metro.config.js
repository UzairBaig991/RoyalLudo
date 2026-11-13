const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch mobile and shared (shared is lightweight, ~15 files).
// Excludes root node_modules and server from being watched, preventing Windows fs.watch freeze.
config.watchFolders = [
  __dirname,
  path.resolve(__dirname, '../shared')
];

module.exports = config;
