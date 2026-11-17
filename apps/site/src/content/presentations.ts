import catalog from '../../../../packages/apiops-presentations/catalog.json';
import {renderRevealSections} from '../../../../packages/apiops-presentations/scripts/reveal-markup.mjs';

type Artifact = {file: string; bytes: number; sha256: string};
type Element = {id: string; type: string; text?: string; items?: string[]; rows?: string[][]; asset?: string; alt?: string; fit?: string};
export type PresentationSlide = {id: string; title: string; elements: Element[]; notes: string};
type SlidePreview = {id: string; title: string; preview: Artifact};
type Release = {version: string; source: Artifact; artifacts: Record<string, Record<string, Artifact>>; slides: Record<string, SlidePreview[]>};
export const presentationCatalog = catalog;
export const presentationEditions = catalog.editions;
export type PresentationEdition = typeof presentationEditions[number];
const releases=import.meta.glob('../../../../packages/apiops-presentations/releases/*/manifest.json',{eager:true,import:'default'});
const releasedContent=import.meta.glob('../../../../packages/apiops-presentations/releases/*/*/content.json',{eager:true,import:'default'});
export const presentationRelease = releases[`../../../../packages/apiops-presentations/releases/${catalog.version}/manifest.json`] as Release;
if(!presentationRelease)throw new Error(`Missing presentation release ${catalog.version}`);
for(const edition of presentationEditions){
 const content=releasedContent[`../../../../packages/apiops-presentations/releases/${catalog.version}/${edition.id}/content.json`] as {slides?:unknown[]} | undefined;
 if(!content?.slides || content.slides.length!==edition.slideCount || !presentationRelease.artifacts[edition.id]?.content || presentationRelease.slides[edition.id]?.length!==edition.slideCount){
  throw new Error(`Incomplete presentation release ${catalog.version}: ${edition.id}. Keep unreleased editions out of catalog.json until a complete reviewed release is prepared.`);
 }
}
export const presentationPath = (id: string) => `/presentations/${id}`;
export const artifactUrl = (artifact: Artifact) => `/presentations/${catalog.version}/${artifact.file}`;
export const fileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes/1024)} KB` : `${(bytes/1024/1024).toFixed(1)} MB`;
export function getPresentationMarkup(id: string): string {
  const model=releasedContent[`../../../../packages/apiops-presentations/releases/${catalog.version}/${id}/content.json`];
  return renderRevealSections(model,`/presentations/${catalog.version}/assets/`);
}
export function getPresentationSlides(id: string): PresentationSlide[] {
  const edition = releasedContent[`../../../../packages/apiops-presentations/releases/${catalog.version}/${id}/content.json`] as {slides:PresentationSlide[]};
  return edition.slides;
}
export const slideTitle = (slide: PresentationSlide) => slide.title || slide.elements.find(e => e.type === 'text')?.text || slide.id;
export const previewFor = (id: string, index = 0) => artifactUrl(presentationRelease.slides[id][index].preview);
export const downloadsFor = (id: string) => presentationRelease.artifacts[id];
