/**
 * PM2 ecosystem para a API em VPS Linux (AWS Lightsail / EC2 / DigitalOcean).
 *
 * Passo a passo completo em DEPLOY.md. Resumo:
 *
 *   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
 *   sudo apt-get install -y nodejs
 *   sudo npm i -g pnpm pm2
 *   git clone <repo> /opt/blog-network && cd /opt/blog-network
 *   pnpm install --filter @bn/api...
 *   nano apps/api/.env   # preenche os valores de produção
 *   sudo mkdir -p /var/log/bn-api && sudo chown $USER /var/log/bn-api
 *   pm2 start apps/api/ecosystem.config.cjs
 *   pm2 save && pm2 startup   # boot automático
 *
 * Reload (CI/CD): `pm2 reload bn-api --update-env` (zero downtime).
 */
module.exports = {
  apps: [
    {
      name: 'bn-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        // Limita o heap do V8 a 1GB. Evita panic do GC em VMs pequenas.
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
      // tsx + mongoose + express normalmente fica em 250–400MB.
      // Pico (request + GC + log batch) pode chegar a 700MB. Folga até 1.2GB.
      max_memory_restart: '1200M',
      // Em caso de crash, espera antes de reiniciar (evita loop apertado).
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '30s',
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
      // Logs separados por stream. pm2-logrotate (instalado no DEPLOY.md)
      // faz rotação automática quando passa de 50MB.
      out_file: '/var/log/bn-api/out.log',
      error_file: '/var/log/bn-api/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
