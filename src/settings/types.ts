export type GitLabRemote = {
  type: "gitlab";
  name: string;
  url: string;
  projectId: string;
};

export type Remote = GitLabRemote;

export type Settings = {
  remotes: Remote[];
  envsToSync: string[];
  envsToIgnore: string[];
  envFilesToUse: string[];
  envFilesToIgnore: string[];
};

export const DEFAULT_SETTINGS: Settings = {
  remotes: [],
  envsToSync: [],
  envsToIgnore: [],
  envFilesToUse: [],
  envFilesToIgnore: [],
};

