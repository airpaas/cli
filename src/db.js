const fs = require("fs");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const config = require("./config");

if (!fs.existsSync(config.configFolder)) {
  fs.mkdirSync(config.configFolder);
}

const db = new JsonDB(new Config(config.configFile, true, false, "/"));

const getValue = (key, defaultValue) => {
  let value;
  try {
    value = db.getData(`/${key}`);
  } catch (error) {
    value = defaultValue;
  }
  return value;
};
module.exports = {
  db,
  getValue,
};
