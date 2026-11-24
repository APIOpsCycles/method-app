import test from 'node:test';
import assert from 'node:assert/strict';
import {containImage,imageDimensions} from './image-layout.mjs';
import {load,dependency,localPath} from './model.mjs';
import {exportPptx} from './pptx.mjs';
import os from 'node:os';
import path from 'node:path';

test('booklet embeds every picture as a decodable PNG, including the 4096px metro map',async(t)=>{
  const fs=await import('node:fs/promises');
  const model=await load('brands/capabilities-booklet.json','capabilities-booklet');
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'apiops-vector-'));
  const file=path.join(directory,'metro.pptx');
  t.after(async()=>{await fs.unlink(file);await fs.rmdir(directory);});
  const dimensions=await imageDimensions(localPath('assets/capabilities-booklet-capability-map.svg'));
  assert.ok(Math.abs(dimensions.width/dimensions.height-1)<0.001);
  await exportPptx(model,file);
  const {default:JSZip}=await dependency('jszip');
  const zip=await JSZip.loadAsync(await fs.readFile(file));
  const media=Object.keys(zip.files).filter(n=>n.startsWith('ppt/media/'));
  assert.ok(!media.some(n=>n.endsWith('.svg')),'no SVG-only image path in PowerPoint');
  const {default:sharp}=await import('sharp');
  let checked=0;
  for(let i=0;i<model.slides.length;i++){
    const xml=await zip.file(`ppt/slides/slide${i+1}.xml`).async('string');
    const rels=await zip.file(`ppt/slides/_rels/slide${i+1}.xml.rels`).async('string');
    assert.doesNotMatch(xml,/<asvg:svgBlip/);
    const images=[model.theme.logo,...model.slides[i].elements.filter(e=>e.type==='image').map(e=>'assets/'+e.asset)];
    const pics=[...xml.matchAll(/<p:pic>[\s\S]*?<\/p:pic>/g)];
    assert.equal(pics.length,images.length);
    const chrome={...model.layouts,...model.layouts.pageChrome?.[model.slides[i].id]};
    const [,logoX]=pics[0][0].match(/<a:off x="(\d+)" y="\d+"/);
    assert.ok(Math.abs(Number(logoX)-chrome.logo.x*9525)<2,'outside-edge logo position exported');
    for(let j=0;j<pics.length;j++){
      const rid=pics[j][0].match(/<a:blip r:embed="([^"]+)"/)?.[1];
      assert.ok(rid,'ordinary image relationship');
      const target=rels.match(new RegExp(`<Relationship Id="${rid}"[^>]*Target="([^"]+)"`))?.[1];
      assert.ok(target?.endsWith('.png'));
      const bytes=await zip.file(path.posix.normalize('ppt/slides/'+target)).async('nodebuffer');
      const source=localPath(images[j].replace(/\.svg$/i,'.png'));
      assert.deepEqual(bytes,await fs.readFile(source),'embedded picture matches the prepared asset');
      const {info}=await sharp(bytes).raw().toBuffer({resolveWithObject:true});
      assert.ok(info.width>0&&info.height>0,'PNG decodes');
      if(/capabilities-booklet-(capability-map|shared-topics|starting-points|focus-map)\.svg$/.test(images[j]))assert.equal(info.width,4096);
      checked++;
    }
  }
  assert.equal(checked,33);
});

test('contain preserves proportions and centres portrait and landscape images',()=>{
  const frame={x:50,y:198,w:1180,h:430};
  for(const source of [{width:1420,height:1100},{width:100,height:200},{width:2000,height:200}]){
    const b=containImage(source,frame);
    assert.ok(Math.abs(b.w/b.h-source.width/source.height)<1e-10);
    assert.ok(b.w<=frame.w&&b.h<=frame.h);
    assert.equal(b.x+b.w/2,frame.x+frame.w/2);
    assert.equal(b.y+b.h/2,frame.y+frame.h/2);
  }
});
