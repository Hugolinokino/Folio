import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface AvailableUpdate {
  version: string;
  notes: string | null;
  install: () => Promise<void>;
}

/** Contacts the update endpoint configured in tauri.conf.json and returns the
 * available update, or null if already on the latest version. */
export async function checkForUpdate(): Promise<AvailableUpdate | null> {
  const update = await check();
  if (!update?.available) return null;
  return {
    version: update.version,
    notes: update.body ?? null,
    install: async () => {
      await update.downloadAndInstall();
      await relaunch();
    },
  };
}
