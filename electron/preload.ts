import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron'
import { Jsonish, noop } from '../src/types/utils'

const isTopLevelFrame = () => {
  try {
    return window === window.top
  } catch {
    return true
  }
}

const nwWrldAppBridge = {
  json: {
    read: (filename: string, defaultValue: any) => ipcRenderer.invoke("bridge:json:read", filename, defaultValue),
    readSync: (filename: string, defaultValue: Jsonish) => ipcRenderer.sendSync("bridge:json:readSync", filename, defaultValue),
    write: (filename: string, data: any) => ipcRenderer.invoke("bridge:json:write", filename, data),
    writeSync: (filename: string, data: any) => ipcRenderer.sendSync("bridge:json:writeSync", filename, data),
  },
  logToMain: (message: any[]) => ipcRenderer.send("log-to-main", message),
}

const nwWrldBridge = {
  project: {
    getDir: () => ipcRenderer.sendSync("bridge:project:getDir"),
    isRequired: () => ipcRenderer.sendSync("bridge:project:isRequired"),
    isDirAvailable: () => ipcRenderer.sendSync("bridge:project:isDirAvailable"),
  },
  os: {
    openExternal: (url: string) => ipcRenderer.sendSync("bridge:os:openExternal", url),
  },
  sandbox: {
    registerToken: (token: string) => ipcRenderer.sendSync("bridge:sandbox:registerToken", token),
    unregisterToken: (token: string) => ipcRenderer.sendSync("bridge:sandbox:unregisterToken", token),
    ensure: () => ipcRenderer.invoke("sandbox:ensure"),
    request: (token: string, type: string, props: any) => ipcRenderer.invoke("sandbox:request", { token, type, props }),
    destroy: () => ipcRenderer.invoke("sandbox:destroy"),
  },
  workspace: {
    listModuleFiles: () => ipcRenderer.invoke("bridge:workspace:listModuleFiles"),
    listModuleSummaries: () => ipcRenderer.invoke("bridge:workspace:listModuleSummaries"),
    getModuleUrl: (moduleName: string) => ipcRenderer.invoke("bridge:workspace:getModuleUrl", moduleName),
    readModuleText: (moduleName: string) => ipcRenderer.invoke("bridge:workspace:readModuleText", moduleName),
    readModuleWithMeta: (moduleName: string) => ipcRenderer.invoke("bridge:workspace:readModuleWithMeta", moduleName),
    writeModuleTextSync: (moduleName: string, text: string) => ipcRenderer.sendSync("bridge:workspace:writeModuleTextSync", moduleName, text),
    moduleExists: (moduleName: string) => ipcRenderer.sendSync("bridge:workspace:moduleExists", moduleName),
    showModuleInFolder: (moduleName: string) => ipcRenderer.send("bridge:workspace:showModuleInFolder", moduleName),
    assetUrl: (relPath: string) => ipcRenderer.sendSync("bridge:workspace:assetUrl", relPath),
    listAssets: (relDir: string) => ipcRenderer.invoke("bridge:workspace:listAssets", relDir),
    readAssetText: (relPath: string) => ipcRenderer.invoke("bridge:workspace:readAssetText", relPath),
  },
  app: {
    getBaseMethodNames: () => ipcRenderer.sendSync("bridge:app:getBaseMethodNames"),
    getMethodCode: (moduleName: string, methodName: string) => ipcRenderer.sendSync("bridge:app:getMethodCode", moduleName, methodName),
    getKickMp3ArrayBuffer: () => ipcRenderer.sendSync("bridge:app:getKickMp3ArrayBuffer"),
    getVersion: () => ipcRenderer.sendSync("bridge:app:getVersion"),
    getRepositoryUrl: () => ipcRenderer.sendSync("bridge:app:getRepositoryUrl"),
    isPackaged: () => ipcRenderer.sendSync("bridge:app:isPackaged"),
  },
  messaging: {
    sendToProjector: (type: string, props = {}) => ipcRenderer.send("dashboard-to-projector", { type, props }),
    sendToDashboard: (type: string, props = {}) => ipcRenderer.send("projector-to-dashboard", { type, props }),
    onFromProjector: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, data: noop) => handler(event, data)
      ipcRenderer.on("from-projector", wrapped)
      return () => ipcRenderer.removeListener("from-projector", wrapped)
    },
    onFromDashboard: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, data: noop) => handler(event, data)
      ipcRenderer.on("from-dashboard", wrapped)
      return () => ipcRenderer.removeListener("from-dashboard", wrapped)
    },
    onInputEvent: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, payload: noop) => handler(event, payload)
      ipcRenderer.on("input-event", wrapped)
      return () => ipcRenderer.removeListener("input-event", wrapped)
    },
    onInputStatus: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, payload: noop) => handler(event, payload)
      ipcRenderer.on("input-status", wrapped)
      return () => ipcRenderer.removeListener("input-status", wrapped)
    },
    onWorkspaceModulesChanged: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, payload: noop) => handler(event, payload)
      ipcRenderer.on("workspace:modulesChanged", wrapped)
      return () => ipcRenderer.removeListener("workspace:modulesChanged", wrapped)
    },
    onWorkspaceLostSync: (handler: noop) => {
      const wrapped = (event: IpcRendererEvent, payload: noop) => handler(event, payload)
      ipcRenderer.on("workspace:lostSync", wrapped)
      return () => ipcRenderer.removeListener("workspace:lostSync", wrapped)
    },
    configureInput: (payload: noop) => ipcRenderer.invoke("input:configure", payload),
    getMidiDevices: () => ipcRenderer.invoke("input:get-midi-devices"),
    selectWorkspace: () => ipcRenderer.invoke("workspace:select"),
  },
}

if (isTopLevelFrame()) {
  contextBridge.exposeInMainWorld("nwWrldBridge", nwWrldBridge)
  contextBridge.exposeInMainWorld("nwWrldAppBridge", nwWrldAppBridge)
}