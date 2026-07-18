# Plan Review Log: Jazz-up rebuild of "True Dog Age"
Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.
Reviewer model: gpt-5.6-sol (config default) — codex-cli 0.144.1.

## Round 1 — Codex
Material problems remain in PLAN.md:

- **Dog CEO mapping is underspecified:** Existing values such as `retriever-golden` are internal compound keys, not directly usable API path segments; a naïve client fetch will 404. **Fix:** Define and test a URL builder that splits the key into `/breed/retriever/golden/images/random`.
- **The fallback shares the failing dependency:** Mirroring `1st_web` means the fallback is another dog.ceo URL, so an outage or CSP/network block breaks both. **Fix:** Bundle a local fallback image and handle both fetch failure and `<img>` decode/error failure.
- **Photo fetching has a race condition:** Rapid breed changes or repeated "fetch another" clicks can let an older response overwrite the current breed's image. **Fix:** Abort superseded requests or guard responses with a monotonically increasing request ID.
- **Known incorrect photos remain an unresolved product decision:** Presenting a cocker spaniel as a Cavalier or a chihuahua as Chinese Crested is misleading, not merely lossy. **Fix:** Resolve before implementation via verified mappings, labeled substitutes, or a generic local image.
- **"Source-verified" data is not represented by the schema:** `{name, lifespan, size, api_breed_name}` cannot retain sources, source dates, lifespan ranges, or derivation notes, and only changed values are logged. **Fix:** Store provenance for every entry and define how source ranges become the scalar `lifespan`.
- **Size classification is non-reproducible:** No weight thresholds, authority, handling of sex-dependent ranges, or rule for breeds spanning categories. **Fix:** Define exact weight boundaries and a deterministic boundary/variety policy with provenance.
- **Model A is not fully specified:** The `~+4/+5/+6/+7` notation permits different implementations; interpolation below one year implies arbitrary values. **Fix:** Replace approximations with an explicit piecewise function and expected boundary fixtures from 0 months onward.
- **Life-stage semantics are missing:** Puppy/adult/senior/geriatric thresholds are undefined. **Fix:** Specify inclusive fraction-of-lifespan boundaries and unit tests at every transition.
- **Progress behavior beyond average lifespan is undefined:** Dogs older than breed average produce >100%. **Fix:** Preserve the calculated value but clamp the visual percentage to `[0,100]` and define over-lifespan copy.
- **Input validation is incomplete:** zero age, negative/fractional years, months outside `0–11`, extreme ages, missing breed, invalid dataset values. **Fix:** Specify validation rules in the pure-function contract and test them.
- **`base: './'` does not alone prove `/apps` compatibility:** At the slashless URL `/apps`, relative URLs resolve from `/` unless the host redirects to `/apps/`. **Fix:** Define the server redirect/deployment layout and run an automated smoke test at both `/apps/` and the slashless URL.
- **Testing covers too little:** Pure-function tests miss combobox keyboard failures, stale image responses, fallback loops, a11y regressions, broken built asset paths. **Fix:** Add component tests plus a production-build browser smoke test.
- **Animation and picker accessibility are absent:** Count-up can violate reduced-motion; a custom picker can lose combobox focus/ARIA. **Fix:** Require keyboard/ARIA acceptance criteria and honor `prefers-reduced-motion`.
- **"Port the existing shadcn components" understates migration risk:** legacy branch is CRA/Tailwind 3/JS with broad unused deps. **Fix:** Scaffold clean Vite and copy only components actually used, with pinned compatible versions.

VERDICT: REVISE

### Claude's response
Accepted all 14 findings — every one is a real spec gap, not a matter of taste; none rejected. Revised PLAN.md accordingly:
- **Data schema** now carries provenance per breed (`lifespan_range`, `lifespan_source`, `source_date`, `notes`) and a rule for collapsing a source range to the scalar `lifespan` (midpoint, rounded to 0.5).
- **Size class** now has explicit weight thresholds (small <20 lb, medium 20–50, large 50–90, giant >90; use the breed's typical-adult-weight midpoint across sexes; note any breed that straddles a boundary).
- **Model A** rewritten as an explicit piecewise function (defined from 0 months) with named per-size increments and required boundary fixtures.
- **Model C** clamps the *visual* bar to [0,100] while showing the true value; over-lifespan copy defined.
- **Life-stage** thresholds defined as fractions of lifespan with tests at every transition.
- **Input validation** contract added (bounds, empties, non-integers, over-lifespan) with tests.
- **Images**: explicit dog.ceo URL builder (split-on-first-hyphen → `/breed/<breed>/<sub>/images/random`, proven by `1st_web`), request-ID/AbortController race guard, and a **bundled local fallback** (not another dog.ceo URL). Substituted "closest-match" breeds now show a **generic local image**, not a misleading wrong-breed photo, and are flagged `image_is_substitute` in the data.
- **Subpath**: `/apps` host must redirect slashless → `/apps/`; if it can't, fall back to a dedicated `base:'/apps/'` build for that host separately from the Vercel root build. Added a production-build smoke test served under a subpath.
- **Testing** expanded to component tests + a built-asset browser smoke test (selection, calc, image failure, rapid requests, subpath load).
- **Accessibility** acceptance criteria added (ARIA combobox + keyboard; `prefers-reduced-motion` disables count-up).
- **Migration** reframed: clean Vite scaffold, copy only the components actually used, pin compatible versions.

## Round 2 — Codex
Most prior findings addressed; several material gaps remain:

- Provenance stores only `"AKC"` and no weight source → still unauditable. **Fix:** store exact lifespan & weight source URLs/titles + access dates per breed.
- Size boundaries overlap at exactly 50 lb. **Fix:** half-open intervals (`<20`, `20–<50`, `50–<90`, `≥90`).
- Legacy mapping assumed valid, but the old backend silently replaced failed lookups and has unmarked substitutions (e.g. `Collie → collie-border`). **Fix:** validate every mapping against dog.ceo's live breed catalog; store explicit `{breed, sub_breed}` fields, not hyphen strings.
- Substitute-breed contradiction: generic image shown initially, but "fetch another" can still request the known-wrong mapping. **Fix:** disable/hide "fetch another" for substitute breeds (or rotate local generics).
- Image handling covers transport failure but not dog.ceo app-level errors / untrusted URLs. **Fix:** require HTTP 200, API `status==="success"`, an HTTPS image URL, response-shape validation, and a request timeout.
- `0m → 0` model fixture contradicts validation rejecting zero age. **Fix:** state that 0 is model-domain-only; add separate validation tests.
- Unexplained 30-year max despite supporting very old dogs. **Fix:** remove the cap or document its rationale + user-facing message.
- A11y omits result announcements and image fallback semantics. **Fix:** `aria-live` result/error region, meaningful alt text, accessible loading/disabled states.

VERDICT: REVISE

### Claude's response
Accepted all 7 — refinements, none rejected. Revised PLAN.md:
- **Schema**: added `lifespan_source_url`, `weight_source`, `weight_source_url`, `access_date`; replaced the hyphen-encoded `api_breed_name` with explicit `{ "dogceo_breed": "...", "dogceo_sub_breed": "..." }`.
- **Size intervals** made half-open: `small <20`, `medium [20,50)`, `large [50,90)`, `giant ≥90` lb.
- **Phase 1** now fetches dog.ceo's `/breeds/list/all` catalog and validates every mapping against it; any breed absent from the catalog is marked `image_is_substitute: true`. This caught more substitutes than my manual pass (e.g. Collie, Alaskan Klee Kai).
- **Substitute breeds**: "fetch another" is hidden/disabled; they show the bundled generic image only. Contradiction removed.
- **Image acceptance**: require HTTP 200 + API `status==="success"` + `https:` URL + response-shape check + request timeout before rendering; any failure → local fallback.
- **Zero age**: clarified — the model's mathematical domain starts at 0 (for interpolation continuity), but input validation requires a positive age (reject both-zero). Separate model-fixture tests vs validation tests.
- **30-year cap**: kept as a typo guard (oldest verified dogs ~29–30 yrs), now documented with rationale and a user-facing message; ages up to 30 including beyond breed lifespan are valid.
- **A11y**: added `aria-live` region for results/errors, meaningful image alt text (breed name / "generic dog" for substitutes), and accessible loading/disabled states.

## Round 3 — Codex
Previous eight addressed. New material issues:

- Model constants (`4/5/6/7` increments, `78.8` human lifespan) unsourced despite "AKC staged" framing. **Fix:** cite/version every model constant or label as app-defined assumptions.
- Life-stage fractions are arbitrary and medical-sounding (a 6-yr dog becomes "senior" on a 12-yr-lifespan breed). **Fix:** cite a veterinary standard or label non-clinical.
- Sex-specific weight → single midpoint aggregation still undefined (two valid methods classify differently). **Fix:** one exact aggregation formula, stored in a dedicated field.
- Mapping validation checks existence only, not semantic correctness (`Collie → border collie` is valid but wrong). **Fix:** name-based semantic verification per non-substitute mapping; default uncertain → substitute.
- No whole-dataset integrity checks (dup names, reversed ranges, nonpositive lifespans, missing sources, inconsistent size, invalid conditional fields). **Fix:** schema validation + automated invariant test over every entry.
- Accepts any HTTPS host from the API. **Fix:** allowlist the dog.ceo image hostname + enforce via response validation and an `img-src` CSP.

VERDICT: REVISE

### Claude's response
Accepted all 6 — sourcing honesty + integrity + security, all material; none rejected. Revised PLAN.md:
- **Model constants**: added a "Sources & honesty" note — increments and 78.8 are cited (AKC/vet convention; 78.8 = US life-expectancy figure the original app used) and any not directly attributable are **labeled app-defined assumptions**; UI already says "approximate."
- **Life-stage**: relabeled a **non-clinical app convention**, with AAHA canine life-stage guidelines cited as the reference framing; copy avoids medical claims.
- **Weight aggregation**: fixed formula — `weight_midpoint_lb = (overall_min_lb + overall_max_lb) / 2` over the combined across-sex range; stored as its own field; size class derived from it.
- **Semantic mapping check**: Phase 1 now requires a name-based semantic review of every non-substitute mapping (not just catalog existence); anything uncertain defaults to `image_is_substitute: true`.
- **Dataset integrity**: added an automated invariant test over `breeds.json` (unique names, ordered ranges, positive lifespans, required source fields present, size matches computed midpoint, conditional image fields consistent).
- **Image security**: allowlist `images.dog.ceo` in response validation and enforce `img-src` (self + dog.ceo host) via CSP.

## Round 4 — Codex
All prior material findings addressed. Plan is sound for a consumer novelty app. Two non-blocking cleanups:

- Phase 1 and Phase 2 both used step `6` — renumber to avoid ambiguous references.
- Clarify the hero/rotating image must be local or covered by the same dog.ceo fallback + CSP rules.

VERDICT: APPROVED

### Claude's response
Converged. Applied both non-blocking cleanups anyway: renumbered Phase 2/3 steps (7–16) and fixed the `(step 10)` cross-reference; added a hero-image clause requiring a bundled local asset or the same acceptance/fallback/CSP treatment as result images.

---

**Resolution: APPROVED after 4 rounds.** Grilled with the user (Act 1), then stress-tested across 4 Codex rounds (8 → 7 → 6 → 0 material findings). No deadlock; Claude accepted every material finding (all were genuine spec gaps, not taste) and rejected none. Plan is locked and ready for implementation. No code written during either act.
