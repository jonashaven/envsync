import type { EnvVar } from "../local-env/types.ts";

export type SyncConfig = {
  localEnvs: EnvVar[];
  remoteEnvs: EnvVar[];
  envsToSync: string[];
  envsToIgnore: string[];
  localEnvFiles: string[];
  remoteName: string;
};

export type SyncCallbacks = {
  addLocalEnv: (key: string, value: string, filePath: string) => void;
  addRemoteEnv: (key: string, value: string) => Promise<void>;
  confirmSync: (key: string, value: string, location: string) => boolean;
  selectTargetFile: (files: string[]) => string | null;
  resolveConflict: (
    key: string,
    localValue: string,
    remoteValue: string
  ) => "local" | "remote" | "skip";
};

export type ConflictResolution = "local" | "remote" | "skip";

