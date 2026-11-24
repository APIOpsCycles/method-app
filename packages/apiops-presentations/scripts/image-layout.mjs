import fs from 'node:fs/promises';

// Read source proportions rather than treating the slide placeholder as the
// image's natural size. Current presentation assets use PNG.
export async function imageDimensions(file){
  const bytes=await fs.readFile(file);
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
  if(file.toLowerCase().endsWith('.svg')){
    const root=bytes.toString('utf8').match(/<svg\b[^>]*>/)?.[0]??'';
    const viewBox=root.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
    const width=viewBox?.[2]??Number(root.match(/\bwidth=["']([\d.]+)(?:px)?["']/)?.[1]);
    const height=viewBox?.[3]??Number(root.match(/\bheight=["']([\d.]+)(?:px)?["']/)?.[1]);
    if(Number.isFinite(width)&&width>0&&Number.isFinite(height)&&height>0)return {width,height};
    throw new Error('SVG requires a valid viewBox or pixel dimensions: '+file);
  }
  throw new Error('Contain sizing requires a PNG or SVG asset: '+file);
}

export function containImage(source,frame){
  const scale=Math.min(frame.w/source.width,frame.h/source.height);
  const w=source.width*scale,h=source.height*scale;
  return {x:frame.x+(frame.w-w)/2,y:frame.y+(frame.h-h)/2,w,h};
}
