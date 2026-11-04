import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pkg=path.join(root,'packages/apiops-presentations');
const catalog=JSON.parse(await fs.readFile(path.join(pkg,'catalog.json'),'utf8'));
if(!/^\d+\.\d+\.\d+$/.test(catalog.version))throw new Error('Invalid presentation release version');
const versions=(await fs.readdir(path.join(pkg,'releases'),{withFileTypes:true})).filter(entry=>entry.isDirectory()&&/^\d+\.\d+\.\d+$/.test(entry.name)).map(entry=>entry.name);
if(!versions.includes(catalog.version))throw new Error('Missing current presentation release');
for(const version of versions){
const release=path.join(pkg,'releases',version),target=path.join(root,'public/presentations',version);
const manifest=JSON.parse(await fs.readFile(path.join(release,'manifest.json'),'utf8'));
if(manifest.version!==version)throw new Error('Presentation release/directory version mismatch');
const {artifacts:_artifacts,slides:_slides,source:_source,assets:_assets,...releasedCatalog}=manifest;
if(version===catalog.version&&JSON.stringify(releasedCatalog)!==JSON.stringify(catalog))throw new Error('Presentation catalog differs from its release. Prepare a new reviewed release.');
const entries=[manifest.source,...(manifest.assets??[]),...Object.values(manifest.artifacts).flatMap(Object.values),...Object.values(manifest.slides).flatMap(slides=>slides.map(slide=>slide.preview))];
// Validate the entire release before copying any public artifacts.
for(const artifact of entries){
 const file=path.resolve(release,artifact.file);
 if(!file.startsWith(release+path.sep))throw new Error('Invalid presentation artifact path');
 const bytes=await fs.readFile(file);
 if(bytes.length!==artifact.bytes||createHash('sha256').update(bytes).digest('hex')!==artifact.sha256)throw new Error(`Presentation artifact integrity failure: ${artifact.file}`);
}
await fs.mkdir(target,{recursive:true});
for(const artifact of entries){const file=path.join(target,artifact.file);await fs.mkdir(path.dirname(file),{recursive:true});await fs.copyFile(path.join(release,artifact.file),file);}
await fs.copyFile(path.join(release,'manifest.json'),path.join(target,'manifest.json'));
console.log(`Synced ${entries.length} verified presentation files (${version})`);
}
