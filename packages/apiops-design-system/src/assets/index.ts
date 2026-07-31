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

/** Default public mount point used by the package asset-copy CLI. */
export const designSystemAssetBasePath = "/design-system" as const;

/** Build a public URL. Consumers deployed below an origin root can supply their own base path. */
export function designSystemAssetPath(path: string, basePath: string = designSystemAssetBasePath): string {
  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** Create the named asset inventory for a consumer-controlled public mount point. */
export function createDesignSystemAssets(basePath: string = designSystemAssetBasePath) {
  const assetPath = (path: string) => designSystemAssetPath(path, basePath);
  return {
    brand: {
      cyclesLogo: assetPath("brand/apiops-cycles-logo.svg"),
      cyclesLogoDark: assetPath("brand/apiops-cycles-logo-dark.svg"),
      cyclesLogoWhite: assetPath("brand/apiops-cycles-logo-white.svg"),
    },
    favicon: assetPath("favicons/favicon.svg"),
    icons: {
      characterNotation: assetPath("icons/apiops-character-notation.svg"),
      method: assetPath("icons/apiops-iconset.svg"),
      metro: assetPath("icons/apiops-metro-icons.svg"),
    },
    humans: {
      characterScenes: assetPath("humans/apiops-character-scenes.svg"),
      scarfAmazed: assetPath("humans/pose-with-scarf-amazed.svg"),
      scarfAnnouncing: assetPath("humans/pose-with-scarf-announcing.svg"),
      scarfCelebrating: assetPath("humans/pose-with-scarf-dancing.svg"),
      scarfHolding: assetPath("humans/pose-with-scarf-holding.svg"),
      scarfHoldingAi: assetPath("humans/pose-with-scarf-holding-AI.svg"),
      scarfHoldingBox: assetPath("humans/pose-with-scarf-holding-box.svg"),
      scarfHoldingComputer: assetPath("humans/pose-with-scarf-holding-computer.svg"),
      scarfHoldingInterface: assetPath("humans/pose-with-scarf-holding-interface.svg"),
      scarfListening: assetPath("humans/pose-with-scarf-listening.svg"),
      scarfPresenting: assetPath("humans/pose-with-scarf-presenting.svg"),
      scarfStanding: assetPath("humans/pose-with-scarf-standing.svg"),
      scarfThinking: assetPath("humans/pose-with-scarf-thinking.svg"),
      scarfWalking: assetPath("humans/pose-with-scarf-walking.svg"),
      poses: assetPath("humans/apiops-stick-figures-poses.svg"),
      stories: assetPath("humans/apiops-stick-figures-stories.svg"),
    },
  } as const;
}

/** Package-owned inventory for asset browsers, validation, and discovery. */
export const designSystemAssetManifest = manifest as DesignSystemAssetManifest;

export const designSystemAssets = createDesignSystemAssets();
