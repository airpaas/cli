const { Command, flags } = require("@oclif/command");
const {
  safeCallFunction,
  logger,
  nanoid,
  catchErrorWrap,
  throwErr,
  strategyFunctionCreactor,
} = require("../utils");
const { prompt } = require("enquirer");
const createLibraryForm = require("../forms/createLibrary");
const path = require("path");
const genForTemplate = require("../utils/genForTemplate");
const jetpack = require("fs-jetpack");
const execa = require("execa");
const PkgHelper = require("../utils/PkgHelper");
const _ = require("lodash");
const checkAuthentication = require("../guards/checkAuthentication");
const { login } = require("../service/iam.service");
const { getValue, db } = require("../db");
const semver = require("semver");
const { getOssSts, saveLibInfo } = require("../service/metaData.service");
const { Client } = require("minio");
const fs = require("fs");
const ProgressBar = require("progress");
class LibCommand extends Command {
  static args = [{ name: "mode" }];
  async collectLibInfo() {
    const anwser = await prompt(createLibraryForm);
    await createLibraryForm.validate(anwser);
    anwser.code = nanoid();
    return anwser;
  }
  async create() {
    catchErrorWrap(async () => {
      const anwser = await this.collectLibInfo();
      const destFolder = path.join(process.cwd(), anwser.name);
      const options = {
        mode: "library",
        framework: anwser.framework,
        data: anwser,
        destFolder,
      };
      const genLog = (fileDestPath) => {
        logger.info(
          "生成文件：",
          fileDestPath.replace(process.cwd() + "/", "")
        );
      };
      await genForTemplate(options, genLog);

      logger.success(`组件库【${anwser.name}】 创建成功`);

      PkgHelper.of({ root: destFolder }).update({
        air: anwser,
      });

      const a2 = await prompt({
        type: "confirm",
        name: "isInstall",
        message: "是否需要安装给组件库依赖",
      });
      if (a2.isInstall) {
        const client = await prompt([
          {
            type: "select",
            name: "client",
            message: "选择安装客户端",
            initial: "npm",
            choices: ["npm", "yarn"],
          },
          {
            type: "confirm",
            name: "useTaobao",
            message: "是否使用淘宝镜像源（比较快哦）？",
          },
        ]);
        await this.execaInstall(client, destFolder);
      }
    });
  }
  getPkgJson(root) {
    const packageJSONPath = path.join(root, "package.json");
    const packageJSON = require(packageJSONPath);
    return { packageJSON, packageJSONPath };
  }
  async execaInstall({ client, useTaobao }, destFolder) {
    const args = [];
    if (client === "npm") {
      args.push("install");
    }
    if (useTaobao) {
      args.push("--registry=https://registry.npm.taobao.org/");
    }
    const data = execa(client, args, {
      cwd: destFolder,
    });
    data.stdout.pipe(process.stdout);
    data.stderr.pipe(process.stderr);
  }

  async publish() {
    catchErrorWrap(async () => {
      const libRootPath = path.join(process.cwd());
      const pkgHelper = PkgHelper.of({ root: libRootPath });
      const { air, version } = pkgHelper.json;
      // 检查有无配置信息
      if (_.isNil(air))
        throwErr(`未发现组件库配置信息，请使用命令 'air lib new' 配置信息`);
      await createLibraryForm.validate(air);
      // 检查有无打包
      const libDistPath = path.join(libRootPath, "lib");
      if (!jetpack.exists(libDistPath))
        throwErr(`组件库尚未打包，请先执行 'npm run build-lib'`);
      // 输入版本号
      const versionAnwser = await prompt({
        name: "version",
        message: `请输入版本号( 当前版本：${version} )`,
        type: "input",
        initial: version,
      });

      if (!semver.valid(versionAnwser.version)) {
        throwErr("版本号格式不正确，格式例子：1.0.0、0.0.1");
      }
      pkgHelper.update({ version: versionAnwser.version });

      // 检查账号信息
      checkAuthentication();
      // 执行登录
      await login(db.getData("/userAccount"));
      const { accessKeyId, accessKeySecret, securityToken } = await getOssSts();
      const endPoint = getValue("minioServer", "minio.apaas.izici.com");
      const bucket = getValue("minioBucket", "libs");
      const client = new Client({
        endPoint,
        useSSL: false,
        accessKey: accessKeyId,
        secretKey: accessKeySecret,
        port: 9000,
        sessionToken: securityToken,
      });

      const getUploadTaskList = (dir, arr = []) => {
        const files = fs.readdirSync(dir);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const extname = path.extname(file).replace(".", "");
          // 过滤非 js 和 css 文件
          if (!["js", "css"].includes(extname)) {
            continue;
          }
          const localFilePath = path.join(dir, file);
          if (fs.statSync(localFilePath).isDirectory()) {
            getUploadTaskList(localFilePath, arr);
          } else {
            const target = `${air.code}/${pkgHelper.json.version}/${file}`;
            const mainFile = [
              `${air.code}.umd.min.js`,
              `${air.code}.css`,
            ].includes(file);

            arr.push({
              local: localFilePath,
              target,
              requestBody: {
                mainFile,
                type: extname === "js" ? "script" : "style",
                url: `//${endPoint}:9000/${target}`,
              },
            });
          }
        }
        return arr;
      };
      const uploadTaskList = getUploadTaskList(libDistPath);
      const bar = new ProgressBar("正在上传文件： [:bar] :current/:total", {
        complete: "=",
        incomplete: " ",
        width: 30,
        total: uploadTaskList.length,
      });
      for (let i = 0; i < uploadTaskList.length; i++) {
        const { target, local } = uploadTaskList[i];
        await client.fPutObject(bucket, target, local);
        bar.tick({ target, local });
      }
      const requestBody = {
        ...air,
        version: versionAnwser.version,
        componentUrlList: uploadTaskList.map((item) => item.requestBody),
      };
      // 更新服务器数据
      await saveLibInfo(requestBody);
      logger.success("组件库发布成功！");
    });
  }

  async genLibInfoCode() {
    const buildLibCommandExecutor = strategyFunctionCreactor({
      vue: (code) =>
        `vue-cli-service build --target lib --name ${code} --dest lib packages/index.js`,
    });
    catchErrorWrap(async () => {
      const libRootPath = path.join(process.cwd());
      const anwser = await this.collectLibInfo();
      PkgHelper.of({ root: libRootPath }).update({
        air: anwser,
        scripts: {
          "build-lib": buildLibCommandExecutor(anwser.framework, anwser.code),
        },
      });
      logger.success("配置组件库信息成功");
      logger.success(`组件库code： ${anwser.code}`);
    });
  }
  async run() {
    const { args } = this.parse(LibCommand);
    const strageties = {
      create: this.create.bind(this),
      publish: this.publish.bind(this),
      new: this.genLibInfoCode.bind(this),
    };
    await safeCallFunction(strageties[args.mode]);
  }
}

LibCommand.description = `组件库操作`;

module.exports = LibCommand;
