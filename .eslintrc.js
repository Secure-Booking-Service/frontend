module.exports = {
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: [
    '@typescript-eslint',
  ],
  root: true,
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-explicit-any": "off",
    "semi": 1,
    "eol-last": 1,
  },
};
