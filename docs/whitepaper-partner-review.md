# Partners page and whitepaper review

This change is held for partner feedback. Do not merge or deploy until the publication date is agreed. Draft status does not prevent hosting providers from creating previews. This repository and these review files are public.

## Review the publications

- [Paper 1 — What Your AI Depends On](../public/whitepapers/what-your-ai-depends-on.pdf): the consumer experience perspective: why API design matters to people, developers and AI agents.
- [Paper 2 — From API Readiness to Sustainable Quality](../public/whitepapers/from-api-readiness-to-sustainable-quality.pdf): the organisational capability perspective: why API quality findings recur, how evidence becomes decisions and how improvements become sustainable.
- [Optional supporting PDF](../public/whitepapers/practical-assessment-and-improvement-resources.pdf) and [editable resource ZIP](../public/whitepapers/practical-assessment-and-improvement-resources.zip): canvases, evidence mappings and a fictional completed brief.

GitHub's PDF file view offers a download button if an inline preview is unavailable. Paper 2’s revised editable HTML, stylesheet, metro map and three additional editable visuals are in `packages/apiops-presentations/whitepapers`; its standalone build updates the public PDF, cover and manifest. Paper 1 and the supporting pack retain their existing editions. The original separate authoring workspace is not included.

## Focus for feedback

Paper 2 has been rewritten around eight reader questions, with eleven pages including references. Check whether the first two pages establish the problem and contextual readiness before introducing assessment methods; whether the Supplier Payments API provides a coherent running example; and whether ownership and investment explain why technical findings recur. Check whether each paper's audience and practical value are clear; whether the distinction between assessment and improvement is accurate; and whether the start-small guidance preserves the importance of missing strategy and architecture work. Check partner descriptions, destinations and the invitation to start a conversation.

The proposed `/partners` page combines two paper download cards, optional practitioner resources, partner cards and the existing workshop advertisement. It also preserves each partner's actual configured URL instead of redirecting all cards to the community homepage. Localised routes share the English publication descriptions and clearly label the PDFs as English.

## Publication handoff

Resolve partner feedback, agree the release date, then mark the PR ready and merge it through the site's normal deployment process. No merge, production deployment, partner notification or hosting configuration change is part of this review preparation.

Keep the release-validation fix independent: it can be reviewed and merged without releasing these publications.
