# Branch Progress

## Phase 0: Branch Cleanup & Consolidation
- [x] 1. Delete merged branches: `competent-heyrovsky`, `vigorous-panini`
- [x] 2. Delete stale/superseded branches: `hungry-jennings`, `youthful-satoshi`
- [x] 3. Evaluated `peaceful-engelbart`'s redirect removal (none found, conflicts prevented cherry-pick)
- [x] 4. Delete remote abandoned branches: `ful-map-refactoring`, `refactor_attempt1`
- [x] 5. Keep `upbeat-blackwell` as the active development branch

## Phase 1: Data Quality Audit (Manual + Supabase)
- [x] 1a. Review `archaeological_site_yn` values
- [x] 1b. Fix non-country entries
- [x] 1c. Verify redirects work

## Phase 2: Quick Bug Fixes
- [x] 2a. Related sites filter
- [x] 2b. Non-country redirect in prod
- [x] 2c. Timeline verification

## Phase 3: Viator Tour Overhaul
- [ ] 3a. Fix RLS — add public read policy
- [ ] 3b. New sync strategy — attraction-first with tag filtering
- [ ] 3c. New Viator client methods
- [ ] 3d. Nuke and rebuild tour data
- [ ] 3e. Simplify display logic
- [ ] 3f. Graceful "no tours" handling

## Phase 4: Featured Scoring System
- [ ] 4a. Add `featured_score` column and RPC
- [ ] 4b. Update sort logic
- [ ] 4c. Admin button to recalculate

## Phase 5: Country Page Enhancements
- [ ] 5a. Embedded country map
- [ ] 5b. Country-specific text
- [ ] 5c. Country page filters/sorting
- [ ] 5d. SingleSiteMap styling alignment

---
## Implementation Notes

### Phase 1 & 2 Execution Summary (March 2026)
- **Phase 1a**: Auto-flagged 399 sites from `Archaeolist Page Analytics - Dec 25 to Mar 26.csv` setting `archaeological_site_yn = true`.
- **Phase 1b & 1c**: Modified `generateStaticParams` in `[country_slug]/page.tsx` to automatically ignore `NON_COUNTRY_SLUGS`. Added URL-encoded variants (like `apur%C3%ADmac-region`) for regional non-ASCII slugs.
- **Phase 2b**: Added catch-all redirect logic in `middleware.ts` to redirect `/site/:slug` (singular) to plural correct `/sites/:country/:slug` gracefully.
- **Phase 2c**: Fixed `src/lib/dateUtils.ts` century/millennium parsers to handle implicit formats like "10" vs "10th".
- **Critical Database Update (The Redirect Loop Fix)**: A major bug was discovered where NextJS' `next.config.mjs` redirected 'fake' regions (e.g. `cusco-region` -> `peru`), but since the Supabase Database still held `country_slug = cusco-region`, the core `[slug]/page.tsx` site logic tried to dynamically reroute back to `cusco-region`, causing an infinite `<->` redirect loop. 
  - *Resolution*: A Node script (`update_country_slugs.js`) was securely run against Production using `SERVICE_ROLE_KEY` to systematically `UPDATE` all 208 non-country sites matching the `country-redirects.json` mapping. Their `country` and `country_slug` values are permanently set to the verified country equivalents, restoring safe Google Indexing behavior and perfectly aligning DB state with NextJS config.
