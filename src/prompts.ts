import type { GitLabRemote } from "./settings/types.ts";
import { logger } from "./shared/logger.ts";

const ask = (question: string): string | null => {
  return typeof prompt === "function" ? prompt(question) : null;
};

const confirm = (question: string): boolean => {
  const response = ask(question + " (y/n)");
  if (!response) return false;
  return response.toLowerCase().startsWith("y");
};

const select = (options: string[], message: string): string | null => {
  if (options.length === 0) return null;
  if (options.length === 1) return options[0];

  logger.info(message);
  options.forEach((opt, i) => logger.info(`  ${i + 1}. ${opt}`));

  const choice = ask(`Select (1-${options.length}, or 'skip'):`);
  if (!choice || choice === "skip") return null;

  const index = parseInt(choice) - 1;
  if (index >= 0 && index < options.length) {
    return options[index];
  }

  logger.warn("Invalid choice, skipping...");
  return null;
};

export const confirmSyncEnv = (
  key: string,
  value: string,
  location: string
): boolean => {
  return confirm(`Add ${key}=${value} to ${location}?`);
};

export const selectTargetFile = (files: string[]): string | null => {
  return select(files, "Available env files:");
};

export const resolveConflict = (
  key: string,
  localValue: string,
  remoteValue: string
): "local" | "remote" | "skip" => {
  logger.warn(`⚠️  Conflict detected for ${key}:`);
  logger.info(`   Local:  ${localValue}`);
  logger.info(`   Remote: ${remoteValue}`);

  const choice = ask("Choose: (l)ocal, (r)emote, or (s)kip:")?.toLowerCase();

  if (choice === "l" || choice === "local") return "local";
  if (choice === "r" || choice === "remote") return "remote";
  return "skip";
};

export type WarningAction = "sync" | "ignore" | "skip";

export const handleUnconfiguredEnv = (message: string): WarningAction => {
  logger.warn(`⚠️  ${message}`);

  const choice = ask("Action: (s)ync, (i)gnore, or (skip):")?.toLowerCase();

  if (choice === "s" || choice === "sync") return "sync";
  if (choice === "i" || choice === "ignore") return "ignore";
  return "skip";
};

export const handleUnconfiguredFile = (message: string): WarningAction => {
  logger.warn(`⚠️  ${message}`);

  const choice = ask("Action: (u)se, (i)gnore, or (skip):")?.toLowerCase();

  if (choice === "u" || choice === "use") return "sync";
  if (choice === "i" || choice === "ignore") return "ignore";
  return "skip";
};

export const setupGitLabRemote = (): GitLabRemote | null => {
  logger.info("📦 No GitLab remote configured. Let's set one up.");

  const name = ask("Remote name (e.g., 'gitlab-main'):");
  if (!name) {
    logger.warn("Setup cancelled.");
    return null;
  }

  const url = ask("GitLab URL (e.g., 'https://gitlab.com'):");
  if (!url) {
    logger.warn("Setup cancelled.");
    return null;
  }

  const projectId = ask("GitLab Project ID (e.g., '12345678'):");
  if (!projectId) {
    logger.warn("Setup cancelled.");
    return null;
  }

  const remote: GitLabRemote = {
    type: "gitlab",
    name: name.trim(),
    url: url.trim(),
    projectId: projectId.trim(),
  };

  logger.success(`Remote "${remote.name}" configured.`);
  logger.info(`   You will be asked for the token when you run the sync.`);

  return remote;
};

export const promptForToken = (
  remoteName: string
): { token: string; isGlobal: boolean } | null => {
  logger.info(`🔑 Token not found for remote "${remoteName}".`);
  const token = ask("Please enter your GitLab token:");
  if (!token) {
    logger.warn("Token entry cancelled.");
    return null;
  }

  const location = ask(
    "Where to save this token? (l)ocal, (g)lobal:"
  )?.toLowerCase();
  const isGlobal = location === "g" || location === "global";

  return { token: token.trim(), isGlobal };
};
