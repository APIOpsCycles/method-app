import {expect,test} from '@playwright/test';
import fs from 'node:fs/promises';
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
  expect(result).toMatchObject({width:'16384',height:'16384',viewBox:'0 0 1000 1000',errors:0,externalImages:0});
  expect(result.paths).toBeGreaterThan(0);
  expect(result.texts).toBeGreaterThan(20);
  expect(new Set(result.supportSizes)).toEqual(new Set(['14px']));
  expect(svg).not.toMatch(/var\(|currentColor/);
  if(variant.station)expect(result.labels).toContain(variant.station);
  expect(await page.locator('svg.metro-map').evaluate(e=>e.outerHTML)).toBe(before);
});
