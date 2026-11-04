# 1. overview-cover

Introduction to the APIOps Cycles method. The supplier-payment examples in this edition are fictional illustrations. Method and canvas attribution is preserved in the relevant slides.

# 2. APIOps Cycles connects decisions across the lifecycle

APIOps introduction. Technical continuation is illustrative; no client implementation or measured improvement is claimed.

The cycle catalog provides these four views over shared stations, resource guidance and readiness criteria. This deck follows the API Productization Cycle. Case-study statements derive from the supplied anonymised Word document. The supplier-payment canvases and subsequent technical decisions are illustrative.

Sources checked 3 November 2026:
src/data/method/cycles.json
src/lib/method-engine.js

# 3. API Productization Cycle metro map

Source: Australian_Financial_Services_APIOps_Cycles_Case_Study (1).docx, supplied by the user. Client anonymised. Engagement by APIsFirst with partner Osaango. Benefits are qualitative; no quantified delivery or business impact is claimed.

Canonical API Productization Cycle map exported through the local repository application at /cycles/api-productization-cycle/ using Export SVG. Public reference: https://apiopscycles.com/cycles/api-productization-cycle/ . Supporting lines cover business opportunities, platform architecture, design, delivery, publishing and adoption, and operating model. The map is a method overview, not evidence that every station was completed during the engagement.

# 4. Customer Journey Canvas: a supplier payment

Source: Australian_Financial_Services_APIOps_Cycles_Case_Study (1).docx, supplied by the user. Client anonymised. Engagement by APIsFirst with partner Osaango. Benefits are qualitative; no quantified delivery or business impact is claimed.

Newly authored fictional example for this case study: a small business owner pays a supplier invoice through a partner portal. The supplied real example set informed only the method of connecting customer tasks, pains, gains and API capabilities. No source screenshot, wording, institution, system identifier, endpoint, number or product name has been reused. Unclear status and duplicate-payment concern are illustrative hypotheses, not measured client findings. Template source: local apiops-cycles-method-data, customerJourneyCanvas. https://apiopscycles.com/resources/customer-journey-canvas/ . Template by APIOps Cycles and Osaango Ltd, CC-BY-SA 4.0. Importable example JSON: assets/illustrative_supplier_payment_customerJourneyCanvas_en.json.

# 5. API Value Proposition Canvas: the same journey

Source: Australian_Financial_Services_APIOps_Cycles_Case_Study (1).docx, supplied by the user. Client anonymised. Engagement by APIsFirst with partner Osaango. Benefits are qualitative; no quantified delivery or business impact is claimed.

The fictional example continues exactly the same five customer tasks as the preceding Customer Journey Canvas. Proposed gain-enabling features: status visibility, a receipt ID and notification of the final result. Proposed pain-relieving features: checking payee details, preventing repeat submissions and explaining failed payments. The four API product names are illustrative candidates, not actual client systems, delivered APIs or verified product boundaries. All canvas notes were authored afresh. No reference screenshots or client-specific details are embedded. Template source: local apiops-cycles-method-data, apiValuePropositionCanvas. https://apiopscycles.com/resources/api-value-proposition-canvas/ . Template by APIOps Cycles, Alexander Osterwalder and Osaango Ltd, CC-BY-SA 4.0. Importable example JSON: assets/illustrative_supplier_payment_apiValuePropositionCanvas_en.json.

# 6. Architecture: business needs become operating decisions

APIOps introduction. Technical continuation is illustrative; no client implementation or measured improvement is claimed.

Canonical API Platform Architecture resources and the API Design entry criteria require validated architecture and shared conventions. Canvas contents inform decisions; they do not prescribe a vendor or deployment topology.

Sources checked 3 November 2026:
method-engine: buildStationResourceData(api-platform-architecture), buildStartData(en, api-productization-cycle)

# 7. Building with AI works best as a bounded change

APIOps introduction. Technical continuation is illustrative; no client implementation or measured improvement is claimed.

Recommended iterative working pattern. The validated contract, domain rules, architecture decisions and critical journeys constrain the implementation. The example task is illustrative. AI output requires review and execution of meaningful tests. Source guidance explicitly connects delivery with prior method outputs. Visual generated with the built-in image generation tool using the APIOps scarf-human style; conceptual, not a client workshop photograph.

Sources checked 3 November 2026:
src/snippets/api-design-principles-guidance.md
packages/create-apiops/template/AGENTS.md

# 8. A first working cycle

APIOps introduction. Technical continuation is illustrative; no client implementation or measured improvement is claimed.

Suggested introduction-to-practice sequence. Sources reviewed include the supplied anonymised Word case study, the previously prepared strategy case deck, installed apiops-cycles-method-data 4.2.1, create-apiops 1.1.4 template and initializer, and the matching local method-data repository. Technical examples and AI workflow recommendations are newly authored illustrative continuations. The case benefits remain qualitative. The local scaffold was generated with --no-install, so no live payment service, Spectral run or runtime test outcome is claimed.

Sources checked 3 November 2026:
https://apiopscycles.com/
https://github.com/APIOpsCycles/apiops-cycles-method-data
packages/create-apiops/README.md
src/lib/method-engine.js
