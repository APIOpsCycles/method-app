import { designSystemAssets } from 'apiops-design-system/assets';

export interface Ad {
  headline: string;
  text: string;
  ctaHref: string;
  ctaText: string;
  visual?: { src: string; alt: string };
  bgcolor?: string; // Optional color for the ad, e.g., `#ff0000` used in border and button background
  /**
   * Optional folder groups that this ad should automatically appear on.
   * Examples: `"getting-started"`, `"de/getting-started"`.
   */
  groups?: string[];
}

interface AdPageEntry {
  id?: string;
}

export const ads: Record<string, Ad> = {
  apiopsWS: {
    headline: 'Accelerate Your APIs with APIOps Cycles Workshop',
    text: 'A compact, high-impact 2-hour online or onsite workshop for API product owners, architects, platform teams, and IT leaders. ',
    ctaHref: 'https://www.osaango.com/services/accelerate-your-apis-with-apiops-cycles/',
    ctaText: 'Learn more',
    visual: {
      src: designSystemAssets.humans.poses,
      alt: 'APIOps people collaborating in a workshop'
    },
    groups: ['resources'],
    bgcolor: '#21ce94ff' // Light background color for the ad
  },
  community: {
    headline: 'Join the APIOps Community',
    text: 'Connect with practitioners and get the latest updates.',
    ctaHref: 'https://apiops.info/',
    ctaText: 'See meetups and more',
    visual: {
      src: designSystemAssets.humans.stories,
      alt: 'APIOps community members sharing ideas'
    },
    groups: ['stations', 'lines'],
        bgcolor: 'var(--color-accent-600)' // Light background color for the ad
  }
};

/**
 * Determine which ad (if any) should be shown for the current page based on
 * the directory groups the page belongs to.
 */
export function selectAd(entry?: AdPageEntry, pathname?: string): Ad | undefined {
  const groups = pageGroups(entry, pathname);
  let best: { ad: Ad; score: number } | undefined;
  let fallback: Ad | undefined;
  for (const ad of Object.values(ads)) {
    if (!ad.groups) {
      fallback ??= ad;
      continue;
    }
    for (const tag of ad.groups) {
      if (groups.includes(tag)) {
        const score = tag.split('/').length;
        if (!best || score > best.score) {
          best = { ad, score };
        }
      }
    }
  }
  return best?.ad ?? fallback;
}

function pageGroups(entry?: AdPageEntry, pathname?: string): string[] {
  let parts: string[] | undefined;
  const id = entry?.id;
  if (id) {
    parts = id.split('/');
    parts.pop(); // remove filename
  } else if (pathname) {
    const trimmed = pathname.replace(/^\/|\/$/g, '');
    if (!trimmed) return [];
    parts = trimmed.split('/');
  } else {
    return [];
  }

  const set = new Set<string>();
  for (let i = 0; i < parts.length; i++) {
    set.add(parts[i]);
    set.add(parts.slice(0, i + 1).join('/'));
  }
  return Array.from(set);
}
