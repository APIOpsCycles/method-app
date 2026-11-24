import {expect,test} from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {pathToFileURL} from 'node:url';
test.use({launchOptions:process.env.APIOPS_TEST_BROWSER?{executablePath:process.env.APIOPS_TEST_BROWSER}:undefined});

for(const variant of [
 {path:'/',button:'Export SVG',locale:'en',station:'Capability Strategy'},
 {path:'/cycles/api-productization-cycle',button:'Export SVG',locale:'en',station:'API Product Strategy'},
 {path:'/cycles/integration-productization-cycle',button:'Export SVG',locale:'en',station:'Integration Capability Strategy'},
 {path:'/cycles/automation-cycle',button:'Export SVG',locale:'en',station:'Automation Opportunity Strategy'},
 {path:'/fi/cycles/api-productization-cycle',button:'Vie SVG',locale:'fi'},
 {path:'/fr/',button:'Exporter SVG',locale:'fr'},
 {path:'/de/',button:'SVG exportieren',locale:'de'},
 {path:'/pt/',button:'Exportar SVG',locale:'pt'},
])test(`large-print metro SVG retains vectors: ${variant.path}`,async({page},testInfo)=>{
  await page.goto(variant.path,{waitUntil:'domcontentloaded'});
  const button=page.getByRole('button',{name:variant.button,exact:true});
  await button.scrollIntoViewIfNeeded();
  // client:idle hydration must complete before exercising the download handler.
  await page.locator('astro-island[component-url*="MetroMapIsland"]:not([ssr])').waitFor();
  const layout=await page.locator('svg.metro-map').evaluate(svg=>{
    const labels=Array.from(svg.querySelectorAll<SVGTextElement>('text')).map(e=>({e,box:e.getBBox()}));
    const support=labels.filter(v=>v.e.classList.contains('metro-support-label'));
    const clippedNodes=Array.from(svg.querySelectorAll<SVGCircleElement>('.metro-support-node')).filter(e=>Math.hypot(e.cx.baseVal.value-500,e.cy.baseVal.value-500)+e.r.baseVal.value>445).length;
    const clipped=support.filter(({box:b})=>[b.x,b.x+b.width].some(x=>[b.y,b.y+b.height].some(y=>(x-500)**2+(y-500)**2>445**2)));
    const overlaps=support.flatMap(a=>labels.filter(b=>a.e!==b.e && Math.min(a.box.x+a.box.width,b.box.x+b.box.width)>Math.max(a.box.x,b.box.x) && Math.min(a.box.y+a.box.height,b.box.y+b.box.height)>Math.max(a.box.y,b.box.y)).map(b=>[a.e.textContent,b.e.textContent]));
    return {clippedNodes,clipped:clipped.map(v=>v.e.textContent),overlaps,sizes:support.map(v=>getComputedStyle(v.e).fontSize),truncated:support.filter(v=>v.e.textContent?.replace(/\s+/g,' ').trim()!==v.e.parentElement?.getAttribute('aria-label')?.split(' — ')[0]).map(v=>v.e.textContent)};
  });
  expect(layout.clipped).toEqual([]);
  expect(layout.clippedNodes).toBe(0);
  expect(layout.overlaps).toEqual([]);
  expect(layout.truncated).toEqual([]);
  expect(new Set(layout.sizes)).toEqual(new Set(['14px']));
  const before=await page.locator('svg.metro-map').evaluate(e=>e.outerHTML);
  const pending=page.waitForEvent('download');
  await button.click();
  const download=await pending;
  expect(download.suggestedFilename()).toBe(`apiops-metro-${variant.locale}.svg`);
  const target=testInfo.outputPath('metro.svg');
  await download.saveAs(target);
  const svg=await fs.readFile(target,'utf8');
  const result=await page.evaluate(source=>{
    const document=new DOMParser().parseFromString(source,'image/svg+xml');
    const root=document.documentElement;
    return {width:root.getAttribute('width'),height:root.getAttribute('height'),viewBox:root.getAttribute('viewBox'),errors:document.querySelectorAll('parsererror').length,paths:document.querySelectorAll('path').length,texts:document.querySelectorAll('text').length,labels:Array.from(document.querySelectorAll('text')).map(t=>t.textContent).join(' '),supportSizes:Array.from(document.querySelectorAll('text')).filter(t=>t.querySelector('tspan')).map(t=>t.getAttribute('font-size')),externalImages:document.querySelectorAll('image,foreignObject').length};
  },svg);
  expect(result).toMatchObject({width:'4096',height:'4096',viewBox:'0 0 1000 1000',errors:0,externalImages:0});
  expect(result.paths).toBeGreaterThan(0);
  expect(result.texts).toBeGreaterThan(20);
  expect(new Set(result.supportSizes)).toEqual(new Set(['14px']));
  expect(svg).not.toMatch(/var\(|currentColor/);
  if(variant.station)expect(result.labels).toContain(variant.station);
  // Parse/count checks alone can pass for an SVG that imports as a blank image.
  // Exercise a real raster importer at its default safety limit, then inspect
  // painted pixels independently of the live SVG DOM.
  const metadata=await sharp(Buffer.from(svg)).metadata();
  expect([metadata.width,metadata.height]).toEqual([4096,4096]);
  const {data}=await sharp(Buffer.from(svg)).resize(512,512).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let painted=0;
  for(let i=0;i<data.length;i+=4)if(data[i+3]>0 && data[i]+data[i+1]+data[i+2]<740)painted++;
  expect(painted).toBeGreaterThan(512*512*.2);
  const browserPaint=await page.evaluate(async source=>{
    const image=new Image();
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);
    await image.decode();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const context=canvas.getContext('2d')!;context.drawImage(image,0,0,512,512);
    const pixels=context.getImageData(0,0,512,512).data;
    let count=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>0&&pixels[i]+pixels[i+1]+pixels[i+2]<740)count++;
    return count;
  },svg);
  expect(browserPaint).toBeGreaterThan(512*512*.2);
  if(variant.path==='/'){
    // Opening the downloaded file is different from rendering it in an <img>.
    // The whole SVG must fit its own browser document, not open on a blank corner.
    const standalone=await page.context().newPage();
    await standalone.goto(pathToFileURL(target).href);
    for(const viewport of [{width:1280,height:720},{width:390,height:844}]){
      await standalone.setViewportSize(viewport);
      const overflow=await standalone.evaluate(()=>({horizontal:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,outside:Array.from(document.querySelectorAll('text')).filter(e=>{const b=e.getBoundingClientRect();return b.left<0||b.top<0||b.right>innerWidth+1||b.bottom>innerHeight+1;}).map(e=>e.textContent)}));
      expect(overflow).toEqual({horizontal:false,vertical:false,outside:[]});
    }
    await standalone.screenshot({path:testInfo.outputPath('standalone-svg-mobile.png')});
    await standalone.close();
  }
  expect(await page.locator('svg.metro-map').evaluate(e=>e.outerHTML)).toBe(before);
});
