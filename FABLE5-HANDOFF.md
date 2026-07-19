# Handoff: Insert "Dogs True Age v2" into the MacScott apps pipeline

**Goal:** Make this app appear on **both** `scott.macscott.net/apps` and `alexander.macscott.net/apps`.

**App:** Frontend-only Vite + React + Tailwind static site (no backend). Renamed to
**Dogs True Age v2** (npm name `dogs-true-age-v2`). Lives on branch `feature/jazz-rebuild`.

---

## How this pipeline actually works (read first)

The showcase repo is **`XRAI-Studio/macscott-sites`** (locally `../Apps_site`), a **Next.js 16 catalog**
hosted on **Vercel** (project `macscott-sites`). It serves both tenant domains.

It does **NOT** accept file drops. Instead it scans GitHub repos owned by `XRAI-Studio` (= tenant
`scott`) and `alexandermacscott-del` (= tenant `alexander`) and includes any repo that:

1. Has the GitHub topic **`macscott-app`**, AND
2. Has a valid **`macscott.json`** at the repo root **on its default branch**.

The app itself is embedded via iframe / linked from its `liveUrl`. `/apps` is a **gallery route**
inside the showcase — the app is *registered*, not *served at that path*.

> ⚠️ Ignore this repo's `DEPLOYMENT.md` / `BRANCHES.md` "copy dist/ into /apps/ subpath" instructions.
> That describes a different (incorrect) model. The real mechanism is the manifest/catalog above.

---

## Current state

- ✅ Repo `XRAI-Studio/Dog_age` is **public** and already has the topic **`macscott-app`**.
- ✅ Default branch is **`main`** (currently just a README — the app is on `feature/jazz-rebuild`).
- ✅ App renamed to Dogs True Age v2; 57 tests pass; branch pushed.
- ❌ No `liveUrl` yet (app not deployed).
- ❌ No `macscott.json` yet.

---

## Remaining steps

### 1. Deploy the app to get an HTTPS `liveUrl`

Vercel is the established pattern (matches macscott-sites). The build is subpath-safe (`base: './'`).

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite (or "Other" with the above)

Result: a stable URL like `https://dogs-true-age-v2-xxxx.vercel.app`. The URL **must** be HTTPS and
**must NOT** be on `scott.macscott.net` or `alexander.macscott.net` (the schema rejects showcase origins).

### 2. Add `macscott.json` at the repo root

```json
{
  "schemaVersion": 1,
  "title": "Dogs True Age v2",
  "description": "See your dog's approximate human-equivalent age from two friendly perspectives.",
  "owner": "both",
  "liveUrl": "https://REPLACE-WITH-VERCEL-URL",
  "embeddable": true,
  "accent": "#f59e0b",
  "screenshot": "screenshots/cover.png"
}
```

Schema constraints (from `macscott-sites/lib/manifest.ts`):

| Field | Rule |
|---|---|
| `schemaVersion` | must be `1` |
| `title` | 1–80 chars |
| `description` | 1–500 chars |
| `owner` | `"both"` → shows on both sites. (Repo is XRAI-Studio, so allowed values are `scott` or `both`.) |
| `liveUrl` | HTTPS, not a macscott.net origin. Optional — omit for an "in development" orb. |
| `embeddable` | defaults `true` when `liveUrl` is set; set `false` only if the app blocks iframing. |
| `accent` | **required**, six-digit hex. **Use `#f59e0b` (amber) — chosen by Scott.** |
| `screenshot` | optional, repo-relative path (no leading `/`, no `..`), fetched at the pinned commit SHA. If omitted, the catalog falls back to the repo's OpenGraph image. |
| (extra keys) | rejected — schema is `.strict()`. |

### 3. Get `macscott.json` onto the **default branch (`main`)**

The catalog only reads the default branch. Two options (Scott's earlier preference was to merge):

- **Recommended:** merge `feature/jazz-rebuild` → `main` (the app + manifest), per `BRANCHES.md`.
- **Minimal:** commit only `macscott.json` to `main` (liveUrl points at the Vercel deploy).

If you add a `screenshot`, that file must also exist on `main` at the referenced path.

### 4. (Optional) Instant refresh instead of the 1-hour cache

Without this, the catalog picks up the new app on its hourly cycle. For seconds-fast refresh, add
`.github/workflows/macscott-revalidate.yml` and store the showcase's `REVALIDATE_SECRET` as the repo
secret `MACSCOTT_REVALIDATE_SECRET`:

```yaml
name: Refresh MacScott
on: [push]
jobs:
  revalidate:
    runs-on: ubuntu-latest
    steps:
      - run: curl --fail -X POST -H "Authorization: Bearer ${{ secrets.MACSCOTT_REVALIDATE_SECRET }}" https://scott.macscott.net/api/revalidate
```

---

## Verify

1. After `main` has the manifest, wait for revalidation (or trigger the webhook).
2. Load `https://scott.macscott.net/apps` and `https://alexander.macscott.net/apps` — the app should
   appear on **both** (because `owner: "both"`).
3. Open it and confirm the embedded app loads from the `liveUrl`.
4. If it's missing, check the showcase's rejection log (`GET /api/catalog-status`, Bearer-protected):
   an invalid manifest excludes only this repo with a structured reason.

## Decisions (locked)

- **Accent color:** `#f59e0b` (amber). Use it verbatim in `macscott.json`.
