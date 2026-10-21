---
name: social-gif
description: Make an animated GIF of the live hockey app with centered call-outs, pills and highlight rings, for sharing on social media or demos. Use when asked for a shareable GIF, animation, or promo clip of a feature, especially the share link and QR codes.
---

# Social GIF

Builds a 1080x1080 animated GIF from the **live site**: every frame is a real
screenshot, with pills, rings and cards drawn over it from the positions of the
actual elements, so call-outs stay centered on what they point at.

## Steps

1. Make sure the feature is deployed (the GIF captures `https://hockey-preview.sploosh.ai`
   by default), or pass `--base` to point at a local server such as
   `http://localhost:3000`.
2. Install Playwright once if needed (it is shared with the PR screenshots tool):

   ```bash
   (cd scripts/pr-screenshots && npm install && npx playwright install chromium)
   ```

3. Render. Rob wants finished GIFs in `~/Downloads`:

   ```bash
   node scripts/social-gif/make-gif.mjs --out ~/Downloads/sploosh-ai-hockey-share-qr.gif
   ```

   The default game is the Kraken's 4-3 shootout win over the Red Wings on 2026-10-20
   (`2026020149`). Options: `--base <url>`, `--game <gameId>` (use a finished game with
   shots so the shot chart and QR cards render), `--caption <text>` (replaces the score
   pill, which is otherwise built from the game's live data), `--keep` (print the folder
   with the raw frames).
4. **Look at it.** Extract a few frames and read them:

   ```bash
   ffmpeg -ss 6.5 -i ~/Downloads/<file>.gif -frames:v 1 -vf scale=540:-1 /tmp/check.png
   ```

   Check that pills are centered on their target, nothing important is covered
   (scoreline, stats, QR codes), and text is readable at feed size.
5. Check the size. Social feeds cap uploads (X about 15 MB); the default is about 2 MB.
6. Copy or send the GIF to Rob. Never commit the GIF to the repo.

## Changing the story

The scenes live in `scripts/social-gif/make-gif.mjs`, in order: title card, Share link,
scroll to the QR cards, Sploosh.AI card, NHL card, end card. The score pill (`caption`)
shows from the scroll onward. The end card leads with a broadcast-style scorebug built from the
game's live data (team logos, scores with the winner highlighted, a FINAL, FINAL/OT or
FINAL/SO tag, a "Sponsored by Sploosh.AI" strip with the logo, arena and date), then the
heading "See every shot" and the game's exact URL (`<host>/?gameId=<id>`). Each uses `reveal([...items])`
with item types `banner`, `caption`, `ring`, `pill`, `tap` and `card`. To highlight a new feature,
tag its element with a `data-gif` attribute in the page (see `shareBtn`) and add a
scene that rings it and adds a `pill` (`pos`: `above`, `below` or `edge`).

## Notes

- The script hides scrollbars, the mobile menu button and the scroll-to-top button, for framing only.
- 900 CSS px at 1.2x gives the single-column layout (no sidebar), 1080 px wide.
- The GIF is built with ffmpeg (palette per frame set, 12 fps, held frames deduplicated).
- Needs network access to the site and `ffmpeg` on the PATH.
