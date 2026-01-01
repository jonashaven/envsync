export type EnvVar = {
  key: string;
  value: string;
};

export type Warning = {
  type: "env" | "file";
  name: string;
  message: string;
};

export type ScanResult = {
  envs: EnvVar[];
  warnings: Warning[];
};
