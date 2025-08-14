// @ts-check

import ainouCodeStyle from '@ainou/code-style'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'
import valtio from 'eslint-plugin-valtio'

export default [
  ...ainouCodeStyle,
  {
    files: ['packages/**/vite.config.ts', 'packages/**/postcss.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    rules: {
      'no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  globalIgnores(['packages/core-sdk/src/schema.d.ts']),
  valtio.configs.recommended,
]
