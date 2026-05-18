# Deploy

```
Mongo Atlas  ──►  API (AWS Lightsail/EC2)  ──►  Admin (Vercel)
                                          ├─►   Social Admin (Vercel)
                                          ├─►   Sonoprofundo (Vercel)
                                          └─►   Canal N (Vercel)

S3 ◄── API saves generated images (TikTok pulls from here)
```

| Camada            | Onde                            | Auto-deploy            |
| ----------------- | ------------------------------- | ---------------------- |
| **API**           | AWS Lightsail/EC2 (PM2 + Caddy) | GitHub Actions (SSH)   |
| **Admin**         | Vercel                          | Vercel (push to main)  |
| **Social Admin**  | Vercel                          | Vercel (push to main)  |
| **Sonoprofundo**  | Vercel                          | Vercel (push to main)  |
| **Mongo**         | Atlas (free M0 ou M10)          | n/a                    |
| **Uploads (S3)**  | AWS S3 + CloudFront (opcional)  | n/a                    |

---

## 1. Banco — MongoDB Atlas

Atlas porque AWS DocumentDB cobra $200+/mês mínimo e é só compatível parcialmente com a API do Mongo. Atlas free tier resolve durante toda a fase inicial.

1. https://cloud.mongodb.com → cria projeto + cluster M0 (free) ou M10.
2. **Database Access**: cria usuário/senha. Anota.
3. **Network Access**: adiciona o IP da instância AWS (depois de provisionar). Em dev, `0.0.0.0/0` temporariamente.
4. Connection string:
   ```
   mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/fernandolimaindie?retryWrites=true&w=majority
   ```

---

## 2. Storage de imagens — AWS S3

A API gera imagens via DALL-E e precisa hospedá-las em um lugar persistente. Local disk é frágil em redeploy/snapshot. **Em produção, sempre S3.**

### 2.1. Criar bucket

1. AWS Console → **S3** → **Create bucket**
2. **Name**: `fernandolimaindie-uploads` (precisa ser único globalmente — adicione um sufixo se necessário)
3. **Region**: a mesma da instância EC2/Lightsail
4. **Block Public Access**: **desmarcar** ("Block all public access" → off). Confirma o aviso.
5. **Bucket Versioning**: off (não precisa)
6. **Create bucket**

### 2.2. Bucket policy (leitura pública das imagens)

Bucket → **Permissions** → **Bucket policy** → cola:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fernandolimaindie-uploads/*"
    }
  ]
}
```

> Sem isso o TikTok não consegue puxar as imagens (PULL_FROM_URL exige acesso público).

### 2.3. CORS (opcional — se o admin for mostrar imagens via fetch)

Bucket → **Permissions** → **Cross-origin resource sharing (CORS)**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://admin.SEUDOMINIO.com", "https://social.SEUDOMINIO.com"],
    "ExposeHeaders": []
  }
]
```

### 2.4. Permissões do app

Duas opções:

**A) IAM Role anexada à instância EC2/Lightsail (recomendado em prod):**
- IAM → **Roles** → **Create role** → AWS service → EC2
- Permissions: **anexa policy custom** com `s3:PutObject`, `s3:GetObject` no resource `arn:aws:s3:::fernandolimaindie-uploads/*`
- Anexa a role à instância (EC2 → Actions → Security → Modify IAM role)
- No `.env` deixa `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` em branco — o SDK pega a credencial via metadata service.

**B) Access key dedicada (mais simples mas menos seguro):**
- IAM → **Users** → **Create user**: `fernandolimaindie-api`
- Anexa policy igual à descrita acima
- Gera access key/secret
- Cola no `.env`

### 2.5. Domínio customizado (opcional)

Sem CloudFront, as URLs vão ser `https://fernandolimaindie-uploads.s3.us-east-1.amazonaws.com/...`. Funciona e é o suficiente.

Pra usar `https://cdn.SEUDOMINIO.com`:
1. CloudFront → **Create distribution** → origin = bucket S3
2. **Alternate domain names**: `cdn.SEUDOMINIO.com`
3. **SSL certificate**: solicita um em ACM (us-east-1 obrigatoriamente)
4. **Default behavior**: redirecionar HTTP→HTTPS, cache 30d
5. Aponta CNAME `cdn` → domain do CloudFront
6. No `.env` da API: `UPLOADS_PUBLIC_BASE_URL=https://cdn.SEUDOMINIO.com`

---

## 3. API — AWS Lightsail (recomendado)

Por que Lightsail e não EC2/ECS/App Runner:

- **Lightsail** = VPS gerenciado, preço fixo (~$5/mês), IP estático grátis, snapshots fáceis.
- **EC2** dá mais controle e tem Free Tier (12 meses de t3.micro grátis), mas exige VPC + SG + Elastic IP.
- **ECS/Fargate** = container serverless, mas precisa de ALB pra HTTPS — $20+/mês.
- **Lambda** **NÃO serve**: a API tem `node-cron` rodando em memória.

### 3.1. Criar a instância Lightsail

1. https://lightsail.aws.amazon.com → **Create instance**
2. **Region**: `us-east-1` (mais barata) ou `sa-east-1` se quer ping menor pro BR
3. **Platform**: Linux/Unix
4. **Blueprint**: OS Only → **Ubuntu 24.04 LTS**
5. **Plan**: $5/mês (1 GB RAM, 2 vCPU, 60 GB SSD)
6. **Identifier**: `fernandolimaindie-api`
7. Create instance

Na aba **Networking**:
- **Create static IP** → attach à instância. Anota o IP.

Na aba **Networking → Firewall**:
- TCP 22 (SSH), 80 (HTTP), 443 (HTTPS) — abre todos
- TCP 4000 — **não abrir**: a API fica atrás do Caddy

### 3.2. SSH e setup base

```bash
ssh -i lightsail_default.pem ubuntu@<seu-ip-estatico>
```

```bash
# Atualiza e instala dependências
sudo apt-get update && sudo apt-get install -y curl git build-essential

# Node 24 LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pnpm@latest pm2

# UFW firewall
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable

# Swap 2GB — defense contra OOM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10

# pm2-logrotate
sudo pm2 install pm2-logrotate
sudo pm2 set pm2-logrotate:max_size 50M
sudo pm2 set pm2-logrotate:retain 5
sudo pm2 set pm2-logrotate:compress true

# Diretório de logs (referenciado no ecosystem.config.cjs)
sudo mkdir -p /var/log/fernandolimaindie-api && sudo chown ubuntu /var/log/fernandolimaindie-api
```

### 3.3. Subir o código

```bash
sudo mkdir -p /opt/fernandolimaindie && sudo chown ubuntu:ubuntu /opt/fernandolimaindie
git clone https://github.com/SEU_USER/fernandolimaindie.git /opt/fernandolimaindie
cd /opt/fernandolimaindie
pnpm install --filter @fernandolimaindie/api...
```

### 3.4. Configurar `.env` de produção

```bash
cp apps/api/.env apps/api/.env.local   # se quiser mexer apenas com overrides locais
nano apps/api/.env
```

Preenche cada campo. Geração de segredos:
```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 16   # REVALIDATE_SECRET
```

Para TikTok (ver seção 6) e S3 (seção 2).

### 3.5. Subir com PM2

```bash
cd /opt/fernandolimaindie
pm2 start apps/api/ecosystem.config.cjs
pm2 save
pm2 startup    # imprime um comando — copie e rode com sudo
```

Smoke test:
```bash
curl http://localhost:4000/health
tail -f /var/log/fernandolimaindie-api/out.log
```

### 3.6. HTTPS via Caddy

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
api.SEUDOMINIO.com {
  reverse_proxy localhost:4000
}
EOF
sudo systemctl reload caddy
```

Aponta DNS A record `api.SEUDOMINIO.com` → IP estático. Em ~30s a API está em `https://api.SEUDOMINIO.com`.

### 3.7. Backup

Console Lightsail → instância → **Auto snapshots** → habilita (1/dia, 7 retidos, ~$0.05/GB/mês). Atlas faz backup do banco por padrão.

---

## 4. CI/CD — GitHub Actions

Pipeline em `.github/workflows/`:

- **`ci.yml`** roda em todo PR/push: `typecheck`, `lint`, `build` de todos os apps.
- **`deploy-api.yml`** roda em push pra `main` que toque em `apps/api/**` ou `packages/shared/**`: espera o CI passar, depois SSH no VPS, `git pull`, `pnpm install --filter @fernandolimaindie/api...`, `pm2 reload fernandolimaindie-api`.

### 4.1. Secrets necessários

No repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Nome              | Valor                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `SSH_HOST`        | IP estático da Lightsail (ex: `54.123.45.67`)                                               |
| `SSH_USER`        | `ubuntu`                                                                                     |
| `SSH_PRIVATE_KEY` | Conteúdo inteiro do `.pem` baixado no Lightsail (cola incluindo `-----BEGIN ...-----`)       |
| `SSH_PORT`        | Opcional (default 22)                                                                       |

### 4.2. Setup da chave SSH no VPS

No GitHub Actions usamos a chave default do Lightsail. Se preferir uma chave dedicada pro CI:

```bash
# Na sua máquina local:
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/fernandolimaindie-deploy
cat ~/.ssh/fernandolimaindie-deploy.pub
# Cola o conteúdo no VPS:
ssh ubuntu@<ip> "mkdir -p ~/.ssh && echo 'CONTEUDO_PUB_AQUI' >> ~/.ssh/authorized_keys"
# Adiciona o conteúdo de ~/.ssh/fernandolimaindie-deploy (privada) como SSH_PRIVATE_KEY no GitHub
```

### 4.3. Como funciona

1. Você dá push em `main`
2. `ci.yml` roda typecheck + build em paralelo
3. Se passou, `deploy-api.yml` espera o CI terminar (via `wait-on-check-action`)
4. SSH no VPS → `git pull` → `pnpm install` → `pm2 reload fernandolimaindie-api --update-env`
5. Smoke test no `/health`

Trigger manual disponível em **Actions → Deploy API → Run workflow** se precisar redeployar sem novos commits.

---

## 5. Apps Next.js — Vercel

Tudo igual entre Admin, Social Admin e Sonoprofundo. Vercel detecta o `vercel.json` automaticamente.

### 5.1. Cada app

1. Vercel → **Add New → Project** → seleciona o repo
2. **Root Directory**: `apps/admin` (ou `apps/social-admin`, ou `apps/sonoprofundo`)
3. **Framework Preset**: Next.js (detecta sozinho)
4. **Environment Variables**:

**Admin** (`apps/admin`):
```
NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
```

**Social Admin** (`apps/social-admin`):
```
NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
```

**Sonoprofundo** (`apps/sonoprofundo`):
```
NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
NEXT_PUBLIC_SITE_URL=https://sonoprofundo.com
NEXT_PUBLIC_CHANNEL_SLUG=sonoprofundo
REVALIDATE_SECRET=<mesmo valor da API>
```

5. **Deploy**
6. **Domains**: aponta domínio próprio
   - `admin.SEUDOMINIO.com` → Admin
   - `social.SEUDOMINIO.com` → Social Admin
   - `sonoprofundo.com` → Sonoprofundo

7. ⚠️ Adiciona todos esses domínios em `ALLOWED_ORIGINS` da API e reinicia.

### 5.2. Push → auto-deploy

Vercel reconstrói automaticamente ao detectar push em `main` que toque em `apps/<app>/**` ou `packages/shared/**`.

---

## 6. TikTok — Setup do Content Posting API

Os passos abaixo só importam pra `apps/social-admin`. Skip se não vai usar.

### 6.1. App TikTok

1. https://developers.tiktok.com/ → **Manage Apps** → **Create app**
2. **Add products**: **Login Kit** + **Content Posting API**
3. Em **Content Posting API**: habilita **Direct Post** (toggle on)
4. **Redirect URI**: adiciona `https://api.SEUDOMINIO.com/api/v1/social/accounts/tiktok/callback`
5. Anota **Client Key** e **Client Secret** → cola em `TIKTOK_CLIENT_KEY` e `TIKTOK_CLIENT_SECRET` no `.env`

### 6.2. Domain verification (URL ownership)

Posts de PHOTO usam `PULL_FROM_URL` — TikTok puxa as imagens do nosso S3/CDN. Precisa verificar a propriedade do domínio.

1. Portal TikTok → **Content Posting API → Verify domains** → adiciona o domínio onde as imagens são servidas:
   - Se usa S3 direto: `<bucket>.s3.<region>.amazonaws.com` (TikTok aceita; verificação fica permanente)
   - Se usa CloudFront com domínio custom: `cdn.SEUDOMINIO.com`
2. Escolhe método **File-based**
3. TikTok mostra: `tiktok-developers-site-verification=ABC123XYZ`
4. Pega só a parte depois do `=` → cola em `.env` como `TIKTOK_DOMAIN_VERIFICATION_KEY=ABC123XYZ`
5. `pm2 reload fernandolimaindie-api`
6. A API agora serve `GET /tiktok<KEY>.txt` com o conteúdo correto

> Se o domínio das imagens for diferente do domínio da API (ex: S3 ou CloudFront), você precisa servir o arquivo de verificação **nesse outro domínio**. Pra S3, faça upload do arquivo direto: `aws s3 cp tiktokABC.txt s3://fernandolimaindie-uploads/`.

7. Clica **Verify** no portal → fica como ✅ Verified

### 6.3. Sandbox vs Production

- **Sandbox** (default ao criar): só funciona pra usuários adicionados como "tester" no portal. `photo.publish` scope geralmente não está disponível.
- **Production review**: necessária pra liberar `photo.publish` e abrir uso público. Demora ~3 dias.

Por enquanto a API usa scope `video.upload` + `MEDIA_UPLOAD` mode — que cai como rascunho no inbox do TikTok do usuário (o que é o comportamento desejado: usuário adiciona música e publica manualmente).

---

## 7. Checklist final

- [ ] Mongo Atlas: cluster + usuário + IP da AWS whitelisted
- [ ] S3 bucket criado, policy pública, IAM role/keys configurados
- [ ] AWS: instância Lightsail (ou EC2) criada com IP estático
- [ ] Node + pnpm + pm2 instalados, swap 2GB
- [ ] `/var/log/fernandolimaindie-api` criado
- [ ] API rodando via pm2 (`pm2 ls` → `fernandolimaindie-api online`)
- [ ] Caddy + HTTPS em `api.SEUDOMINIO.com`
- [ ] DNS A record apontando pro IP estático
- [ ] Secrets do GitHub Actions: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
- [ ] Workflow `ci.yml` passa
- [ ] Workflow `deploy-api.yml` faz deploy e smoke test passa
- [ ] Admin/Social Admin/Sonoprofundo deployados na Vercel com env vars
- [ ] `ALLOWED_ORIGINS` da API contém todos os domínios
- [ ] TikTok: app criado, redirect URI cadastrada, domain verificado
- [ ] No admin, cada canal tem `siteUrl` apontando pro domínio público
- [ ] Trigger manual no admin gera post → blog revalida em segundos
- [ ] Trigger manual no social-admin gera carousel → cai no inbox do TikTok

---

## 8. Custos estimados (mensais)

| Serviço                     | Custo                                  |
| --------------------------- | -------------------------------------- |
| **AWS Lightsail 1GB**       | $5                                     |
| Lightsail Auto Snapshot     | ~$1 (opcional)                         |
| **OU EC2 t3.micro**         | $0 nos primeiros 12 meses, depois ~$8  |
| Elastic IP (EC2)            | $0 enquanto associada                  |
| **S3** (uploads)            | $0.02/GB armazenado + $0.09/GB egress |
| CloudFront                  | $0 primeiros 1TB/mês egress           |
| MongoDB Atlas M0            | $0 (free tier)                         |
| Vercel Hobby (×3 apps)      | $0                                     |
| Domínios                    | ~R$40/ano cada                         |
| Anthropic / OpenAI          | só quando trocar de `mock` pra real    |
| PageSpeed Insights          | $0 (25k req/dia free)                  |

Total fixo no começo: **~$5–6/mês** na AWS Lightsail. S3 quase de graça enquanto não tiver milhares de imagens.
