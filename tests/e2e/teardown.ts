import { rm } from "node:fs/promises";
import path from "node:path";

export default async function teardown() {
  await rm(path.join(process.cwd(), "data", "site-content.e2e.json"), { force: true });
}
