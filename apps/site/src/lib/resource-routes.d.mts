export interface RoutableResource { slug: string }

export declare const resourceRouteSegment: (resource: RoutableResource) => string;
export declare const resourcePath: (locale: string, resource: RoutableResource) => string;
export declare const canvasCreatorUrl: (locale: string, resource: { canvasId?: string | null }) => string | undefined;
