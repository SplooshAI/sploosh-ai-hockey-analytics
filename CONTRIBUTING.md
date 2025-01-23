# Contributing

## Commit Signing Requirements

All commits must be signed using GPG keys. To set up commit signing:

1. Generate a GPG key if you don't have one:
   ```bash
   gpg --full-generate-key
   ```

2. Add the GPG key to your GitHub account:
   - List your GPG keys: `gpg --list-secret-keys --keyid-format=long`
   - Copy your GPG key ID
   - Export the public key: `gpg --armor --export YOUR_KEY_ID`
   - Add the key to GitHub: Settings → SSH and GPG keys → New GPG key

3. Configure Git to use your GPG key:
   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   ```

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/). PR titles should be formatted as:

Breaking Changes (major version bump):
- `feat!: breaking feature change`
- `fix!: breaking bug fix`
- `refactor!: breaking code change`
- Any type can include `!` to indicate a breaking change

Regular Changes:
- `feat: add new feature` (minor version bump)
- `fix: resolve bug` (patch version bump)
- `docs: update readme` (patch version bump)
- `style: format code` (patch version bump)
- `refactor: improve code` (patch version bump)
- `perf: optimize performance` (patch version bump)
- `test: add tests` (patch version bump)
- `build: update dependencies` (patch version bump)
- `ci: update workflows` (patch version bump)
- `chore: maintenance` (patch version bump)
- `revert: undo previous change` (patch version bump)

Note: The `!` indicates a breaking change and will trigger a major version bump regardless of the type prefix used.
