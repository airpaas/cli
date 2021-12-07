const { validator } = require("../utils");

const userAccountFrom = [
  { type: "input", name: "username", message: "用户名" },
  { type: "password", name: "password", message: "密码" },
];

userAccountFrom.validate = validator({
  username: { required: true, message: "用户名不能为空" },
  password: { required: true, message: "密码不能为空" },
});

module.exports = userAccountFrom;
