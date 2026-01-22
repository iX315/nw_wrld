import { ipcMain } from "electron";

import InputManager from "../../InputManager";
import { state } from "../state";
import { normalizeInputConfig } from "../../../shared/validation/inputConfigValidation";

export function registerInputBridge(): void {
  if (process.platform === "linux") {
    // Temporarily disable input on Linux due to issues with ALSA/MIDI handling
    ipcMain.handle("input:configure", async (event, payload) => {return { success: false }})
    ipcMain.handle("input:get-midi-devices", async () => {return []});
    return
  }
  ipcMain.handle("input:configure", async (event, payload) => {
    if (state.inputManager) {
      const normalized = normalizeInputConfig(payload);
      await (state.inputManager as InputManager).initialize(
        normalized as Parameters<InputManager["initialize"]>[0]
      );
    }
    return { success: true };
  });

  ipcMain.handle("input:get-midi-devices", async () => {
    return await InputManager.getAvailableMIDIDevices();
  });
}

