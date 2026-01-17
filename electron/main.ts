import { app, BrowserWindow, screen } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

require('node:os')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const getScreenSizes = () => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const { x, y } = primaryDisplay.workArea

  return {
    x,
    y,
    width,
    height
  }
}

function createDashboardWindow() {
  const screenSize = getScreenSizes()

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    x: screenSize.x,
    y: screenSize.y,
    height: screenSize.height,
    width: Math.floor(screenSize.width / 2),
    title: "Dashboard [NW_WRLD]",
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + 'dashboard')
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, '/dashboard/index.html'))
  }
}

function createProjectorWindow() {
  const screenSize = getScreenSizes()

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    frame: false,
    title: "Projector [NW_WRLD]",
    x: screenSize.x + Math.floor(screenSize.width / 2),
    y: screenSize.y,
    height: screenSize.height,
    width: Math.floor(screenSize.width / 2),
    show: true,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
      backgroundThrottling: false,
      webgl: true,
      autoplayPolicy: "no-user-gesture-required",
    }
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL + 'projector')
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, '/projector/index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createDashboardWindow()
    createProjectorWindow()
  }
})

app.whenReady().then(() => {
  createDashboardWindow()
  createProjectorWindow()
})
