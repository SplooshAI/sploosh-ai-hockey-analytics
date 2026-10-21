#!/usr/bin/env bash
#
# Ships this repo to the Oracle Cloud VM and manages its containers there.
# Everything runs as the dedicated `hockeydeploy` user, against that user's own
# rootless Docker daemon — never as root and never through the VM's shared
# Docker daemon (which belongs to a different project).
#
# Usage:
#   ./scripts/deploy/deploy-to-oracle.sh <command> [service]
#
# Commands:
#   sync       Copy code + .env.deploy to the VM. Starts and stops nothing.
#   up         sync, then rebuild and (re)create the app. Without a service,
#              the tunnel is brought up too; it is only recreated if its
#              config changed, so a routine code deploy leaves it connected.
#   stop       Stop containers, keep them (and their images) on the VM.
#   start      Start stopped containers.
#   restart    Restart containers in place, no rebuild.
#   down       Remove containers and the network (images stay cached).
#   status     Container state on the VM, plus an HTTP check of the public URL.
#   logs       Last 100 lines of logs (add FOLLOW=1 to stream).
#
# service (optional):  app | tunnel   — default is both.
#
# Settings come from .env.deploy (see .env.deploy.example):
#   HOCKEY_VM_IP, HOCKEY_PUBLIC_HOSTNAME, TUNNEL_TOKEN
#
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

usage() { sed -n '2,/^set -euo/p' "${BASH_SOURCE[0]}" | sed '$d' | sed 's/^# \{0,1\}//'; }

CMD="${1:-}"
[ -n "$CMD" ] || { usage >&2; exit 1; }
SERVICE_ARG="${2:-}"

ENV_FILE=".env.deploy"
[ -f "$ENV_FILE" ] || { echo "No $ENV_FILE — copy .env.deploy.example and fill it in." >&2; exit 1; }

# Read with grep rather than sourcing: .env files are not guaranteed to be
# shell-safe, and the token should never be echoed by a stray `set -x`.
env_get() { grep -m1 "^$1=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true; }
HOST="$(env_get HOCKEY_VM_IP)"
PUBLIC_HOSTNAME="$(env_get HOCKEY_PUBLIC_HOSTNAME)"
[ -n "$HOST" ] || { echo "Set HOCKEY_VM_IP in $ENV_FILE." >&2; exit 1; }

KEY="$HOME/.ssh/hockey_oracle_deploy"
USER_NAME="hockeydeploy"
REMOTE_DIR="/home/$USER_NAME/sploosh-ai-hockey-analytics"
[ -f "$KEY" ] || { echo "Missing deploy key at $KEY — see docs/deployment/oracle-vm.md, step 1." >&2; exit 1; }

SSH_OPTS=(-i "$KEY" -o StrictHostKeyChecking=accept-new -o BatchMode=yes -o ConnectTimeout=10)
ssh_vm() { ssh "${SSH_OPTS[@]}" "$USER_NAME@$HOST" "$@" 2> >(grep -v -i 'post-quantum\|store now\|openssh.com/pq' >&2); }

# Non-interactive SSH does not read ~/.bashrc, so point the docker CLI at this
# user's own daemon explicitly.
REMOTE_ENV='export XDG_RUNTIME_DIR=/run/user/$(id -u) DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock'
COMPOSE="docker compose -p sploosh-ai-hockey-analytics-prod --env-file $ENV_FILE \
-f docker/sploosh-ai-hockey-analytics/production/docker-compose.yml \
-f docker/sploosh-ai-hockey-analytics/production/docker-compose.tunnel.yml --profile tunnel"

case "$SERVICE_ARG" in
  "")     SERVICES="" ;;
  app)    SERVICES="sploosh-ai-hockey-analytics-app" ;;
  tunnel) SERVICES="cloudflared" ;;
  *) echo "Unknown service '$SERVICE_ARG' (use app or tunnel)." >&2; exit 1 ;;
esac

remote() { ssh_vm "$REMOTE_ENV; cd $REMOTE_DIR && $*"; }

do_sync() {
  echo "==> Syncing code to $USER_NAME@$HOST:$REMOTE_DIR (no .git, no node_modules, no secrets in the diff)"
  ssh_vm "mkdir -p $REMOTE_DIR"
  rsync -az --delete \
    -e "ssh ${SSH_OPTS[*]}" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '**/node_modules' \
    --exclude '.next' \
    --exclude 'coverage' \
    --exclude '.DS_Store' \
    --exclude '.env.deploy' \
    ./ "$USER_NAME@$HOST:$REMOTE_DIR/" 2> >(grep -v -i 'post-quantum\|store now\|openssh.com/pq' >&2)
  echo "==> Syncing $ENV_FILE separately (never logged)"
  scp "${SSH_OPTS[@]}" "$ENV_FILE" "$USER_NAME@$HOST:$REMOTE_DIR/$ENV_FILE" 2> >(grep -v -i 'post-quantum\|store now\|openssh.com/pq' >&2)
  ssh_vm "chmod 600 $REMOTE_DIR/$ENV_FILE"
}

case "$CMD" in
  sync)
    do_sync
    ;;
  up)
    do_sync
    GIT_HASH="$(git rev-parse HEAD)"
    GIT_DATE="$(git log -1 --format=%aI)"
    echo "==> Building and starting ${SERVICE_ARG:-app + tunnel} at ${GIT_HASH:0:7}"
    # Always detached. An attached `docker compose up` over SSH stops every
    # container the moment the session's stdin closes (found on the CIP deploy).
    remote "GIT_HASH=$GIT_HASH GIT_DATE=$GIT_DATE $COMPOSE up -d --build $SERVICES"
    ;;
  stop)    remote "$COMPOSE stop $SERVICES" ;;
  start)   remote "$COMPOSE start $SERVICES" ;;
  restart) remote "$COMPOSE restart $SERVICES" ;;
  down)    remote "$COMPOSE down" ;;
  status)
    remote "$COMPOSE ps -a"
    if [ -n "$PUBLIC_HOSTNAME" ]; then
      echo
      code="$(curl -s -o /dev/null --max-time 15 -w '%{http_code}' "https://$PUBLIC_HOSTNAME/" || true)"
      echo "https://$PUBLIC_HOSTNAME/ -> ${code:-000}$([ "${code:-000}" = 000 ] && echo ' (unreachable)')"
    fi
    ;;
  logs)
    remote "$COMPOSE logs --tail 100 ${FOLLOW:+-f} $SERVICES"
    ;;
  -h|--help|help) usage ;;
  *) echo "Unknown command: $CMD" >&2; usage >&2; exit 1 ;;
esac
