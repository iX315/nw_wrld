import * as fs from 'node:fs'

import type { Jsonish } from '../../types/utils'

export async function readJsonWithBackup(
  filePath: string,
  defaultValue: Jsonish
): Promise<Jsonish> {
  try {
    const raw = await fs.promises.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as Jsonish
  } catch {
    try {
      const raw = await fs.promises.readFile(`${filePath}.backup`, 'utf-8')
      return JSON.parse(raw) as Jsonish
    } catch {
      return defaultValue
    }
  }
}

export function readJsonWithBackupSync(
  filePath: string,
  defaultValue: Jsonish
): Jsonish {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Jsonish
  } catch {
    try {
      const raw = fs.readFileSync(`${filePath}.backup`, 'utf-8')
      return JSON.parse(raw) as Jsonish
    } catch {
      return defaultValue
    }
  }
}
