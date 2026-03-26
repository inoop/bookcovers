import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // `any` is used intentionally for Axios error typing and form callbacks.
      // Warn rather than error so CI surfaces new occurrences without blocking.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Synchronous setState inside useEffect is a valid React pattern for
      // conditional early-returns (e.g. clearing loading state). Turn off the
      // overly-strict rule added in react-hooks v7.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
