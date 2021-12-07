const { db } = require("../db");
const { logger } = require("../utils");

const checkAuthentication = () => {
  // 检查有无配置用户名密码
  try {
    const data = db.getData("/userAccount");
    return data;
  } catch (error) {
    throw new Error(`尚未配置账号信息, 请运行 "gdc config" 命令配置`);
  }
};
module.exports = checkAuthentication;
