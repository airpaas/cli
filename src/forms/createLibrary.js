const { validator } = require("../utils");
const { namePattern } = require("../utils/patterns");

const createLibraryForm = [
  {
    type: "input",
    name: "name",
    message: "组件库名称",
  },
  {
    type: "select",
    message: "选择技术框架",
    name: "framework",
    initial: "vue",
    choices: ["vue"],
  },
];
createLibraryForm.validate = validator({
  name: [
    { required: true, message: "组件库名称不能为空" },
    {
      pattern: namePattern,
      message: '组件库名称只能使用字母、数字、"-"，且只能以字母开头',
    },
  ],
});
module.exports = createLibraryForm;
