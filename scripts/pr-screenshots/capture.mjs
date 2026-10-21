// Captures the pages listed in shots.json from a running copy of the app.
//
// Usage: node capture.mjs <baseUrl> <outDir> <prefix>
//   e.g. node capture.mjs http://localhost:3100 out before
// writes out/before-game-desktop.png, out/before-game-mobile.png, ...
//
// Exits non-zero if any page fails to render its expected content, so a
// broken or unreachable app fails the PR check instead of producing a blank
// screenshot that looks like a pass.
import { chromium } from 'playwright'
import { readFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [baseUrl, outDir, prefix] = process.argv.slice(2)
if (!baseUrl || !outDir || !prefix) {
  console.error('Usage: node capture.mjs <baseUrl> <outDir> <prefix>')
  process.exit(2)
}

const here = path.dirname(fileURLToPath(import.meta.url))
const { shots } = JSON.parse(await readFile(path.join(here, 'shots.json'), 'utf8'))
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
let failed = 0
try {
  for (const shot of shots) {
    const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 1 })
    const page = await context.newPage()
    const file = path.join(outDir, `${prefix}-${shot.name}.png`)
    let ok = false
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        await page.goto(new URL(shot.path, baseUrl).toString(), { waitUntil: 'networkidle', timeout: 60000 })
        await page.waitForSelector(shot.waitFor, { timeout: 45000 })
        if (shot.click) {
          const target = page.locator(shot.click).first()
          if (await target.isVisible()) await target.click()
        }
        await page.waitForTimeout(1500) // let charts finish animating
        ok = true
      } catch (err) {
        console.error(`  ${shot.name}: attempt ${attempt} failed: ${err.message.split('\n')[0]}`)
      }
    }
    await page.screenshot({ path: file })
    console.log(`${ok ? 'captured' : 'FAILED  '} ${file}`)
    if (!ok) failed++
    await context.close()
  }
} finally {
  await browser.close()
}
process.exit(failed ? 1 : 0)
