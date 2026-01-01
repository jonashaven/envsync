export const isEnvFile = (filename: string): boolean =>
  filename === ".env" || filename.startsWith(".env.");

export const listFiles = (dir: string): Deno.DirEntry[] =>
  Array.from(Deno.readDirSync(dir));

export const readTextFile = (path: string): string =>
  Deno.readTextFileSync(path);

export const writeTextFile = (path: string, content: string): void =>
  Deno.writeTextFileSync(path, content);

export const appendTextFile = (path: string, content: string): void =>
  Deno.writeTextFileSync(path, content, { append: true });

export const fileExists = (path: string): boolean => {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    return false;
  }
};

export const ensureDir = (path: string): void => {
  try {
    Deno.mkdirSync(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
};

export const getHomeDir = (): string | null => {
  return Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || null;
};

export const getCwd = (): string => Deno.cwd();

