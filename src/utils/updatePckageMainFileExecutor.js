const path = require("path");
const fs = require("fs");
const { strategyFunctionCreactor, logger } = require(".");
const genForSingleFile = require("./genForSingleFile");

const getComponentFolders = (packagesPath) => {
  const excludes = ["utils", "mixins", "styles", ".umi"];
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
  const outputPath = path.join(packagesPath, "index.js");
  await genForSingleFile("vue-packages-main-file.js.ejs", outputPath, {
    components: componentFolders,
  });
};

const updatePackageMainFileForReact = async (packagesPath, anwser) => {
  const componentFolders = getComponentFolders(packagesPath);
  const outputPath = path.join(packagesPath, "index.ts");
  await genForSingleFile("react-packages-main-file.ts.ejs", outputPath, {
    components: componentFolders,
  });
  // 写入markdown文档文件
  const docOutputPath = path.join(
    `${anwser.libraryRoot}`,
    "docs",
    `${anwser.name}.md`
  );
  await genForSingleFile("react-component-doc.md.ejs", docOutputPath, anwser);
  logger.info("文档生成成功", `${anwser.name}.md`);
};
const updatePckageMainFileExecutor = strategyFunctionCreactor({
  vue: updatePackageMainFileForVue,
  react: updatePackageMainFileForReact,
});

module.exports = updatePckageMainFileExecutor;
