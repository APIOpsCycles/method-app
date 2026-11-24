import fs from 'node:fs/promises';
import path from 'node:path';
import {load,ROOT} from './model.mjs';
const name=process.argv[2]??'apiops-cycles-capabilities-booklet-a5';
if(!/^[a-z0-9-]+$/.test(name))throw Error('Use a simple output name');
const model=await load('brands/capabilities-booklet.json','capabilities-booklet');
const mm=25.4/96,{width,height}=model.layouts.canvas;
const pages=[];
for(const [index,slide] of model.slides.entries()){
 const number=index+1,left=number%2===0;
 const chrome={...model.layouts,...model.layouts.pageChrome?.[slide.id]};
 const bodyBottom=Math.max(...slide.elements.map(e=>{const b=model.layouts.slides[slide.id][e.id];return b.y+b.h;}));
 const bottomGap=chrome.pageNumber.y-bodyBottom;
 if(bottomGap<18)throw Error(`${number}: body content must leave at least 18 px above footer/page-number row`);
 const footer=chrome.footer,numberBox=chrome.pageNumber;
 const horizontalGap=left?footer.x-(numberBox.x+numberBox.w):numberBox.x-(footer.x+footer.w);
 if(slide.footer!==''&&horizontalGap<18)throw Error(`${number}: footer and number need at least 18 px horizontal separation`);
 const boxes=[['logo',chrome.logo],['title',chrome.title],['pageNumber',chrome.pageNumber],...(slide.footer===''?[]:[['footer',chrome.footer]]),...slide.elements.map(e=>[e.id,model.layouts.slides[slide.id][e.id]])];
 let minimum=Infinity,inner=Infinity;
 for(const [id,b] of boxes){
  const margins=[b.x,width-b.x-b.w,b.y,height-b.y-b.h].map(n=>n*mm);
  if(margins.some(n=>n<5-0.001))throw Error(`${number}/${id}: less than 5 mm from trim: ${margins}`);
  const gutter=margins[left?1:0];
  if(gutter<7-0.001)throw Error(`${number}/${id}: binding safety less than 7 mm`);
  minimum=Math.min(minimum,...margins);inner=Math.min(inner,gutter);
 }
 if(number>1&&number<12){
  if(left&&chrome.logo.x!==model.layouts.logo.x)throw Error('Left-page mark must be outside');
  if(!left&&chrome.logo.x<width/2)throw Error('Right-page mark must be outside');
 }
 pages.push({page:number,side:left?'left':'right',minimumTrimMm:+minimum.toFixed(3),minimumBindingMm:+inner.toFixed(3),bodyToFooterMm:+(bottomGap*mm).toFixed(3),outsideMark:number>1&&number<12});
}
await fs.writeFile(path.join(ROOT,'output',name+'-previews','margin-check.json'),JSON.stringify({trimMinimumMm:5,bindingMinimumMm:7,mainTextSideMarginsMm:+(model.layouts.title.x*mm).toFixed(3),pages},null,2)+'\n');
console.log(`Checked ${pages.length} pages: >=5 mm trim safety, >=7 mm binding safety, alternating outside marks/numbers.`);
