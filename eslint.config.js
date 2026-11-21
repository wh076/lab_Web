import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'

export default withVueTs(
  { ignores: ['**/dist/**', '**/coverage/**'] },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser },
    rules: { '@typescript-eslint/no-explicit-any': 'error' }
  },
  {
    files: ['vite.config.ts'],
    languageOptions: { globals: globals.node }
  },
  prettierConfig
)
