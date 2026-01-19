import fs from 'fs'
import path from 'path'

import { STARTER_MODULES_DIR } from '../constants'

import type { Dirent } from 'fs'

export function ensureWorkspaceStarterModules(modulesDir: string) {
  if (!fs.existsSync(modulesDir)) return

  let entries: Dirent[] = []
  try {
    entries = fs.readdirSync(STARTER_MODULES_DIR, { withFileTypes: true })
  } catch {
    entries = []
  }

  entries
    .filter((e) => e && e.isFile && e.isFile() && e.name.endsWith('.js'))
    .map((e) => e.name)
    .forEach((filename) => {
      const srcPath = path.join(STARTER_MODULES_DIR, filename)
      const destPath = path.join(modulesDir, filename)
      if (fs.existsSync(destPath)) return
      try {
        fs.copyFileSync(srcPath, destPath)
      } catch {}
    })
}