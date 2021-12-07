const chalk = require("chalk");
const Schema = require("async-validator").default;
const { customAlphabet } = require("nanoid");
const _ = require("lodash");
const dayjs = require("dayjs");
const logger = {
  get timestamp() {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  },
  error(...message) {
    console.log(chalk.redBright(`${this.timestamp} [ERROR]`, ...message));
  },
  success(...message) {
    console.log(chalk.greenBright(`${this.timestamp} [SUCCESS]`, ...message));
  },
  info(...message) {
    console.log(chalk.blueBright(`${this.timestamp} [INFO]`, ...message));
  },
};

const catchErrorWrap = async (fn, args = [], cb) => {
  try {
    return await safeCallFunction(fn, ...args);
  } catch (error) {
    logger.error(error.message);
    logger.error(error.stack);
    await safeCallFunction(cb);
  }
};
const throwErr = (msg) => {
  throw new Error(msg);
};
const validator = (descriptor) => {
  return (data) => {
    const validator = new Schema(descriptor);
    return validator
      .validate(data)
      .then(() => {
        return Promise.resolve();
      })
      .catch((e) => {
        return Promise.reject(new Error(e.errors[0].message));
      });
  };
};

const safeCallFunction = (fn, ...args) => {
  if (fn) return fn(...args);
};

const strategyValueCreactor = (map = {}, defaultValue) => {
  return (key) => {
    const value = map[key];
    return _.isNil(value) ? defaultValue : value;
  };
};
const strategyFunctionCreactor = (map = {}) => {
  return (key, ...args) => {
    return safeCallFunction(map[key], ...args);
  };
};

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ",
  10
);

exports.catchErrorWrap = catchErrorWrap;
exports.throwErr = throwErr;
exports.validator = validator;
exports.logger = logger;
exports.safeCallFunction = safeCallFunction;
exports.nanoid = nanoid;
exports.strategyValueCreactor = strategyValueCreactor;
exports.strategyFunctionCreactor = strategyFunctionCreactor;
