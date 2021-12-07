const { Command } = require("@oclif/command");
const {
  safeCallFunction,
  logger,
  strategyValueCreactor,
  strategyFunctionCreactor,
} = require("../utils");
const { prompt } = require("enquirer");
const creaateComponentForm = require("../forms/createComponent");
const changeCase = require("change-case");
const path = require("path");
const jetpack = require("fs-jetpack");
const genForTemplate = require("../utils/genForTemplate");
const createLibraryForm = require("../forms/createLibrary");
const updatePckageMainFileExecutor = require("../utils/updatePckageMainFileExecutor");
const defaultValueExecutor = strategyValueCreactor(
  {
    string: `''`,
    number: `0`,
    boolean: `true`,
    array: "[]",
    object: "{}",
  },
  ""
);
const isComplexDataType = (dataType) => ["array", "object"].includes(dataType);

const complexDataTypeExecutor = strategyFunctionCreactor({
  array: () => `()=>[]`,
  object: () => `()=>({})`,
});

class ComponentCommand extends Command {
  static args = [
    {
      name: "operation",
      required: true,
    },
  ];

  async getFramework() {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (jetpack.exists(packageJsonPath)) {
      const { air } = require(packageJsonPath);
      if (air && air.framework) {
        return air.framework;
      }
    }
    const anwser = await prompt(createLibraryForm[1]);
    return anwser.framework;
  }
  async processArgs() {
    // 处理参数
    const anwser = await prompt(creaateComponentForm);
    await creaateComponentForm.validate(anwser);
    anwser.dataTypeU = changeCase.pascalCase(anwser.dataType);
    const dataTypeDefaultValue = defaultValueExecutor(anwser.dataType);
    anwser.dataTypeDefaultValue = dataTypeDefaultValue;
    anwser.dataTypeDefaultValueU = isComplexDataType(anwser.dataType)
      ? complexDataTypeExecutor(anwser.dataType)
      : dataTypeDefaultValue;
    anwser.name = changeCase.pascalCase(anwser.name);
    anwser.componentName = changeCase.paramCase(anwser.name);
    return anwser;
  }

  async create() {
    try {
      const anwser = await this.processArgs();
      // 执行生成模板
      const packageFolderPath = path.join(process.cwd(), "packages");
      const destFolder = path.join(packageFolderPath, anwser.name);
      const framework = await this.getFramework();
      const gen = async () => {
        await genForTemplate(
          {
            mode: "component",
            framework,
            data: anwser,
            destFolder,
          },
          (fileDestPath) => {
            logger.info(
              `生成文件：${fileDestPath.replace(packageFolderPath + "/", "")}`
            );
          }
        );
      };
      if (jetpack.exists(destFolder)) {
        const res = await prompt({
          type: "confirm",
          name: "override",
          message: `组件【 ${anwser.name} 】已存在，继续执行会覆盖，是否继续？`,
        });
        if (res.override) await gen();
      } else {
        await gen();
      }
      logger.info("组件创建完成");
      await updatePckageMainFileExecutor(framework, packageFolderPath);
      logger.info("更新组件包主文件成功");
      // 检查有无该组件
    } catch (error) {
      logger.error(error.message);
      logger.error(error.stack);
    }
  }

  async run() {
    const { args } = this.parse(ComponentCommand);
    const strageties = {
      create: this.create.bind(this),
    };
    await safeCallFunction(strageties[args.operation]);
  }
}

ComponentCommand.description = `组件操作`;

module.exports = ComponentCommand;
