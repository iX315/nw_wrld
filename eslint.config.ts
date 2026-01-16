import { defineConfig } from 'eslint/config'
import eslintConfig from '@ix315/eslint-config'

export default defineConfig([
  eslintConfig.recommended,
  {
    ignores: [
      'dist-electron',
      'electron' // TODO extend config for node based files
    ]
  }
])
