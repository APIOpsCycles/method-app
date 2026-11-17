import downloads from '../../../../public/whitepapers/manifest.json';
export const whitepapers = downloads.publications.filter(p => p.id !== 'companion');
export const companion = downloads.publications.find(p => p.id === 'companion')!;
export const resourceBundle = downloads.bundle;
export const downloadSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
