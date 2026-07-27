import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layoutSource = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
const islandSource = readFileSync(new URL("../src/components/islands/SiteAnnouncement.tsx", import.meta.url), "utf8");

test("the shared layout mounts the localized announcement on every public page", () => {
  assert.match(layoutSource, /announcement\.translations\[locale\]/);
  assert.match(layoutSource, /<SiteAnnouncement/);
  assert.match(layoutSource, /client:load/);
});

test("the announcement delays display and persists dismissal by announcement ID", () => {
  assert.match(islandSource, /delay = 3000/);
  assert.match(islandSource, /localStorage\.getItem\(id\) === "dismissed"/);
  assert.match(islandSource, /localStorage\.setItem\(id, "dismissed"\)/);
  assert.match(islandSource, /<AnnouncementToast/);
});
