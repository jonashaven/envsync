import { bold, cyan, yellow, red, green, magenta, dim } from "fmt/colors";

export const logger = {
  info: (msg: string) => console.log(bold(cyan("INFO:")) + " " + msg),
  warn: (msg: string) => console.warn(bold(yellow("WARN:")) + " " + msg),
  error: (msg: string) => console.error(bold(red("ERROR:")) + " " + msg),
  success: (msg: string) => console.log(bold(green("SUCCESS:")) + " " + msg),
  debug: (msg: string) => console.log(dim(magenta("DEBUG:")) + " " + msg),
};
