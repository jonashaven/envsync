import type { EnvVar } from "../local-env/types.ts";
import type { GitLabConfig } from "./types.ts";

const apiUrl = (config: GitLabConfig, path = "") =>
  `${config.url}/api/v4/projects/${config.projectId}/variables${path}`;

const headers = (token: string) => ({
  "Private-Token": token,
  "Content-Type": "application/json",
});

const envVarDefaults = {
  variable_type: "env_var",
  protected: false,
  masked: false,
};

export const fetchGitLabEnvs = async (
  config: GitLabConfig
): Promise<EnvVar[]> => {
  const response = await fetch(apiUrl(config), {
    headers: headers(config.token),
  });

  if (!response.ok) {
    throw new Error(
      `GitLab API error: ${response.status} ${response.statusText}`
    );
  }

  const variables = await response.json();
  if (!Array.isArray(variables)) return [];

  return variables
    .filter((v) => v.key && v.value)
    .map((v) => ({ key: v.key, value: v.value }));
};

export const addGitLabEnv = async (
  config: GitLabConfig,
  key: string,
  value: string
): Promise<void> => {
  const createResponse = await fetch(apiUrl(config), {
    method: "POST",
    headers: headers(config.token),
    body: JSON.stringify({ key, value, ...envVarDefaults }),
  });

  if (createResponse.ok) return;

  if (createResponse.status === 400) {
    const updateResponse = await fetch(
      apiUrl(config, `/${encodeURIComponent(key)}`),
      {
        method: "PUT",
        headers: headers(config.token),
        body: JSON.stringify({ value, ...envVarDefaults }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        `GitLab update failed: ${updateResponse.status} ${updateResponse.statusText}`
      );
    }
    return;
  }

  throw new Error(
    `GitLab create failed: ${createResponse.status} ${createResponse.statusText}`
  );
};
