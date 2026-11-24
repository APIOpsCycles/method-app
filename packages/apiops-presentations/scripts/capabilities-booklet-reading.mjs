import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT} from './model.mjs';
import {escapeHtml as e} from './reveal-markup.mjs';
const linked=text=>e(text).replace(/\b(apiopscycles\.com(?:\/[a-z0-9-]+)*|apiops\.info)\b/g,'<a href="https://$1">$1</a>').replaceAll('\n','<br>');
export async function renderBookletReadingHtml(model){
 const repo=path.resolve(ROOT,'../..');
 const catalog=JSON.parse(await fs.readFile(path.join(repo,'generated/method/method-catalog.en.json'),'utf8'));
 const graph=JSON.parse(await fs.readFile(path.join(repo,'generated/method/method-graph.json'),'utf8'));
 const ids=graph.byCycle['api-productization-cycle'].stationIds;
 const stations=ids.map(id=>catalog.translations.en.stations.find(s=>s.id===id));
 const image=async element=>{
  const mime=element.asset.endsWith('.svg')?'image/svg+xml':'image/png';
  const size=['wordmark','osaango','community'].includes(element.id)?' style="max-width:13rem;max-height:6rem"':'';
  return `<img${size} src="data:${mime};base64,${(await fs.readFile(path.join(ROOT,'assets',element.asset))).toString('base64')}" alt="${e(element.alt)}">`;
 };
 const sections=[];
 for(const [i,s] of model.slides.entries()){
  let body='';const partners=[];
  for(const item of s.elements){
   if(item.id.startsWith('partner-')){partners.push(await image(item));continue;}
   // A direct link replaces the QR in the reading version.
   if(item.id==='qr'){body+='<p><a href="https://apiopscycles.com/#metro-map-title">Open the interactive APIOps Cycles map</a></p>';continue;}
   if(item.id==='qr-label')continue;
   if(item.type==='image'){
    body+=`<figure>${await image(item)}</figure>`;
    if(item.id==='full-map')body+='<p><a href="https://apiopscycles.com/#metro-map-title">Explore the complete interactive map and download its scalable SVG</a></p>';
    if(item.id==='shared-map')body+=`<details><summary>Core topics and stations shared by the cycles</summary><p>These are connected activities, with no compulsory starting station. Each cycle uses questions and tools adapted to its purpose.</p><ul>${stations.map(station=>`<li><a href="https://apiopscycles.com/stations/${e(station.id)}">${e(station.title)}</a></li>`).join('')}</ul></details>`;
    if(item.id==='canvas')body+='<p><a href="https://apiopscycles.com/resources/customer-journey-canvas">Open the full-size Customer Journey Canvas</a></p>';
    if(item.id==='context-controls')body+='<p><a href="https://apiopscycles.com/features/contextual-navigation">Explore contextual navigation</a></p>';
   }else if(item.type==='text'){
    const box=model.layouts.slides[s.id][item.id];
    const tag=i===6&&['people','assistants','build'].includes(item.id)?'h3':'p';
    body+=`<${tag}>${box.bold&&tag==='p'?'<strong>':''}${linked(item.text)}${box.bold&&tag==='p'?'</strong>':''}</${tag}>`;
   }
  }
  if(i===6)body+='<p><a href="https://apiopscycles.com/data">Explore the open tools and method data</a></p><details><summary>Technical options for developers and AI integrations</summary><p>Visual canvases also have portable JSON data. The semantic knowledge graph connects cycles, stations, roles, goals and resources. Prompt packs provide structured method context for AI assistants.</p><p><code>npm create apiops@latest</code> scaffolds an APIOps project. The command-line interface (CLI) can find resources and generate canvas files.</p><p><a href="https://github.com/APIOpsCycles/apiops-cycles-method-data#readme">Read the canonical CLI instructions and source</a></p></details>';
  if(partners.length)body+=`<div class="partner-logos">${partners.join('')}</div><p><a href="https://apiopscycles.com/partners">All method partners and contact information</a></p>`;
  sections.push(`<section id="page-${i+1}" aria-labelledby="heading-${i+1}"><${i?'h2':'h1'} id="heading-${i+1}">${e(s.title.replaceAll('\n',' '))}</${i?'h2':'h1'}>${body}</section>`);
 }
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(model.deck.title)} | Reading edition</title><style>
*{box-sizing:border-box}body{margin:0;color:#10233f;background:#fff;font:1.125rem/1.6 Arial,sans-serif}a{color:#164ea6;text-underline-offset:.2em}a:focus-visible,summary:focus-visible{outline:3px solid #071640;outline-offset:4px}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;background:white;padding:1rem}header,main,footer{max-width:48rem;margin:auto;padding:1.5rem}header{border-bottom:1px solid #bbb}nav a{display:inline-block;margin:.25rem .75rem .25rem 0}section{padding:2rem 0;border-bottom:1px solid #ddd}h1{font-size:2.5rem;line-height:1.15}h2{font-size:1.75rem;line-height:1.25}h3{font-size:1.2rem}p{overflow-wrap:anywhere}figure{margin:1.5rem 0}img{display:block;width:auto;max-width:100%;max-height:23rem;margin:auto}summary{cursor:pointer}.partner-logos{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin:2rem 0}.partner-logos img{width:100%;height:4rem;object-fit:contain}@media(max-width:30rem){.partner-logos{grid-template-columns:1fr}h1{font-size:2rem}}@media print{nav,.skip{display:none}section{break-inside:avoid}a{color:inherit}}
</style></head><body><a class="skip" href="#main">Skip to content</a><header><p>APIOps Cycles / Osaango Ltd</p><nav aria-label="Booklet contents">${model.slides.map((s,i)=>`<a href="#page-${i+1}">${i+1}. ${e(s.title.replaceAll('\n',' '))}</a>`).join('')}</nav></header><main id="main">${sections.join('')}</main><footer><p>APIOps Cycles method content: <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0</a>. Illustrative scenarios are teaching examples.</p></footer></body></html>`;
}
