#!/bin/bash

# Configuration
BOT_NAME="GitHub Actions Bot"
BOT_EMAIL="github-actions-bot@users.noreply.github.com"
KEY_COMMENT="GPG key for automated commits"

# Generate GPG key configuration file
cat > gpg-key-config <<EOF
%echo Generating GPG key for GitHub Actions
Key-Type: ED25519
Key-Curve: ed25519
Key-Usage: sign
Subkey-Type: ECDH
Subkey-Curve: cv25519
Subkey-Usage: encrypt
Name-Real: $BOT_NAME
Name-Comment: $KEY_COMMENT
Name-Email: $BOT_EMAIL
Expire-Date: 0
%no-protection
%commit
%echo Done
EOF

# Generate key
gpg --batch --generate-key gpg-key-config

# Export public key
KEY_ID=$(gpg --list-secret-keys --keyid-format LONG "$BOT_EMAIL" | grep sec | awk '{print $2}' | cut -d'/' -f2)
echo -e "\nPublic Key:"
gpg --armor --export $KEY_ID

# Export private key (for GitHub secret)
echo -e "\nPrivate Key (for GitHub secret):"
gpg --armor --export-secret-key $KEY_ID

# Cleanup
rm gpg-key-config

echo -e "\nKey generation complete!"
echo "Key ID: $KEY_ID"
echo "Email: $BOT_EMAIL" 