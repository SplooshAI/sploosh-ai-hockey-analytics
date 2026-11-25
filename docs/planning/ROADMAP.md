# Roadmap

**Written:** 2026-11-25, carried over from items 5 to 7 of the `sploosh-ai-web` roadmap.

## 1. Analytics

No analytics package is listed in the app's `package.json`. **Rob decides:** add one (for example Cloudflare
Web Analytics or PostHog) or leave the site without it. Check any privacy wording matches the choice.

## 2. VM disk

The VM disk is shared (see [Disk space](../deployment/oracle-vm.md#disk-space)). Deploys already prune
untagged images and old build cache.

- Add a report of current disk use, and **ask Rob before any wider cleanup**
- The lasting fix is a larger boot volume in the OCI Console, then growing the filesystem
- Optional: a weekly cleanup timer, once Rob approves running it unattended

## 3. Later

- Uptime monitoring for the public sites
- Major dependency upgrades, one PR each (check Next.js support before TypeScript 7)
- Convert any remaining `<img>` tags to `next/image`
- Remove old local branches, after checking they are merged
