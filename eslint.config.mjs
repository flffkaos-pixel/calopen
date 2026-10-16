import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'coverage/**', 'next-env.d.ts'],
  },
  {
    // Test mocks intentionally use `any` and require(); they never ship.
    // Same for plain JS configs (jest/playwright) using require().
    files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**', 'scripts/**', '**/*.js', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
