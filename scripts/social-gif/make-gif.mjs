// Builds a shareable, animated GIF of the live app with call-outs, pills and
// highlight rings drawn over the real UI. Every frame is a screenshot of the
// running site, so the GIF always shows what the code produces right now.
//
// Usage: node make-gif.mjs [--base URL] [--game ID] [--caption TEXT] [--out FILE] [--keep]
//   defaults: --base https://hockey-preview.sploosh.ai --game 2026020149 (Kraken 4, Red Wings 3 (SO), 2026-10-20)
//   --caption TEXT overrides the score caption pill (default is built from the game's live data)
//             --out ./sploosh-ai-hockey-share.gif
//
// Needs Playwright (reuses ../pr-screenshots/node_modules, installed by
// `npm run pr:screenshots` or `npm install` in that folder) and ffmpeg.
import { chromium } from '../pr-screenshots/node_modules/playwright/index.mjs'
import { execFileSync } from 'node:child_process'
import { mkdtemp, writeFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true])
    return acc
  }, [])
)
const BASE = String(args.base || 'https://hockey-preview.sploosh.ai')
const GAME = String(args.game || '2026020149')
const OUT = path.resolve(String(args.out || 'sploosh-ai-hockey-share.gif'))
const HOST = new URL(BASE).host

// 900 CSS px at 1.2x = a 1080x1080 square, the size social feeds crop least.
// Under 1024px wide the app shows its single-column layout, so the QR cards
// and the Share link are the focus with no sidebar around them.
const SIZE = 900
const SCALE = 1.2
const FPS = 12

const dir = await mkdtemp(path.join(tmpdir(), 'social-gif-'))
const frames = []
let n = 0

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: SCALE })
  const page = await context.newPage()
  await page.goto(`${BASE}/?gameId=${GAME}`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('[data-testid=qr-share]', { timeout: 45000 })

  // Score caption from the game's own data, so the pill always matches the page.
  const game = await page.evaluate(async (g) => {
    const d = await (await fetch(`/api/nhl/play-by-play?gameId=${g}`)).json()
    const t = d.periodDescriptor?.periodType
    const final = d.gameState === 'FINAL' || d.gameState === 'OFF'
    const date = new Date(`${d.gameDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const side = (x) => ({
      abbrev: x.abbrev,
      score: x.score ?? 0,
      logo: x.logo,
      name: [x.placeName?.default, x.commonName?.default].filter(Boolean).join(' '),
    })
    return {
      away: side(d.awayTeam),
      home: side(d.homeTeam),
      // broadcast style: FINAL, FINAL/OT, FINAL/SO; anything else shows the live game state
      status: final ? (t === 'OT' || t === 'SO' ? `FINAL/${t}` : 'FINAL') : String(d.gameState),
      label: final ? (t === 'OT' || t === 'SO' ? `Final (${t})` : 'Final') : String(d.gameState),
      date,
      venue: d.venue?.default || '',
    }
  }, GAME)
  const info = `${game.away.abbrev} ${game.away.score}  @  ${game.home.abbrev} ${game.home.score}  ·  ${game.label}  ·  ${game.date}`
  const CAPTION = String(args.caption && args.caption !== true ? args.caption : info)

  // Framing only: hide scrollbars, the mobile menu button and the scroll-to-top button.
  await page.addStyleTag({
    content: `
      * { scrollbar-width: none !important; }
      *::-webkit-scrollbar { display: none !important; }
      button.lg\\:hidden, button[aria-label="Scroll to top"] { display: none !important; }
      #gif-overlay * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; }
    `,
  })

  await page.evaluate(() => {
    const ov = document.createElement('div')
    ov.id = 'gif-overlay'
    ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden'
    document.body.appendChild(ov)
  })

  // Draws overlay items. Each item is positioned from a live element's
  // rectangle so call-outs stay centered on what they point at.
  //   banner  - pill pinned bottom center
  //   ring    - pulsing outline around an element (tight: true for a small glow)
  //   pill    - label centered above, below, or on the top edge of an element
  //   caption - score pill pinned top center
//   tap     - tap ripple at the center of an element
  //   card    - full-frame title / end card
  // p is animation progress 0..1 (fade and scale in); k is a pulse phase.
  const draw = (items, p = 1, k = 0) =>
    page.evaluate(
      ({ items, p, k }) => {
        const ov = document.getElementById('gif-overlay')
        ov.innerHTML = ''
        const ease = 1 - Math.pow(1 - p, 3)
        // TV-style scorebug: team logo, abbreviation and score each side, FINAL tag in the middle.
        // The winner is full strength, the loser dimmed.
        const scoreboardHtml = (g) => {
          const winner = g.away.score > g.home.score ? 'away' : g.home.score > g.away.score ? 'home' : null
          const team = (t, key) => {
            const dim = winner && winner !== key ? 'opacity:.6;' : ''
            const logo = `<div style="width:78px;height:78px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3)"><img src="${t.logo}" style="width:58px;height:58px;object-fit:contain"></div>`
            const abbr = `<div style="font-weight:900;font-size:38px;letter-spacing:.02em;${dim}">${t.abbrev}</div>`
            const score = `<div style="font-weight:900;font-size:84px;line-height:1;min-width:52px;text-align:center;${dim}">${t.score}</div>`
            const parts = key === 'away' ? [logo, abbr, score] : [score, abbr, logo]
            return `<div style="display:flex;align-items:center;gap:14px">${parts.join('')}</div>`
          }
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">
            <div style="display:flex;align-items:center;justify-content:center;gap:22px;background:rgba(8,15,35,.82);border:3px solid rgba(255,255,255,.55);border-radius:26px;padding:18px 28px;box-shadow:0 14px 40px rgba(0,0,0,.4)">
              ${team(g.away, 'away')}
              <div style="background:#facc15;color:#1e293b;font-weight:900;font-size:24px;letter-spacing:.06em;border-radius:12px;padding:9px 15px;white-space:nowrap">${g.status}</div>
              ${team(g.home, 'home')}
            </div>
            <div style="font-weight:600;font-size:26px;opacity:.9">${[g.venue, g.date].filter(Boolean).join(' · ')}</div>
          </div>`
        }
        const css = (el, s) => Object.assign(el.style, s)
        const pillCss = (bg) => ({
          position: 'absolute',
          background: bg,
          color: '#fff',
          fontWeight: '800',
          fontSize: '23px',
          letterSpacing: '0.01em',
          padding: '11px 22px',
          borderRadius: '999px',
          boxShadow: '0 10px 28px rgba(15,23,42,.35)',
          whiteSpace: 'nowrap',
          opacity: String(ease),
        })
        for (const it of items) {
          const target = it.selector && document.querySelector(it.selector)
          const r = target && target.getBoundingClientRect()
          if (it.type === 'banner') {
            const el = document.createElement('div')
            el.innerHTML = `<span style="background:#facc15;color:#1e293b;border-radius:999px;padding:3px 12px;margin-right:12px;font-size:19px">NEW</span>${it.text}`
            css(el, { ...pillCss('#1d4ed8'), left: '50%', bottom: '26px', transform: `translateX(-50%) scale(${0.9 + 0.1 * ease})`, fontSize: '26px', padding: '12px 26px' })
            ov.appendChild(el)
          } else if (it.type === 'caption') {
            const el = document.createElement('div')
            el.textContent = it.text
            css(el, { ...pillCss('#0f172a'), left: '50%', top: '22px', transform: `translateX(-50%) scale(${0.9 + 0.1 * ease})`, fontSize: '26px', padding: '12px 28px', border: '3px solid rgba(255,255,255,.85)' })
            ov.appendChild(el)
          } else if (it.type === 'ring' && r) {
            const el = document.createElement('div')
            const pulse = Math.sin(k * Math.PI)
            // tight rings (the QR cards sit side by side) stay small so the glow never touches the neighbor
            const grow = it.tight ? 4 + 3 * pulse : 10 + 6 * pulse
            css(el, {
              position: 'absolute',
              left: r.left - grow + 'px',
              top: r.top - grow + 'px',
              width: r.width + grow * 2 + 'px',
              height: r.height + grow * 2 + 'px',
              border: '5px solid #2563eb',
              borderRadius: '18px',
              boxShadow: it.tight ? `0 0 0 ${2 + 3 * pulse}px rgba(37,99,235,.22), 0 0 14px rgba(37,99,235,.5)` : `0 0 0 ${4 + 8 * pulse}px rgba(37,99,235,.22), 0 0 34px rgba(37,99,235,.55)`,
              opacity: String(ease),
            })
            ov.appendChild(el)
          } else if (it.type === 'pill' && r) {
            const el = document.createElement('div')
            el.textContent = it.text
            css(el, { ...pillCss(it.color || '#2563eb'), left: '0px', top: '0px', visibility: 'hidden' })
            ov.appendChild(el)
            const w = el.offsetWidth
            const h = el.offsetHeight
            const cx = Math.min(Math.max(r.left + r.width / 2, w / 2 + 16), window.innerWidth - w / 2 - 16)
            const gap = 26
            const top = it.pos === 'below' ? r.bottom + gap : it.pos === 'edge' ? r.top - h + 2 : r.top - h - gap
            css(el, { left: cx - w / 2 + 'px', top: top + (it.pos === 'below' ? 1 : it.pos === 'edge' ? 0 : -1) * 8 * (1 - ease) + 'px', visibility: 'visible' })
          } else if (it.type === 'tap' && r) {
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const ripple = document.createElement('div')
            const size = 30 + 90 * k
            css(ripple, { position: 'absolute', left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', width: size + 'px', height: size + 'px', borderRadius: '50%', border: '5px solid rgba(255,255,255,.95)', background: 'rgba(37,99,235,.35)', opacity: String(1 - k * 0.85), boxShadow: '0 0 0 3px rgba(37,99,235,.7)' })
            ov.appendChild(ripple)
          } else if (it.type === 'card') {
            const el = document.createElement('div')
            css(el, {
              position: 'absolute',
              inset: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '26px',
              textAlign: 'center',
              background: 'linear-gradient(160deg,#0f172a 0%,#1e3a8a 60%,#2563eb 100%)',
              color: '#fff',
              opacity: String(it.solid ? 1 : ease),
            })
            el.innerHTML = `
              <div style="background:#facc15;color:#1e293b;font-weight:900;font-size:24px;border-radius:999px;padding:6px 20px;letter-spacing:.08em">NEW</div>
              <div style="font-weight:900;font-size:${it.titleSize || 84}px;line-height:1.05;max-width:760px">${it.title}</div>
              ${it.scoreboard ? scoreboardHtml(it.scoreboard) : `<div style="font-weight:600;font-size:34px;opacity:.9;max-width:720px">${it.subtitle}</div>`}
              <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:780px">
                ${(it.pills || []).map((t) => `<span style="background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.55);border-radius:999px;padding:10px 24px;font-weight:700;font-size:26px">${t}</span>`).join('')}
              </div>
              ${it.footer ? `<div style="margin-top:14px;background:#fff;border-radius:999px;padding:18px 34px;box-shadow:0 12px 34px rgba(0,0,0,.35);white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:27px;font-weight:700;color:#334155"><span style="color:#1d4ed8;font-weight:800">${it.footer}</span>${it.footerSub || ''}</div>` : ''}`
            ov.appendChild(el)
          }
        }
      },
      { items, p, k }
    ).then(() =>
      // team logos load over the network; never capture a frame before they have
      page.evaluate(() => Promise.all([...document.querySelectorAll('#gif-overlay img')].map((i) => (i.complete ? 1 : new Promise((res) => { i.onload = i.onerror = res })))))
    )

  const snap = async (dur) => {
    const file = path.join(dir, `f${String(++n).padStart(4, '0')}.png`)
    await page.screenshot({ path: file })
    frames.push({ file, dur })
  }
  const scrollTo = (selector, offset) =>
    page.evaluate(
      ({ selector, offset }) => {
        const main = document.getElementById('main-content')
        const el = selector ? document.querySelector(selector) : null
        main.scrollTop = el ? main.scrollTop + el.getBoundingClientRect().top - offset : 0
      },
      { selector, offset }
    )
  // Fade/scale an item set in over a few frames, then pulse while holding.
  const reveal = async (items, hold, { fadeFrames = 4, pulseFrames = 6 } = {}) => {
    for (let i = 1; i <= fadeFrames; i++) {
      await draw(items, i / fadeFrames, 0)
      await snap(1 / FPS)
    }
    const per = hold / pulseFrames
    for (let i = 0; i < pulseFrames; i++) {
      await draw(items, 1, i / pulseFrames)
      await snap(per)
    }
  }

  const banner = { type: 'banner', text: 'Share any game in a tap' }
  const cap = { type: 'caption', text: CAPTION }
  const sploosh = '[data-testid=qr-share]'
  const nhl = '[data-testid=qr-game-center]'
  const shareCard = `${sploosh}`
  const cardOf = (sel) => `${sel}`

  // ---- Scene 1: title card
  await scrollTo(null, 0)
  await reveal([{ type: 'card', title: 'Share any game.<br>Scan or tap.', subtitle: 'Sploosh.AI Hockey Analytics', pills: ['Share link', 'QR codes', 'Tap to open'], titleSize: 78 }], 1.7, { fadeFrames: 5, pulseFrames: 4 })

  // ---- Scene 2: the Share link in the game header
  const shareBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Share'))
  await shareBtn.evaluate((b) => b.setAttribute('data-gif', 'share'))
  await draw([banner], 1, 0)
  for (const i of [1, 2, 3]) {
    // fade the title card out by redrawing the live page under the banner
    await draw([banner], i / 3, 0)
    await snap(1 / FPS)
  }
  await reveal([banner, { type: 'ring', selector: '[data-gif=share]' }, { type: 'pill', selector: '[data-gif=share]', text: 'Share link: opens your phone’s share sheet', pos: 'below' }], 2.2)

  // ---- Scene 3: scroll down to the QR cards
  const FROM = await page.evaluate(() => document.getElementById('main-content').scrollTop)
  const target = await page.evaluate((sel) => {
    const main = document.getElementById('main-content')
    return main.scrollTop + document.querySelector(sel).closest('figure').getBoundingClientRect().top - 480
  }, sploosh)
  const steps = 9
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    await page.evaluate((y) => (document.getElementById('main-content').scrollTop = y), FROM + (target - FROM) * e)
    await draw([banner, cap], 1, 0)
    await snap(0.07)
  }

  // ---- Scene 4: Sploosh.AI card, then NHL card
  const sploFigure = `${sploosh}`
  await page.evaluate(() => {
    document.querySelector('[data-testid=qr-share]').closest('figure').setAttribute('data-gif', 'splo')
    document.querySelector('[data-testid=qr-game-center]').closest('figure').setAttribute('data-gif', 'nhl')
  })
  await reveal([banner, cap, { type: 'ring', selector: '[data-gif=splo]', tight: true }, { type: 'pill', selector: '[data-gif=splo]', text: 'Scan or tap: this game', pos: 'edge' }], 1.5)
  for (let i = 0; i < 5; i++) {
    await draw([banner, cap, { type: 'ring', selector: '[data-gif=splo]', tight: true }, { type: 'pill', selector: '[data-gif=splo]', text: 'Scan or tap: this game', pos: 'edge' }, { type: 'tap', selector: sploosh }], 1, i / 5)
    await snap(0.1)
  }
  await reveal([banner, cap, { type: 'ring', selector: '[data-gif=nhl]', tight: true }, { type: 'pill', selector: '[data-gif=nhl]', text: 'Scan or tap: NHL.com recap', pos: 'edge', color: '#0f172a' }], 1.5)
  for (let i = 0; i < 5; i++) {
    await draw([banner, cap, { type: 'ring', selector: '[data-gif=nhl]', tight: true }, { type: 'pill', selector: '[data-gif=nhl]', text: 'Scan or tap: NHL.com recap', pos: 'edge', color: '#0f172a' }, { type: 'tap', selector: nhl }], 1, i / 5)
    await snap(0.1)
  }

  // ---- Scene 5: end card
  await reveal([{ type: 'card', title: 'Open this game', scoreboard: game, pills: ['Tap to open', 'Scan to share', 'Works on mobile'], footer: HOST, footerSub: `/?gameId=${GAME}`, titleSize: 70 }], 2.6, { fadeFrames: 5, pulseFrames: 4 })

  // ---- Encode
  const list = frames.map((f) => `file '${f.file}'\nduration ${f.dur.toFixed(3)}`).join('\n') + `\nfile '${frames[frames.length - 1].file}'\n`
  await writeFile(path.join(dir, 'frames.txt'), list)
  execFileSync(
    'ffmpeg',
    [
      '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'frames.txt'),
      '-vf', `fps=${FPS},scale=1080:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
      '-loop', '0', OUT,
    ],
    { stdio: 'inherit' }
  )
  const { size } = await stat(OUT)
  console.log(`${OUT}  ${(size / 1048576).toFixed(2)} MB, ${frames.length} frames, ${(frames.reduce((s, f) => s + f.dur, 0)).toFixed(1)}s`)
  if (args.keep) console.log(`frames kept in ${dir}`)
} finally {
  await browser.close()
  if (!args.keep) await rm(dir, { recursive: true, force: true })
}
