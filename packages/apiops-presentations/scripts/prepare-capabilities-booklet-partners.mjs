// Use the same partner list and original logo assets as the method website.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ROOT} from './model.mjs';
const repo=path.resolve(ROOT,'../..');
const manifest=JSON.parse(await fs.readFile(path.join(repo,'generated/method/partners.json'),'utf8'));
const names={'Osaango':'osaango','adorsys GmbH & Co. KG':'adorsys','APIsFirst':'apisfirst','API Evangelist':'api-evangelist'};
const partners=manifest.items.filter(item=>item.title!=='You?');
if(partners.length!==Object.keys(names).length||partners.some(p=>!names[p.title]))throw Error('Review updated partner set before fitting the back cover');
const report=[];
for(const partner of partners){
 const source=path.join(repo,'public',partner.logo.replace(/^\//,''));
 const target=path.join(ROOT,'assets',`capabilities-booklet-partner-${names[partner.title]}.png`);
 // Crop only outer whitespace, preserving all logo content and proportions.
 const rendered=await sharp(source,{density:600}).flatten({background:'#ffffff'}).png().toBuffer();
 await sharp(rendered).trim({background:'#ffffff',threshold:10}).resize({width:1800}).png().toFile(target);
 const metadata=await sharp(target).metadata();
 report.push({title:partner.title,source:partner.logo,asset:path.basename(target),width:metadata.width,height:metadata.height});
}
await fs.writeFile(path.join(ROOT,'specifications/capabilities-booklet-partners.json'),JSON.stringify({source:'generated/method/partners.json',partners:report},null,2)+'\n');
console.log(report);
