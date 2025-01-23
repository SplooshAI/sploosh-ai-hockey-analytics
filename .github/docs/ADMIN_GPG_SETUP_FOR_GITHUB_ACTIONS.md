# Setting Up GPG Signing for GitHub Actions

This guide explains how to set up GPG signing for automated commits made by GitHub Actions.

## 1. Generate a GPG Key

1. Install GPG if not already installed:
   ```bash
   # macOS
   brew install gnupg
   
   # Ubuntu/Debian
   sudo apt-get install gnupg
   ```

2. Generate a new GPG key:
   ```bash
   gpg --full-generate-key
   ```
   
   When prompted:
   - Choose RSA and RSA (default)
   - Use 4096 bits
   - Set expiration to 0 (never expires) or specific duration
   - Enter details for the GitHub Actions bot:
    - Name: `github-actions[bot]`
    - Email: `github-actions[bot]@users.noreply.github.com`
    - Comment: `GPG key for automated commits`

## 2. Export the GPG Key

1. List your GPG keys to get the key ID:
   ```bash
   gpg --list-secret-keys --keyid-format=long
   ```
   Look for the key ID after "sec rsa4096/" (it's a 16-character string)

2. Export the private key (you'll need this for the GitHub secret):
   ```bash
   gpg --export-secret-key --armor YOUR_KEY_ID > github_actions_private.gpg
   ```

3. Set a secure passphrase when prompted

## 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add two new secrets:
   - Name: `GPG_PRIVATE_KEY`
     - Value: The entire contents of `github_actions_private.gpg`
   - Name: `GPG_PASSPHRASE`
     - Value: The passphrase you set for the key

## 4. Verify Setup

1. After adding the secrets, trigger a workflow that creates commits
2. Verify the commits show as "Verified" in GitHub
3. The signature should show as verified from "github-actions[bot]"

## Security Notes

- Store the GPG private key and passphrase securely
- Consider setting an expiration date on the GPG key
- Regularly rotate the GPG key (recommended: every 6-12 months)
- Delete local copies of `github_actions_private.gpg` after adding to GitHub
- Only organization admins should have access to the GPG credentials

## Troubleshooting

If commits aren't being signed:

1. Check workflow logs for GPG-related errors
2. Verify the secrets are correctly set in GitHub
3. Ensure the workflow has the correct permissions
4. Verify the GPG key hasn't expired
