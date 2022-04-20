import { readFile } from "node:fs/promises";

export const packageJson = JSON.parse(
  await readFile(new URL("../../package.json", import.meta.url), "utf-8")
);