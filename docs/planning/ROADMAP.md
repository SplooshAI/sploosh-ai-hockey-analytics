# Roadmap

**Written:** 2026-11-25, carried over from items 5 to 7 of the `sploosh-ai-web` roadmap.

## 1. Analytics ✅

Decided 2026-11-25: no analytics for the time being. None is installed.

## 2. VM disk

The VM disk is shared (see [Disk space](../deployment/oracle-vm.md#disk-space)). Deploys already prune
untagged images and old build cache.

- Add a report of current disk use, and **ask Rob before any wider cleanup**
- The lasting fix is a larger boot volume in the OCI Console, then growing the filesystem
- Optional: a weekly cleanup timer, once Rob approves running it unattended

## 3. Later

- ~~Uptime monitoring for the public sites~~ (done 2026-11-25: [monitoring and analytics](../deployment/monitoring-and-analytics.md))
- Major dependency upgrades, one PR each (check Next.js support before TypeScript 7)
- Convert any remaining `<img>` tags to `next/image`
- Remove old local branches, after checking they are merged

## 4. Footer version card

This app's footer card is the reference for `sploosh-ai-web` and Furball Frenzy: `vX.Y.Z`, `Released YYYY.MM.DD @ time`
in the visitor's time zone, and a link to the repository. Keep the three reading the same way.

## 5. Separate deploy workflows

Give deployment its own workflow so each deploy shows as its own run in the Actions list, not as a job inside
Main Branch Merge. See `sploosh-ai-web` (`deploy-production.yml`, `deploy-preview.yml`) for the pattern.
