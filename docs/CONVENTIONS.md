# Conventions

These rules are non-negotiable. Every new file must follow them.

## Language

- Plain JavaScript (ESM). No TypeScript, no JSDoc type annotations.
- Latest ECMAScript. `import`/`export`, arrow functions, destructuring,
  optional chaining, nullish coalescing, `Object.freeze`, `Symbol.for`.
- Node 22+ runtime features are allowed.

## No classes

- Never write `class` in this codebase.
- Domain types are factory functions returning frozen plain objects.
- Built-in classes from libraries (`Error`, `Router`, `Schema`) are fine to
  instantiate with `new`. We do not extend them.
- Identification of error variants uses tagged objects (see
  `errors/http-error.js`), not `instanceof`.

## Functional style

- All identifiers are `const`. No `let`, no `var` unless a loop accumulator
  is genuinely simpler — prefer `map`/`reduce`/`filter`/`for...of`.
- Functions are pure where possible. Side effects are isolated to:
  `middleware/`, `config/database.js`, `bootstrap/`, `server.js`, repositories,
  and controllers.
- Composition over inheritance, always.
- Small functions. If a function does two things, split it.

## No magic values

- Every string, number, regex, or path used by the runtime lives under
  `constants/`. The only literals allowed in feature code are:
    - format strings of `template literals`
    - keys of object literals
    - numeric indices that obviously index a known tuple
- Use `Object.freeze` on constant maps so they cannot be mutated.

## No comments

- Code is the source of truth. Names carry intent.
- Exceptions: a one-line note when a non-obvious external constraint exists
  (e.g. a workaround for a specific library bug). Even then: under 80 chars,
  single line.
- Never add docstrings, banner blocks, change logs, or "this function does X"
  preambles.

## Naming

- Files: `kebab-case`. Multi-segment names use dots:
  `auth.controller.js`, `users.repository.js`.
- Folders: `kebab-case`, singular for shared infrastructure
  (`config`, `middleware`), plural for collections of items
  (`constants`, `modules`, `routes`).
- Exports: `camelCase` for values and functions, `SCREAMING_SNAKE_CASE` for
  immutable constants, factories named `create<Thing>` when they instantiate.
- Async functions are not prefixed. The `await` at the call site is the
  signal.

## Imports

- Always include the `.js` extension. ESM requires it.
- Relative paths inside a module. Cross-module access only via that module's
  `index.js`.
- No circular imports. If you need one, the structure is wrong.

## Errors

- Throw via factories in `errors/factories.js`. Never `throw new Error('...')`
  in feature code.
- Validation errors are produced by Zod's `.parse()`. Let them throw.
- The error handler is the single place that maps errors to HTTP responses.

## Mongoose

- Schemas live only in `modules/<feature>/<feature>.model.js`.
- All queries live in `modules/<feature>/<feature>.repository.js`. Services
  call repositories, never `Model.find(...)` directly.
- Use `.lean()` for reads when the result is sent to the client. Documents
  stay inside the repository layer.

## Express

- Routers are created by factory functions (`create<Feature>Router`).
- Routes register handlers wrapped in `asyncHandler` from `lib/`.
- Controllers receive `(req, res)` and never return a promise that the
  framework cares about — they `res.json(...)` or `res.send(...)` directly.

## Testing-ready shape

- Services accept plain objects, return plain objects. No `req` / `res`
  inside services.
- Repositories accept primitives or plain objects. No `req` / `res`.
- This split is the contract that makes future tests trivial.

## Language of code

- English only — identifiers, comments (if any), log messages, error strings,
  documentation. Portuguese stays out of source.
