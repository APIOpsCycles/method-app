// Build the independently editable Paper 2 revision without the separate authoring kit.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'packages/apiops-presentations/whitepapers/from-api-readiness-to-sustainable-quality.html');
const output = path.join(root, 'packages/apiops-presentations/output');
const name = 'from-api-readiness-to-sustainable-quality.pdf';
const stage = process.argv.includes('--stage');
if (process.argv.slice(2).some(arg => arg !== '--stage')) throw new Error('Usage: node scripts/build-paper2.mjs [--stage]');
await fs.mkdir(output, { recursive: true });
// Serve only publication inputs locally; some managed Chromium policies block file URLs.
const inputs = new Map([
  ['/paper2.html', [source, 'text/html']],
  ['/paper2.css', [path.join(path.dirname(source), 'paper2.css'), 'text/css']],
  ['/supplier-payments-metro.svg', [path.join(path.dirname(source), 'supplier-payments-metro.svg'), 'image/svg+xml']],
  ['/assets/apiops-cycles-logo.png', [path.join(root, 'packages/apiops-presentations/assets/apiops-cycles-logo.png'), 'image/png']]
]);
const server = createServer(async (req, res) => {
  const input = inputs.get(req.url);
  if (!input) { res.writeHead(404).end(); return; }
  try {
    res.writeHead(200, { 'Content-Type': input[1] });
    res.end(await fs.readFile(input[0]));
  } catch { res.writeHead(500).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {}),
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/paper2.html`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  const problems = await page.evaluate(() => [...document.querySelectorAll('article')].flatMap((article, i) => {
    const footer = article.querySelector('footer').getBoundingClientRect();
    const main = article.querySelector('main');
    const last = main.lastElementChild.getBoundingClientRect();
    const failures = [];
    if (last.bottom > footer.top - 5 || footer.bottom > article.getBoundingClientRect().bottom) failures.push(`Page ${i + 1}: text overflows`);
    for (const img of article.querySelectorAll('img')) if (!img.complete || !img.naturalWidth) failures.push(`Page ${i + 1}: missing image`);
    return failures;
  }));
  if (problems.length) throw new Error(problems.join('\n'));
  await page.pdf({ path: path.join(output, name), preferCSSPageSize: true, printBackground: true });
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
const bytes = await fs.readFile(path.join(output, name));
const info = execFileSync('pdfinfo', [path.join(output, name)], { encoding: 'utf8' });
const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
const html = await fs.readFile(source, 'utf8');
const expected = (html.match(/<article\b/g) || []).length;
if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-')) || pages !== expected) {
  throw new Error(`Invalid PDF or pagination overflow: expected ${expected} pages, got ${pages}. Review before staging.`);
}
if (stage) {
  const dest = path.join(root, 'public/whitepapers');
  const manifestPath = path.join(dest, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const entry = manifest.publications.find(item => item.id === 'paper2');
  if (!entry) throw new Error('Paper 2 is missing from the download manifest');
  // Render before replacing tracked artifacts, so missing Poppler does not stage a partial update.
  execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-singlefile', '-scale-to', '720', '-png',
    path.join(output, name), path.join(output, 'paper2-cover')], { stdio: 'pipe' });
  Object.assign(entry, {
    description: 'Why API quality problems recur, how evidence becomes decisions, and how organisations make improvements sustainable.',
    pages, date: '17 November 2026', bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  });
  await fs.copyFile(path.join(output, name), path.join(dest, name));
  await fs.copyFile(path.join(output, 'paper2-cover.png'), path.join(dest, 'paper2-cover.png'));
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
console.log(`Built Paper 2: ${pages} pages${stage ? '; staged PDF, cover and manifest' : ' (not staged)'}.`);
