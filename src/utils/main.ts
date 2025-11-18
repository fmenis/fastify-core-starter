import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

export function getServerVersion(): string {
  const { version } = JSON.parse(
    readFileSync(join(resolve(), "package.json"), { encoding: "utf-8" })
  );
  return version;
}
