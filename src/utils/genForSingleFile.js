const ejs = require("ejs");
const jetpack = require("fs-jetpack");
const glob = require("glob");
const path = require("path");
const config = require("../config");
const root = path.join(config.templateFolder, "singleFiles");
const genForSingleFile = async (filename, outputPath, data) => {
  const filePath = path.join(root, filename);
  const content = await ejs.renderFile(filePath, data);
  jetpack.write(outputPath, content);
  return { filePath, content };
};
module.exports = genForSingleFile;
