const os = require("os");
const path = require("path");
const configFolder = path.join(os.homedir(), ".gdc");

const config = {
  configFolder,
  configFile: path.join(configFolder, "config.json"),
  templateFolder: path.resolve(__dirname, "../templates"),
};

module.exports = config;
