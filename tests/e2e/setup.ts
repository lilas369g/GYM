import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";

export default async function setup() {
  const target = path.join(process.cwd(), "data", "site-content.e2e.json");
  await mkdir(path.dirname(target), { recursive: true });
  await rm(target, { force: true });
  await copyFile(path.join(process.cwd(), "data", "site-content.json"), target);
}
