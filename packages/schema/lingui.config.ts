import { defineConfig } from '@lingui/cli'

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['en-US', 'zh-CN', 'pseudo-LOCALE'],
  pseudoLocale: 'pseudo-LOCALE',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  catalogsMergePath: 'dist-locales/{locale}',
  compileNamespace: 'es',
  format: 'po',
})
