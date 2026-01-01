import { getCwd, listFiles, isEnvFile, readTextFile } from "../shared/fs.ts";
import type { EnvVar } from "./types.ts";

export const findEnvFiles = (dir = getCwd(), recursive = false): string[] => {
  if (!recursive) {
    return listFiles(dir)
      .filter((entry) => entry.isFile && isEnvFile(entry.name))
      .map((entry) => entry.name);
  }

  const results: string[] = [];
  for (const entry of listFiles(dir)) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isFile && isEnvFile(entry.name)) {
      results.push(fullPath);
    }
    if (entry.isDirectory) {
      results.push(...findEnvFiles(fullPath, true));
    }
  }
  return results;
};

export const parseEnvFile = (path: string): EnvVar[] => {
  const envs: EnvVar[] = [];
  const content = readTextFile(path);

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    if (key) {
      envs.push({ key, value });
    }
  }

  return envs;
};

export const readEnvFiles = (
  files: string[],
  ignoredFiles: string[] = []
): EnvVar[] => {
  const envs: EnvVar[] = [];

  for (const file of files) {
    if (ignoredFiles.includes(file)) continue;
    envs.push(...parseEnvFile(file));
  }

  return envs;
};
