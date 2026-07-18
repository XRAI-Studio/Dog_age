# Plan: Rebuild "True Dog Age" as a jazzed-up, frontend-only static web app
_Locked via grill — by Claude + Scott (XRAI Studio). Hardened via Codex review (Round 1)._

## Goal
Turn the existing `1st_web` "True Dog Age" prototype into an eye-catching, friendly, informative static web app that converts a dog's real age + breed into a human-equivalent age. Drop the Python/MongoDB backend entirely; the app becomes a Vite + React + Tailwind + shadcn static site with a local, source-verified breed dataset and dog.ceo photos fetched client-side. It ships two complementary age readings (a nonlinear "dog's point of view" age and a linear "our point of view" life-fraction age), a "playful vet-office charm" visual identity, a searchable breed picker, and a life-stage badge + life-progress bar. It must run both on Vercel and under the subpath `https://scott.macscott.net/apps`.

## Approach

### Phase 1 — Data (sourced `breeds.json`)
1. For all ~80 breeds currently in `1st_web`, verify **average lifespan** via WebSearch against authoritative sources (primary: AKC breed pages; corroborate with veterinary/actuarial data, Dog Aging Project / VetCompass).
2. **Data schema** — each breed entry carries full provenance with source URLs, not just a scalar:
   ```json
   {
     "name": "Golden Retriever",
     "lifespan": 11.0,
     "lifespan_range": [10, 12],
     "lifespan_source": "AKC",
     "lifespan_source_url": "https://www.akc.org/dog-breeds/golden-retriever/",
     "weight_lb": [55, 75],
     "weight_source": "AKC",
     "weight_source_url": "https://www.akc.org/dog-breeds/golden-retriever/",
     "access_date": "2026-07",
     "size": "large",
     "dogceo_breed": "retriever",
     "dogceo_sub_breed": "golden",
     "image_is_substitute": false,
     "notes": ""
   }
   ```
   - **Range → scalar rule:** `lifespan` = midpoint of `lifespan_range`, rounded to the nearest 0.5.
   - Source URLs + `access_date` are required for both lifespan and weight so every number is auditable.
3. **Size class** — deterministic, from typical-adult **weight**, using **half-open** intervals (no boundary overlap):
   - **Aggregation formula (exact):** `weight_midpoint_lb = (overall_min_lb + overall_max_lb) / 2`, where the min/max span the **combined** across-sex weight range. Store `weight_midpoint_lb` as its own field; classify from it.
   - `small` `< 20` lb · `medium` `[20, 50)` lb · `large` `[50, 90)` lb · `giant` `≥ 90` lb.
   - Record any ambiguity in `notes`.
4. **dog.ceo mapping validation + image substitution** — do **not** trust the legacy hyphen-encoded `api_breed_name` (the old backend silently swapped failed lookups and has *unmarked* substitutions, e.g. `Collie → collie-border`, `Alaskan Klee Kai → husky`). In Phase 1, fetch dog.ceo's `/breeds/list/all` catalog and validate every mapping:
   - **Existence check:** the mapping must exist in the real catalog. Store it as explicit `dogceo_breed` / `dogceo_sub_breed` fields (not a hyphen string).
   - **Semantic check:** a valid mapping can still be *wrong* (`Collie → border collie` exists but isn't a Collie). Every non-substitute mapping gets a name-based semantic review; anything uncertain **defaults to `image_is_substitute: true`**.
   - Any breed absent from the catalog, semantically mismatched, or a known "closest-match" stand-in is marked `image_is_substitute: true` and renders a **generic local dog image** — never a misleading wrong-breed photo.
5. Emit `breeds.json`. Log every lifespan value that changed from the old data, with its source, so the diff is traceable.
6. **Dataset integrity test (automated invariant over every entry):** unique `name`; `lifespan_range` ascending and `lifespan` = its rounded midpoint; `lifespan > 0`; required source fields present (`lifespan_source_url`, `weight_source_url`, `access_date`); `size` matches the class computed from `weight_midpoint_lb`; conditional image fields consistent (substitutes have no live mapping expectation). CI fails on any violation so bad data can't ship.

### Phase 2 — App rebuild (Vite static frontend)
7. **Scaffold clean** Vite + React + Tailwind. Do **not** bulk-port `1st_web`; copy only the shadcn/ui components actually used, on pinned, mutually-compatible versions. **No react-router** (single page). Set Vite `base: './'` for relative assets.
8. **Age models — pure functions with unit tests.** Contracts below are normative.

   **Model A — "From your dog's point of view" (nonlinear, AKC staged).** Let `y` = dog age in decimal years, `k` = size increment (`small 4, medium 5, large 6, giant 7`). Piecewise, continuous, defined from `y = 0`:
   - `0 ≤ y ≤ 1`: `human = 15 · y`   (0 → 0, 1yr → 15)
   - `1 < y ≤ 2`: `human = 15 + 9·(y − 1)`   (2yr → 24)
   - `y > 2`: `human = 24 + k·(y − 2)`
   - Required boundary fixtures (test): `0m→0`, `6m→7.5`, `12m→15`, `18m→19.5`, `24m→24`, and `y=5` per size (e.g. large → 42).

   **Model C — "From our point of view" (linear life-fraction).** `human = (y / breed_lifespan) · 78.8`. Value is shown as calculated (may exceed 78.8); only the *progress bar* is clamped (step 10).

   **Model constants — sources & honesty.** The staged first/second-year values (15, +9) and per-size increments (`4/5/6/7`) follow the widely-published AKC/veterinary convention; `78.8` is the US life-expectancy figure the original `1st_web` app used. Each constant is cited in a code comment with its source, and any value not directly attributable to a named source is **explicitly labeled an app-defined assumption**. The UI presents both models as **approximate**, not clinical.

9. **Input validation** (part of the pure-function contract, tested):
   - Years: integer `0–30`; Months: integer `0–11`; reject if both are 0; reject missing breed.
   - Non-integer / out-of-range / pasted junk → inline error, no calculation.
   - Ages beyond `lifespan` are **valid** (old dogs exist) — compute normally, trigger over-lifespan copy.
   - **Zero-age note:** the age models are mathematically *defined* from `y = 0` (needed for smooth sub-1-year interpolation), but `y = 0` is **model-domain-only** — the input validator rejects a real submission of 0 years + 0 months. Model fixtures (`0m→0`) and validation tests (both-zero → error) are separate test sets.
   - **30-year cap rationale:** a typo guard, not a biological claim — the oldest verified dogs reach ~29–30 years, so `>30` is almost certainly fat-fingered input (e.g. `300`). Over-cap input shows a message explaining the limit rather than silently truncating.
10. **Life-stage badge + progress bar.**
   - Life-stage by fraction `f = y / lifespan`: `puppy` if `y < 1`; else `adult` if `f < 0.5`; `senior` if `0.5 ≤ f < 0.75`; `geriatric` if `f ≥ 0.75`. Unit-test each transition. These are a **non-clinical app convention** (framing informed by the AAHA canine life-stage guidelines), presented as a friendly label, not a medical assessment — copy avoids diagnostic language.
   - Progress bar = `min(100, max(0, f·100))` visually; true `f` still shown numerically. Define over-100% copy (e.g. "beyond the breed's average lifespan 🎉").
11. **Images (client-side dog.ceo):**
    - **URL builder:** from the validated `dogceo_breed` / `dogceo_sub_breed` fields → `/breed/<breed>/<sub>/images/random`, or `/breed/<breed>/images/random` when there's no sub-breed. Unit-test the builder.
    - **Response acceptance (before rendering):** require HTTP `200` **and** dog.ceo body `status === "success"` **and** a returned `message` that is an `https:` URL **whose hostname is on an allowlist (`images.dog.ceo`)** **and** a valid response shape; enforce a request **timeout**. Any check failing → treat as a failure and fall back. Belt-and-suspenders: an `img-src 'self' https://images.dog.ceo` **CSP** blocks any other image origin at the browser level.
    - **Race guard:** each fetch tagged with a monotonically increasing request id (or `AbortController`); responses for a superseded breed/click are discarded.
    - **Fallback:** on fetch failure, rejected response, **or** `<img>` error/decode failure, show a **bundled local image** (not another dog.ceo URL).
    - **Substitute breeds** (`image_is_substitute: true`): render the bundled generic image only; the "🔄 fetch another" control is **hidden/disabled** for them (no path to request the known-wrong mapping).
    - "🔄 fetch another" (non-substitute breeds only) re-requests a random photo, respecting the race guard and acceptance checks.
12. **UI (playful vet-office charm):** hero with headline + mascot/rotating photo; searchable breed picker (type-to-filter); age input (years + months); big rounded breed photo in results; both age numbers with count-up animation + one-line explanation each; life-stage badge + progress bar; fully mobile-responsive.
    - **Hero image:** must be either a **bundled local asset** or a dog.ceo image subject to the **same acceptance checks, fallback, and CSP allowlist** as result images (step 11) — no unguarded third-party image origin anywhere on the page.
13. **Accessibility (acceptance criteria):** breed picker is a proper ARIA combobox — full keyboard operation (arrow/enter/escape, focus retained). Count-up animation and any motion are disabled under `prefers-reduced-motion`. Results and validation errors are announced via an **`aria-live`** region. Breed image has meaningful **alt text** (breed name, or "generic dog photo" for substitutes). Loading and disabled states are accessible (not color-only; proper `aria-busy` / `disabled` semantics).

### Phase 3 — Subpath + ship
14. **Subpath correctness (not assumed — tested):** the `/apps` host must redirect the slashless `/apps` → `/apps/` so relative URLs resolve correctly. If that redirect is not possible on `scott.macscott.net`, produce a **dedicated `base: '/apps/'` build** for that host, separate from the Vercel-root build. Verify CSS `url()` assets resolve too.
15. **Testing:** pure-function tests (both models, validation, life-stage, URL builder); component tests (picker keyboard/ARIA, image-failure fallback, rapid-request race); a **production-build browser smoke test** exercising selection → calculation → image failure → rapid requests → loading under a `/apps/` subpath.
16. Commit to `feature/jazz-rebuild`; push for a Vercel preview URL. Document build/deploy for both targets (Vercel + `scott.macscott.net/apps`). Branch guidance in `BRANCHES.md`.

## Key decisions & tradeoffs
- **Frontend-only, no backend.** The `1st_web` FastAPI+MongoDB backend only served a static table, proxied a public image API, and logged calculations — all removable. A static site is cheaper, simpler, fewer failure modes. Tradeoff: no server-side analytics (not requested).
- **Two age models shown side by side.** Model A (nonlinear, developmental) and Model C (linear life-fraction) answer different questions; showing both is the "informative" hook. Confusion risk mitigated by "your dog's point of view" / "our point of view" labels + one-line explanations.
- **Replaced the original linear-only formula.** Old `age × (78.8 / lifespan)` is biologically wrong for young dogs (1-yr-old Lab → 6.6 human years). Model A fixes the curve; Model C keeps the old math but reframed honestly as life-fraction.
- **Vite over CRA/craco;** clean scaffold, copy only used components with pinned versions (avoids inheriting the dead toolchain and unused deps).
- **Relative base + slashless redirect (or per-host build).** Required because the site serves both at a Vercel root and under `/apps`; absolute paths would 404 and the slashless URL needs a trailing-slash redirect.
- **Data provenance is first-class.** Every breed carries source + range + date + size derivation, so "verified" is auditable, not a claim.
- **Substitute photos show a generic local image, not a wrong breed.** Misleading is worse than neutral.
- **Data verification is its own phase.** Sourced, reviewable `breeds.json` before any UI consumes it.
- **Scope discipline.** In: searchable picker, life-stage badge + progress bar. Deferred: breed fun-fact blurbs, shareable result card.

## Risks / open questions
- **dog.ceo mapping is still lossy for non-substitute breeds** — a valid mapping can still return an atypical-looking individual photo. Accepted; the "fetch another" button lets users reroll.
- **Lifespan source variance** — sources disagree by 1–2 years; AKC is the primary tiebreaker, range + source recorded per breed.
- **Model A increments are a published convention, not a law** (±1/yr across sources); UI labels results "approximate."
- **`scott.macscott.net/apps` redirect capability is unconfirmed** — if the host cannot redirect slashless→trailing-slash, the fallback is the dedicated `base:'/apps/'` build. Confirm host behavior before final deploy.

## Out of scope
- The Python/FastAPI/MongoDB backend (removed, not migrated).
- User accounts, saved dogs, calculation history/logging.
- Breed fun-fact/temperament content and the shareable result card (future).
- The "human age → dog age" reverse direction.
- Mobile app / app-store distribution (web only).
- Expanding the breed list beyond the existing ~80.
