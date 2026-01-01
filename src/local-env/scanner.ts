import type { Settings } from "../settings/types.ts";
import type { Warning, ScanResult, EnvVar } from "./types.ts";
import { findEnvFiles, readEnvFiles } from "./reader.ts";

export const scanLocalEnvs = (settings: Settings): ScanResult => {
  const warnings: Warning[] = [];
  const files = findEnvFiles();

  for (const file of files) {
    const isConfigured =
      settings.envFilesToUse.includes(file) ||
      settings.envFilesToIgnore.includes(file);

    if (!isConfigured) {
      warnings.push({
        type: "file",
        name: file,
        message: `Local env file "${file}" is not configured in settings.`,
      });
    }
  }

  const envs = readEnvFiles(files, settings.envFilesToIgnore);

  const configuredEnvs = [...settings.envsToSync, ...settings.envsToIgnore];
  for (const env of envs) {
    if (!configuredEnvs.includes(env.key)) {
      warnings.push({
        type: "env",
        name: env.key,
        message: `Local env variable "${env.key}" is not configured in settings.`,
      });
    }
  }

  return { envs, warnings };
};

export const scanRemoteEnvs = (
  remoteEnvs: EnvVar[],
  remoteName: string,
  settings: Settings
): Warning[] => {
  const configuredEnvs = [...settings.envsToSync, ...settings.envsToIgnore];
  const warnings: Warning[] = [];

  for (const env of remoteEnvs) {
    if (!configuredEnvs.includes(env.key)) {
      warnings.push({
        type: "env",
        name: env.key,
        message: `Remote env variable "${env.key}" from ${remoteName} is not configured in settings.`,
      });
    }
  }

  return warnings;
};

