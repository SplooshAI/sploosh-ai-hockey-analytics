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
    - Name: `GitHub Actions Bot`
    - Email: `github-actions-bot@users.noreply.github.com`
    - Comment: `GPG key for automated commits`

   Note: While the actual GitHub Actions bot uses the email `github-actions[bot]@users.noreply.github.com`, 
   we use `github-actions-bot@users.noreply.github.com` for GPG key generation as it's a valid email format.
   The commits will still be associated with the GitHub Actions bot in the UI.

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

3a. If you need to revoke an existing key, you can do so with the following command:
    ```bash
    gpg --gen-revoke YOUR_KEY_ID
    ```

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

## Managing GPG Keys

### List Existing Keys
```bash
# List all keys
gpg --list-secret-keys --keyid-format=long

# List specific key details
gpg --list-secret-keys github-actions-bot@users.noreply.github.com
```

### Delete a GPG Key

1. First, identify the key ID you want to delete:
   ```bash
   gpg --list-secret-keys --keyid-format=long
   ```

2. Delete the private key:
   ```bash
   gpg --delete-secret-key YOUR_KEY_ID
   ```
   - You will be prompted to confirm the deletion
   - Enter "yes" to confirm

3. Delete the public key:
   ```bash
   gpg --delete-key YOUR_KEY_ID
   ```
   - You must delete the private key before deleting the public key
   - Enter "yes" to confirm

4. Verify the key is deleted:
   ```bash
   gpg --list-keys YOUR_KEY_ID
   # Should return "gpg: key YOUR_KEY_ID not found"
   ```

### Clean Up GitHub Secrets

After deleting a GPG key, remember to:

1. Remove or update the corresponding GitHub secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Delete or update `GPG_PRIVATE_KEY`
   - Delete or update `GPG_PASSPHRASE`

2. If you're replacing the key:
   - Generate a new key following the setup instructions above
   - Update the GitHub secrets with the new key information
   - Test the workflow to ensure commits are being signed correctly

### Best Practices

- Keep a secure backup of important GPG keys
- Document key expiration dates and rotation schedule
- Remove unused or expired keys promptly
- Update GitHub secrets immediately after key changes
- Audit GPG keys periodically (recommended: every 3-6 months)
