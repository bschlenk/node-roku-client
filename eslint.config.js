import bschlenk, { globals } from '@bschlenk/eslint-config';

export default [
  { ignores: ['**/dist/'] },
  { files: ['**/*.js', '**/*.ts'] },

  {
    languageOptions: {
      parserOptions: { project: './tsconfig.json' },
      globals: { ...globals.es2022 },
    },
  },

  ...bschlenk.configs.typescript,

  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    },
  },
];
