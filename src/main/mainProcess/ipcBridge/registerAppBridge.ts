import { app, ipcMain } from "electron";
import * as fs from "node:fs";
import * as path from "node:path";

import { state } from "../state";
import { safeModuleName, isExistingDirectory, resolveWithinDir } from "../pathSafety";
import {
  escapeRegExpLiteral,
  normalizeGetMethodCodeArgs,
} from "../../../shared/validation/methodCodeRequestValidation";
import { getProjectDirForEvent, type SenderEvent } from "./projectContext";

export function registerAppBridge(): void {
  ipcMain.on("bridge:app:getBaseMethodNames", (event) => {
    try {
      const moduleBasePath = path.join(process.env.APP_ROOT, "projector", "helpers", "moduleBase.ts");
      const threeBasePath = path.join(process.env.APP_ROOT, "projector", "helpers", "threeBase.ts");
      const moduleBaseContent = fs.readFileSync(moduleBasePath, "utf-8");
      const threeBaseContent = fs.readFileSync(threeBasePath, "utf-8");
      const methodRegex = /{\s*name:\s*"([^"]+)",\s*executeOnLoad:/g;
      const moduleBaseMatches = [...moduleBaseContent.matchAll(methodRegex)];
      const threeBaseMatches = [...threeBaseContent.matchAll(methodRegex)];
      event.returnValue = {
        moduleBase: moduleBaseMatches.map((m) => m[1]),
        threeBase: threeBaseMatches.map((m) => m[1]),
      };
    } catch {
      event.returnValue = { moduleBase: [], threeBase: [] };
    }
  });

  ipcMain.on("bridge:app:isPackaged", (event) => {
    try {
      event.returnValue = Boolean(app.isPackaged);
    } catch {
      event.returnValue = true;
    }
  });

  ipcMain.on("bridge:app:getVersion", (event) => {
    try {
      event.returnValue = import.meta.env.PACKAGE_VERSION;
    } catch {
      event.returnValue = null;
    }
  });

  ipcMain.on("bridge:app:getRepositoryUrl", (event) => {
    try {
      event.returnValue = import.meta.env.REPO_URL;
    } catch {
      event.returnValue = null;
    }
  });

  ipcMain.on("bridge:app:openProjectorDevTools", (_event) => {
    try {
      const win = state.projector1Window as {
        isDestroyed?: () => boolean;
        webContents?: { isDestroyed?: () => boolean; openDevTools?: (opts?: unknown) => void };
      } | null;
      if (!win || win.isDestroyed?.()) return;
      const wc = win.webContents;
      if (!wc || wc.isDestroyed?.()) return;
      if (typeof wc.openDevTools === "function") {
        wc.openDevTools({ mode: "detach" });
      }
    } catch {}
  });

  ipcMain.on("bridge:app:getMethodCode", (event, moduleName, methodName) => {
    try {
      const normalized = normalizeGetMethodCodeArgs(moduleName, methodName);
      if (!normalized.methodName) {
        event.returnValue = { code: null, filePath: null };
        return;
      }
      const safeMethodName = normalized.methodName;
      const methodNameEscaped = escapeRegExpLiteral(safeMethodName);

      const moduleBasePath = path.join(process.env.APP_ROOT, "projector", "helpers", "moduleBase.ts");
      const threeBasePath = path.join(process.env.APP_ROOT, "projector", "helpers", "threeBase.ts");

      let filePath: string | null = null;
      let fileContent: string | null = null;
      const searchOrder: string[] = [];

      const projectDir = getProjectDirForEvent(event as unknown as SenderEvent);
      const safeModule = safeModuleName(moduleName);
      if (projectDir && isExistingDirectory(projectDir) && safeModule) {
        const modulesDir = path.join(projectDir, "modules");
        const workspaceModulePath = resolveWithinDir(modulesDir, `${safeModule}.js`);
        if (workspaceModulePath && fs.existsSync(workspaceModulePath)) {
          searchOrder.push(workspaceModulePath);
        }
      }

      if (fs.existsSync(moduleBasePath)) searchOrder.push(moduleBasePath);
      if (fs.existsSync(threeBasePath)) searchOrder.push(threeBasePath);

      for (const p of searchOrder) {
        const content = fs.readFileSync(p, "utf-8");
        const classMethodRegex = new RegExp(`\\s+${methodNameEscaped}\\s*\\([^)]*\\)\\s*\\{`, "m");
        if (classMethodRegex.test(content)) {
          filePath = p;
          fileContent = content;
          break;
        }
      }

      if (!fileContent || !filePath) {
        event.returnValue = { code: null, filePath: null };
        return;
      }

      const methodNamePattern = new RegExp(`\\s+${methodNameEscaped}\\s*\\(`, "m");
      const methodNameMatch = fileContent.match(methodNamePattern);
      if (!methodNameMatch) {
        event.returnValue = { code: null, filePath };
        return;
      }

      const startIndex = fileContent.indexOf(methodNameMatch[0]);
      if (startIndex === -1) {
        event.returnValue = { code: null, filePath };
        return;
      }

      let parenCount = 0;
      let braceCount = 0;
      let inString = false;
      let stringChar: string | null = null;
      let foundMethodBody = false;
      let i = startIndex + methodNameMatch[0].indexOf("(");

      while (i < fileContent.length) {
        const char = fileContent[i];
        const prevChar = i > 0 ? fileContent[i - 1] : null;

        if (!inString && (char === '"' || char === "'" || char === "`")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && prevChar !== "\\") {
          inString = false;
          stringChar = null;
        } else if (!inString) {
          if (char === "(") parenCount++;
          if (char === ")") parenCount--;
          if (char === "{") {
            if (parenCount === 0 && !foundMethodBody) {
              foundMethodBody = true;
              braceCount = 1;
            } else {
              braceCount++;
            }
          }
          if (char === "}") {
            braceCount--;
            if (foundMethodBody && braceCount === 0) {
              const code = fileContent.substring(startIndex, i + 1);
              event.returnValue = { code: code.trim(), filePath };
              return;
            }
          }
        }
        i++;
      }

      event.returnValue = { code: null, filePath };
    } catch {
      event.returnValue = { code: null, filePath: null };
    }
  });

  ipcMain.on("bridge:app:getKickMp3ArrayBuffer", (event) => {
    try {
      const kickPath = path.join(process.env.APP_ROOT, "dashboard", "assets", "audio", "kick.mp3");
      const buf = fs.readFileSync(kickPath);
      event.returnValue = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } catch {
      event.returnValue = null;
    }
  });
}

