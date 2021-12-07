const ejs = require("ejs");
const jetpack = require("fs-jetpack");
const { promisify } = require("util");
const glob = require("glob");
const outputFile = promisify(ejs.renderFile);
const _ = require("lodash");
const path = require("path");
const config = require("../config");
const { safeCallFunction } = require(".");

const isDotFile = (name) => name.charAt(0) === "_";

const expressionCompile = (tpl, data) => {
  const regexp = /\{\{(.+?)\}\}/g;
  let match;
  while ((match = regexp.exec(tpl)) !== null) {
    const [m, key] = match;
    tpl = tpl.replace(m, key ? data[key] : "");
    regexp.lastIndex = 0;
  }
  return tpl;
};

const genFilename = (filename, data = {}) => {
  if (isDotFile(filename)) {
    filename = filename.replace("_", ".");
  }

  return expressionCompile(filename, data);
};

/**
 *
 * @param {String} mode 模式 library or component
 * @param {String} framework
 * @param {*} data 渲染数据
 * @param {*} destFolder 输出位置
 */
const genForTemplate = (
  { mode = "library", framework = "vue", data = {}, destFolder },
  cb
) => {
  const templatePath = `${config.templateFolder}/${framework}/${mode}`;
  const templateFiles = glob.sync(`${templatePath}/**/*.*`);
  templateFiles.forEach(async (filePath) => {
    const psplit = filePath.split("/");
    let filename = psplit.pop().replace(".ejs", "");
    filename = genFilename(filename, data);
    const isEjsTpl = path.extname(filePath) === ".ejs";
    const fileContent = isEjsTpl
      ? await outputFile(filePath, data)
      : jetpack.read(filePath);
    const folder = psplit.join("/").replace(templatePath, destFolder);
    const fileDestPath = path.join(folder, filename);
    jetpack.write(fileDestPath, fileContent);
    safeCallFunction(cb, fileDestPath, filename);
  });
};

module.exports = genForTemplate;
