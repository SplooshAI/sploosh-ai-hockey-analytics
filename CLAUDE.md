# Sploosh.AI Hockey Analytics

A Next.js app in `apps/sploosh-ai-hockey-analytics`, deployed as a Docker
container on an Oracle Cloud VM behind a Cloudflare Tunnel
(`docs/deployment/oracle-vm.md`). Live at <https://hockey-preview.sploosh.ai/>.

## Git workflow

- **Branch naming:** `YYYY.MM.DD/short-kebab-description`, dated the day the
  branch is created. Get the date from `date`, never from memory.
- **Never commit directly to `main`.** Branch off `main`, push, open a PR.
- **Commits are GPG-signed** and PR titles are semantic (`feat:`, `fix:`,
  `chore:`, `docs:` ...); the title decides the version bump. See
  `CONTRIBUTING.md`.
- Only commit code that has actually been run and verified.

## Screenshots in PRs

**Every PR that changes what a user can see needs before and after
screenshots, every time, even if the change looks small or cosmetic.**
Visible changes are anything under `apps/sploosh-ai-hockey-analytics/` in
`app/`, `components/`, `hooks/`, `lib/`, `public/`, or the build config.

- **It is automatic.** The `PR Screenshots` workflow
  (`.github/workflows/pr-screenshots.yml`) builds `main` and the PR head,
  captures the pages in `scripts/pr-screenshots/shots.json`, and writes a
  before/after table into the **PR description** (between
  `<!-- pr-screenshots:start -->` and `<!-- pr-screenshots:end -->`; it is
  replaced on every push and leaves the rest of the description alone). The
  screenshots belong in the description, not buried in a comment. Do not
  attach images by hand unless the workflow cannot show the change.
- **A change with no visible effect** (a refactor, a dependency bump, docs, a
  deploy script) gets the `no-visual-change` label instead.
- **Add a page to `shots.json`** when a PR changes something the existing
  pages do not show (a new route, a state that needs a specific game).
- **Always against live data and a fresh build.** Never screenshot a stale
  build, a cached image, or a copy made only for a preview: the shot must show
  what the code produces right now. The scripts always build from source.
- **When opening a PR**, check the description before calling it done: if the
  change is visible, the screenshots block must be there (wait for the
  workflow, or use the `pr-screenshots` skill
  (`.claude/skills/pr-screenshots/SKILL.md`) to capture and publish the same
  before/after yourself and paste the table in). If it is not visible, the
  `no-visual-change` label must be on the PR.
- **Images are linked by commit SHA**, from the never-deleted
  `pr-screenshots` branch, not by branch name or relative path. A relative
  path does not render in a PR, and a branch-name link turns into a 404 when
  the branch is deleted.
- **Then show Rob the real thing** (the running app, or the screenshots)
  before calling the PR done. A screenshot Claude looked at itself is not the
  same as Rob having seen it.
