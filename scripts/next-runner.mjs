import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const environment = { ...process.env };

try {
  require("@next/swc-win32-x64-msvc");
} catch {
  // Some Windows/Node combinations reject the native addon. Next's official
  // WASM build keeps local development and CI deterministic in that case.
  environment.NEXT_TEST_WASM_DIR = path.dirname(require.resolve("@next/swc-wasm-nodejs"));
}

const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), ...process.argv.slice(2)], {
  stdio: "inherit",
  env: environment,
});

process.exit(result.status ?? 1);
