import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePresentationRelease} from './presentation-release.mjs';
const catalog={version:'1.0.0',editions:[{id:'example',slideCount:1}]};
const release={version:'1.0.0',artifacts:{example:{content:{file:'example/content.json'}}},slides:{example:[{}]}};
test('complete released content is accepted',()=>{
 assert.doesNotThrow(()=>validatePresentationRelease(catalog,release,()=>({slides:[{}]})));
});
test('an unreleased catalogue entry fails with the edition and recovery guidance',()=>{
 const changed={...catalog,editions:[...catalog.editions,{id:'unreleased',slideCount:1}]};
 assert.throws(()=>validatePresentationRelease(changed,release,()=>({slides:[{}]})),/unreleased.*Keep unreleased editions/);
});
test('missing and truncated content are rejected',()=>{
 for(const content of [undefined,{}, {slides:[]}])assert.throws(()=>validatePresentationRelease(catalog,release,()=>content),/Missing or incomplete presentation content/);
});
test('missing previews are rejected',()=>{
 assert.throws(()=>validatePresentationRelease(catalog,{...release,slides:{}},()=>({slides:[{}]})),/Incomplete presentation release/);
});
