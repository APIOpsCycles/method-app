// Edit source SVG artwork, retaining the official map's station/route geometry.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {JSDOM} from 'jsdom';
import {ROOT} from './model.mjs';
async function save(name,svg,width=4096){
 await fs.writeFile(path.join(ROOT,'assets',name+'.svg'),svg);
 await sharp(Buffer.from(svg)).resize(width).png().toFile(path.join(ROOT,'assets',name+'.png'));
}
const cover=new JSDOM(await fs.readFile(path.join(ROOT,'assets/capabilities-booklet-cover.svg'),'utf8'),{contentType:'image/svg+xml'}).window.document;
for(const t of [...cover.querySelectorAll('text')])if(['Understand','Define','Design','Build','Enable'].includes(t.textContent))t.remove();
for(const c of [...cover.querySelectorAll('circle')])if(c.getAttribute('cy')==='264')c.remove();
for(const p of [...cover.querySelectorAll('path')])if(['M280 194 V236','M264 220 L280 238 L296 220','M78 264 H482'].includes(p.getAttribute('d')))p.remove();
cover.documentElement.setAttribute('viewBox','0 0 560 205');cover.documentElement.setAttribute('width','2240');cover.documentElement.setAttribute('height','820');
await save('capabilities-booklet-cover-collaboration',cover.documentElement.outerHTML,2240);

const map=new JSDOM(await fs.readFile(path.join(ROOT,'assets/capabilities-booklet-capability-map.svg'),'utf8'),{contentType:'image/svg+xml'}).window.document;
// The central brand mark would be cut by this excerpt; omit it rather than
// leaving a fragment at the crop edge. The method routes remain unchanged.
for(const nested of map.documentElement.querySelectorAll('svg'))nested.remove();
const keep=new Set(['Capability Strategy','Consumer & Producer','Commitments','Roles and Responsibilities']);
// Hide labels outside the three examples, including their now-empty white labels.
// Circles, route paths, coordinates and the coloured context areas stay intact.
const parents=new Set([...map.querySelectorAll('text')].map(t=>t.parentElement));
for(const t of [...map.querySelectorAll('text')])if(!keep.has(t.textContent))t.remove();
for(const parent of parents)if(parent&&!parent.querySelector('text'))for(const child of [...parent.children])if(child.localName==='rect')child.remove();
for(const t of map.querySelectorAll('text')){
 // New site exports wrap substation labels in positioned tspans. Flatten each
 // retained label before positioning this independently enlarged excerpt.
 t.textContent=t.textContent;
 t.setAttribute('font-family','Arial, sans-serif');t.setAttribute('font-size','25');t.setAttribute('font-weight','700');
 if(t.textContent==='Capability Strategy'){
  t.setAttribute('y','339');const r=t.parentElement.querySelector('rect');for(const [k,v] of Object.entries({x:375,y:310,width:250,height:42}))r.setAttribute(k,String(v));
 }else if(t.textContent==='Consumer & Producer'||t.textContent==='Commitments'){
  t.setAttribute('x','710');t.setAttribute('y',t.textContent==='Commitments'?'405':'377');
  const r=t.parentElement.querySelector('rect');for(const [k,v] of Object.entries({x:575,y:350,width:270,height:65}))r.setAttribute(k,String(v));
 }else t.setAttribute('x','668');
}
const ns='http://www.w3.org/2000/svg';
const cLabel=[...map.querySelectorAll('text')].find(t=>t.textContent==='Roles and Responsibilities');
const background=map.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:355,y:248,width:320,height:44,rx:6,fill:'#ffffff','fill-opacity':'.94'}))background.setAttribute(k,String(v));cLabel.before(background);
for(const [letter,cx,cy] of [['A',500,375],['B',588.388,411.612],['C',700,270]]){
 const g=map.createElementNS(ns,'g'),circle=map.createElementNS(ns,'circle'),text=map.createElementNS(ns,'text');
 for(const [k,v] of Object.entries({cx,cy,r:22,fill:'#071640',stroke:'#ffffff','stroke-width':3}))circle.setAttribute(k,String(v));
 for(const [k,v] of Object.entries({x:cx,y:cy+12,'text-anchor':'middle','font-family':'Arial','font-size':34,'font-weight':700,fill:'#ffffff'}))text.setAttribute(k,String(v));
 text.textContent=letter;g.append(circle,text);map.documentElement.append(g);
}
map.documentElement.setAttribute('viewBox','330 215 520 290');map.documentElement.setAttribute('width','4096');map.documentElement.setAttribute('height','2284');
map.documentElement.setAttribute('aria-label','Focused official map excerpt: A Capability Strategy, B Consumer and Producer Commitments, C Roles and Responsibilities. Original station and route positions retained.');
await save('capabilities-booklet-focus-map',map.documentElement.outerHTML);


// Extract one complete canonical field, retaining its original native elements.
const document=new JSDOM(await fs.readFile(path.join(ROOT,'assets/capabilities-booklet-customer-journey-canvas.svg'),'utf8'),{contentType:'image/svg+xml'}).window.document;
const svg=document.documentElement;
const selectors=['rect[x="20"][y="80"]','circle[cx="30"][cy="90"]','text[x="30"][y="95"]','text[x="44"][y="104"]','text[x="30"][y="116"]'];
const field=selectors.map(selector=>svg.querySelector(selector));
if(field.some(element=>!element))throw Error('Canonical Customer Discovers Need field has changed');
for(const child of [...svg.children])if(!field.includes(child)&&child.localName!=='defs')child.remove();
svg.setAttribute('viewBox','14 74 198 122');
svg.setAttribute('width','4096');
svg.setAttribute('height','2524');
svg.setAttribute('aria-label','Enlarged Customer Discovers Need field from the canonical Customer Journey Canvas.');
await fs.writeFile(path.join(ROOT,'assets/capabilities-booklet-customer-journey-detail.svg'),svg.outerHTML);
await sharp(Buffer.from(svg.outerHTML)).png().toFile(path.join(ROOT,'assets/capabilities-booklet-customer-journey-detail.png'));
console.log('Prepared an exact, readable crop of the canonical Customer Journey Canvas.');
