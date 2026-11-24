import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT} from './model.mjs';
const write=async(f,v)=>fs.writeFile(path.join(ROOT,f),JSON.stringify(v,null,2)+'\n');
// Author against the reviewed A6 grid, then scale the whole composition to the
// chosen physical page. Contained images keep their original proportions.
const paper=process.argv.includes('--a6')?'A6':'A5';
const size=paper==='A5'?{width:148,height:210}:{width:105,height:148};
const w=105/25.4*96,h=148/25.4*96;
const layouts={canvas:{width:w,height:h},logo:{x:32,y:24,w:27,h:27},pageNumber:{x:w-52,y:h-35,w:20,h:16,fontSize:12},title:{x:32,y:72,w:w-64,h:95,fontSize:31},footer:{x:32,y:h-35,w:290,h:16,fontSize:12},slides:{},pageChrome:{}};
const slides=[];
const T=(id,text,y,height,size=16,bold=false)=>[{id,type:'text',text},{x:32,y,w:w-64,h:height,fontSize:size,bold,color:'body',spaceAfter:0}];
const descriptions={cover:'Teams connect API decisions across understand, define, design, build and enable activities.',wordmark:'APIOps Cycles',osaango:'Osaango',platforms:'Practitioners hold OpenAPI, AsyncAPI and GraphQL specifications.', 'shared-picture':'Teams have interfaces but lack a common view of their connections.', 'local-decisions':'Teams optimize their own APIs independently.', 'metro-core':'Simplified API Productization map with shortened station names. Activities can be revisited; the map does not prescribe a compulsory sequence.',conversations:'API producers and consumers discuss the result of an interaction.',governance:'Practitioners balance shared controls and freedom to innovate.',community:'APIOps Community',together:'API practitioners work together.', 'method-qr':'QR code linking to https://apiopscycles.com/#metro-map-title'};
const I=(id,name,y,height,x=32,width=w-64)=>[{id,type:'image',asset:`capabilities-booklet-${name}.svg`,alt:descriptions[name]??name.replaceAll('-',' '),fit:'contain'},{x,y,w:width,h:height}];
const partner=(name,x,y)=>[{id:'partner-'+name,type:'image',asset:`capabilities-booklet-partner-${name}.png`,alt:({osaango:'Osaango',adorsys:'adorsys GmbH & Co. KG',apisfirst:'APIsFirst','api-evangelist':'API Evangelist'})[name],fit:'contain'},{x,y,w:144,h:28}];
Object.assign(descriptions,{'capability-map':'The official APIOps Cycles metro map with the Capability Productization route selected. Shared stations connect business, governance, consumer and technical work.','shared-topics':'All four cycles address strategy, consumers, architecture, design, delivery, readiness, enablement and improvement. Choose an entry point and revisit activities as needed.','customer-journey-canvas':'The canonical Customer Journey Canvas: customer need, persona, pains and gains, journey steps, inputs and outputs, interaction rules and improvement opportunities.','starting-points':'Official map excerpt. A marks Capability Strategy, B marks Consumer and Producer Commitments, C marks Roles and Responsibilities.'});
Object.assign(descriptions,{'cover-collaboration':'People align API decisions and shared understanding. The original small linear process strip is omitted.','focus-map':'Focused official map: A Capability Strategy, B Consumer and Producer Commitments, C Roles and Responsibilities. Routes and station positions are unchanged.','community-meetups':'People meeting','community-workshops':'Conversations in a workshop','community-talks':'Microphone for practitioner talks'});
descriptions['customer-journey-detail']='Enlarged original Customer Discovers Need field from the Customer Journey Canvas. How does the customer recognize their need or problem?';
function page(title,items,notes=''){
 const id='capabilities-booklet-'+String(slides.length+1).padStart(2,'0');
 slides.push({id,title,elements:items.map(i=>i[0]),notes:`APIOps Cycles / Osaango Ltd. Method content CC-BY-SA 4.0. Original artwork retained from the supplied Pariisi-Messuvihko.pptx. ${notes}`});
 layouts.slides[id]=Object.fromEntries(items.map(i=>[i[0].id,i[1]]));
}
page('Turning ideas into\nreusable capabilities',[
 T('subtitle','A practical method to connect business goals, people and technology across APIs, integrations and AI-assisted automation.',183,97,18),I('cover','cover-collaboration',295,130),I('wordmark','wordmark',454,48)
]);
page('APIOps Cycles',[
 T('definition','An open method for reusable capabilities, APIs, integrations and automation.',120,62,17,true),I('full-map','capability-map',188,280),T('overview','Four cycles share stations, decisions and tools.',476,30,14)
], 'Official method map exported from the local method website with the Capability Productization route selected. This map is an orientation image; the full-size interactive map supplies station detail. The method builds on Lean and Service Design. Attribution remains in notes and the digital edition.');
slides.at(-1).footer='apiopscycles.com · CC BY-SA 4.0';
page('Different teams.\nDifferent pictures.',[
 T('problem','APIs, integrations and automation often grow in separate teams.',176,65,20,true),I('scene','shared-picture',258,138),T('method','APIOps Cycles gives them a shared view of consumers, meaning, ownership and decisions.',415,90,18)
]);
page('Every team\noptimizes locally',[
 I('scene','local-decisions',173,118),T('example','An API and an automation use different definitions of “customer”. Their outputs cannot be combined reliably.',302,89,18),T('decision','Agree on what “customer” means, which capabilities can be reused, and who owns the shared decisions before choosing implementations.',408,94,17,true)
], 'Illustrative scenario, not a reported client case.');
page('AI-assisted\nautomation',[
 T('question','AI can assist a task. Its authority, evidence and fallback need deliberate design.',175,75,19,true),[{id:'ai-scene',type:'image',asset:'intro-ai-build.png',alt:'People review AI-assisted work against a specification and explicit checks.',fit:'contain'},{x:32,y:262,w:w-64,h:145}],T('method','The Automation Cycle helps you decide what to automate, when AI is useful, and where human review belongs.',423,80,17)
], 'Grounded in the Automation Cycle opportunity, architecture, workflow, readiness and monitoring stations. AI is an implementation option, selected alongside deterministic approaches, with explicit authority, evidence, fallback and review. Existing repository illustration intro-ai-build.png is reused.');
page('Contextual\nnavigation',[
 T('intro','Choose your role and goal. The method highlights relevant stations and tools.',175,65,18),[{id:'context-controls',type:'image',asset:'capabilities-booklet-context-navigation.png',alt:'Real Who and Why controls: Capability Owner selected as the role, and Define or improve a reusable capability selected as the goal.',fit:'contain'},{x:32,y:251,w:w-64,h:125}],T('capability','Capability: shape a reusable capability.',386,24,14),T('api','API: design and productize an API.',418,24,14),T('integration','Integration: develop reusable integrations.',450,24,14),T('automation','Automation: improve workflows and tasks.',482,24,14)
], 'Merges former pages 6 and 7. The supplied context navigation screenshot is the reference. The real responsive website editor is captured without redrawing the controls; Who and Why are stacked for readable A6 placement. Role and goal resolve relevant method context; the route is guidance rather than a compulsory sequence. Cycle purpose summaries follow generated method data. Source: apps/site/src/components/islands/MethodContextStrip.tsx and resolve-method-context.ts.');
page('One method.\nMany ways to use it.',[
 T('people','Work with people',175,28,20,true),T('people-use','Use visual canvases and workshops to make decisions together.',214,60,18),T('assistants','Work with AI',296,28,20,true),T('assistants-use','Give AI assistants structured method knowledge and reusable tools.',335,60,18),T('build','Build with the method',409,28,20,true),T('build-use','Use open data and code to bring the method into your own workflows.',448,58,17)
], 'Feature coverage follows the user-supplied method features screenshot and apps/site/src/content/features.ts. Visual canvas workspaces export JSON; /data provides catalog, canvas manifest, method graph and prompt packs. The installed canonical apiops-cycles-method-data 4.2.1 package exports method-engine and method-cli. Its README documents npm create apiops@latest; CLI help supports start, resources and generate-canvases. AI context is an integration input, not a claim that a live MCP service or autonomous execution is included. Sources: apps/site/src/pages/features/ai-ready-method.astro, open-json-data.astro, DataContent.astro and node_modules/apiops-cycles-method-data/README.md.');
slides.at(-1).footer='apiopscycles.com/data';
page('A shared view of\nthe customer journey',[
 T('intro','Use the Customer Journey Canvas to connect the customer’s task, pain points and desired outcome.',175,65,17),I('canvas-detail','customer-journey-detail',244,166),I('canvas','customer-journey-canvas',422,80,32,120),[{id:'prompt',type:'text',text:'Discuss what happens before deciding what to build.'},{x:170,y:418,w:195,h:44,fontSize:14,color:'body'}],[{id:'tools',type:'text',text:'Get the free canvas:\napiopscycles.com/resources'},{x:170,y:472,w:195,h:34,fontSize:13,bold:true,color:'body'}]
], 'Canonical Customer Journey Canvas generated with CanvasCreator from the installed method-data template. The large image is an exact crop of the Customer Discovers Need field, with its original question and native geometry. The smaller complete canvas provides context. Blank reusable template; no fabricated client evidence. Full-size tool: https://apiopscycles.com/resources/customer-journey-canvas');
slides.at(-1).footer='';
page('Governance\nand innovation',[
 T('scenario','A team needs to launch quickly. Security needs consistent controls. The platform team wants reuse.',176,91,18),I('scene','governance',278,100),T('method','APIOps Cycles helps them agree which decisions to make together and which can remain local.',392,72,17,true),T('example','For example: shared access rules, with local implementation choices.',473,32,13)
], 'Illustrative scenario. Shared and local decisions depend on organizational context.');
page('Start where it\nhurts most',[
 T('intro','Bring your biggest challenge to the map.',175,36,17),I('challenge-map','focus-map',218,155),T('a','A  Strategy: what can we reuse?',383,24,15,true),T('b','B  Consumers: who are we serving?',411,24,15,true),T('c','C  Roles & responsibilities:\nwho owns the decisions?',439,36,15,true),T('start','Examples only. Start where it hurts most.',486,20,14)
], 'A points to Capability Strategy (api-product-strategy), B to Consumer & Producer Commitments (api-consumer-experience), C to the supporting governance station Roles and Responsibilities. Letter annotations identify the three questions, not a mandatory sequence. Start with the question where the team lacks agreement.');
page('Join the\nAPIOps Community',[
 T('invitation','Bring your challenges.\nFind your people.',175,65,24,true),I('community','community',255,55),T('description','Connect with API practitioners around the world.',326,54,18),I('meetup-icon','community-meetups',390,48,32,88),I('workshop-icon','community-workshops',390,48,154,88),I('talk-icon','community-talks',390,48,276,88),[{id:'meetups',type:'text',text:'Meetups'},{x:44,y:448,w:86,h:24,fontSize:15,bold:true,color:'body'}],[{id:'workshops',type:'text',text:'Workshops'},{x:160,y:448,w:98,h:24,fontSize:15,bold:true,color:'body'}],[{id:'talks',type:'text',text:'Talks'},{x:304,y:448,w:61,h:24,fontSize:15,bold:true,color:'body'}],T('action','Join us at apiops.info',480,26,21,true)
], 'APIOps is the practitioner community. APIOps Cycles is the open method.');
slides.at(-1).footer='';
page('Your path\nstarts here',[
 I('scene','together',164,70),T('link','Choose your challenge and explore the map.',243,43,18),I('qr','method-qr',294,94.49,32,94.49),T('qr-label','apiopscycles.com\nExplore the interactive map',310,60,16),T('partners','APIOps Cycles partners can help you map your path.',402,32,14),partner('osaango',32,441),partner('adorsys',221,441),partner('apisfirst',32,476),partner('api-evangelist',221,476)
]);
// Leave the QR caption beside the code.
Object.assign(layouts.slides[slides[11].id]['qr-label'],{x:145,w:220});
slides[11].footer='apiopscycles.com/partners';
slides[11].notes+=' Partner names and original logo assets follow generated/method/partners.json and public/partners/. The invitation placeholder is not a partner.';
for(const id of ['partner-osaango','partner-adorsys','partner-apisfirst','partner-api-evangelist'])layouts.slides[slides[11].id][id].h=26;
// Reading-order saddle-stitched booklet: even pages are on the left, odd on the right.
// Main content already has >=8.4 mm side margins. Put small marks/page numbers
// outside on interior spreads; keep all footer boxes >=5 mm above the trim.
for(const [index,slide] of slides.entries()){
 const number=index+1,left=number%2===0,interior=number>1&&number<12;
 layouts.pageChrome[slide.id]={
  logo:{...layouts.logo,x:interior&&!left?w-32-layouts.logo.w:32},
  pageNumber:{...layouts.pageNumber,x:left?32:w-52},
  footer:{...layouts.footer,x:left?70:32,w:left?260:290},
 };
}
const sx=size.width/105,sy=size.height/148;
function scaleBox(box){
 for(const key of ['x','w'])if(typeof box[key]==='number')box[key]*=sx;
 for(const key of ['y','h','spaceAfter'])if(typeof box[key]==='number')box[key]*=sy;
 if(typeof box.fontSize==='number')box.fontSize*=sx;
 if(box.columnWidths)box.columnWidths=box.columnWidths.map(value=>value*sx);
}
for(const key of ['logo','pageNumber','title','footer'])scaleBox(layouts[key]);
for(const positions of Object.values(layouts.slides))for(const box of Object.values(positions))scaleBox(box);
for(const chrome of Object.values(layouts.pageChrome))for(const box of Object.values(chrome))scaleBox(box);
layouts.canvas={width:size.width/25.4*96,height:size.height/25.4*96};
await write('layouts-capabilities-booklet.json',layouts);
for(const slide of slides)await write(`slides/${slide.id}.json`,slide);
await write('editions/capabilities-booklet.json',{schemaVersion:'1.0',id:'capabilities-booklet',title:'Turning ideas into reusable capabilities',language:'en',author:'APIOps Cycles / Osaango Ltd',layouts:'layouts-capabilities-booklet.json',slides:slides.map(s=>`slides/${s.id}.json`)});
await write('brands/capabilities-booklet.json',{name:'APIOps Cycles',author:'APIOps Cycles / Osaango Ltd',font:'Arial',footer:'apiopscycles.com',logo:'assets/apiops-cycles-logo.png',colors:{heading:'#071640',body:'#10233f',muted:'#526077'}});
console.log(`Authored 12 ${paper} pages (${size.width} x ${size.height} mm) in the existing presentation framework.`);
