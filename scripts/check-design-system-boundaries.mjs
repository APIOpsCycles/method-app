import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function sourceFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(file));
    else if (/\.(?:astro|[jt]sx?)$/.test(entry.name)) files.push(file);
  }
  return files;
}

const violations = [];
const packageFiles = await sourceFiles("packages/apiops-design-system/src");

const forbiddenPackageImports = [
  "apiops-cycles-method-data",
  "canvas-manifest",
  "method-manifest",
  "prompt-pack",
  "/data/",
];

for (const file of packageFiles) {
  const source = await readFile(file, "utf8");
  for (const value of forbiddenPackageImports) {
    if (source.includes(value)) violations.push(`${file}: design-system source references domain content (${value})`);
  }
}

for (const file of await sourceFiles("apps")) {
  const source = await readFile(file, "utf8");
  if (source.includes('"/design-system/') || source.includes("'/design-system/") || source.includes("`/design-system/")) {
    violations.push(`${file}: use apiops-design-system/assets instead of a hard-coded asset path`);
  }
}

const layouts = ["apps/site/src/layouts/BaseLayout.astro"];
for (const file of layouts) {
  const source = await readFile(file, "utf8");
  const imports = source.match(/@apiops\/design-system\/styles\.css/g) ?? [];
  if (imports.length !== 1) violations.push(`${file}: styles.css must be imported exactly once at the application layout`);
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Design-system ownership boundaries are intact.");
}
