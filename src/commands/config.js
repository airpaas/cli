const { Command, flags } = require("@oclif/command");
const { prompt } = require("enquirer");
const { db } = require("../db");
const userAccountFrom = require("../forms/userAccount");
const { login, getUserInfo } = require("../service/iam.service");
const { logger } = require("../utils");
const fs = require("fs");
const config = require("../config");
class ConfigCommand extends Command {
  static args = [{ name: "key" }, { name: "value" }];
  async run() {
    const { args } = this.parse(ConfigCommand);

    const { key, value } = args;
    if (key === "clear") {
      fs.writeFileSync(config.configFile, "{}", { encoding: "utf-8" });
      logger.info("数据清除成功");
      return;
    }
    logger.info("欢迎使用 AirPaaS 命令行工具");
    if (key && value) {
      db.push(`/${key}`, value);
    } else {
      await this.saveUserInfo();
    }
  }
  async saveUserInfo() {
    logger.info("配置您的账号信息");
    try {
      let res = await prompt(userAccountFrom);
      await userAccountFrom.validate(res);
      // 写入用户信息
      db.push("/userAccount", res);
      // 执行登录
      await this.doLogin(res);
    } catch (error) {
      logger.error("配置失败:", error.message);
    }
  }
  async doLogin(data) {
    await login(data);
    // 写入token
    await getUserInfo();
    logger.success("配置成功！");
  }
}

ConfigCommand.description = `配置账号信息`;
module.exports = ConfigCommand;
