import { UserConfig, defineConfig } from 'vite'
import { rmSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig(() => {
  rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true })
  rmSync(path.join(__dirname, 'dist-electron'), { recursive: true, force: true })

  return {
    plugins: [
      react(),
      tailwindcss(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: 'src/index.ts',
          vite: {
            define: {
              'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
              'import.meta.env.REPO_URL': JSON.stringify(packageJson.repository.url),
            }
          },
          onstart(options) {
            // fix linux devtools
            // https://github.com/electron-vite/vite-plugin-electron/issues/264
            options.startup(undefined, { stdio: ['inherit', 'inherit', 'inherit', 'ignore', 'ipc'] })
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, 'src/preload.ts'),
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: process.env.NODE_ENV === 'test'
          // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          ? undefined
          : {}
      })
    ],
    base: '',
    build: {
      outDir: path.join(__dirname, 'dist'),
      rollupOptions: {
        // Externalize deps that shouldn't be bundled into your library.
        external: ['electron'],
        input: {
          main: path.join(__dirname, 'html/dashboard.html'),
          projector: path.join(__dirname, 'html/projector.html'),
          moduleSandbox: path.join(__dirname, 'html/moduleSandbox.html'),
          sandboxPreload: path.join(__dirname, 'src/sandboxPreload.ts'),
        },
      },
    },
  } satisfies UserConfig
})
