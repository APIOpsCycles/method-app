import { chmod, cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(packageRoot, "dist");
await import("./build-character-scenes.mjs");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of ["styles.css", "tokens.json", "assets", "metadata"]) {
  await cp(path.join(packageRoot, "src", entry), path.join(dist, entry), { recursive: true });
}
await new Promise((resolve, reject) => {
  const tscCli = path.resolve(packageRoot, "..", "..", "node_modules", "typescript", "bin", "tsc");
  const child = spawn(process.execPath, [tscCli, "-p", "tsconfig.json"], { cwd: packageRoot, stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`tsc exited with ${code}`)));
});
await chmod(path.join(dist, "cli", "index.js"), 0o755);
