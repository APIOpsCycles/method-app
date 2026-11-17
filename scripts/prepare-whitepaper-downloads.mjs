// Explicitly stage reviewed publications; site builds use the tracked public files.
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),pkg=path.resolve(process.env.WHITEPAPER_SOURCE_ROOT || path.join(root,'packages/apiops-presentations')),dest=path.join(root,'public/whitepapers');
const publications=[
 {id:'paper1',source:'ai-dependencies-paper1',file:'what-your-ai-depends-on-paper1.pdf',publicFile:'what-your-ai-depends-on.pdf',description:'Why API quality shapes user, developer and agent experiences—even when the software connections are invisible.'},
 {id:'paper2',source:'api-readiness-sustainable-quality',file:'from-api-readiness-to-sustainable-quality.pdf',publicFile:'from-api-readiness-to-sustainable-quality.pdf',description:'How teams turn assessment findings into decisions, coordinated work and improvements they can sustain.'},
 {id:'companion',source:'api-readiness-supporting',file:'api-readiness-supporting-material.pdf',publicFile:'practical-assessment-and-improvement-resources.pdf',description:'Optional canvases, evidence mappings and a fictional completed improvement brief for practitioners.'}
];
await fs.mkdir(dest,{recursive:true});const entries=[];
for(const item of publications){
 const p=JSON.parse(await fs.readFile(path.join(pkg,'whitepapers',item.source+'.json'),'utf8'));if(/draft/i.test(p.status))throw Error('Use a publication edition: '+item.source);
 const bytes=await fs.readFile(path.join(pkg,'output',item.file));if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Invalid PDF');
 const target=path.join(dest,item.publicFile);await fs.writeFile(target,bytes);
 const cover=item.id+'-cover';execFileSync('pdftoppm',['-f','1','-l','1','-singlefile','-scale-to','720','-png',target,path.join(dest,cover)],{stdio:'pipe'});
 entries.push({id:item.id,title:p.title,description:item.description,pages:p.pages.length,language:'English',date:p.date,url:'/whitepapers/'+item.publicFile,cover:'/whitepapers/'+cover+'.png',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const zip=await fs.readFile(path.join(pkg,'output/api-readiness-supporting-material.zip'));await fs.writeFile(path.join(dest,'practical-assessment-and-improvement-resources.zip'),zip);
await fs.copyFile(path.join(pkg,'assets/paper1-capability-scene.svg'),path.join(dest,'api-capability.svg'));
await fs.writeFile(path.join(dest,'manifest.json'),JSON.stringify({edition:'2026-11-17',author:'Marjukka Niinioja / Osaango Ltd',license:'CC-BY-SA-4.0',publications:entries,bundle:{url:'/whitepapers/practical-assessment-and-improvement-resources.zip',bytes:zip.length,sha256:createHash('sha256').update(zip).digest('hex')}},null,2)+'\n');
console.log('Staged three PDFs, companion ZIP, cover previews and download manifest.');
