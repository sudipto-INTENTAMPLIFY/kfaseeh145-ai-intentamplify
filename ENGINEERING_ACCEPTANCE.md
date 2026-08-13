# Intent Amplify — Staging Acceptance Evidence

Status vocabulary: VERIFIED / SIGNAL / ASSUMPTION / UNKNOWN / CONFLICT / QUARANTINED.

## Scope
Branch: `agent/intent-amplify-staging`. Production merge, production DNS and production publish are prohibited.

## Canonical corrections
- VERIFIED in source: commercial tiers are Discover → Activate → Accelerate → Enterprise, progressively composed.
- VERIFIED in source: global primary CTA `Build Your GTM Stack`; secondary `Book Strategy Session`.
- VERIFIED in source: web behavior never creates MQL, SQL or Opportunity.
- VERIFIED in source: unsupported price, ROI, performance, customer and security proof is absent/quarantined.

## Analytics
- SIGNAL pending deployed DebugView: consent-gated `route_view`, `nav_click`, `cta_click`, form events.
- VERIFIED in source: event ID/version/timestamp, consent state, session/anonymous references, source system, conversion acknowledgement and CRM handoff status.
- VERIFIED in source: first-touch and current-touch UTM/ad-ID storage are separate; first touch is not overwritten.
- VERIFIED in source: no form PII is intentionally emitted to analytics.

## Forms / CRM
- VERIFIED in source: staging endpoint validates required fields, email, honeypot and simple rate limiting.
- VERIFIED connector readback 2026-08-13: SuiteCRM v4.1 authenticated; approved modules include Leads, Contacts, Accounts, Opportunities.
- VERIFIED isolation: staging endpoint does not write CRM and returns `crm_handoff_status=isolated_staging`.
- QUARANTINED: MQL/SAL/SQL automation until authoritative RevOps definitions, field APIs, source precedence and routing rules exist.

## SEO / accessibility / security
- VERIFIED in source: staging `noindex,nofollow,noarchive`, robots Disallow `/`, semantic H1, labels, focus treatment, skip link, reduced-motion support, responsive CSS.
- SIGNAL pending deployed header readback: CSP, frame denial, MIME sniffing prevention, referrer and permissions policy.
- UNKNOWN until automated/browser run: WCAG audit, Core Web Vitals, dependency/secret scan.

## Benchmarks
- Frontal: SIGNAL — compressed hierarchy, restrained dark/light contrast. IMPLEMENTED as pattern only; no copied content/assets.
- Warmly: SIGNAL — direct visitor-to-conversation CTA prominence. IMPLEMENTED through persistent strategy-session and stack CTAs; no identity claims.
- HubSpot pricing: SIGNAL — compare/configure commercial decision support. IMPLEMENTED as progressive stack comparison without copying prices/terms.
- Informa TechTarget: SIGNAL — breadth mapped to buyer jobs. IMPLEMENTED within canonical IA capabilities; unsupported market claims rejected.
- 6sense: SIGNAL — platform/account-intelligence breadth. IMPLEMENTED only as navigation/information-architecture inspiration; superiority claims rejected.

## Rollback
Git history on the staging branch is the immutable rollback record. Pre-correction branch tree SHA: `69240822675622cd17ae3c48b4e76a1f7764a197`. Corrections are separate commits, permitting branch reset/revert without touching main or production. Before production, record the exact deployed staging commit and test a revert to the previous known-good preview.

## Remaining acceptance tests
1. Confirm staging deployment reaches latest branch commit.
2. Browser QA at 360, 390, 430, 768, 1024, 1280 and 1440+.
3. Keyboard/focus and form-state test.
4. POST form success/error/rate-limit test against deployed staging endpoint.
5. GA4/GTM DebugView/Realtime single-fire evidence.
6. UTM first/current touch navigation + form journey test.
7. Consent-before/after tag behavior test.
8. Deployed robots/meta/security-header readback.
9. Lighthouse/CWV and dependency/secret scan.
10. Record deployed commit and rollback test.

No EXECUTION 10/10 or PRODUCTION 10/10 claim is authorized until these tests pass with evidence.
