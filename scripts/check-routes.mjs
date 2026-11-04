import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:8443/'
const routes = ['/#/about', '/#/login', '/#/notes']

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } })

for (const route of routes) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${base}${route.replace(/^\//, '')}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 500)
  console.log(`\n=== ${route} ===`)
  console.log(body)
  if (errors.length) console.log('page errors:', errors.join(' | '))
  await page.screenshot({
    path: `test-results/${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.png`,
    fullPage: true,
  })
}

await browser.close()
