import { appendTextFile } from "../shared/fs.ts";
import { logger } from "../shared/logger.ts";

export const addEnvToFile = (
  key: string,
  value: string,
  filePath: string
): boolean => {
  try {
    appendTextFile(filePath, `${key}=${value}\n`);
    logger.success(`Added ${key} to ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Failed to add ${key} to ${filePath}: ${error}`);
    return false;
  }
};

