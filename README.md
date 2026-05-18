# fernandolimaindie

Minimal API — Express + Mongoose + JWT auth.

## Stack

| Layer       | Tech                                  |
| ----------- | ------------------------------------- |
| Runtime     | Node.js 22+ (tested with 24 LTS)      |
| Pkg manager | pnpm 10 + workspaces                  |
| Language    | JavaScript (ESM)                      |
| API         | Express 5, Mongoose 9, JWT            |
| Validation  | Zod 4                                 |
| Auth hash   | bcryptjs                              |

## Environment

**Source of truth: [Doppler](https://doppler.com)**.

```bash
doppler login                # once
doppler setup                # pick project fernandolimaindie + dev config
pnpm dev                     # scripts go through `doppler run --`
```

Without Doppler: drop a `.env.local` in `apps/api/` and run `cd apps/api && pnpm dev`.

## Prerequisites

- **Node.js 22+** (24 LTS recommended via nvm)
- **pnpm 10+** (`npm i -g pnpm`)
- **MongoDB Atlas** — set `MONGODB_URI` in `apps/api/.env.local` (or via Doppler)

## Setup

```bash
pnpm install
pnpm dev            # starts API on :4000
```

## Bootstrap

First boot creates the default admin user:
- Username: `fernando`
- Password: `Fz9mPx7Kq2vRtY8n`

Override via env: `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD`, `ADMIN_BOOTSTRAP_NAME`.

## Endpoints

| Method | Path                 | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/health`            | status + uptime       |
| GET    | `/`                  | landing page          |
| POST   | `/api/v1/auth/login` | login (returns JWT)   |
| GET    | `/api/v1/auth/me`    | current user (auth)   |

Smoke test:
```bash
curl http://localhost:4000/health
```

## Structure

```
fernandolimaindie/
├── docs/                            # architecture, conventions, recipes
└── apps/
    └── api/
        └── src/
            ├── index.js              # entry
            ├── app.js                # express composition
            ├── server.js             # listen + shutdown + db lifecycle
            ├── constants/            # every literal lives here
            ├── config/               # env, logger, database, package info
            ├── middleware/           # one concern per file
            ├── errors/               # factory + named factories (no class)
            ├── lib/                  # framework-agnostic utilities
            ├── modules/<feature>/    # self-contained feature slice
            ├── routes/               # composes module routers
            ├── views/                # server-rendered HTML
            └── bootstrap/            # startup tasks
```

## Contributing

Before touching the code, read [`docs/`](./docs/README.md). Conventions
are non-negotiable: no `class`, no comments, no magic values, English only,
functional style.

## License

Private — Fernando.
