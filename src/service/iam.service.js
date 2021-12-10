const request = require("../utils/request");
const IAM_SSO_SERVER = "/staff-iam-sso";
const IAM_ADMIN_SERVER = "/staff-iam-admin";
const qs = require("qs");
const { db } = require("../db");
const login = (data) => {
  return request
    .post(
      `${IAM_SSO_SERVER}/oauth/token`,
      qs.stringify({
        grant_type: "airpaas",
        enterpriseCode: "airpaas",
        scope: "all",
        client_id: "airpaas",
        client_secret: "123456",
        ...data,
      })
    )
    .then(({ payload }) => {
      db.push(`/token`, payload.access_token);
      db.push(`/refreshToken`, payload.refresh_token);
      return payload;
    });
};

const getUserInfo = () => {
  return request
    .get(`${IAM_ADMIN_SERVER}/users/token/verify`)
    .then(({ payload }) => {
      db.push("/userInfo", payload);
      return payload;
    });
};

module.exports = {
  login,
  getUserInfo,
};
