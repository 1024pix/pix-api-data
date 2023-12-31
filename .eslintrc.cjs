module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'knex', 'unicorn'],
  extends: [
    "@1024pix",
    'plugin:@typescript-eslint/recommended',
    'plugin:mocha/recommended',
    'plugin:prettier/recommended',
    'plugin:chai-expect/recommended',
    'plugin:n/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  "settings": {
    "node": {
      "tryExtensions": [".js", ".json", ".node", ".ts", ".d.ts"]
    },
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'error',
    'mocha/no-hooks-for-single-case': 'off',
    'no-sync': 'error',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-pending-tests': 'error',
    'mocha/no-skipped-tests': 'error',
    'mocha/no-top-level-hooks': 'error',
    'no-empty-function': 'error',
    'n/no-process-exit': 'error',
    'unicorn/no-empty-file': 'error',
    'n/no-missing-import': 'off',
    'n/no-unpublished-import': [
      'error',
      {
        allowModules: [
          'chai',
          'flush-write-stream',
          'form-data',
          'mockdate',
          'nock',
          'proxyquire',
          'sinon',
          'split2',
          'stream-to-promise',
          'pino-pretty',
          'pg',
          'sinon-chai'
        ],
      },
    ],
  },
};
