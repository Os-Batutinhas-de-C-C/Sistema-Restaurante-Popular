import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

// Keep the dev server independent from a host-provided Next.js dev directory.
delete process.env.NEXT_PRIVATE_DEV_DIR;

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCli, "dev", ".", "--turbopack"], {
    stdio: "inherit",
});

if (result.error) {
    console.error(result.error);
    process.exitCode = 1;
} else {
    process.exitCode = result.status ?? 1;
}
