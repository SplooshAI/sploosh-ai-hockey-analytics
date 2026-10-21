#!/usr/bin/env bash
#
# One-time (re-runnable) setup of the `hockeydeploy` user on the Oracle Cloud
# VM, including its own rootless Docker daemon.
#
# Needs an existing account on the VM that has passwordless sudo — on the
# current VM that is `cipdeploy` (see docs/deployment/oracle-vm.md). That
# account is used ONLY here, once; everything after this runs as
# `hockeydeploy`.
#
# Usage:
#   ./scripts/deploy/provision-vm.sh <PUBLIC_IP> [ADMIN_USER] [ADMIN_KEY]
#
#   ADMIN_USER  defaults to cipdeploy
#   ADMIN_KEY   defaults to ~/.ssh/cip_oracle_deploy
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

HOST="${1:-}"
[ -n "$HOST" ] || { echo "Usage: $0 <PUBLIC_IP> [ADMIN_USER] [ADMIN_KEY]" >&2; exit 1; }
ADMIN_USER="${2:-cipdeploy}"
ADMIN_KEY="${3:-$HOME/.ssh/cip_oracle_deploy}"
KEY="$HOME/.ssh/hockey_oracle_deploy"
PUBFILE="infra/oracle-cloud/hockey_oracle_deploy.pub"

[ -f "$ADMIN_KEY" ] || { echo "Missing admin key at $ADMIN_KEY" >&2; exit 1; }
[ -f "$PUBFILE" ] || { echo "Missing $PUBFILE" >&2; exit 1; }
[ -f "$KEY" ] || { echo "Missing deploy key at $KEY — see docs/deployment/oracle-vm.md, step 1" >&2; exit 1; }

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o BatchMode=yes)

echo "==> Stage 1 (as $ADMIN_USER, with sudo): create hockeydeploy, key, linger"
ssh -i "$ADMIN_KEY" "${SSH_OPTS[@]}" "$ADMIN_USER@$HOST" \
  "sudo bash -s -- \"$(cat "$PUBFILE")\"" < infra/oracle-cloud/provision-hockeydeploy.sh

echo "==> Stage 2 (as hockeydeploy): install rootless Docker and start its daemon"
# A fresh SSH login gives the user a systemd session (XDG_RUNTIME_DIR), which
# the rootless installer needs; `sudo -u` from stage 1 would not.
ssh -i "$KEY" "${SSH_OPTS[@]}" "hockeydeploy@$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
if ! systemctl --user is-active --quiet docker; then
  dockerd-rootless-setuptool.sh install
fi
systemctl --user enable --now docker
# Non-interactive SSH commands do not read ~/.bashrc, so scripts always set
# DOCKER_HOST themselves; this is for people who log in and type `docker`.
grep -q 'hockeydeploy rootless docker' ~/.bashrc 2>/dev/null || cat >> ~/.bashrc <<'EOF'

# hockeydeploy rootless docker
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/docker.sock"
EOF
export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/docker.sock"
docker version --format 'rootless daemon: {{.Server.Version}} on {{.Server.Os}}/{{.Server.Arch}}'
docker info --format 'security options: {{.SecurityOptions}}'
REMOTE

echo "==> Provisioned. Deploy with: npm run deploy:sync && npm run deploy"
