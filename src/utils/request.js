const axios = require("axios").default;
const { getValue } = require("../db");
const { logger } = require("./index");
const request = axios.create({
  baseURL: getValue("apiServer", "http://gw.apaas.izici.com"),
});

request.interceptors.request.use((config) => {
  const token = getValue("token", "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const res = err.response;
    const data = res.data;
    const msg = data.message || data.msg || err.message;
    logger.error(msg);
    return Promise.reject(err);
  }
);

module.exports = request;
