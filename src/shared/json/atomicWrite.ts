import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const writeQueue = new Map()
const writeEpoch = new Map()
let tmpCounter = 0

function isSystemError(err: unknown): err is NodeJS.ErrnoException & { code?: string } {
  return !!err && typeof err === 'object' && 'code' in err
}

function makeTempPath(filePath: string) {
  tmpCounter = (tmpCounter + 1) >>> 0
  const uuid =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`
  return `${filePath}.tmp.${process.pid}.${Date.now()}.${tmpCounter}.${uuid}`
}

async function performAtomicWrite(filePath: string, data: string, epoch: any) {
  const tempPath = makeTempPath(filePath)

  try {
    await fs.promises.writeFile(tempPath, data, 'utf-8')

    if (epoch != null && writeEpoch.get(filePath) !== epoch) {
      try {
        await fs.promises.unlink(tempPath)
      } catch (err) {
        console.error(err)
        // TODO do something with the error
      }
      return
    }

    try {
      await fs.promises.rename(tempPath, filePath)
    } catch (renameError) {
      if (!isSystemError(renameError)) return
      if (renameError.code === 'EEXIST' || renameError.code === 'EPERM') {
        if (epoch != null && writeEpoch.get(filePath) !== epoch) {
          try {
            await fs.promises.unlink(tempPath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          return
        }

        const backupPath = `${filePath}.backup`
        try {
          await fs.promises.unlink(backupPath)
        } catch (err) {
          console.error(err)
          // TODO do something with the error
        }
        try {
          await fs.promises.rename(filePath, backupPath)
        } catch (backupError) {
          if (!isSystemError(backupError)) return
          if (backupError.code !== 'ENOENT') {
            throw backupError
          }
        }

        if (epoch != null && writeEpoch.get(filePath) !== epoch) {
          try {
            await fs.promises.rename(backupPath, filePath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          try {
            await fs.promises.unlink(tempPath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          return
        }

        await fs.promises.rename(tempPath, filePath)
        try {
          await fs.promises.unlink(backupPath)
        } catch (err) {
          console.error(err)
          // TODO do something with the error
        }
      } else {
        throw renameError
      }
    }
  } catch (error) {
    try {
      await fs.promises.unlink(tempPath)
    } catch (err) {
      console.error(err)
      // TODO do something with the error
    }
    throw error
  }
}

export async function atomicWriteFile(filePath: string, data: string) {
  const inflight = writeQueue.get(filePath)
  if (inflight) {
    try {
      await inflight
    } catch (err) {
      console.error(err)
      // TODO do something with the error
    }
  }

  const epoch = (writeEpoch.get(filePath) || 0) + 1
  writeEpoch.set(filePath, epoch)

  const writePromise = performAtomicWrite(filePath, data, epoch)

  writeQueue.set(filePath, writePromise)

  try {
    await writePromise
  } finally {
    if (writeQueue.get(filePath) === writePromise) {
      writeQueue.delete(filePath)
    }
  }
}

export function atomicWriteFileSync(filePath: string, data: string) {
  const epoch = (writeEpoch.get(filePath) || 0) + 1
  writeEpoch.set(filePath, epoch)

  const tempPath = makeTempPath(filePath)

  try {
    fs.writeFileSync(tempPath, data, 'utf-8')

    if (epoch != null && writeEpoch.get(filePath) !== epoch) {
      try {
        fs.unlinkSync(tempPath)
      } catch (err) {
        console.error(err)
        // TODO do something with the error
      }
      return
    }

    try {
      fs.renameSync(tempPath, filePath)
    } catch (renameError) {
      if (!isSystemError(renameError)) return
      if (renameError.code === 'EEXIST' || renameError.code === 'EPERM') {
        if (epoch != null && writeEpoch.get(filePath) !== epoch) {
          try {
            fs.unlinkSync(tempPath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          return
        }

        const backupPath = `${filePath}.backup`
        try {
          fs.unlinkSync(backupPath)
        } catch (err) {
          console.error(err)
          // TODO do something with the error
        }
        try {
          fs.renameSync(filePath, backupPath)
        } catch (backupError) {
          if (!isSystemError(backupError)) return
          if (backupError.code !== 'ENOENT') {
            throw backupError
          }
        }

        if (epoch != null && writeEpoch.get(filePath) !== epoch) {
          try {
            fs.renameSync(backupPath, filePath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          try {
            fs.unlinkSync(tempPath)
          } catch (err) {
            console.error(err)
            // TODO do something with the error
          }
          return
        }

        fs.renameSync(tempPath, filePath)
        try {
          fs.unlinkSync(backupPath)
        } catch (err) {
          console.error(err)
          // TODO do something with the error
        }
      } else {
        throw renameError
      }
    }
  } catch (error) {
    try {
      fs.unlinkSync(tempPath)
    } catch (err) {
      console.error(err)
      // TODO do something with the error
    }
    throw error
  }
}

export async function cleanupStaleTempFiles(directory: string, minAgeMs = 60_000) {
  try {
    const files = await fs.promises.readdir(directory)
    const now = Date.now()
    const tempFiles = files.filter((f) => f.includes('.tmp.'))

    for (const file of tempFiles) {
      try {
        const fullPath = path.join(directory, file)
        const stat = await fs.promises.stat(fullPath)
        if (now - stat.mtimeMs >= minAgeMs) {
          await fs.promises.unlink(fullPath)
        }
      } catch (err) {
        console.error(err)
        // TODO do something with the error
      }
    }
  } catch (err) {
    console.error(err)
    // TODO do something with the error
  }
}