# Deploy

API runs on a Linux VPS under PM2. Secrets come from Doppler. CI/CD via GitHub Actions (`.github/workflows/deploy-api.yml`) SSHes in and reloads.

## First-time server setup

The deploy workflow expects the repo cloned at `/opt/fernandolimaindie` with PM2 already running. Bootstrap a fresh VPS once:

```bash
ssh <deploy-user>@<host>
sudo apt-get update
curl -fsSL https://raw.githubusercontent.com/lnfernandobr/fernandolimaindie/main/scripts/bootstrap-server.sh -o bootstrap.sh
bash bootstrap.sh
```

The script is **idempotent** — re-run it if something is off. It installs Node 24, pnpm, pm2, Doppler CLI; clones the repo at `/opt/fernandolimaindie`; creates `/var/log/fernandolimaindie-api`; starts PM2; and persists PM2 across reboots.

### Doppler auth

The script exits early if Doppler is not authenticated. Run once on the box:

```bash
doppler login
cd /opt/fernandolimaindie
doppler setup --project fernandolimaindie --config prd
bash scripts/bootstrap-server.sh   # re-run to finish
```

## GitHub Actions secrets

`.github/workflows/deploy-api.yml` needs:

| Secret            | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| `SSH_HOST`        | server hostname or IP                                    |
| `SSH_USER`        | deploy user (same one used for bootstrap)                |
| `SSH_PRIVATE_KEY` | private key whose pub key is in `~/.ssh/authorized_keys` |
| `SSH_PORT`        | (optional) defaults to `22`                              |

## Routine deploys

Push to `main` with changes under `apps/api/**`, `pnpm-lock.yaml`, or `package.json`. CI runs first; on green, the deploy job SSHes in and runs `git reset --hard origin/main` + `pnpm install` + `pm2 reload`.

Manual trigger: GitHub → Actions → **Deploy API** → Run workflow.

## Operating on the server

```bash
pm2 status
pm2 logs fernandolimaindie-api
pm2 reload fernandolimaindie-api --update-env   # after Doppler secret changes
```

Logs at `/var/log/fernandolimaindie-api/{out,err}.log` (auto-rotated by `pm2-logrotate` once installed: `pm2 install pm2-logrotate`).
