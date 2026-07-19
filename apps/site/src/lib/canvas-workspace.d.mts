export type CanvasWorkspaceNote = { content: string; color: string; size: number };
export type CanvasWorkspaceMetadata = { title: string; owner: string; context: string; date: string };
export function canvasStorageKeys(entityId: string, canvasId: string): { notes: string; metadata: string };
export function createCanvasExport(canvas: any, locale: string, metadata: CanvasWorkspaceMetadata, notes: Record<string, CanvasWorkspaceNote[]>): any;
export function parseCanvasExport(text: string, canvas: any): { notes: Record<string, CanvasWorkspaceNote[]>; metadata?: CanvasWorkspaceMetadata };
