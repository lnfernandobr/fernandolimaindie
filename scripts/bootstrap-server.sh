#!/usr/bin/env bash
# One-shot server bootstrap for fernandolimaindie-api.
# Run as the deploy user on a fresh Ubuntu VPS. Idempotent: safe to re-run.
#
#   curl -fsSL https://raw.githubusercontent.com/lnfernandobr/fernandolimaindie/main/scripts/bootstrap-server.sh | bash
#
# Or, after cloning:
#   bash scripts/bootstrap-server.sh

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/lnfernandobr/fernandolimaindie.git}"
APP_DIR="${APP_DIR:-/opt/fernandolimaindie}"
LOG_DIR="${LOG_DIR:-/var/log/fernandolimaindie-api}"
NODE_MAJOR="${NODE_MAJOR:-24}"

log() { printf '\n→ %s\n' "$*"; }

log "Installing Node.js ${NODE_MAJOR}, pnpm, pm2"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi
command -v pnpm >/dev/null 2>&1 || sudo npm i -g pnpm
command -v pm2  >/dev/null 2>&1 || sudo npm i -g pm2

log "Installing Doppler CLI"
if ! command -v doppler >/dev/null 2>&1; then
  curl -sLf --tlsv1.2 --proto '=https' --retry 3 \
    https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key \
    | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
  echo 'deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main' \
    | sudo tee /etc/apt/sources.list.d/doppler-cli.list
  sudo apt-get update && sudo apt-get install -y doppler
fi

log "Preparing ${APP_DIR}"
sudo mkdir -p "${APP_DIR}"
sudo chown "${USER}:${USER}" "${APP_DIR}"

log "Cloning / updating repo"
if [ ! -d "${APP_DIR}/.git" ]; then
  git clone "${REPO_URL}" "${APP_DIR}"
fi
cd "${APP_DIR}"
git fetch origin main
git reset --hard origin/main

log "Preparing log dir ${LOG_DIR}"
sudo mkdir -p "${LOG_DIR}"
sudo chown "${USER}:${USER}" "${LOG_DIR}"

log "Doppler auth check"
if ! doppler configure get token >/dev/null 2>&1; then
  echo "Doppler is not configured. Run interactively:"
  echo "  doppler login"
  echo "  cd ${APP_DIR} && doppler setup --project fernandolimaindie --config prd"
  echo "Then re-run this script."
  exit 1
fi

log "Delegating to deploy-on-host.sh (install + reap + start + smoke test)"
bash "${APP_DIR}/scripts/deploy-on-host.sh"

log "Persisting PM2 across reboots"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "${USER}" --hp "$HOME" | tail -n 1 | sudo bash || true

log "Done."
