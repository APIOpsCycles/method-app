import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,load,options} from './model.mjs';
import {exportPptx} from './pptx.mjs';
import {exportReveal} from './reveal.mjs';
const o=options(),model=await load(o.brand,o.edition),output=path.join(ROOT,'output');
await fs.mkdir(output,{recursive:true});
// The Typst entry point reads this resolved snapshot. Content stays in slides/*.json.
await fs.writeFile(path.join(output,o.name+'.resolved.json'),JSON.stringify(model,null,2)+'\n');
const typst=`// Generated entry point. Edit slides/*.json and theme.json, then rebuild.\n#import "../typst/template.typ": render-deck\n#render-deck(json("${o.name}.resolved.json"))\n`;
await fs.writeFile(path.join(output,o.name+'.typ'),typst);
await fs.writeFile(path.join(output,o.name+'.notes.md'),model.slides.map((s,i)=>`# ${i+1}. ${s.title||s.id}\n\n${s.notes}\n`).join('\n'));
if(['all','pptx'].includes(o.format))await exportPptx(model,path.join(output,o.name+'.pptx'));
if(['all','reveal'].includes(o.format))await exportReveal(model,o.name);
if(o.format==='pdf'){
  const result=spawnSync('typst',['compile','--root',ROOT,path.join(output,o.name+'.typ'),path.join(output,o.name+'.pdf')],{stdio:'inherit'});
  if(result.error)throw new Error('Install the Typst CLI and add it to PATH, or upload this entire kit to the Typst web app. '+result.error.message);
  if(result.status!==0)process.exit(result.status??1);
}
console.log(`Built ${model.slides.length} slides for ${model.theme.name} in output/${o.name}.*`);
