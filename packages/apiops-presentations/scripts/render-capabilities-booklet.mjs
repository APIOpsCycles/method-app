// PDF and previews use the framework's shared HTML renderer and physical layout.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {load,ROOT} from './model.mjs';
import {renderRevealSections} from './reveal-markup.mjs';
import {renderBookletReadingHtml} from './capabilities-booklet-reading.mjs';
const model=await load('brands/capabilities-booklet.json','capabilities-booklet');
const output=path.join(ROOT,'output'),name=process.argv[2]??'apiops-cycles-capabilities-booklet-a5';
if(!/^[a-z0-9-]+$/.test(name))throw Error('Use a simple output name');
const css=await fs.readFile(path.join(ROOT,'scripts/reveal-theme.css'),'utf8');
const widthMm=model.layouts.canvas.width*25.4/96,heightMm=model.layouts.canvas.height*25.4/96;
let sections=renderRevealSections(model);
for(const asset of new Set([model.theme.logo.replace(/^assets\//,''),...model.slides.flatMap(s=>s.elements.filter(e=>e.type==='image').map(e=>e.asset))])){
 const mime=asset.endsWith('.svg')?'image/svg+xml':'image/png';
 const data=`data:${mime};base64,${(await fs.readFile(path.join(ROOT,'assets',asset))).toString('base64')}`;
 sections=sections.replaceAll(`src="assets/${asset}"`,`src="${data}"`);
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>${model.deck.title}</title><style>${css}
@page{size:${widthMm}mm ${heightMm}mm;margin:0}body{margin:0;background:#fff}section{position:relative;width:${widthMm}mm;height:${heightMm}mm;break-after:page;overflow:hidden}section:last-child{break-after:auto}aside.notes{display:none}.apiops-slide-canvas{transform-origin:top left}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}
</style>${sections}</html>`;
await fs.writeFile(path.join(output,name+'.html'),html);
await fs.writeFile(path.join(output,name+'-reading.html'),await renderBookletReadingHtml(model));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:Math.ceil(model.layouts.canvas.width),height:Math.ceil(model.layouts.canvas.height)},deviceScaleFactor:2});
 await page.goto(pathToFileURL(path.join(output,name+'.html')).href);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();}));});
 const overflow=await page.locator('.apiops-slide-item:not(img)').evaluateAll(items=>items.filter(e=>e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2).map(e=>({text:e.textContent,box:[e.clientWidth,e.clientHeight],content:[e.scrollWidth,e.scrollHeight]})));
 if(overflow.length)throw Error('Text overflow: '+JSON.stringify(overflow));
 const previews=path.join(output,name+'-previews');await fs.mkdir(previews,{recursive:true});
 for(let i=0;i<12;i++)await page.locator('section').nth(i).screenshot({path:path.join(previews,`page-${String(i+1).padStart(2,'0')}.png`)});
 await page.pdf({path:path.join(output,name+'.pdf'),preferCSSPageSize:true,printBackground:true,tagged:true,outline:true});
 await fs.writeFile(path.join(previews,'review.json'),JSON.stringify({pages:12,widthMm,heightMm,textOverflow:overflow},null,2));
 const reading=await browser.newPage({viewport:{width:390,height:844}});
 await reading.goto(pathToFileURL(path.join(output,name+'-reading.html')).href);
 await reading.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 if(await reading.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Reading HTML overflows mobile viewport');
 if(await reading.locator('h1').count()!==1||await reading.locator('main section').count()!==12)throw Error('Invalid reading hierarchy');
 await reading.screenshot({path:path.join(previews,'reading-mobile.png'),fullPage:true});
 console.log(`Rendered 12 ${widthMm.toFixed(0)} x ${heightMm.toFixed(0)} mm pages, tagged PDF, previews and self-contained reading HTML. No text overflow.`);
}finally{await browser.close();}
