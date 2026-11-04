import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {ROOT,localPath,dependency} from './model.mjs';
import {renderRevealSections,escapeHtml} from './reveal-markup.mjs';
const require=createRequire(import.meta.url);
export async function exportReveal(model,name){
 const folder=path.join(ROOT,'output',name+'-reveal');await fs.mkdir(path.join(folder,'vendor'),{recursive:true});await fs.mkdir(path.join(folder,'assets'),{recursive:true});
 const revealRoot=path.resolve(path.dirname(require.resolve('reveal.js')),'..');
 for(const [from,to] of [['dist/reveal.js','reveal.js'],['dist/reveal.css','reveal.css'],['dist/plugin/notes.js','notes.js'],['LICENSE','LICENSE-reveal.txt']])await fs.copyFile(path.join(revealRoot,from),path.join(folder,'vendor',to));
 await fs.copyFile(path.join(ROOT,'scripts/reveal-theme.css'),path.join(folder,'theme.css'));
 const assets=new Set([model.theme.logo.replace(/^assets\//,'')]);
 for(const s of model.slides)for(const e of s.elements)if(e.type==='image')assets.add(e.asset);
 for(const asset of assets)await fs.copyFile(localPath('assets/'+asset),path.join(folder,'assets',asset));
 const html=`<!doctype html><html lang="${escapeHtml(model.deck.language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(model.deck.title)}</title><link rel="stylesheet" href="vendor/reveal.css"><link rel="stylesheet" href="theme.css"><style>body{margin:0}.reveal{height:100dvh}#fallback{font:18px Arial,sans-serif;padding:24px}</style></head><body><noscript><p id="fallback">Enable JavaScript for Reveal.js navigation, or use the accompanying PDF or PowerPoint.</p></noscript><div class="reveal apiops-reveal"><div class="slides">${renderRevealSections(model)}</div></div><script src="vendor/reveal.js"></script><script src="vendor/notes.js"></script><script>Reveal.initialize({width:1280,height:720,margin:0,center:false,hash:true,scrollActivationWidth:null,transition:'none',slideNumber:'c/t',plugins:[RevealNotes]});</script></body></html>`;
 await fs.writeFile(path.join(folder,'index.html'),html);
 await fs.writeFile(path.join(folder,'README.txt'),'APIOps Cycles Reveal.js edition\n\nServe this folder with a static HTTP server and open index.html. For example: npx serve .\nUse arrow keys, Esc for overview, F for fullscreen and S for speaker notes. Speaker view requires HTTP and popups.\nText, lists and tables are HTML; diagrams and illustrations are image assets.\nTo change content or branding consistently across formats, edit the source kit and rebuild.\nRetain APIOps Cycles, canvas and case-study attribution. Reveal.js is MIT licensed; its notice is in vendor/LICENSE-reveal.txt.\n');
 const {default:JSZip}=await dependency('jszip'),zip=new JSZip();
 async function add(dir){for(const item of await fs.readdir(path.join(folder,dir),{withFileTypes:true})){const rel=path.join(dir,item.name);if(item.isDirectory())await add(rel);else zip.file(rel.replaceAll('\\','/'),await fs.readFile(path.join(folder,rel)));}}
 await add('');const archive=path.join(ROOT,'output',name+'-reveal.zip');await fs.writeFile(archive,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));return archive;
}
