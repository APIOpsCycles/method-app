import manifest from "../metadata/assets.json" with { type: "json" };

export type DesignSystemAssetKind = "brand" | "favicon" | "glyph" | "human" | "icon";

export type DesignSystemAssetMetadata = {
  path: string;
  kind: DesignSystemAssetKind;
  tags: string[];
};

export type DesignSystemAssetManifest = {
  schemaVersion: number;
  assets: DesignSystemAssetMetadata[];
};

/** Public mount point populated by the package's asset sync script. */
export const designSystemAssetBasePath = "/design-system" as const;

/** Build a public URL without duplicating the package mount convention in an app. */
export function designSystemAssetPath(path: string): string {
  return `${designSystemAssetBasePath}/${path.replace(/^\/+/, "")}`;
}

/** Package-owned inventory for asset browsers, validation, and discovery. */
export const designSystemAssetManifest = manifest as DesignSystemAssetManifest;

export const designSystemAssets = {
  brand: {
    cyclesLogo: designSystemAssetPath("brand/apiops-cycles-logo.svg"),
    cyclesLogoDark: designSystemAssetPath("brand/apiops-cycles-logo-dark.svg"),
    cyclesLogoWhite: designSystemAssetPath("brand/apiops-cycles-logo-white.svg"),
  },
  favicon: designSystemAssetPath("favicons/favicon.svg"),
  icons: {
    method: designSystemAssetPath("icons/apiops-iconset.svg"),
    metro: designSystemAssetPath("icons/apiops-metro-icons.svg"),
  },
  humans: {
    poses: designSystemAssetPath("humans/apiops-stick-figures-poses.svg"),
    stories: designSystemAssetPath("humans/apiops-stick-figures-stories.svg"),
  },
} as const;
