# Cloudflare Tunnel for the Oracle VM deployment

This publishes the app running on the Oracle VM at a `sploosh.ai` subdomain
without opening any inbound port. `cloudflared` (a container next to the app)
holds an outbound connection to Cloudflare; Cloudflare routes the public
hostname down it. The dashboard walkthrough mirrors the CIP guide
(`docs/cloudflare/tunnel-setup.md` in the coordination-intelligence-platform
repo), which was written by clicking through the real dashboard.

## Choosing the hostname

CIP uses a tunnel named `cip-preview` with flat, single-label subdomains:
`cip-preview-web`, `cip-preview-auth`, `cip-preview-neo4j`. This app has one
public service, so it needs one hostname.

| Option | Hostname | Tunnel name | Notes |
| --- | --- | --- | --- |
| **Recommended** | `hockey-preview.sploosh.ai` | `hockey-preview` | Mirrors `cip-preview`. "Preview" signals it is not the production site (that is still the Vercel deployment), and the name can later be promoted without renaming anything. |
| Production-style | `hockey.sploosh.ai` | `hockey` | Use once this deployment replaces the Vercel one. |
| Descriptive | `hockey-analytics.sploosh.ai` | `hockey-analytics` | Matches the repo name; longer. |

Keep it **one label** deep. `*.sploosh.ai` is covered by Cloudflare's free
Universal SSL certificate, but a two-label name such as
`web.hockey-preview.sploosh.ai` is not, and would need a paid Advanced
Certificate. If an API is ever exposed separately, follow CIP's flat pattern:
`hockey-preview-api.sploosh.ai`.

The examples below use the recommended name.

## Step 1: Create the tunnel

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/) with the
   account that manages `sploosh.ai`.
2. Sidebar, under **Protect & connect**: **Networking**, then **Tunnels**.
3. **Create Tunnel**, name it `hockey-preview`, **Create Tunnel**.
4. The next page offers an install command for various operating systems.
   Ignore the commands; the page only continues once a connector is live,
   which happens after the first deploy.

## Step 2: Get the token

1. On the tunnel's **Overview** tab, pick the **Docker** option under
   "Install cloudflared connector".
2. Copy only the token (the string after `--token`).
3. Copy the whole command with the copy icon, then run
   `npm run deploy:token`. It reads the token from the clipboard, writes
   `TUNNEL_TOKEN=` into `.env.deploy`, and never prints it. (Pasting the
   token into `.env.deploy` by hand works too.)

   Treat it like a password. Anyone with it can point this tunnel anywhere.
   Do not paste it into chat, an issue, or a commit. `.env.deploy` is
   gitignored, and `npm run deploy` copies it to the VM over SSH with mode 600.

## Step 3: Add the public hostname

From the tunnel's **Routes** tab:

1. **+ Add route**, choose **Published application** (not "Private hostname").
2. Fill in:

   | Field | Value |
   | --- | --- |
   | Subdomain | `hockey-preview` |
   | Domain | `sploosh.ai` (check the dropdown if the account has more than one domain) |
   | Path | leave blank |
   | Service URL | `http://sploosh-ai-hockey-analytics-app:3000` |

   The "Full hostname" preview should read `hockey-preview.sploosh.ai`.
3. **Add route**. Cloudflare creates the DNS record itself.

**The Service URL is the compose service name, not `localhost`.** `cloudflared`
connects from inside the same Docker network, where `localhost` is the
`cloudflared` container itself. The name comes from
`docker/sploosh-ai-hockey-analytics/production/docker-compose.yml`; if the
service is ever renamed there, update this route to match.

## Step 4: Start it and verify

```bash
npm run deploy          # app + tunnel
npm run deploy:status   # container state, plus the HTTP status of the public URL
```

The tunnel's Overview tab shows **Inactive** until the first deploy with a real
token and changes to **Healthy** once `cloudflared` connects. Then open
`https://hockey-preview.sploosh.ai/`.

To work on the tunnel alone:

```bash
./scripts/deploy/deploy-to-oracle.sh logs tunnel
./scripts/deploy/deploy-to-oracle.sh restart tunnel
```

## Why a separate tunnel from CIP

CIP's tunnel token can only serve CIP's hostnames from CIP's containers, and a
token only holds one live connector per tunnel. A second tunnel keeps the two
projects independent: rotating or deleting one never affects the other, and
each token lives only in its own project's `.env` file on the VM.

## If something needs to change later

- **Token exposed:** on the tunnel's Overview tab, use **Rotate token**, update
  `TUNNEL_TOKEN` in `.env.deploy`, then `npm run deploy:sync` and
  `./scripts/deploy/deploy-to-oracle.sh up tunnel`.
- **Renaming the hostname:** edit the route in the dashboard and
  `HOCKEY_PUBLIC_HOSTNAME` in `.env.deploy`; no code change.
- **Restricting access** to a preview (an email allowlist, say): Zero Trust >
  Access controls > Applications > Self-hosted, on the same hostname. Optional;
  the app serves public NHL data and has no login.
- **Tunnel shows Inactive unexpectedly:** run `npm run deploy:status`. If the
  tunnel container is not running, `deploy:logs` on `tunnel` shows why.
