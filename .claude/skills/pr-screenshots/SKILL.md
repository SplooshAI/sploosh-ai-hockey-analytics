---
name: pr-screenshots
description: Capture and publish before/after screenshots for a pull request that changes what the hockey app looks like. Use before or while opening a PR that touches app, components, hooks, lib, public, or build config under apps/sploosh-ai-hockey-analytics, or when asked for screenshots of a change.
---

# PR screenshots

Every PR that changes visible output gets before and after screenshots. CI does
this automatically (`.github/workflows/pr-screenshots.yml`); this skill is for
checking a change yourself first, or when CI cannot show it.

## Steps

1. Make sure the change is committed on its branch, so `HEAD` is the "after".
2. Capture from live data, fresh builds of `origin/main` and `HEAD`:

   ```bash
   npm run pr:screenshots
   ```

   Output goes to `screenshots/` (gitignored): `before-<page>.png` and
   `after-<page>.png` for each page in `scripts/pr-screenshots/shots.json`.
3. **Look at them.** Open a few. Check the change is actually visible, nothing
   is clipped, and before and after are the same game and viewport.
4. If the change is not visible in the existing pages, add a page to
   `scripts/pr-screenshots/shots.json` (path, viewport, and a `waitFor` text
   that proves the page rendered) and capture again.
5. To put them on a PR by hand, publish and get the Markdown:

   ```bash
   ./scripts/pr-screenshots/publish.sh <pr-number> screenshots
   ```

   This pushes the PNGs to the `pr-screenshots` branch and prints a Markdown
   table that links each image by commit SHA and has already checked each URL
   returns 200. Paste it into the PR **description**, not just a comment. Never link a
   branch name or a relative path.
6. **Show Rob the real thing** (the running app or the images) before treating
   the PR as done.

## If there is no visible change

Add the `no-visual-change` label to the PR instead. Do not skip screenshots for
a change that looks small or cosmetic: those are the ones that get skipped by
mistake.

## Notes

- Needs Node and network access. Playwright and its Chromium install on first
  run into `scripts/pr-screenshots/node_modules`, not the app's dependencies.
- A build of each ref takes a couple of minutes.
- The sidebar game list is live data and can differ between before and after.
  The game page itself uses a fixed finished game so they match.
