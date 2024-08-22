import antfu from '@antfu/eslint-config';
import mochaPlugin from 'eslint-plugin-mocha';

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

    formatters: {
      markdown: 'prettier',
    },

    ignores: ['build', '**/build/**', 'node_modules', '**/node_modules/**', 'data', '**/data/**', '.circleci', '**/.circleci/**'],
  },
  {
    rules: {
      'regexp/no-useless-assertions': 0,
    },
  },
  {
    files: ['tests/**'],
    rules: {
      'prefer-arrow-callback': 0,
      'ts/no-unused-expressions': 0,
    },
  },
  {
    ...mochaPlugin.configs.flat.recommended,
  },
);
