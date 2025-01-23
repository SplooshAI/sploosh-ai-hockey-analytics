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

- `feat: add new feature` (bumps minor version)
- `fix: resolve bug` (bumps patch version)
- `feat!: breaking change` (bumps major version)
- `docs: update readme` (bumps patch version)
- `style: format code` (bumps patch version)
- `refactor: improve code` (bumps patch version)
- `perf: optimize performance` (bumps patch version)
- `test: add tests` (bumps patch version)
- `build: update dependencies` (bumps patch version)
- `ci: update workflows` (bumps patch version)
- `chore: maintenance` (bumps patch version)
