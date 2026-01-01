import type { EnvVar } from "../local-env/types.ts";

export type GitLabConfig = {
  url: string;
  token: string;
  projectId: string;
};

export interface RemoteProvider {
  fetchEnvs(): Promise<EnvVar[]>;
  addEnv(key: string, value: string): Promise<void>;
}
