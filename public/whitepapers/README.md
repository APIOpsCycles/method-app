# Reviewed APIOps Cycles publications

These public artifacts back the downloads on `/partners` and the existing localised partner routes. The site build uses these tracked files; it does not require the ignored authoring output directory or regenerate papers.

The two whitepapers, optional companion PDF and companion ZIP are freely downloadable. `manifest.json` records titles, language, page counts, file sizes and SHA-256 hashes. Cover previews are rendered from the actual PDFs. The companion is a resource pack, not a third thought-leadership whitepaper.

To update: rebuild and review the publication PDFs/ZIP in `packages/apiops-presentations/output`, then run `npm run whitepapers:stage`. This explicitly copies the publication editions, renders cover previews with Poppler and updates the manifest. Review and commit the resulting public files together. Ordinary site builds do not run this staging step.

Original content and APIOps artwork: Marjukka Niinioja / Osaango Ltd, CC-BY-SA 4.0. Retain creator attribution on adapted canvases; independently referenced works retain their own terms. Credits and scope are included in the papers and companion README.

The page uses generated method partner data and the existing advertisement system. The partner sync preserves each partner's configured URL; the previous nullish/ternary expression incorrectly replaced every destination with the community homepage. The workshop ad explicitly targets the `partners` group, including localised routes.

Release hold: this branch is for partner feedback. Keep the PR in draft and do not merge or deploy until the publication date is agreed. This is a public repository: files in the PR are publicly readable before merge. A draft PR is not an embargo or a deployment control. Cloudflare preview settings must be managed separately if previews are enabled.

The authoring workspace is maintained separately from this website change. Staging requires that workspace's reviewed source JSON, PDFs, ZIP and illustration; ordinary builds use only these committed downloads.
Set WHITEPAPER_SOURCE_ROOT to the complete authoring kit directory when staging from a separate checkout. Poppler's pdftoppm must be on PATH.
