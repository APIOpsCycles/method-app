import path from 'node:path';
import {dependency,localPath} from './model.mjs';
export async function exportPptx(model,file){
  const mod=await dependency('pptxgenjs');
  const PptxGenJS=mod.default?.default??mod.default;
  const pptx=new PptxGenJS();
  const {deck,slides,layouts:l,theme:t}=model;
  const color=token=>(t.colors[token]??t.colors.body).slice(1);
  const xy=b=>({x:b.x/96,y:b.y/96,w:b.w/96,h:b.h/96});
  pptx.defineLayout({name:'SOURCE',width:l.canvas.width/96,height:l.canvas.height/96});pptx.layout='SOURCE';
  pptx.author=t.author;pptx.subject='APIOps Cycles partner source kit';pptx.title=deck.title;pptx.lang=deck.language;
  pptx.theme={headFontFace:t.font,bodyFontFace:t.font,lang:deck.language};
  for(let i=0;i<slides.length;i++){
    const s=slides[i],sl=pptx.addSlide(),positions=l.slides[s.id];sl.background={color:color('background')};
    function text(value,b,extra={}){sl.addText(value,{...xy(b),fontFace:t.font,fontSize:b.fontSize*.75,bold:!!b.bold,color:color(b.color??'body'),margin:0,valign:'top',paraSpaceAfter:0,...extra});}
    const logo=localPath(t.logo);sl.addImage({path:logo,...xy(l.logo),sizing:{type:'contain',w:l.logo.w/96,h:l.logo.h/96},altText:t.name+' logo'});
    text(String(i+1).padStart(2,'0'),{...l.pageNumber,color:'muted'});
    if(s.title)text(s.title,{...l.title,bold:true,color:'heading'});
    for(const e of s.elements){
      const b=positions[e.id];
      if(e.type==='image'){
        const p=localPath('assets/'+e.asset);
        sl.addImage({path:p,...xy(b),sizing:{type:e.fit==='cover'?'cover':'contain',w:b.w/96,h:b.h/96},altText:e.alt});
      }else if(e.type==='table'){
        const rows=e.rows.map((row,r)=>row.map((value,c)=>({text:value,options:{bold:(e.header&&r===0)||(e.emphasizeFirstColumn&&c===0),fill:color(r===0&&e.header?'tableHeader':r%2?'tableAlternate':'background')}})));
        sl.addTable(rows,{...xy(b),fontFace:t.font,fontSize:b.fontSize*.75,color:color('body'),colW:b.columnWidths.map(v=>v/96),rowH:b.h/e.rows.length/96,margin:[3,6,3,6],border:{type:'solid',color:color('tableBorder'),pt:.75},valign:'top',autoPage:false,paraSpaceAfter:0});
      }else if(['bullets','numbered'].includes(e.type)){
        const values=e.items.map((value,j)=>({text:value,options:{breakLine:true,bullet:e.type==='numbered'?{type:'number',style:'arabicPeriod',numberStartAt:j+1,indent:22}:{indent:18},hanging:e.type==='numbered'?16:12,paraSpaceAfter:b.spaceAfter}}));
        text(values,b);
      }else{text(e.text,b,e.type==='code'?{fontFace:t.codeFont,lang:'en-US'}:{});}
    }
    text(t.footer,{x:64,y:704,w:1100,h:14,fontSize:12,color:'muted'});
    sl.addNotes(s.notes);
  }
  await pptx.writeFile({fileName:file});
}
