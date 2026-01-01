import {
  readTextFile,
  writeTextFile,
  getHomeDir,
  ensureDir,
} from "../shared/fs.ts";
import { type Settings, DEFAULT_SETTINGS } from "./types.ts";

const SETTINGS_PATH = "./.envsync.json";

export const loadSettings = (path = SETTINGS_PATH): Settings => {
  try {
    const data = readTextFile(path);
    return JSON.parse(data) as Settings;
  } catch {
    saveSettings(DEFAULT_SETTINGS, path);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (
  settings: Settings,
  path = SETTINGS_PATH
): void => {
  const data = JSON.stringify(settings, null, 2);
  writeTextFile(path, data);
};

const getGlobalTokenPath = (remoteName: string): string | null => {
  const home = getHomeDir();
  if (!home) return null;
  return `${home}/.envsync/token-${remoteName}`;
};

export const loadToken = (remoteName: string): string | null => {
  // Try local first
  try {
    return readTextFile(`./token-${remoteName}`).trim();
  } catch {
    // Continue to check global
  }

  // Try global
  const globalPath = getGlobalTokenPath(remoteName);
  if (globalPath) {
    try {
      return readTextFile(globalPath).trim();
    } catch {
      // Ignore
    }
  }

  return null;
};

export const saveToken = (
  remoteName: string,
  token: string,
  isGlobal: boolean
): void => {
  let path = `./token-${remoteName}`;

  if (isGlobal) {
    const home = getHomeDir();
    if (!home) {
      throw new Error("Could not determine home directory for global storage.");
    }
    const envsyncDir = `${home}/.envsync`;
    ensureDir(envsyncDir);
    path = `${envsyncDir}/token-${remoteName}`;
  }

  writeTextFile(path, token);
};
