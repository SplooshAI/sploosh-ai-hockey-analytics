#!/usr/bin/env bash
#
# Reads the Cloudflare Tunnel token from the macOS clipboard and writes it to
# .env.deploy, without ever printing it. Copy it from the tunnel's Overview tab
# in the Cloudflare dashboard first (Docker option, copy icon next to the
# command). Accepts either the whole `docker run ... --token <token>` command
# or the bare token.
#
# Usage:
#   ./scripts/deploy/set-tunnel-token.sh
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

ENV_FILE=".env.deploy"
[ -f "$ENV_FILE" ] || { echo "No $ENV_FILE — copy .env.deploy.example first." >&2; exit 1; }

clip="$(pbpaste)"
# Pull out whatever follows --token if the whole command was copied.
token="$(printf '%s' "$clip" | sed -n 's/.*--token[= ]\{1,\}\([A-Za-z0-9_=+\/.-]\{20,\}\).*/\1/p' | head -1)"
[ -n "$token" ] || token="$(printf '%s' "$clip" | tr -d '[:space:]')"

# Tunnel tokens are long base64 strings; refuse anything that is plainly not one.
if ! printf '%s' "$token" | grep -Eq '^[A-Za-z0-9_=+/.-]{60,}$'; then
  echo "The clipboard does not look like a Cloudflare tunnel token. Copy it from the tunnel's Overview tab and retry." >&2
  exit 1
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
grep -v '^TUNNEL_TOKEN=' "$ENV_FILE" > "$tmp" || true
printf 'TUNNEL_TOKEN=%s\n' "$token" >> "$tmp"
cat "$tmp" > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "Saved TUNNEL_TOKEN to $ENV_FILE (${#token} characters, not shown)."
