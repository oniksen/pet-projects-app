import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:8443/'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1360, height: 900 } })
const errors = []

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    errors.push(`console ${message.type()}: ${message.text()}`)
  }
})
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

await page.goto(url, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(15000)

console.log('title:', await page.title())
console.log('url:', page.url())
console.log('body:', (await page.locator('body').innerText()).slice(0, 1600))
console.log('errors:', errors.length ? errors.join('\n') : 'none')

await page.screenshot({ path: 'test-results/home.png', fullPage: true })
await browser.close()
