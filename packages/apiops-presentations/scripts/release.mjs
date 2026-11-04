import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {ROOT,load,readJson,dependency} from './model.mjs';
import {exportReveal} from './reveal.mjs';

const args=process.argv.slice(2);
if(args.some(a=>a!=='--from-output'))throw new Error('Use --from-output only to package previously built and reviewed files.');
const reuse=args.includes('--from-output'),catalog=await readJson(path.join(ROOT,'catalog.json'));
const destination=path.join(ROOT,'releases',catalog.version);
try{await fs.access(destination);throw new Error(`Release ${catalog.version} exists. Increment catalog.json version; releases are immutable.`);}catch(e){if(e.code!=='ENOENT')throw e;}
const stage=path.join(ROOT,'.release-tmp',catalog.version+'-'+Date.now());await fs.mkdir(stage,{recursive:true});
function run(command,argv){const result=spawnSync(command,argv,{stdio:'inherit',cwd:ROOT});if(result.error)throw result.error;if(result.status!==0)throw new Error(`${command} failed (${result.status})`);}
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
const manifest={...catalog,artifacts:{},slides:{},assets:[]};
async function copy(source,target){const bytes=await fs.readFile(source);const file=path.join(stage,target);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);return {file:target,bytes:bytes.length,sha256:sha(bytes)};}
for(const edition of catalog.editions){
 const model=await load('theme.json',edition.id),base=path.join(ROOT,'output',edition.id);
 if(model.slides.length!==edition.slideCount)throw new Error(`Catalog slide count mismatch: ${edition.id}`);
 if(!reuse){
  run(process.execPath,['scripts/build.mjs','--edition',edition.id,'--name',edition.id]);
  run('typst',['compile','--root',ROOT,base+'.typ',base+'.pdf']);
  run('typst',['compile','--root',ROOT,'--format','png','--ppi','96',base+'.typ',base+'-slide-{n}.png']);
 }
 const resolved=await readJson(base+'.resolved.json');
 if(JSON.stringify(resolved)!==JSON.stringify(model))throw new Error(`Stale output for ${edition.id}. Rebuild before releasing.`);
 manifest.artifacts[edition.id]={};
 for(const ext of ['pptx','pdf'])manifest.artifacts[edition.id][ext]=await copy(base+'.'+ext,edition.id+'/'+edition.id+'.'+ext);
 manifest.artifacts[edition.id].content=await copy(base+'.resolved.json',edition.id+'/content.json');
 manifest.artifacts[edition.id].notes=await copy(base+'.notes.md',edition.id+'/speaker-notes.md');
 await exportReveal(model,edition.id);
 manifest.artifacts[edition.id].reveal=await copy(base+'-reveal.zip',edition.id+'/'+edition.id+'-reveal.zip');
 manifest.slides[edition.id]=[];
 for(let i=0;i<model.slides.length;i++){
  const slide=model.slides[i];const preview=await copy(base+`-slide-${i+1}.png`,`${edition.id}/slides/${i+1}.png`);
  manifest.slides[edition.id].push({id:slide.id,title:slide.title||slide.elements.find(e=>e.type==='text')?.text||slide.id,preview,...(i===0?{cover:true}:{})});
 }
}
for(const file of await fs.readdir(path.join(ROOT,'assets')))if(/\.(png|svg|jpe?g|webp)$/i.test(file))manifest.assets.push(await copy(path.join(ROOT,'assets',file),'assets/'+file));
const zipModule=await dependency('jszip'),JSZip=zipModule.default,zip=new JSZip();
const sourceFolders=['slides','assets','canvases','brands','schemas','typst','scripts','editions','.vscode'];
async function addFolder(dir){for(const item of await fs.readdir(path.join(ROOT,dir),{withFileTypes:true})){const rel=dir+'/'+item.name;if(item.isDirectory())await addFolder(rel);else zip.file('apiops-presentations/'+rel,await fs.readFile(path.join(ROOT,rel)));}}
for(const dir of sourceFolders)await addFolder(dir);
// Include the canonical visual guide; extracted standalone kits reuse their bundled copy.
let visualGuide;
try{visualGuide=await fs.readFile(path.join(ROOT,'docs/creating-visuals.md'));}
catch(error){if(error.code!=='ENOENT')throw error;visualGuide=await fs.readFile(path.join(ROOT,'../apiops-design-system/docs/creating-visuals.md'));}
zip.file('apiops-presentations/docs/creating-visuals.md',visualGuide);
for(const file of ['README.md','package.json','catalog.json','deck.json','layouts.json','theme.json','.gitignore'])zip.file('apiops-presentations/'+file,await fs.readFile(path.join(ROOT,file)));
const source=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
await fs.writeFile(path.join(stage,'apiops-presentations-source.zip'),source);
manifest.source={file:'apiops-presentations-source.zip',bytes:source.length,sha256:sha(source)};
await fs.writeFile(path.join(stage,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.mkdir(path.dirname(destination),{recursive:true});await fs.rename(stage,destination);
console.log(`Packaged ${catalog.editions.length} editions in releases/${catalog.version}`);
