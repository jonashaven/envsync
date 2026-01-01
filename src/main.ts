import { logger } from "./shared/logger.ts";
import {
  loadSettings,
  saveSettings,
  loadToken,
  saveToken,
  type Settings,
  type GitLabRemote,
} from "./settings/index.ts";
import {
  scanLocalEnvs,
  scanRemoteEnvs,
  findEnvFiles,
  addEnvToFile,
  type Warning,
} from "./local-env/index.ts";
import {
  fetchGitLabEnvs,
  addGitLabEnv,
  type GitLabConfig,
} from "./remote/index.ts";
import { runSync } from "./sync/index.ts";
import {
  setupGitLabRemote,
  handleUnconfiguredEnv,
  handleUnconfiguredFile,
  confirmSyncEnv,
  selectTargetFile,
  resolveConflict,
  promptForToken,
} from "./prompts.ts";

const addIfMissing = (list: string[], item: string) => {
  if (!list.includes(item)) list.push(item);
};

const processWarning = (warning: Warning, settings: Settings): void => {
  const isEnv = warning.type === "env";
  const action = isEnv
    ? handleUnconfiguredEnv(warning.message)
    : handleUnconfiguredFile(warning.message);

  if (action === "sync") {
    addIfMissing(
      isEnv ? settings.envsToSync : settings.envFilesToUse,
      warning.name
    );
  } else if (action === "ignore") {
    addIfMissing(
      isEnv ? settings.envsToIgnore : settings.envFilesToIgnore,
      warning.name
    );
  }
};

const processGitLabRemote = async (
  remote: GitLabRemote,
  localEnvs: { key: string; value: string }[],
  settings: Settings
): Promise<void> => {
  let token = loadToken(remote.name);
  if (!token) {
    const result = promptForToken(remote.name);
    if (!result) {
      logger.error(
        `No token found for remote "${remote.name}" (expected ./token-${remote.name} or ~/.envsync/token-${remote.name})`
      );
      return;
    }
    token = result.token;
    saveToken(remote.name, token, result.isGlobal);
    logger.success(`Token saved ${result.isGlobal ? "globally" : "locally"}.`);
  }

  const config: GitLabConfig = {
    url: remote.url,
    token,
    projectId: remote.projectId,
  };

  const remoteEnvs = await fetchGitLabEnvs(config);

  const remoteWarnings = scanRemoteEnvs(remoteEnvs, remote.name, settings);
  for (const warning of remoteWarnings) {
    processWarning(warning, settings);
  }

  logger.info(
    `Local Envs: ${JSON.stringify(
      localEnvs.map((e) => ({ ...e, value: "***" })),
      null,
      2
    )}`
  );
  logger.info(
    `${remote.name} Envs: ${JSON.stringify(
      remoteEnvs.map((e) => ({ ...e, value: "***" })),
      null,
      2
    )}`
  );

  const localEnvFiles = findEnvFiles(undefined, true);

  await runSync(
    {
      localEnvs,
      remoteEnvs,
      envsToSync: settings.envsToSync,
      envsToIgnore: settings.envsToIgnore,
      localEnvFiles,
      remoteName: remote.name,
    },
    {
      addLocalEnv: addEnvToFile,
      addRemoteEnv: async (key, value) => {
        try {
          await addGitLabEnv(config, key, value);
          logger.success(`Added ${key} to ${remote.name}`);
        } catch (error) {
          logger.error(`Failed to add ${key} to ${remote.name}: ${error}`);
        }
      },
      confirmSync: confirmSyncEnv,
      selectTargetFile,
      resolveConflict,
    }
  );
};

const main = async (): Promise<void> => {
  const settings = loadSettings();
  const originalSettings = JSON.stringify(settings);

  if (settings.remotes.length === 0) {
    const newRemote = setupGitLabRemote();
    if (!newRemote) {
      logger.error("No remote configured. Exiting.");
      return;
    }
    settings.remotes.push(newRemote);
    saveSettings(settings);
    logger.success("Remote configuration saved to .envsync.json");
  }

  const { envs: localEnvs, warnings: localWarnings } = scanLocalEnvs(settings);

  for (const warning of localWarnings) {
    processWarning(warning, settings);
  }

  for (const remote of settings.remotes) {
    if (remote.type === "gitlab") {
      await processGitLabRemote(remote, localEnvs, settings);
    }
  }

  if (JSON.stringify(settings) !== originalSettings) {
    saveSettings(settings);
    logger.success("Settings updated based on your choices");
  }
};

main();
