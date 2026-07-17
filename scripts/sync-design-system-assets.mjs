import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "packages", "apiops-design-system", "dist", "assets");
const destination = path.join(root, "public", "design-system");
await rm(destination, { recursive: true, force: true });
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });
console.log("Synced @apiops/design-system assets to public/design-system");