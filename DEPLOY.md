# Deploy

API roda em **AWS Lightsail** (recomendado) ou **EC2**. Admin e cada blog rodam na **Vercel**.

```
Mongo Atlas  ──►  API (AWS)  ──►  Admin (Vercel)
                            ├─►  Sonoprofundo (Vercel)
                            └─►  Canal N (Vercel)
```

---

## 1. Banco — MongoDB Atlas

Atlas porque AWS DocumentDB cobra $200+/mês mínimo e é só compatível parcialmente com a API do Mongo (mexe com Mongoose). Atlas free tier resolve durante toda a fase inicial.

1. https://cloud.mongodb.com → cria projeto + cluster M0 (free) ou M10.
2. **Database Access**: cria usuário/senha. Anota.
3. **Network Access**: adiciona o IP da instância AWS (depois de provisionar). Em dev, `0.0.0.0/0` temporariamente.
4. Pega a connection string:
   ```
   mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/blog-network?retryWrites=true&w=majority
   ```

---

## 2. API — AWS Lightsail (recomendado)

Por que Lightsail e não EC2/ECS/App Runner:

- **Lightsail** = VPS gerenciado, preço fixo (~$5/mês), IP estático grátis, snapshots fáceis. Equivalente direto da Vultr/DigitalOcean. Zero burocracia de VPC/Security Group.
- **EC2** dá mais controle e tem Free Tier (12 meses de t3.micro grátis), mas exige VPC + SG + Elastic IP. Faz sentido se você já usa AWS pra outras coisas.
- **ECS/Fargate** = container serverless, mas precisa de ALB pra HTTPS — fica $20+/mês.
- **App Runner** = simples mas $25+/mês.
- **Lambda** **NÃO serve**: a API tem `node-cron` rodando em memória, exige instância sempre on.

### 2.1. Criar a instância Lightsail

1. https://lightsail.aws.amazon.com → **Create instance**
2. **Region**: `us-east-1` (mais barata) ou `sa-east-1` se quer ping menor pro BR
3. **Platform**: Linux/Unix
4. **Blueprint**: OS Only → **Ubuntu 24.04 LTS**
5. **Plan**: $5/mês (1 GB RAM, 2 vCPU, 60 GB SSD) — suficiente pra começar
6. **Identifier**: `blog-network-api`
7. Create instance

Na aba **Networking**:
- **Create static IP** → attach à instância. **Anota o IP**, é o que aponta o DNS depois.

Na aba **Networking → Firewall**:
- TCP 22 (SSH) — já vem aberto
- TCP 80 (HTTP) — já vem aberto
- TCP 443 (HTTPS) — adicionar
- TCP 4000 — **não abrir**: a API fica atrás do Caddy

### 2.2. SSH e setup base

Botão **Connect using SSH** no console Lightsail abre terminal direto no browser. Ou baixa a chave `.pem` em **Account → SSH keys** e:

```bash
ssh -i lightsail_default.pem ubuntu@<seu-ip-estatico>
```

Como `ubuntu` (já tem sudo passwordless):

```bash
# Atualiza e instala dependências
sudo apt-get update && sudo apt-get install -y curl git build-essential

# Node 24 LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pnpm@latest pm2

# UFW (firewall extra na instância — Lightsail já tem firewall, mas defense in depth)
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable

# Swap de 2GB — defesa contra OOM em pico de memória.
# Lightsail/EC2 não vêm com swap por padrão. Sem swap, qualquer pico de
# RAM dispara o OOM killer e mata processos (incluindo sshd).
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10   # só usa swap em emergência

# pm2-logrotate — sem isso os logs crescem até encher o disco
sudo pm2 install pm2-logrotate
sudo pm2 set pm2-logrotate:max_size 50M
sudo pm2 set pm2-logrotate:retain 5
sudo pm2 set pm2-logrotate:compress true
```

### 2.3. Subir o código

```bash
sudo mkdir -p /opt/blog-network && sudo chown ubuntu:ubuntu /opt/blog-network
git clone https://github.com/SEU_USER/blog-network.git /opt/blog-network
cd /opt/blog-network
pnpm install --filter @bn/api...
```

### 2.4. Configurar `.env` de produção

```bash
nano /opt/blog-network/apps/api/.env
```

```
NODE_ENV=production
API_PORT=4000

MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/blog-network?retryWrites=true&w=majority
JWT_SECRET=<gere com `openssl rand -hex 32`>
JWT_EXPIRES_IN=7d
REVALIDATE_SECRET=<gere com `openssl rand -hex 16`>

LOG_LEVEL=info
ADMIN_BOOTSTRAP_NAME=Fernando
ADMIN_BOOTSTRAP_USERNAME=fernando
ADMIN_BOOTSTRAP_PASSWORD=<senha forte>

ALLOWED_ORIGINS=https://admin.exemplo.com,https://sonoprofundo.com,https://canal2.com

AI_PROVIDER=claude
AI_MODEL=
ANTHROPIC_API_KEY=<https://console.anthropic.com/settings/keys>
OPENAI_API_KEY=<https://platform.openai.com/api-keys>

IMAGE_PROVIDER=openai
IMAGE_MODEL=

PUBLIC_API_URL=https://api.SEUDOMINIO.com

GOOGLE_PAGESPEED_API_KEY=<crie em https://console.cloud.google.com/apis/credentials>
```

> O `REVALIDATE_SECRET` precisa ser **igual** no `.env` da API e nos sites/blogs (variável de ambiente na Vercel).

> **Setup de IA pra produção**: `AI_PROVIDER=claude` (Sonnet 4.6, melhor qualidade pra texto longo) + `IMAGE_PROVIDER=openai` (gpt-image-1; Anthropic não gera imagem). Precisa das duas keys.

> `PUBLIC_API_URL` monta as URLs de imagens hospedadas em `/uploads/`. Aponte pro domínio HTTPS da API em prod.

> A chave do **PageSpeed Insights** é gratuita (25k req/dia, sem cartão). Sem ela, o audit ainda funciona mas com rate limit baixo.

### 2.5. Subir com PM2

```bash
cd /opt/blog-network
pm2 start apps/api/ecosystem.config.cjs
pm2 save
pm2 startup    # imprime um comando — copie e rode com sudo
```

Smoke:

```bash
curl http://localhost:4000/health
```

### 2.6. HTTPS via Caddy

Caddy resolve TLS sozinho via Let's Encrypt:

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

Aponta o A record `api.SEUDOMINIO.com` → IP estático da Lightsail. Em ~30s a API está em `https://api.SEUDOMINIO.com`.

### 2.7. Atualizações posteriores

```bash
cd /opt/blog-network
git pull
pnpm install --filter @bn/api...
pm2 restart bn-api
```

### 2.8. Backup mínimo

Console Lightsail → instância → **Snapshots** → **Create snapshot manual** ou habilita **Auto snapshots** (1 por dia, 7 retidos, ~$0.05/GB/mês). MongoDB Atlas faz backup do banco por padrão — você só precisa cuidar do servidor.

---

## 2-alt. API — AWS EC2 (alternativa)

Use só se quer **Free Tier** (12 meses de t3.micro grátis = ~$0/mês durante o primeiro ano) ou já mantém VPCs/SGs por outros motivos.

### Provisionar

1. EC2 → **Launch instance**
2. **Name**: `blog-network-api`
3. **AMI**: Ubuntu Server 24.04 LTS (HVM, SSD)
4. **Instance type**: `t3.micro` (Free Tier elegível) ou `t3.small` (~$15/mês)
5. **Key pair**: cria um e baixa o `.pem`
6. **Network**:
   - Security Group novo:
     - SSH (22) from My IP
     - HTTP (80) from anywhere
     - HTTPS (443) from anywhere
   - **Não abre 4000** — fica atrás do Caddy
7. **Storage**: 20 GB gp3
8. Launch

Na seção **Elastic IPs**:
- **Allocate Elastic IP** → **Associate** com a instância. Anota o IP.

> Lembre: Elastic IP só é grátis enquanto associado a uma instância running. Se desligar a instância sem liberar o IP, AWS cobra.

### Setup do servidor

A partir daí o procedimento é **idêntico** ao Lightsail (seções 2.2 a 2.8). O usuário SSH é `ubuntu`, sudo passwordless, todos os comandos rodam iguais.

---

## 3. Admin — Vercel

1. Push do repo no GitHub.
2. Vercel → **Add New → Project** → seleciona o repo.
3. Configurar:
   - **Root Directory**: `apps/admin`
   - **Framework Preset**: Next.js (detecta sozinho)
   - Demais campos: deixa em branco (o `vercel.json` cuida)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
   ```
5. Deploy.
6. **Domains**: aponta `admin.SEUDOMINIO.com` → Vercel.

> ⚠️ Adiciona `https://admin.SEUDOMINIO.com` em `ALLOWED_ORIGINS` da API. `pm2 restart bn-api`.

---

## 4. Cada Blog — Vercel (1 projeto por site)

Existem dois caminhos pra cada novo canal:

### 4a. Canal dentro do monorepo (`apps/<canal>`)

Recomendado quando o canal compartilha código com o template ou quando você quer deployar tudo do mesmo repo. Já temos **`apps/sonoprofundo`** como exemplo vivo (sleep blog completo, com quiz, calculadora, checklist e produtos).

1. Cria a pasta `apps/<canal>` (copiar `apps/sonoprofundo` e adaptar é o mais rápido).
2. No `package.json` do app, usa o nome `@bn/<canal>` e mantém `vercel.json` na raiz dele:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs",
     "installCommand": "cd ../.. && pnpm install --filter @bn/<canal>...",
     "buildCommand": "cd ../.. && pnpm --filter @bn/<canal> build",
     "outputDirectory": ".next"
   }
   ```
3. No root `package.json`, adiciona o atalho `dev:<canal>`:
   ```json
   "dev:<canal>": "pnpm --filter @bn/<canal> dev"
   ```
4. Vercel → novo projeto apontando pro mesmo GitHub repo.
5. **Root Directory**: `apps/<canal>` (Vercel detecta o `vercel.json` automaticamente).
6. **Environment Variables** (mesmas do 4b).
7. Deploy.

> Vantagem: o build do canal só roda quando arquivos do `apps/<canal>` ou `packages/shared` mudam — Vercel detecta via path filtering automático do monorepo. E qualquer melhoria no template (lib/api, lib/seo) propaga pra todos os canais via shared code.

### 4b. Canal em repositório próprio

Útil quando o canal tem time ou identidade muito separada do resto.

1. Cria projeto Next.js separado a partir de `apps/sonoprofundo` (ver `apps/sonoprofundo/SETUP.md`).
2. Push num repo próprio.
3. Vercel → novo projeto.
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
   NEXT_PUBLIC_SITE_URL=https://canal.com
   NEXT_PUBLIC_CHANNEL_SLUG=canal
   REVALIDATE_SECRET=<o mesmo da API>
   ```
5. Deploy.
6. **Domains**: aponta `canal.com` → Vercel.

> ⚠️ No painel do admin (`/canais`), edita o canal e coloca `https://canal.com` no campo **URL do site**.
> ⚠️ Adiciona `https://canal.com` em `ALLOWED_ORIGINS` da API e reinicia.

### Endpoint de revalidação que cada blog precisa expor

A API chama `POST {siteUrl}/api/revalidate?secret=...` quando publica/edita post. O Next.js do blog precisa de:

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('secret') !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { tags = [] } = await req.json().catch(() => ({}));
  for (const tag of tags) revalidateTag(tag, 'default');
  return NextResponse.json({ revalidated: true, tags });
}
```

(Já existe pronto em `apps/sonoprofundo/src/app/api/revalidate/route.ts`.)

---

## 5. Checklist final

- [ ] Mongo Atlas: cluster + usuário + IP da AWS whitelisted
- [ ] AWS: instância Lightsail (ou EC2) criada com IP estático
- [ ] Node + pnpm + pm2 instalados
- [ ] API rodando via pm2 (`pm2 ls` → `bn-api online`)
- [ ] Caddy + HTTPS em `api.SEUDOMINIO.com`
- [ ] DNS apontando pro IP estático
- [ ] Admin deployado em `admin.SEUDOMINIO.com` com `NEXT_PUBLIC_API_URL` correto
- [ ] Login admin (Fernando) funciona em produção
- [ ] Cada blog: Vercel + variáveis + domínio próprio
- [ ] `ALLOWED_ORIGINS` da API contém todos os domínios (admin + blogs)
- [ ] No admin, cada canal tem `siteUrl` apontando pro domínio público
- [ ] `GOOGLE_PAGESPEED_API_KEY` configurada (audit funciona sem, mas com rate limit)
- [ ] Trigger manual no admin gera post → blog revalida em segundos

---

## 6. Custos estimados (mensais)

| Serviço                     | Custo                                  |
| --------------------------- | -------------------------------------- |
| **AWS Lightsail 1GB**       | $5                                     |
| AWS Lightsail Auto Snapshot | ~$1 (opcional)                         |
| **OU EC2 t3.micro**         | $0 nos primeiros 12 meses, depois ~$8  |
| Elastic IP (EC2)            | $0 enquanto associada                  |
| MongoDB Atlas M0            | $0 (free tier)                         |
| Vercel Hobby                | $0                                     |
| Domínios                    | ~R$40/ano cada                         |
| Anthropic / OpenAI          | só quando trocar de `mock` pra real    |
| PageSpeed Insights          | $0 (25k req/dia free)                  |

Total fixo no começo: **~$5/mês (~R$30) na AWS Lightsail**, ou praticamente zero no Free Tier do EC2 durante o primeiro ano.
