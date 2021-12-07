const request = require("../utils/request");
const prefix = "/meta-data";

const getOssSts = () =>
  request.get(`${prefix}/obs/sts`).then((res) => {
    return res.payload;
  });

const saveLibInfo = (data) => {
  return request.post(`${prefix}/customComponent`, data);
};

module.exports = {
  getOssSts,
  saveLibInfo,
};
