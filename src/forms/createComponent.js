const { validator } = require("../utils");
const { namePattern, titlePattern } = require("../utils/patterns");

const creaateComponentForm = [
  {
    type: "input",
    name: "name",
    message: "组件名称",
  },
  { type: "input", name: "title", message: "组件标题" },
  {
    type: "select",
    message: "组件产出的数据类型",
    name: "dataType",
    initial: "string",
    choices: ["string", "boolean", "number", "object", "array"],
  },
];

creaateComponentForm.validate = validator({
  name: [
    { required: true, message: "组件名称不能为空" },
    {
      pattern: namePattern,
      message: '组件名称只能使用字母、数字、"-"，且只能以字母开头',
    },
  ],
  title: [
    { required: true, message: "组件标题不能为空" },
    {
      pattern: titlePattern,
      message: "组件标题只能使用字母、数字、中文",
    },
  ],
});

module.exports = creaateComponentForm;
