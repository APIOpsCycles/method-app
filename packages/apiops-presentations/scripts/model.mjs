import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const readJson=async file=>JSON.parse(await fs.readFile(file,'utf8'));
export function localPath(file){
  const result=path.resolve(ROOT,file);
  if(result!==ROOT&&!result.startsWith(ROOT+path.sep))throw new Error(`Path must stay inside the kit: ${file}`);
  return result;
}
export function options(args=process.argv.slice(2)){
  const o={brand:'theme.json',name:'apiops-introduction',format:'all',edition:'strategy-to-technical-delivery'};
  for(let i=0;i<args.length;i+=2){if(!['--brand','--name','--format','--edition'].includes(args[i])||!args[i+1])throw new Error('Use --brand FILE --name NAME --edition ID --format all|pptx|typst|pdf|reveal');o[args[i].slice(2)]=args[i+1];}
  if(!/^[a-zA-Z0-9_-]+$/.test(o.name))throw new Error('Output name must contain only letters, digits, hyphens or underscores.');
  if(!['all','pptx','typst','pdf','reveal'].includes(o.format))throw new Error('Unknown format');
  return o;
}
export async function load(brand='theme.json',edition='strategy-to-technical-delivery'){
  if(!/^[a-z0-9-]+$/.test(edition))throw new Error('Invalid edition ID');
  const [deck,layouts,base,override]=await Promise.all([readJson(localPath(`editions/${edition}.json`)),readJson(localPath('layouts.json')),readJson(localPath('theme.json')),readJson(localPath(brand))]);
  const theme={...base,...override,colors:{...base.colors,...override.colors}};
  const slides=await Promise.all(deck.slides.map(file=>readJson(localPath(file))));
  if(!slides.length)throw new Error('Deck must contain slides.');
  const ids=new Set();
  for(const slide of slides){
    if(ids.has(slide.id))throw new Error(`Duplicate slide ${slide.id}`);ids.add(slide.id);
    const layout=layouts.slides[slide.id];if(!layout)throw new Error(`Missing layout ${slide.id}`);
    const elements=new Set();
    for(const e of slide.elements){
      if(elements.has(e.id))throw new Error(`Duplicate element ${slide.id}/${e.id}`);elements.add(e.id);
      if(!['text','code','image','table','bullets','numbered'].includes(e.type))throw new Error(`Unknown element type ${e.type}`);
      const box=layout[e.id];if(!box)throw new Error(`Missing box ${slide.id}/${e.id}`);
      for(const v of ['x','y','w','h'])if(!Number.isFinite(box[v]))throw new Error(`Invalid ${v}: ${slide.id}/${e.id}`);
      if(box.x<0||box.y<0||box.w<=0||box.h<=0||box.x+box.w>layouts.canvas.width+1||box.y+box.h>layouts.canvas.height+1)throw new Error(`Box outside slide ${slide.id}/${e.id}`);
      if(['text','code'].includes(e.type)&&typeof e.text!=='string')throw new Error(`Text required ${e.id}`);
      if(['bullets','numbered'].includes(e.type)&&(!Array.isArray(e.items)||!e.items.every(v=>typeof v==='string')))throw new Error(`List items required ${e.id}`);
      if(e.type==='table'&&(!Array.isArray(e.rows)||!e.rows.length||!e.rows.every(row=>row.length===e.rows[0].length&&row.every(v=>typeof v==='string'))))throw new Error(`Rectangular string table required ${e.id}`);
      if(e.type==='table'&&box.columnWidths.length!==e.rows[0].length)throw new Error(`Column widths mismatch ${e.id}`);
      if(e.type==='image')await fs.access(localPath('assets/'+e.asset));
    }
  }
  for(const [key,value] of Object.entries(theme.colors))if(!/^#[0-9a-f]{6}$/i.test(value))throw new Error(`Invalid theme color ${key}`);
  await fs.access(localPath(theme.logo));
  return {deck,slides,layouts,theme};
}
export async function dependency(name){
  // Normal partner installs resolve npm dependencies. Codex can use its supplied runtime without copying private libraries.
  try{return await import(name);}catch(error){
    if(!process.env.RUNTIME_NODE_MODULES)throw new Error(`Run npm install first. Cannot load ${name}: ${error.message}`);
    if(name==='pptxgenjs')return import(pathToFileURL(path.join(process.env.RUNTIME_NODE_MODULES,'pptxgenjs/dist/pptxgen.cjs.js')).href);
    if(name==='jszip')return import(pathToFileURL(path.join(process.env.RUNTIME_NODE_MODULES,'jszip/lib/index.js')).href);
    if(name==='@oai/artifact-tool')return import(pathToFileURL(path.join(process.env.RUNTIME_NODE_MODULES,'@oai/artifact-tool/dist/artifact_tool.mjs')).href);
    throw error;
  }
}
