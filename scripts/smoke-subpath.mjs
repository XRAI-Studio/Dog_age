import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const distRoot = resolve('dist')
const mime = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (request, response) => {
  if (request.url === '/apps') {
    response.writeHead(308, { location: '/apps/' }).end()
    return
  }
  if (!request.url?.startsWith('/apps/')) {
    response.writeHead(404).end()
    return
  }

  const relativePath = decodeURIComponent(request.url.slice('/apps/'.length).split('?')[0]) || 'index.html'
  const filePath = resolve(distRoot, relativePath)
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
    response.writeHead(403).end()
    return
  }

  try {
    if (!(await stat(filePath)).isFile()) throw new Error('Not a file')
    response.writeHead(200, { 'content-type': mime[extname(filePath)] ?? 'application/octet-stream' })
    response.end(await readFile(filePath))
  } catch {
    response.writeHead(404).end()
  }
})

await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
const { port } = server.address()
const origin = `http://127.0.0.1:${port}`

try {
  const slashless = await fetch(`${origin}/apps`, { redirect: 'manual' })
  if (slashless.status !== 308 || slashless.headers.get('location') !== '/apps/') {
    throw new Error('Slashless /apps did not redirect to /apps/.')
  }

  const pageUrl = `${origin}/apps/`
  const page = await fetch(pageUrl)
  if (!page.ok) throw new Error(`/apps/ returned HTTP ${page.status}.`)
  const html = await page.text()
  if (/\b(?:src|href)="\//.test(html)) throw new Error('Built HTML contains a root-absolute asset URL.')

  const assetRefs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1])
  const assetUrls = assetRefs.map((ref) => new URL(ref, pageUrl))
  for (const url of assetUrls) {
    if (!url.pathname.startsWith('/apps/')) throw new Error(`Asset escaped /apps/: ${url.pathname}`)
    const assetResponse = await fetch(url)
    if (!assetResponse.ok) throw new Error(`${url.pathname} returned HTTP ${assetResponse.status}.`)

    if (url.pathname.endsWith('.css')) {
      const css = await assetResponse.text()
      const cssRefs = [...css.matchAll(/url\((['"]?)(.*?)\1\)/g)].map((match) => match[2]).filter((ref) => !ref.startsWith('data:'))
      for (const cssRef of cssRefs) {
        const cssAsset = new URL(cssRef, url)
        const cssResponse = await fetch(cssAsset)
        if (!cssResponse.ok) throw new Error(`CSS asset ${cssAsset.pathname} returned HTTP ${cssResponse.status}.`)
      }
    }
  }

  for (const localAsset of ['generic-dog.svg', 'dog-mascot.svg']) {
    const response = await fetch(`${pageUrl}${localAsset}`)
    if (!response.ok) throw new Error(`${localAsset} returned HTTP ${response.status}.`)
  }

  console.log('PASS /apps redirects to /apps/')
  console.log(`PASS /apps/ loaded with ${assetUrls.length} emitted HTML assets`)
  console.log('PASS emitted HTML/CSS assets remain inside /apps/')
  console.log('PASS bundled mascot and fallback images load under /apps/')
} finally {
  await new Promise((resolveClose) => server.close(resolveClose))
}
