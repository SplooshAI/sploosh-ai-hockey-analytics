# Deploying to the Oracle Cloud VM

This puts the production container of the app on the Oracle Cloud VM that
already hosts the Coordination Intelligence Platform (CIP), reachable through a
Cloudflare Tunnel at a `sploosh.ai` subdomain. It follows the same pattern as
CIP (`docs/plans/2026.08.17/oracle-cloud-deploy.md` in that repo) with one
deliberate difference: this app runs under its own VM user and its own Docker
daemon, so it cannot see or touch CIP's containers, and vice versa.

The app is stateless (a Next.js server that calls the public NHL API), so
there is no database, volume, or backup to manage.

## How it fits together

```text
Cloudflare edge  ◄── outbound-only connection ──  cloudflared (container)
hockey-preview.sploosh.ai                                │ http://sploosh-ai-hockey-analytics-app:3000
                                                         ▼
                                              app (container, Next.js standalone)

        both run in the `hockeydeploy` user's rootless Docker daemon
        on the VM `sploosh.ai-vm` (Oracle Linux 9, Ampere A1, aarch64)
```

- No inbound port is opened for the app. The tunnel is outbound-only, and the
  app publishes **no host port** in the tunnel overlay. That matters on this
  VM: CIP already holds host port 3000.
- The VM's only inbound rule is SSH (22), as for CIP.

## Who is who on the VM

| Account | Purpose | sudo | `docker` group |
| --- | --- | --- | --- |
| `opc` | OCI's default account. Never used day to day. | yes | no |
| `cipdeploy` | CIP's deploy user. Used **once** here, to create `hockeydeploy`. | yes | yes |
| `hockeydeploy` | Owns this app's containers and nothing else. | **no** | **no** |

`hockeydeploy` runs [rootless Docker](https://docs.docker.com/engine/security/rootless/):
its own daemon, started by its own systemd user service, with its own images
and containers. It is deliberately **not** in the `docker` group, which is
root-equivalent and would also expose CIP's containers.

What this isolates, and what it does not:

- Isolated: containers, images, networks, and the Docker daemon; a compromised
  hockey container or deploy key cannot read CIP's `.env`, containers, or
  database, and cannot become root.
- Shared: the VM's kernel, CPU, RAM, and **disk**. A runaway build here can
  still fill the disk CIP uses (see [Disk space](#disk-space)).

## One-time setup

### 1. Generate a dedicated SSH key

Never reuse another project's key.

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hockey_oracle_deploy -N "" \
  -C "hockey-deploy-oracle-$(date +%Y%m%d)"
cp ~/.ssh/hockey_oracle_deploy.pub infra/oracle-cloud/hockey_oracle_deploy.pub
```

No passphrase, so the deploy script can run unattended. Only the `.pub` file is
committed; the private key never is.

### 2. Create `.env.deploy`

```bash
cp .env.deploy.example .env.deploy
```

Fill in `HOCKEY_VM_IP` from the OCI Console (Compute > Instances >
`sploosh.ai-vm` > Public IP address). `.env.deploy` is gitignored. Leave
`TUNNEL_TOKEN` empty until you have created the tunnel
([cloudflare-tunnel.md](cloudflare-tunnel.md)); use any placeholder such as
`not-set-yet` to deploy the app alone first, since Compose refuses to
interpolate an empty token even for a service that is not started.

### 3. Create the `hockeydeploy` user and its Docker daemon

```bash
npm run deploy:provision
```

This runs `scripts/deploy/provision-vm.sh`, which is safe to re-run:

1. As `cipdeploy` (passwordless sudo; the CIP key at
   `~/.ssh/cip_oracle_deploy`), runs `infra/oracle-cloud/provision-hockeydeploy.sh`
   to create the user, install the SSH key, install `slirp4netns`, and enable
   systemd *linger* so the user's services start at boot with nobody logged in.
2. As `hockeydeploy`, installs rootless Docker and enables its systemd user
   service.

On a brand-new VM with no `cipdeploy`, create any sudo-capable account
first (for example by pasting the CIP `cloud-init.yaml` into the OCI Console's
Initialization script field) and pass it as the second argument:
`./scripts/deploy/provision-vm.sh <IP> <admin-user> <admin-key>`.

## Deploying and operating

All of these run from your laptop and act on the VM as `hockeydeploy`.

| Command | What it does |
| --- | --- |
| `npm run deploy` | Sync code, rebuild the image on the VM, recreate the app and tunnel. |
| `npm run deploy:sync` | Copy code and `.env.deploy` only. Starts and stops nothing. |
| `npm run deploy:stop` | Stop the containers; they stay on the VM. |
| `npm run deploy:start` | Start stopped containers. |
| `npm run deploy:restart` | Restart in place, no rebuild. |
| `npm run deploy:down` | Remove containers and the network; images stay cached. |
| `npm run deploy:status` | Container state, plus an HTTP check of the public URL. |
| `npm run deploy:logs` | Last 100 log lines (`FOLLOW=1 npm run deploy:logs` to stream). |

Every command except `sync` and `down` takes an optional service,
`app` or `tunnel`, so the tunnel can be restarted without touching the app:

```bash
./scripts/deploy/deploy-to-oracle.sh restart tunnel
# redeploy code, leave the tunnel connected
./scripts/deploy/deploy-to-oracle.sh up app
```

`up` is always detached. An attached `docker compose up` over SSH stops every
container the moment the session's stdin closes, which is how CIP's first
deploy lost its stack.

The app image is built on the VM from the synced source, tagged with the
current git commit (`GIT_HASH`, `GIT_DATE`) so the version shown in the app
matches what shipped.

### Logging in to look around

```bash
ssh -i ~/.ssh/hockey_oracle_deploy hockeydeploy@<IP>
docker ps          # DOCKER_HOST is set in ~/.bashrc by the provision script
```

Non-interactive SSH does not read `~/.bashrc`, which is why the deploy script
exports `DOCKER_HOST` itself.

## Verified on 2026-10-20

Run against `sploosh.ai-vm` (Oracle Linux 9.8, aarch64, 4 OCPU / 24 GB) with
the app at commit `f40c81f` plus this branch.

- [x] Local Docker, production stack: built, started, `GET /` returned 200 with
      the app title.
- [x] Local Docker, development stack: started, returned 200, torn down.
- [x] `hockeydeploy` created with no sudo and no `docker` group; its Docker
      daemon reports the `rootless` security option.
- [x] Isolation: `docker ps` as `hockeydeploy` lists only this app's
      container; CIP's six containers were untouched and still serving on
      host port 3000 throughout.
- [x] Deploy: first build on the VM took about 90 seconds; the container
      reported `healthy`; `GET /` returned the app title from inside the
      container.
- [x] `stop`, `start`, `restart`, `down`, and a cached `up` all worked
      (the cached `up` took about 10 seconds).
- [x] Restarting the user's Docker daemon brought the app back on its own
      (`restart: unless-stopped`). Linger and the user service are enabled.
- [x] Public URL through the tunnel: `https://hockey-preview.sploosh.ai/`
      returned 200 with the app title. Stopping only the tunnel made it
      return 530; `start` and `restart` on the tunnel, and `restart` on the
      app, brought it back to 200. CIP's own public URL stayed 200 throughout.
      See [cloudflare-tunnel.md](cloudflare-tunnel.md).
- [ ] Full VM reboot. Not tested, to avoid taking CIP down; the pieces it
      relies on (linger, the enabled user service, the restart policy) are
      verified individually above.

## Disk space

The VM's 30 GB boot volume is shared with CIP. Each build leaves about 1.5 GB
of layers and untagged images behind, so `npm run deploy` ends by pruning
untagged images and trimming the build cache to 500 MB (about 90 seconds for a
full rebuild, seconds for a cached one). Verified on 2026-10-21: a full rebuild
and deploy left the disk at 65% used, where the same build used to add about
1.5 GB.

Other things worth knowing:

- Watch `df -h /` on the VM, or the last line the deploy prints.
- Each Docker daemon keeps its own cache. CIP's lives under the system
  daemon, so clear it as `cipdeploy` with `sudo docker builder prune`; this
  deploy's cleanup never touches it.
- Safe system cleanups when it gets tight: `sudo dnf clean all` (about 1 GB)
  and `sudo journalctl --vacuum-size=100M`.
- The volume group has no free space and `/var/oled` is a separate Oracle
  volume that cannot be shrunk. The real fix for a bigger disk is growing the
  boot volume in the OCI Console (Block Storage > Boot Volumes).

## Rotating or removing

- **Rotate the SSH key:** generate a new one, copy the `.pub` into
  `infra/oracle-cloud/`, and run `npm run deploy:provision` again; it rewrites
  `authorized_keys`.
- **Remove the app entirely:** `npm run deploy:down`, then on the VM as
  `cipdeploy`: `sudo loginctl disable-linger hockeydeploy && sudo userdel -r hockeydeploy`.
  Nothing outside that user's home is affected.

## Things worth doing later

- Build and push the image to GHCR from CI (the `ghcr:build` script already
  produces it) and pull it on the VM instead of building there: faster deploys,
  no build toolchain load next to CIP.
- A GitHub Actions workflow that runs `npm run deploy` on merge to `main`.
- Pin `cloudflared` to a version instead of `latest`.
- Uptime monitoring on the public URL.
