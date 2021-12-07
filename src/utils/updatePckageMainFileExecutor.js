const ejs = require("ejs");
const path = require("path");
const jetpack = require("fs-jetpack");
const config = require("../config");
const fs = require("fs");
const { strategyFunctionCreactor } = require(".");

const getComponentFolders = (packagesPath) => {
  const excludes = ["utils", "mixins"];
  return fs
    .readdirSync(packagesPath, "utf-8")
    .filter((item) => {
      return fs.statSync(path.join(packagesPath, item)).isDirectory();
    })
    .filter((item) => {
      return !excludes.includes(item);
    });
};

const updatePackageMainFileForVue = async (packagesPath) => {
  const componentFolders = getComponentFolders(packagesPath);
  const mainFileTplPath = path.resolve(
    `${config.templateFolder}/singleFiles/vue-packages-main-file.js.ejs`
  );
  const content = await ejs.renderFile(
    mainFileTplPath,
    {
      components: componentFolders,
    },
    {
      beautify: true,
    }
  );

  jetpack.write(path.join(packagesPath, "index.js"), content);
};

const updatePckageMainFileExecutor = strategyFunctionCreactor({
  vue: updatePackageMainFileForVue,
});

module.exports = updatePckageMainFileExecutor;
