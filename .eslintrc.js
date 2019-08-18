module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  "parser": "babel-eslint",
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "no-use-before-define":0,
    "react/prefer-stateless-function":0,
    "react/destructuring-assignment":0,
    "react/prop-types":0,
    "no-console":0,
    "import/prefer-default-export":0,
    "comma-dangle":0,
    "global-require":0,
    "camelcase":0
  },
};
