import {load,options} from './model.mjs';
const o=options();const m=await load(o.brand,o.edition);
console.log(`Validated ${m.slides.length} slides, content references, layouts, assets and theme: ${m.theme.name}`);
