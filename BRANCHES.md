# Which branch to use

This repo has several branches. Here's what each one is and which to build on.

| Branch | What it is | Status |
|--------|-----------|--------|
| `main` | Just the README. No app code. | Base / default |
| `feature/dog-age-website` | Bare-bones vanilla HTML/CSS/JS calculator (human age → dog age, 4 size buckets). | **Legacy — reference only** |
| `1st_web` | React + shadcn frontend with a **FastAPI + MongoDB** backend and dog.ceo images. The "True Dog Age" app. | **Legacy — reference only** |
| `feature/jazz-rebuild` | **The active rebuild.** Frontend-only Vite + React + Tailwind + shadcn static app. No backend. This is where all new work goes. | **← Use this** |

## Use `feature/jazz-rebuild`

All new work happens on **`feature/jazz-rebuild`**, branched off `main`.

- The old branches (`1st_web`, `feature/dog-age-website`) are kept **untouched as history/reference** — do not build on them, do not delete them.
- The `1st_web` backend (Python/MongoDB) is **not** carried forward. The rebuild is a static site: breed data is a local `breeds.json`, images come straight from the dog.ceo API in the browser.

## Deployment

The built static site is hosted in **two** places, so the build must use **relative asset paths** (Vite `base: './'`) and **no client-side router**:

1. **Vercel** — push `feature/jazz-rebuild`, get an automatic preview URL, promote to production when approved.
2. **`https://scott.macscott.net/apps`** — served under a subpath. Relative paths are what make it work under `/apps` without 404ing on assets.

## Flow

1. Build on `feature/jazz-rebuild`.
2. Push → Vercel preview URL for review.
3. Merge to `main` when approved.
4. Deploy the static build to both Vercel (production) and `scott.macscott.net/apps`.
