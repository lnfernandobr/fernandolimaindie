# Docs

Authoritative guide for any AI agent or human contributor changing this codebase.
Read every file in this folder before proposing changes.

| File | Purpose |
| ---- | ------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder layout, layer responsibilities, dependency rules, request lifecycle |
| [CONVENTIONS.md](./CONVENTIONS.md) | Coding rules. Non-negotiable |
| [ADDING-A-MODULE.md](./ADDING-A-MODULE.md) | Step-by-step recipe to add a new feature module |
| [ERROR-HANDLING.md](./ERROR-HANDLING.md) | Error model, factories, propagation |

## Quick anchors

- Entry point: `apps/api/src/index.js`
- HTTP composition: `apps/api/src/app.js`
- Lifecycle: `apps/api/src/server.js`
- Routes registry: `apps/api/src/routes/index.js`
- Modules: `apps/api/src/modules/<feature>/`
- All magic values live under: `apps/api/src/constants/`
