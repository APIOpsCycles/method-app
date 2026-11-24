import path from 'node:path';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dependency,localPath} from './model.mjs';
import {imageDimensions,containImage} from './image-layout.mjs';
export async function exportPptx(model,file){
  const mod=await dependency('pptxgenjs');
  const PptxGenJS=mod.default?.default??mod.default;
  const pptx=new PptxGenJS();
  const {deck,slides,layouts:l,theme:t}=model;
  const color=token=>(t.colors[token]??t.colors.body).slice(1);
  const xy=b=>({x:b.x/96,y:b.y/96,w:b.w/96,h:b.h/96});
  const dimensions=new Map();
  // Use ordinary embedded PNGs for Office and previewer compatibility. SVG
  // remains the source for HTML/PDF and separate vector downloads. Requiring
  // the prepared sibling avoids silently rasterizing a small SVG at export.
  const powerpointImage=file=>{
    const prepared=file.toLowerCase().endsWith('.svg')?file.slice(0,-4)+'.png':file;
    // Preserve support for existing partner SVGs without a prepared PNG.
    return existsSync(prepared)?prepared:file;
  };
  async function contained(file,frame){
    if(!dimensions.has(file))dimensions.set(file,await imageDimensions(file));
    return containImage(dimensions.get(file),xy(frame));
  }
  pptx.defineLayout({name:'SOURCE',width:l.canvas.width/96,height:l.canvas.height/96});pptx.layout='SOURCE';
  pptx.author=t.author;pptx.subject='APIOps Cycles partner source kit';pptx.title=deck.title;pptx.lang=deck.language;
  pptx.theme={headFontFace:t.font,bodyFontFace:t.font,lang:deck.language};
  for(let i=0;i<slides.length;i++){
    const s=slides[i],sl=pptx.addSlide(),positions=l.slides[s.id];sl.background={color:color('background')};
    const chrome={...l,...l.pageChrome?.[s.id]};
    function text(value,b,extra={}){sl.addText(value,{...xy(b),fontFace:t.font,fontSize:b.fontSize*.75,bold:!!b.bold,color:color(b.color??'body'),margin:0,valign:'top',paraSpaceAfter:0,...extra});}
    const logo=powerpointImage(localPath(t.logo));sl.addImage({path:logo,...await contained(logo,chrome.logo),altText:t.name+' logo'});
    text(String(i+1).padStart(2,'0'),{...chrome.pageNumber,color:'muted'});
    if(s.title)text(s.title,{...chrome.title,bold:true,color:'heading'});
    for(const e of s.elements){
      const b=positions[e.id];
      if(e.type==='image'){
        const p=powerpointImage(localPath('assets/'+e.asset));
        sl.addImage(e.fit==='cover'
          ? {path:p,...xy(b),sizing:{type:'cover',w:b.w/96,h:b.h/96},altText:e.alt}
          : {path:p,...await contained(p,b),altText:e.alt});
      }else if(e.type==='table'){
        const rows=e.rows.map((row,r)=>row.map((value,c)=>({text:value,options:{bold:(e.header&&r===0)||(e.emphasizeFirstColumn&&c===0),fill:color(r===0&&e.header?'tableHeader':r%2?'tableAlternate':'background')}})));
        sl.addTable(rows,{...xy(b),fontFace:t.font,fontSize:b.fontSize*.75,color:color('body'),colW:b.columnWidths.map(v=>v/96),rowH:b.h/e.rows.length/96,margin:[3,6,3,6],border:{type:'solid',color:color('tableBorder'),pt:.75},valign:'top',autoPage:false,paraSpaceAfter:0});
      }else if(['bullets','numbered'].includes(e.type)){
        const values=e.items.map((value,j)=>({text:value,options:{breakLine:true,bullet:e.type==='numbered'?{type:'number',style:'arabicPeriod',numberStartAt:j+1,indent:22}:{indent:18},hanging:e.type==='numbered'?16:12,paraSpaceAfter:b.spaceAfter}}));
        text(values,b);
      }else{text(e.text,b,e.type==='code'?{fontFace:t.codeFont,lang:'en-US'}:{});}
    }
    text(s.footer??t.footer,chrome.footer??{x:64,y:704,w:1100,h:14,fontSize:12,color:'muted'});
    sl.addNotes(s.notes);
  }
  await pptx.writeFile({fileName:file});
  // PptxGenJS can advertise one slide master per slide while writing only
  // the shared master. Keep content-type overrides aligned with ZIP parts.
  const {default:JSZip}=await dependency('jszip');
  const zip=await JSZip.loadAsync(await fs.readFile(file));
  const contentTypes=await zip.file('[Content_Types].xml').async('string');
  const cleaned=contentTypes.replace(/<Override\b[^>]*PartName="(\/ppt\/slideMasters\/slideMaster\d+\.xml)"[^>]*\/>/g,
    (entry,part)=>zip.file(part.slice(1))?entry:'');
  if(cleaned!==contentTypes){
    zip.file('[Content_Types].xml',cleaned);
    await fs.writeFile(file,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
  }
}
