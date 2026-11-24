// Exercise the real site export so presentation assets use exactly the same map.
// Usage: node export-metro-assets.mjs [URL] [NAME] [PNG_LONG_EDGE]
// Keep SVG for large print. Optional PNG size is independent of SVG dimensions.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
import {ROOT} from './model.mjs';
const url=process.argv[2]??'http://127.0.0.1:4321/cycles/api-productization-cycle';
const name=process.argv[3]??'apiops-metro-api-productization-en';
if(!/^[a-z0-9-]+$/.test(name))throw Error('Use a lowercase asset name without path separators');
const pngSize=Number(process.argv[4]??4096);
if(!Number.isInteger(pngSize)||pngSize<1024||pngSize>16_384)throw Error('PNG long edge must be an integer from 1024 to 16384 pixels');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto(url,{waitUntil:'domcontentloaded'});
 const button=page.getByRole('button',{name:'Export SVG',exact:true});
 await button.scrollIntoViewIfNeeded();
 await page.locator('astro-island[component-url*="MetroMapIsland"]:not([ssr])').waitFor();
 const pending=page.waitForEvent('download');await button.click();
 const download=await pending;
 await download.saveAs(path.join(ROOT,'assets',name+'.svg'));
 const svg=await fs.readFile(path.join(ROOT,'assets',name+'.svg'));
 // Rasterize a separate copy at the requested size. This avoids allocating a
 // 16K surface for a smaller PNG and leaves the downloaded SVG unchanged.
 const rasterSvg=await page.evaluate(({source,size})=>{
  const document=new DOMParser().parseFromString(source,'image/svg+xml');
  if(document.querySelector('parsererror'))throw Error('Invalid map SVG');
  const root=document.documentElement;
  const width=Number(root.getAttribute('width')),height=Number(root.getAttribute('height'));
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Map dimensions must be positive');
  const scale=size/Math.max(width,height);
  root.setAttribute('width',String(Math.round(width*scale)));
  root.setAttribute('height',String(Math.round(height*scale)));
  return new XMLSerializer().serializeToString(root);
 },{source:svg.toString('utf8'),size:pngSize});
 await sharp(Buffer.from(rasterSvg),{limitInputPixels:16_384**2}).png().toFile(path.join(ROOT,'assets',name+'.png'));
 for(const ext of ['svg','png'])await fs.copyFile(path.join(ROOT,'assets',name+'.'+ext),path.join(ROOT,'output',name+'.'+ext));
 console.log(`Exported native SVG and ${pngSize}px PNG from ${url}`);
}finally{await browser.close();}
