// Shared, framework-independent HTML renderer for the website and portable Reveal.js export.
export const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const box=b=>`left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px;`;
const titleOf=s=>s.title||s.elements.find(e=>e.type==='text')?.text||s.id;
export function renderRevealSections(model,assetBase='assets/'){
 const {slides,layouts:l,theme:t}=model;
 const image=(file,b,alt,fit='contain')=>`<img class="apiops-slide-item apiops-slide-image" style="${box(b)}object-fit:${fit}" src="${escapeHtml(assetBase+file)}" alt="${escapeHtml(alt)}" loading="lazy">`;
 const text=(value,b,type='text')=>`<${type==='code'?'pre':'p'} class="apiops-slide-item apiops-slide-${type}" style="${box(b)}font-size:${b.fontSize}px;font-weight:${b.bold?'700':'400'};color:${t.colors[b.color??'body']}">${escapeHtml(value)}</${type==='code'?'pre':'p'}>`;
 return slides.map((s,i)=>{
  const positions=l.slides[s.id];
  const vars=`--apiops-slide-font:${JSON.stringify(t.font)};--apiops-code-font:${JSON.stringify(t.codeFont)};--apiops-slide-body:${t.colors.body};--apiops-table-border:${t.colors.tableBorder};--apiops-table-header:${t.colors.tableHeader};--apiops-table-alternate:${t.colors.tableAlternate};background:${t.colors.background};`;
  let content=image(t.logo.replace(/^assets\//,''),l.logo,t.name+' logo')+text(String(i+1).padStart(2,'0'),{...l.pageNumber,color:'muted'});
  if(s.title)content+=text(s.title,{...l.title,bold:true,color:'heading'});
  for(const e of s.elements){
   const b=positions[e.id];
   if(e.type==='image')content+=image(e.asset,b,e.alt,e.fit);
   else if(e.type==='table')content+=`<div class="apiops-slide-item" style="${box(b)}font-size:${b.fontSize}px"><table class="apiops-slide-table" style="height:100%"><colgroup>${b.columnWidths.map(w=>`<col style="width:${w}px">`).join('')}</colgroup>${e.rows.map((row,r)=>`<tr style="height:${b.h/e.rows.length}px">${row.map((value,c)=>`<${r===0&&e.header?'th':'td'} style="font-weight:${r===0&&e.header||c===0&&e.emphasizeFirstColumn?'700':'400'}">${escapeHtml(value)}</${r===0&&e.header?'th':'td'}>`).join('')}</tr>`).join('')}</table></div>`;
   else if(e.type==='bullets'||e.type==='numbered'){
    const tag=e.type==='numbered'?'ol':'ul';
    content+=`<${tag} class="apiops-slide-item apiops-slide-list" style="${box(b)}font-size:${b.fontSize}px;--apiops-list-space:${b.spaceAfter}px">${e.items.map(value=>{
     const prefix=e.emphasis?.find(p=>value.startsWith(p));
     return `<li>${prefix?`<strong>${escapeHtml(prefix)}</strong>${escapeHtml(value.slice(prefix.length))}`:escapeHtml(value)}</li>`;
    }).join('')}</${tag}>`;
   }else content+=text(e.text,b,e.type);
  }
  content+=text(t.footer,{x:64,y:704,w:1100,h:14,fontSize:12,color:'muted'});
  return `<section id="slide-${i+1}" data-slide aria-label="Slide ${i+1}: ${escapeHtml(titleOf(s))}"><div class="apiops-slide-canvas" style="${escapeHtml(vars)}">${content}</div><aside class="notes">${escapeHtml(s.notes)}</aside></section>`;
 }).join('\n');
}
