// Same controls as the supplied screenshot, captured at a narrow real viewport
// so role/goal text remains readable in the A6 booklet. No UI is redrawn.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
import {ROOT} from './model.mjs';
const url=process.argv[2]??'http://127.0.0.1:4321/';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:480,height:1000},deviceScaleFactor:3});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#method-context-controls').scrollIntoViewIfNeeded();
 await page.locator('astro-island[component-url*=MethodContextStrip]:not([ssr])').waitFor();
 await page.getByRole('button',{name:'Change context'}).click();
 const editor=page.locator('#method-context-editor');
 await editor.locator('select').nth(0).selectOption('capability-owner');
 await editor.locator('select').nth(1).selectOption('improve-reusable-capability');
 await page.evaluate(()=>document.activeElement?.blur());
 const bounds=await editor.evaluate(e=>{const box=e.getBoundingClientRect();return [...e.querySelectorAll('select')].map(s=>({left:s.getBoundingClientRect().left-box.left,right:s.getBoundingClientRect().right-box.left,width:box.width}));});
 if(bounds.some(b=>b.left<0||b.right>b.width+1))throw Error('Context selector exceeds its responsive editor');
 const fields=await Promise.all([0,1].map(i=>editor.locator('label').nth(i).screenshot()));
 const metadata=await Promise.all(fields.map(buffer=>sharp(buffer).metadata()));
 const width=Math.max(...metadata.map(m=>m.width));
 const gap=30,height=metadata[0].height+metadata[1].height+gap;
 await sharp({create:{width,height,channels:3,background:'#ffffff'}}).composite(fields.map((input,i)=>({input,left:0,top:i?metadata[0].height+gap:0}))).png().toFile(path.join(ROOT,'assets/capabilities-booklet-context-navigation.png'));
 await fs.writeFile(path.join(ROOT,'specifications/capabilities-booklet-context-image.json'),JSON.stringify({source:url,reference:'User-supplied contextual navigation screenshot',capture:'Real responsive Who/Why editor controls, stacked without redrawing',viewportCss:[480,1000],deviceScaleFactor:3,role:'capability-owner',goal:'improve-reusable-capability',imagePixels:[width,height],bounds},null,2)+'\n');
 console.log('Captured real Who/Why controls; responsive borders and selected values fit.');
}finally{await browser.close();}
