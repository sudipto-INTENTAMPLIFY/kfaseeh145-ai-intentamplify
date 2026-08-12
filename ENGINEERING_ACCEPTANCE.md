# Intent Amplify — Engineering Acceptance Contract

## Release state

This branch is a **staging implementation candidate**, not a production release.

## Implemented in code

- React frontend routes: `/`, `/solutions`, `/how-it-works`, `/resources`, `/about`, `/contact`, `/privacy`, catch-all 404.
- Responsive navigation/layout and reduced-motion handling.
- Accessible skip link, semantic controls, labels, focus states and error status.
- Contact form validation and same-origin `/api/contact` submission.
- API validation, bounded message input and optional server-side CRM webhook handoff.
- UTM persistence for source, medium, campaign, term and content.
- Consent gate for optional analytics events.
- `dataLayer` event contract: `page_view`, `cta_click`, `form_submit`, `form_success`, `form_error`, `consent_granted`.
- SEO shell, canonical URL, robots and sitemap.
- Security headers/CSP for the documented Vercel-compatible staging path.
- SPA rewrite plus application-level 404.
- Environment-variable boundary for CRM and analytics IDs.

## Deliberately not claimed

- No production deployment.
- No staging URL until an authoritative hosting integration produces one.
- No live GA4/GTM verification until IDs/container and staging network evidence are available.
- No live CRM write verification. `CRM_WEBHOOK_URL` is intentionally optional; missing configuration prevents external CRM writes.
- No MQL, SQL or Opportunity creation logic exists in this website.
- No pricing publication; commercial treatment remains Custom.

## Required staging acceptance tests

1. Install dependencies and run `npm run build` with zero errors.
2. Deploy this branch to the approved staging provider only.
3. Exercise every route at desktop and mobile breakpoints.
4. Verify unknown route renders 404 and direct-route refresh succeeds.
5. Verify consent declined => no optional analytics events.
6. Verify consent granted => expected `dataLayer` events and configured GA4/GTM delivery.
7. Verify UTM parameters persist through navigation and are attached to form payload.
8. Verify invalid and oversized form submissions return 400.
9. Verify valid form returns 202 and only the approved CRM endpoint receives it.
10. Verify CSP/security headers in staging response.
11. Run accessibility, performance and SEO audits and record results.
12. Record staging deployment identifier and rollback target before promotion.

## Rollback

Promote only via reviewed commit/PR. Rollback by redeploying the last accepted staging/production commit; never mutate CRM or analytics state as part of website rollback.
