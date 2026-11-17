import assert from 'node:assert/strict';import test from 'node:test';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import path from 'node:path';import {fileURLToPath} from 'node:url';import JSZip from 'jszip';import {JSDOM} from 'jsdom';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../../../',import.meta.url)),manifest=JSON.parse(readFileSync(path.join(root,'public/whitepapers/manifest.json'),'utf8'));
const page=readFileSync(path.join(root,'dist/partners/index.html'),'utf8');
const document=new JSDOM(page).window.document;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('partners page offers ungated reviewed publications and matching downloadable bytes',()=>{
 for(const p of [...manifest.publications,manifest.bundle]){assert.ok(page.includes(p.url),p.url);const bytes=readFileSync(path.join(root,'dist',p.url));assert.equal(bytes.length,p.bytes);assert.equal(hash(bytes),p.sha256);if(p.url.endsWith('.pdf'))assert.equal(bytes.subarray(0,5).toString(),'%PDF-');}
 for(const p of manifest.publications){if(p.id!=='companion')assert.ok(document.body.textContent.includes(p.title));assert.ok(Number.isInteger(p.pages) && p.pages>0);}
 assert.match(page,/no sign-up/);assert.match(page,/Optional practitioner resources/);
});
test('partner destinations preserve the method data instead of all redirecting to the community homepage',()=>{
 const methodRoot=process.env.METHOD_DATA_PATH || path.resolve(require.resolve('apiops-cycles-method-data/method-engine'),'../../..');
 const source=JSON.parse(readFileSync(path.join(methodRoot,'src/data/partners.json'),'utf8'));
 for(const partner of source)assert.ok(page.includes(`href="${partner.href}"`),partner.title);
 assert.equal(document.querySelectorAll('.practitioner-card').length,source.filter(p=>p.title!=='You?').length);
});
test('existing workshop advertisement is selected for normal and localised partner routes',async()=>{
 const {selectAd}=await import('../../../data/ads.ts');
 for(const route of ['/partners','/partners/','/fi/partners','/de/partners'])assert.equal(selectAd(undefined,route)?.ctaHref,'https://www.osaango.com/services/accelerate-your-apis-with-apiops-cycles/');
 assert.equal((page.match(/aria-label="Community notice"/g)||[]).length,1);
});
test('public companion ZIP retains editable native canvases and matches its standalone PDF',async()=>{
 const zip=await JSZip.loadAsync(readFileSync(path.join(root,'dist',manifest.bundle.url)));
 for(const name of ['README.md','completed-brief.json','canvas-evidence-mapping.json','methodology-note.json','poor-api-business-model.json','stronger-api-business-model.json','poor-api-business-model.svg','stronger-api-business-model.svg'])assert.ok(zip.file(name),name);
 const companion=manifest.publications.find(p=>p.id==='companion');assert.equal(hash(await zip.file('api-readiness-supporting-material.pdf').async('nodebuffer')),companion.sha256);
});
