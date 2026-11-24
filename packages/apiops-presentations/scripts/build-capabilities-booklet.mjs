// One entry point for the current, consistently named booklet deliverables.
import path from 'node:path';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {ROOT} from './model.mjs';
const a6=process.argv.includes('--a6');
const stage=process.argv.includes('--stage');
if(process.argv.slice(2).some(argument=>!['--a6','--stage'].includes(argument)))throw Error('Usage: npm run build:booklet [-- --a6] [--stage]');
const name=`apiops-cycles-capabilities-booklet-${a6?'a6':'a5'}`;
function run(command,args){
 const result=spawnSync(command,args,{cwd:ROOT,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(`${path.basename(command)} failed (${result.status})`);
}
const node=(file,...args)=>run(process.execPath,['scripts/'+file,...args]);
node('author-capabilities-booklet.mjs',...(a6?['--a6']:[]));
node('build.mjs','--edition','capabilities-booklet','--brand','brands/capabilities-booklet.json','--name',name);
node('render-capabilities-booklet.mjs',name);
const python=process.env.PYTHON??(process.platform==='win32'?'python':'python3');
run(python,['scripts/finalize-capabilities-booklet.py',name]);
run(python,['scripts/check-capabilities-booklet-print.py',name]);
node('check-booklet-margins.mjs',name);
if(stage){
 const destination=path.resolve(ROOT,'../../public/booklets');
 await fs.mkdir(destination,{recursive:true});
 for(const suffix of ['.pptx','.pdf','-print.pdf','-reading.html','-production-notes.txt'])
  await fs.copyFile(path.join(ROOT,'output',name+suffix),path.join(destination,name+suffix));
 await fs.copyFile(path.join(ROOT,'output',name+'-previews/page-01.png'),path.join(destination,name+'-cover.png'));
 console.log(`Staged final deliverables in ${destination}`);
}
console.log(`Booklet ready in ${path.join(ROOT,'output',name)}.*`);
