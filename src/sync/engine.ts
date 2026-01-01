import type { SyncConfig, SyncCallbacks } from "./types.ts";
import { logger } from "../shared/logger.ts";

const shouldSync = (
  key: string,
  envsToSync: string[],
  envsToIgnore: string[]
): boolean => {
  if (envsToIgnore.includes(key)) return false;
  if (envsToSync.length > 0 && !envsToSync.includes(key)) return false;
  return true;
};

export const runSync = async (
  config: SyncConfig,
  callbacks: SyncCallbacks
): Promise<void> => {
  const {
    localEnvs,
    remoteEnvs,
    envsToSync,
    envsToIgnore,
    localEnvFiles,
    remoteName,
  } = config;

  const {
    addLocalEnv,
    addRemoteEnv,
    confirmSync,
    selectTargetFile,
    resolveConflict,
  } = callbacks;

  const localMap = new Map(localEnvs.map((e) => [e.key, e.value]));
  const remoteMap = new Map(remoteEnvs.map((e) => [e.key, e.value]));
  const allKeys = new Set([...localMap.keys(), ...remoteMap.keys()]);

  for (const key of allKeys) {
    if (!shouldSync(key, envsToSync, envsToIgnore)) continue;

    const localValue = localMap.get(key);
    const remoteValue = remoteMap.get(key);

    if (remoteValue !== undefined && localValue === undefined) {
      const confirmed = confirmSync(
        key,
        remoteValue,
        `local (from ${remoteName})`
      );
      if (confirmed) {
        const targetFile = selectTargetFile(localEnvFiles);
        if (targetFile) {
          addLocalEnv(key, remoteValue, targetFile);
        }
      }
      continue;
    }

    if (localValue !== undefined && remoteValue === undefined) {
      const confirmed = confirmSync(key, localValue, remoteName);
      if (confirmed) {
        await addRemoteEnv(key, localValue);
      }
      continue;
    }

    if (
      localValue !== undefined &&
      remoteValue !== undefined &&
      localValue !== remoteValue
    ) {
      const resolution = resolveConflict(key, localValue, remoteValue);

      if (resolution === "local") {
        await addRemoteEnv(key, localValue);
        logger.info(`   → Using local value, updating ${remoteName}`);
      } else if (resolution === "remote") {
        const targetFile = selectTargetFile(localEnvFiles);
        if (targetFile) {
          addLocalEnv(key, remoteValue, targetFile);
          logger.info(`   → Using remote value, updating local`);
        }
      } else {
        logger.info(`   → Skipping conflict resolution for ${key}`);
      }
    }
  }
};
