 
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true  // 明确启用 ES6 环境
  },
  extends: [
    "eslint:recommended",       // ESLint 推荐规则
    "plugin:vue/essential",     // Vue 基础规则
    "plugin:vue/recommended"    // Vue 推荐规则（可选，根据需求添加）
  ],
  parser: "vue-eslint-parser",  // 明确指定主解析器为 vue-eslint-parser
  parserOptions: {
    parser: "@babel/eslint-parser", // 使用 Babel 解析 JS 文件
    ecmaVersion: 2022,          // 替代 "latest"，更明确
    sourceType: "module",
    requireConfigFile: false    // 避免寻找 Babel 配置文件
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // 忽略以 _ 开头的变量
    "vue/multi-word-component-names": "off" // 关闭 Vue 3 多单词组件名警告
  },
  globals: {
    // 如有需要可添加全局变量
  },
  overrides: [
    {
      files: ["**/*.spec.js", "**/*.test.js"],
      env: {
        jest: true  // 测试文件启用 Jest 环境
      }
    }
  ]
};