import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { chromium } from '@playwright/test'

const distRoot = resolve('dist')
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml' }
const server = createServer(async (request, response) => {
  if (request.url === '/apps') {
    response.writeHead(308, { location: '/apps/' }).end()
    return
  }
  if (!request.url?.startsWith('/apps/')) {
    response.writeHead(404).end()
    return
  }
  const relativePath = decodeURIComponent(request.url.slice(6).split('?')[0]) || 'index.html'
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
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ reducedMotion: 'reduce' })
let apiRequest = 0
const consoleErrors = []
const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')

try {
  await page.route('https://dog.ceo/api/**', async (route) => {
    apiRequest += 1
    if (apiRequest === 2) await new Promise((resolveDelay) => setTimeout(resolveDelay, 500))
    const image = apiRequest === 1
      ? 'https://images.dog.ceo/breeds/beagle/broken.jpg'
      : apiRequest === 2
        ? 'https://images.dog.ceo/breeds/beagle/stale.png'
        : 'https://images.dog.ceo/breeds/retriever-golden/final.png'
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', message: image }) })
  })
  await page.route('https://images.dog.ceo/**', async (route) => {
    if (route.request().url().endsWith('/broken.jpg')) await route.abort('failed')
    else await route.fulfill({ status: 200, contentType: 'image/png', body: onePixelPng })
  })

  await page.goto(`${origin}/apps`, { waitUntil: 'networkidle' })
  if (page.url() !== `${origin}/apps/`) throw new Error(`Expected trailing-slash URL, received ${page.url()}`)

  const breed = page.getByRole('combobox', { name: 'Dog breed' })
  await breed.fill('Beagle')
  await breed.press('ArrowDown')
  await breed.press('Enter')
  await page.getByLabel('Years', { exact: true }).fill('5')
  await page.getByRole('button', { name: 'Show their ages' }).click()
  await page.getByText("Your dog's point of view", { exact: true }).waitFor()
  await page.getByText('Our point of view', { exact: true }).waitFor()
  await page.locator('[data-testid="dog-photo"][aria-busy="false"]').waitFor()
  await page.getByRole('img', { name: 'Generic dog illustration for Beagle' }).waitFor()
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })

  await page.getByRole('button', { name: 'Fetch another photo' }).click()
  await page.locator('[data-testid="dog-photo"][aria-busy="true"]').waitFor()
  await breed.fill('Golden Retriever')
  await breed.press('ArrowDown')
  await breed.press('Enter')
  await page.getByRole('button', { name: 'Show their ages' }).click()

  const finalImage = page.getByRole('img', { name: 'Golden Retriever dog photo' })
  await page.waitForTimeout(800)
  await finalImage.waitFor()
  await page.waitForTimeout(650)
  if (!(await finalImage.getAttribute('src'))?.includes('retriever-golden/final.png')) {
    throw new Error('A stale image request replaced the final Golden Retriever photo.')
  }
  if ((await page.locator('[data-testid="dog-photo"]').getAttribute('aria-busy')) !== 'false') {
    throw new Error('Photo region did not leave its loading state.')
  }

  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`)

  console.log('PASS production app loaded under /apps/ after slashless redirect')
  console.log('PASS keyboard breed selection and both age results rendered')
  console.log('PASS broken remote image fell back to the bundled local illustration')
  console.log('PASS rapid superseding requests retained the final breed photo')
  console.log('PASS accessible loading state returned to idle')
} finally {
  await browser.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
