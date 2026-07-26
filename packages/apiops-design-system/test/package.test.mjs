import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8"));

test("every public package export exists in the built artifact", () => {
  function exportedFiles(value) {
    if (typeof value === "string") return value.includes("*") ? [] : [value];
    return Object.values(value).flatMap(exportedFiles);
  }

  for (const file of Object.values(manifest.exports).flatMap(exportedFiles)) {
    assert.equal(existsSync(path.join(packageRoot, file)), true, `${file} is included in dist`);
  }
  assert.equal(existsSync(path.join(packageRoot, manifest.bin["apiops-design-system"])), true);
});

test("the installed CLI copies assets without relying on a monorepo layout", () => {
  const temporaryRoot = mkdtempSync(path.join(tmpdir(), "apiops-design-system-"));
  try {
    execFileSync(
      process.execPath,
      [path.join(packageRoot, manifest.bin["apiops-design-system"]), "copy-assets", "--output", "public/ui"],
      { cwd: temporaryRoot },
    );
    assert.equal(existsSync(path.join(temporaryRoot, "public/ui/brand/apiops-cycles-logo.svg")), true);
    assert.equal(existsSync(path.join(temporaryRoot, "public/ui/icons/apiops-iconset.svg")), true);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("focused entry points expose the documented API", async () => {
  const canvas = await import("../dist/react/canvas.js");
  const metro = await import("../dist/react/metro.js");
  const patterns = await import("../dist/react/patterns.js");
  const testing = await import("../dist/testing/index.js");
  assert.equal(typeof canvas.CanvasSystemShell, "function");
  assert.equal(typeof metro.MetroMapShell, "function");
  assert.equal(typeof patterns.PartnerCard, "function");
  assert.equal(typeof patterns.MethodContextBar, "function");
  assert.equal(typeof patterns.MethodContextEditor, "function");
  assert.equal(typeof patterns.ContextGuidance, "function");
  assert.equal(typeof testing.CanvasSystemFixture, "function");
});
