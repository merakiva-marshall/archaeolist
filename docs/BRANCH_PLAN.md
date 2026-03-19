# Archaeolist Branch Improvement Plan

> This is the working plan for the current development branch. It covers all pending items before merging back to main.

## Context
The project has accumulated ~16 improvement items spanning data quality, UI, maps, filtering, Viator integration, and redirects. There are also several unmerged `claude/*` branches with overlapping work that need consolidation. This plan organizes all items into a logical execution order with dependencies.

---

## Phase 0: Branch Cleanup & Consolidation
**Goal**: Merge useful work from existing branches, delete stale ones.

**Branch assessment:**
- `claude/competent-heyrovsky` + `claude/vigorous-panini` — already merged to main, safe to delete
- `claude/peaceful-engelbart` (1 commit) — performance improvements, removed `country-redirects.json` + 208 static redirects. **Risky** — verify dynamic redirects cover all cases first
- `claude/upbeat-blackwell` (5 commits) — **THIS BRANCH** — data integrity filtering (NON_COUNTRY_SLUGS), timeline fixes, new redirects, welcome popup cleanup
- `claude/youthful-satoshi` (4 commits) — subset of upbeat-blackwell
- `claude/hungry-jennings` (1 commit) — overlaps with main
- Remote-only `origin/ful-map-refactoring` + `origin/refactor_attempt1` — abandoned

**Steps:**
1. Delete merged branches: `competent-heyrovsky`, `vigorous-panini`
2. Merge `upbeat-blackwell` (this branch) onto main
3. Evaluate `peaceful-engelbart`'s redirect removal — only merge if dynamic redirects fully cover the 208 static cases
4. Delete `hungry-jennings`, `youthful-satoshi` (subsets)
5. Delete remote `ful-map-refactoring` and `refactor_attempt1`

---

## Phase 1: Data Quality Audit (Manual + Supabase)
**Goal**: Fix the foundation before building features on top.

### 1a. Review `archaeological_site_yn` values
- Query Supabase for `archaeological_site_yn = false` sites — review which are actually real
- Cross-reference with Google Analytics top pages
- Anything with real traffic → flag as `archaeological_site_yn = true`
- Automated: script to match analytics URLs to site slugs

### 1b. Fix non-country entries
- Already handled on this branch (NON_COUNTRY_SLUGS filter using `country-redirects.json`)
- Verify after merge: countries page should not show "Cuzco Area", "Aleppo Governorate", etc.
- Also check `generateStaticParams` in `[country_slug]/page.tsx`

### 1c. Verify redirects work
- Test the 208 static redirects in `next.config.mjs`
- Test non-ASCII redirects (e.g., `apurímac-region`) — may fail on URL-encoded paths
- Dynamic redirect in `[slug]/page.tsx` lines 131-146 covers remaining cases

---

## Phase 2: Quick Bug Fixes
**Goal**: Small targeted fixes, high impact.

### 2a. Related sites filter
- `/src/app/sites/[country_slug]/[slug]/page.tsx` line 151-156: add `.eq('archaeological_site_yn', true)` to related sites query
- **One-line fix**

### 2b. Non-country redirect in prod
- Audit `next.config.mjs` for non-ASCII characters that may not match URL-encoded paths
- Add URL-encoded variants or move to middleware
- **Files:** `next.config.mjs`, possibly `src/middleware.ts`

### 2c. Timeline verification
- Test `SiteTimeline.tsx` + `dateUtils.ts` with real site data
- Timeline fixes already on this branch — verify edge cases: empty dates, malformed centuries, mixed array/string descriptions
- **Files:** `src/components/SiteTimeline.tsx`, `src/lib/dateUtils.ts`

---

## Phase 3: Viator Tour Overhaul
**Goal**: Fundamentally fix why tours don't show up. Multi-layered problem.

### Supabase Data Findings (verified 2026-03-19):
- **22,291 tour rows** exist in `viator_tours` (but only **4,272 unique tours**)
- **3,410 destinations** cached in `viator_destinations`
- **2,757 sites** have linked tours; **2,743** marked `synced_found`
- **3,978 sites** marked `no_dest_100km` (57% of all sites — no Viator destination within 100km)
- **155 sites** still `pending`, **43** `synced_no_tours`, **1** `skipped_no_coords`

### Root Cause (4 layers of failure):

**Layer 1 (MAIN BLOCKER) — RLS blocks all frontend reads**
- `viator_tours` and `viator_destinations` have RLS enabled with ONLY an admin policy (`admin@archaeolist.com`)
- The site detail page reads tours with the **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `anon` role sees **0 tours**. Every single page shows zero tours because of this.
- The 22,291 tours in the DB are completely invisible to visitors.

**Layer 2 — Synced tours are mostly irrelevant to the sites they're linked to**
- "Pompeii" → "Private Transfer from Positano to Rome" (not a Pompeii tour)
- "Machu Picchu" → "Humantay Lagoon" tours (nearby attraction, not Machu Picchu)
- Archaeological sites in Massachusetts → "Whale Watching Tour in Gloucester"
- The sync searches Viator by site name within nearest destination, but gets whatever's popular in that region

**Layer 3 — Massive duplication: generic tours linked to hundreds of sites**
- One tour ("Best of the Holyland") linked to **152 different sites**
- **557 tours** are each linked to **10+ different sites** — region-wide generic tours, not site-specific
- 22,291 total rows but only 4,272 unique tours (5.2x duplication ratio)

**Layer 4 — Display-side keyword filter kills remaining tours**
- Even if RLS were fixed, keyword matching filters out tours where the site name doesn't appear in tour title
- "Private Transfer from Positano" filtered out for Pompeii because "Pompeii" isn't in the title
- Stop words remove "great", "park", "complex" — breaks matching for many sites

### Additional Data Findings:
- Only **23 sites** have tours where the exact site name appears in the tour title
- Only **129 sites** have tours where any meaningful keyword matches — **4.7% relevance rate**
- Pompeii has its own Viator destination (0.4km away), yet got "Private Transfer from Positano to Rome"
- The API sorts by **PRICE DESCENDING**, returning the most expensive (private transfers, multi-day packages) first
- Most archaeological sites simply don't have dedicated Viator tours — the best we can offer is quality tours in the area

### Why the current approach fundamentally can't work:
The Viator `/products/search` API `text` filter does a full-text search across tour descriptions (not just titles). Combined with `sort: PRICE DESC` and `count: 10`, we get the 10 most expensive tours that vaguely mention the site name somewhere in their description — which are private transfers and multi-day packages, not actual archaeological tours.

Even fixing the sort and increasing count won't help for most sites. "Suburban Baths of Pompeii" will never have a dedicated Viator tour. The fundamental mismatch: we have ~5,500 granular archaeological sites but Viator has tours at the city/region level, not the individual-site level.

### Fix Plan — New Architecture:

**3a. Fix RLS — add public read policy** (required regardless)
- `CREATE POLICY "Public read" ON viator_tours FOR SELECT USING (true);`
- Same for `viator_destinations`
- No security concern — tour data is all public Viator catalog info

**3b. Completely rethink the sync strategy** (`/src/lib/viator/client.ts`, `/src/lib/viator/sync.ts`)
New approach:
1. **Search by destination WITHOUT text filter** — get the broadly popular tours in the area
2. **Sort by TRAVELER_RATING or REVIEW_AVG_RATING** instead of PRICE DESC
3. **Fetch 50 results** per destination instead of 10
4. **Post-filter for relevance**: score each tour based on whether title/description contains:
   - The site name (highest weight)
   - Archaeological/historical keywords ("archaeological", "ruins", "ancient", "historical", "heritage", "excavation", "temple", "tomb")
   - The country name
5. **Store a `relevance_score`** on each `viator_tours` row so the frontend can sort by it
6. **Don't link one tour to hundreds of sites** — if a tour has no site-specific keywords, only link to the ~3 nearest sites within a destination, not all of them

**3c. Nuke and rebuild tour data**
- Truncate `viator_tours` — current data is 95% irrelevant
- Re-run sync with new logic
- Add `relevance_score` column to `viator_tours` table

**3d. Simplify display logic** (`/src/app/sites/[country_slug]/[slug]/page.tsx`)
- Remove keyword matching entirely
- Query tours ordered by `relevance_score DESC, review_count DESC`
- Only show tours with `relevance_score > 0` OR `review_count >= 10`
- Keep Bayesian scoring only as a tiebreaker
- Remove debug console.logs (lines 216-226)

**3e. Graceful "no tours" handling**
- For sites with no relevant tours, don't show the section (already works)
- Consider a fallback: "Explore tours near {country}" linking to Viator's destination page with our affiliate link

**Files:** `/src/lib/viator/client.ts`, `/src/lib/viator/sync.ts`, `/src/app/sites/[country_slug]/[slug]/page.tsx`
**Supabase:** Add RLS read policy, add `relevance_score` column, truncate + re-sync tour data

---

## Phase 4: Featured Scoring System
**Goal**: Completeness-based score + manual override.

**Two-part system:**
1. `featured_score` (int 0-100) — auto-calculated from field completeness. Photos weighted highest.
2. `featured` (bool, existing) — manual override, always promotes if true.

**Scoring (photos heaviest):**
| Factor | Points |
|--------|--------|
| 3+ images | 25 |
| 1-2 images | 15 |
| description >200 chars | 10 |
| short_description | 5 |
| processed_periods | 10 |
| processed_features | 10 |
| timeline entries | 10 |
| FAQs | 5 |
| UNESCO | 5 |
| wikipedia_url | 5 |
| valid location | 5 |
| linked Viator tours | 10 |

**Implementation:**
1. Add `featured_score integer DEFAULT 0` column
2. Supabase RPC `recalculate_featured_scores()` — manual trigger
3. Sort: `order('featured', desc).order('featured_score', desc)`
4. Admin button to recalculate

**Files:** `src/lib/sites.ts`, `src/components/FeaturedSites.tsx`, `src/types/site.ts`

---

## Phase 5: Country Page Enhancements
**Goal**: Richer country pages with map, text, filtering.

### 5a. Embedded country map
- New `/src/components/CountryMap.tsx` — client, dynamic import (no SSR)
- `mapboxgl.LngLatBounds` to fit all markers
- **Must match homepage map style**: same Mapbox style, custom `archaeological-site` marker, symbol layer from `mapLayers.ts`, dynamic zoom scaling
- Add `location` to `getCountryInfo` query (currently missing)
- Place between header and stats cards

### 5b. Country-specific text
- `country_info` Supabase table: `country_slug` (PK), `country_name`, `description`
- AI generates descriptions for all countries, stored in Supabase
- Fallback to generic text if no entry

### 5c. Country page filters/sorting
- Reuse `AllSitesClient.tsx` with optional `countrySlug` prop, or extract filter UI
- Country page: server fetch → client component with filters

### 5d. SingleSiteMap styling alignment
- Replace default Mapbox teardrop marker with custom `archaeological-site` icon
- Use GeoJSON source + symbol layer from `mapLayers.ts`
- **Files:** `src/components/SingleSiteMap.tsx`

---

## Execution Order

```
Phase 0 (Branch Cleanup)           ← DO FIRST
  ↓
Phase 1 (Data Quality Audit)       ← Foundation
  ↓
Phase 2 (Quick Bug Fixes)          ← Ship fast
  ↓
  ├── Phase 3 (Viator Overhaul)    ← Independent
  ├── Phase 4 (Featured Scoring)   ← Independent
  └── Phase 5 (Country Pages)      ← Independent
```

**Deferred to next branch:** Map viewport-based loading + spatial queries + map filters.

---

## Verification
- Phase 0: `npm run build` succeeds, stale branches deleted
- Phase 1: Countries page clean, analytics top pages resolve
- Phase 2: Related sites filtered, redirects work, timeline renders
- Phase 3: Tours appear on previously-empty site pages
- Phase 4: Homepage featured shows data-rich sites
- Phase 5: Country maps, descriptions, filters all work
- Full: `npm run build` + spot-check key pages in preview
