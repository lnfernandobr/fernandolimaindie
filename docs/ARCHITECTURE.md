# Architecture

## Layout

```
apps/api/src/
├── index.js              entry: composes app + starts server
├── app.js                builds Express app (middleware + routes + error pipeline)
├── server.js             listen + graceful shutdown + DB lifecycle
├── constants/            every literal, magic value, enum, default
├── config/               env, logger, database, package metadata
├── middleware/           one concern per file (security, cors, body, log, auth, ...)
├── errors/               http-error factory + named factories
├── lib/                  framework-agnostic utilities (asyncHandler, ...)
├── modules/<feature>/    self-contained feature slice (auth, users, health, ...)
├── routes/               composes module routers under URL prefixes
├── views/<view>/         server-rendered HTML (template, styles, render fn)
└── bootstrap/            startup tasks run after DB connect, before listen
```

## Layer responsibilities

| Layer | Imports from | Never imports from |
| ----- | ------------ | ------------------ |
| `constants/` | nothing | anything |
| `config/` | `constants/` | `modules/`, `routes/`, `app.js` |
| `lib/` | `constants/` | `modules/`, `config/`, `app.js` |
| `errors/` | `constants/` | anything else |
| `middleware/` | `config/`, `constants/`, `errors/`, `lib/` | `modules/`, `routes/`, `app.js` |
| `modules/<feature>/` | `config/`, `constants/`, `errors/`, `lib/`, other `modules/*` via that module's `index.js` only | `routes/`, `app.js`, `server.js` |
| `views/<view>/` | `config/`, `constants/` | `modules/`, `routes/` |
| `routes/` | `modules/*/index.js`, `views/*`, `constants/` | `app.js` |
| `app.js` | `middleware/`, `routes/` | `server.js`, `index.js` |
| `server.js` | `config/`, `constants/` | `app.js`, `modules/`, `routes/` |
| `bootstrap/` | `config/`, `constants/`, `modules/*/index.js` | `routes/`, `app.js` |
| `index.js` | `app.js`, `server.js`, `bootstrap/`, `config/`, `constants/` | everything else only via those |

Cross-module access is always through the module's `index.js`. Reaching into
`modules/auth/auth.service.js` from `modules/users` is forbidden.

## Module anatomy

Each `modules/<feature>/` slice contains:

| File | Role |
| ---- | ---- |
| `<feature>.routes.js` | builds an Express `Router`. Exports `create<Feature>Router()` |
| `<feature>.controller.js` | thin HTTP adapter: parse input, call service, send response |
| `<feature>.service.js` | business logic. Pure of Express. Receives plain inputs |
| `<feature>.schema.js` | Zod validation schemas for inputs and DTOs |
| `<feature>.dto.js` | shapes domain objects into public response payloads |
| `<feature>.repository.js` | data access (Mongoose). Only file allowed to touch the model |
| `<feature>.model.js` | Mongoose schema and model |
| `<feature>.<other>.js` | feature-private helpers (e.g. `auth.tokens.js`) |
| `index.js` | public barrel: re-exports only the symbols other modules may consume |

Not every module needs every file. Health has no model. Auth has no model
(reads users via `modules/users`). The shape is consistent so the gaps are
obvious.

## Request lifecycle

```
client
  └── express
       ├── security (helmet)
       ├── corsPolicy
       ├── jsonBodyParser
       ├── requestLog
       ├── router(s)        modules/<feature>/<feature>.routes.js
       │     └── requireAuth (when used)
       │         └── asyncHandler(controller)
       │             └── controller        parse + call service
       │                 └── service       business logic + repository
       │                     └── repository  mongo
       ├── notFoundHandler
       └── errorHandler     ZodError | HttpError | unknown
```

## Startup lifecycle

`index.js` → `createApp()` → `startServer(app, runBootstrapTasks)`
→ `connectDatabase()` → bootstrap tasks → `app.listen()` → register shutdown
hooks on `SIGINT` / `SIGTERM`.

## Errors

No class definitions. `createHttpError({status, name, message, details})` returns
a tagged `Error` instance. Detect with `isHttpError(value)`. Named factories
(`notFound`, `badRequest`, `unauthorized`, `conflict`) live in
`errors/factories.js`. Zod errors are caught separately by the error handler
because `ZodError` is owned by the validation library.

## Configuration

`config/env.js` loads dotenv files (precedence: `.env.local` → `.env`),
strips empty values, and validates through `config/env.schema.js`. The schema
gets every default and constraint from `constants/env.js`. Adding a new
env var means editing both files. Never read `process.env` outside `config/env.js`.
