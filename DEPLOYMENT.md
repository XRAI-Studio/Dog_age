# Deployment

The single production artifact is `dist/`. Vite uses `base: './'`, so the same build works at a domain root and beneath a trailing-slash subpath.

## Build

```bash
npm ci
npm test
npm run build
npm run smoke:subpath
npm run smoke:browser
```

## Vercel root or preview

- Build command: `npm run build`
- Output directory: `dist`
- No framework router or rewrite is required.

## `scott.macscott.net/apps/`

Copy the contents of `dist/` into the server directory exposed as `/apps/`. Configure the host or reverse proxy to redirect the slashless `/apps` request to `/apps/` before serving the page. This redirect is required because relative asset URLs resolve against the current URL.

Example Nginx rule:

```nginx
location = /apps {
    return 308 /apps/;
}
```

Then serve static files from `/apps/` normally. `npm run smoke:subpath` reproduces this redirect and checks emitted assets. `npm run smoke:browser` additionally runs the production React bundle under `/apps/` in Chromium and exercises calculation, loading, fallback, and rapid-request behavior.
