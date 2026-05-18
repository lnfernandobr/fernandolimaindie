# Error handling

## Model

Three kinds of errors enter the error handler:

1. **`ZodError`** — produced by `schema.parse(...)`. Returns HTTP 400
   with a structured `issues` array.
2. **HTTP errors** — created by factories in `errors/factories.js`. Carry
   `status`, `name`, `message`, optional `details`. Detected by
   `isHttpError(value)`, which checks a `Symbol.for('app.http-error')` tag
   placed on the error object by `createHttpError`.
3. **Unknown errors** — anything else. Logged at `error` level. Returns
   HTTP 500 with a generic body.

## Why no class

`HttpError extends Error` was the old approach. The convention here is
factory functions returning tagged plain `Error` instances. Reasons:
- consistent with the rest of the codebase (no `class` anywhere)
- works across module boundaries even when bundlers duplicate class
  definitions
- the discriminator is explicit (`Symbol.for(...)` tag), not implicit
  (`instanceof`)

## Factories

| Factory | Status | Default message |
| ------- | ------ | --------------- |
| `notFound(msg?)` | 404 | `'Not found'` |
| `badRequest(msg, details?)` | 400 | required |
| `unauthorized(msg?)` | 401 | `AUTH_ERRORS.UNAUTHORIZED` |
| `conflict(msg)` | 409 | required |

Add a factory in `errors/factories.js` when a new HTTP error class is
genuinely needed, not before. Use existing factories first.

## Where to throw

- In services and middleware. Never inside controllers (other than letting
  Zod's `.parse` throw on validation failure).
- Never in repositories — they return `null`/`undefined` for "not found"
  and let the service translate to an HTTP error.

## Where not to catch

- Do not wrap controllers in try/catch. `asyncHandler` forwards rejections
  to Express's error pipeline.
- Do not catch and rethrow. Either handle (rare) or let it bubble.

## Logging

The error handler logs only the unknown-error branch. Known errors (Zod,
HTTP) are expected and produce structured responses, so they are not noise
in logs. If a known error indicates a bug, fix the bug — do not log the
error.
