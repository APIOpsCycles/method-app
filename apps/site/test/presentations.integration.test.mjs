import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {dependency} from '../../../packages/apiops-presentations/scripts/model.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url)),dist=path.join(root,'dist');
const catalog=JSON.parse(readFileSync(path.join(root,'packages/apiops-presentations/catalog.json'),'utf8'));
const base=path.join(dist,'presentations',catalog.version),manifest=JSON.parse(readFileSync(path.join(base,'manifest.json'),'utf8'));
const html=route=>readFileSync(path.join(dist,route,'index.html'),'utf8');

test('all editions expose matching downloadable artifacts, source and complete online transcripts',()=>{
  const sitemap=readFileSync(path.join(dist,'sitemap.xml'),'utf8');
  for(const edition of catalog.editions){
    const detail=html(`presentations/${edition.id}`),viewer=html(`presentations/${edition.id}/view`);
    assert.match(detail,/Download PowerPoint/);assert.match(detail,/Download PDF/);assert.match(detail,/Download source kit/);
    assert.equal((viewer.match(/ data-slide(?:\s|>)/g)||[]).length,edition.slideCount);
    assert.equal(manifest.slides[edition.id].length,edition.slideCount);
    for(const artifact of [manifest.source,...Object.values(manifest.artifacts[edition.id]),...manifest.slides[edition.id].map(s=>s.preview)]){
      const bytes=readFileSync(path.join(base,artifact.file));
      assert.equal(bytes.length,artifact.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),artifact.sha256);
    }
    for(const ext of ['pdf','pptx'])assert.ok(detail.includes(`/presentations/${catalog.version}/${manifest.artifacts[edition.id][ext].file}`));
    for(const suffix of ['', '/view'])assert.ok(sitemap.includes(`/presentations/${edition.id}${suffix}`));
    const deck=JSON.parse(readFileSync(path.join(root,`packages/apiops-presentations/editions/${edition.id}.json`),'utf8'));
    for(const file of deck.slides){
      const slide=JSON.parse(readFileSync(path.join(root,'packages/apiops-presentations',file),'utf8'));
      for(const e of slide.elements)if(e.type==='image')assert.ok(viewer.includes(e.alt.replaceAll('&','&amp;')),`image description for ${slide.id}`);
    }
  }
});

test('source ZIP is a portable project containing every edition and excludes build/private inputs',async()=>{
  const {default:JSZip}=await dependency('jszip');
  const zip=await JSZip.loadAsync(readFileSync(path.join(base,manifest.source.file))),names=Object.keys(zip.files);
  for(const required of ['package.json','README.md','scripts/build.mjs','scripts/release.mjs','typst/template.typ','brands/partner-example.json','docs/creating-visuals.md'])assert.ok(zip.file('apiops-presentations/'+required),required);
  for(const e of catalog.editions)assert.ok(zip.file(`apiops-presentations/editions/${e.id}.json`));
  assert.ok(!names.some(name=>/node_modules|\/output\/|\/releases\/|tempfiles|\.docx$|\.pdf$|\.codex|CLEANED|adorsys/i.test(name)));
});

test('PowerPoint downloads preserve native tables, lists and speaker notes',async()=>{
  const {default:JSZip}=await dependency('jszip');
  for(const e of catalog.editions){
    const zip=await JSZip.loadAsync(readFileSync(path.join(base,manifest.artifacts[e.id].pptx.file)));
    const slides=Object.keys(zip.files).filter(name=>/^ppt\/slides\/slide\d+\.xml$/.test(name));
    assert.equal(slides.length,e.slideCount);
    const xml=(await Promise.all(slides.map(name=>zip.file(name).async('string')))).join('');
    assert.match(xml,/<a:tbl>/);assert.match(xml,/<a:buAutoNum/);assert.match(xml,/<a:buChar/);
    assert.equal(Object.keys(zip.files).filter(name=>/^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name)).length,e.slideCount);
  }
});

test('Reveal.js downloads are portable HTML decks with bundled runtime, notes and attribution',async()=>{
  const {default:JSZip}=await dependency('jszip');
  for(const e of catalog.editions){
    const zip=await JSZip.loadAsync(readFileSync(path.join(base,manifest.artifacts[e.id].reveal.file)));
    for(const file of ['index.html','theme.css','vendor/reveal.js','vendor/reveal.css','vendor/notes.js','vendor/LICENSE-reveal.txt'])assert.ok(zip.file(file),file);
    const content=await zip.file('index.html').async('string');
    assert.equal((content.match(/data-slide aria-label/g)||[]).length,e.slideCount);
    assert.match(content,/<aside class="notes">/);assert.match(content,/apiops-slide-text/);assert.match(content,/<(?:ul|ol) class="apiops-slide-item/);
    assert.ok(!content.includes('cdn.jsdelivr.net'));
    for(const [,asset] of content.matchAll(/src="(assets\/[^\"]+)"/g))assert.ok(zip.file(asset),asset);
  }
});

test('method navigation discovers presentations without creating unsupported language routes',()=>{
  for(const route of ['stations/api-design','cycles/api-productization-cycle','fi/stations/api-design'])assert.match(html(route),/related-presentations/);
  assert.match(html('presentations'),/8 slides/);assert.match(html('presentations'),/11 slides/);assert.match(html('presentations'),/28 slides/);
  assert.match(html('presentations/developers'),/npm run build/);
  assert.ok(!existsSync(path.join(dist,'fi/presentations/index.html')));
});
