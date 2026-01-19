import type { FSWatcher } from 'original-fs'
import type InputManager from '../InputManager'
import type { BrowserView, BrowserWindow, Rectangle } from 'electron'

interface State {
  projector1Window: BrowserWindow | null
  dashboardWindow: BrowserWindow | null
  inputManager: InputManager | null
  workspaceWatcher: FSWatcher | null
  workspaceWatcherDebounce: NodeJS.Timeout | null
  currentWorkspacePath: string | null
  currentProjectDir: string | null
  didRegisterAppLifecycleHandlers: boolean
  webContentsToProjectDir: Map<number, string | null>
  sandboxTokenToProjectDir: Map<string, { projectDir: string, ownerWebContentsId: number, createdAt: number }>
  sandboxOwnerWebContentsIdToTokens: Map<number, Set<string>>
  sandboxOwnerCleanupHooked: Set<number>
  sandboxView: BrowserView | null
  sandboxViewWebContentsId: number | null
  activeSandboxToken: string | null
  sandboxEnsureInFlight: Promise<{
    ok: boolean;
    reason: string;
    token?: undefined;
  } | {
    ok: boolean;
    token: string;
    reason?: undefined;
  }> | null
  projectorDefaultBounds: Rectangle | null
  pendingSandboxRequests: Map<string, { resolve: (value: any) => void, timeout: NodeJS.Timeout, token: string }>
  didRunShutdownCleanup: boolean
}

export const state: State = {
  projector1Window: null,
  dashboardWindow: null,
  inputManager: null,
  workspaceWatcher: null,
  workspaceWatcherDebounce: null,
  currentWorkspacePath: null,
  currentProjectDir: null,
  didRegisterAppLifecycleHandlers: false,
  webContentsToProjectDir: new Map(),
  sandboxTokenToProjectDir: new Map(),
  sandboxOwnerWebContentsIdToTokens: new Map(),
  sandboxOwnerCleanupHooked: new Set(),
  sandboxView: null,
  sandboxViewWebContentsId: null,
  activeSandboxToken: null,
  sandboxEnsureInFlight: null,
  projectorDefaultBounds: null,
  pendingSandboxRequests: new Map(),
  didRunShutdownCleanup: false
}