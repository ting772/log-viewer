//https://eslint.org/docs/latest/use/configure/

module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  plugins: [],
  //https://eslint.org/docs/latest/use/configure/language-options#specifying-environments
  env: {
    browser: true,
    node: true,
    es6: true
  },
  //https://eslint.org/docs/latest/use/configure/language-options#specifying-globals
  globals: {},
  //https://eslint.org/docs/latest/use/configure/language-options#specifying-parser-options
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 6,
    ecmaFeatures: {
      //如果要支持jsx，打开jsx：true
      // jsx: true,
    }
  }
};