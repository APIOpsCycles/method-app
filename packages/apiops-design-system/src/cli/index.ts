#!/usr/bin/env node

import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage(): never {
  console.error("Usage: apiops-design-system copy-assets --output <directory>");
  process.exit(1);
}

if (process.argv[2] !== "copy-assets") usage();

const output = option("--output");
if (!output) usage();

const distributionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(distributionRoot, "assets");
const destination = path.resolve(process.cwd(), output);

await rm(destination, { recursive: true, force: true });
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });
console.log(`Copied @apiops/design-system assets to ${destination}`);
