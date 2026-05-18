# Adding a module

Recipe to add a new feature module. Follow it verbatim. Skipping a layer is
not a shortcut — it is a bug seed.

Assume we are adding a `posts` feature with `POST /api/v1/posts` to create
a post and `GET /api/v1/posts/:id` to read one.

## 1. Constants

Edit `apps/api/src/constants/api.js`:

```js
export const PATHS = Object.freeze({
  ...
  POSTS: '/posts',
  POSTS_ID: '/:id',
});
```

Add a `PUBLIC_ENDPOINTS` row so the landing page lists the new surface.

If the feature has its own error messages or limits, create
`apps/api/src/constants/posts.js`. Never inline them.

## 2. Model + repository

Create `apps/api/src/modules/posts/posts.model.js`. Define the Mongoose
schema. Export `PostModel`.

Create `apps/api/src/modules/posts/posts.repository.js`. Wrap every query:
`findPostById`, `createPost`, `listPosts`, etc. No Mongoose call may leak
outside this file.

## 3. DTO

Create `apps/api/src/modules/posts/posts.dto.js`. Export `toPublicPost(doc)`
that turns a Mongoose document into the JSON shape the client receives.

## 4. Schema

Create `apps/api/src/modules/posts/posts.schema.js`. Zod schemas for inputs:
`createPostSchema`, `postIdParamSchema`. Import limit constants — never
inline `.max(120)`.

## 5. Service

Create `apps/api/src/modules/posts/posts.service.js`. Pure of Express. Each
exported function takes a plain object, calls the repository, returns plain
objects. Throws via `errors/factories.js`.

```js
export const getPostById = async (id) => {
  const post = await findPostById(id);
  if (!post) throw notFound(POST_ERRORS.NOT_FOUND);
  return toPublicPost(post);
};
```

## 6. Controller

Create `apps/api/src/modules/posts/posts.controller.js`. Thin handlers:
parse with Zod, call service, send response.

```js
export const handleCreatePost = async (req, res) => {
  const input = createPostSchema.parse(req.body);
  const post = await createPost(input);
  res.status(HTTP_STATUS.OK).json(post);
};
```

## 7. Router

Create `apps/api/src/modules/posts/posts.routes.js`. Factory `createPostsRouter`
wires paths from `constants/api.js`. Wrap controllers in `asyncHandler`. Add
`requireAuth` where needed.

## 8. Barrel

Create `apps/api/src/modules/posts/index.js` exporting `createPostsRouter`
plus any repository helpers other modules may legitimately need
(rarely — keep the surface minimal).

## 9. Register

Edit `apps/api/src/routes/api.routes.js`:

```js
router.use(PATHS.POSTS, createPostsRouter());
```

No change needed in `app.js`. Composition is hierarchical.

## 10. Bootstrap (optional)

If the feature needs a one-time setup on boot (seed data, index ensure beyond
the schema, warmups), add a function in `apps/api/src/bootstrap/` and append
it to `bootstrapTasks` in `bootstrap/index.js`.

## Checklist before submitting

- [ ] Every literal is in `constants/`.
- [ ] No `class` keyword.
- [ ] No `let`/`var`.
- [ ] No comments.
- [ ] Service has no `req`/`res`.
- [ ] Repository owns every Mongoose call.
- [ ] Errors thrown via factories.
- [ ] English only.
- [ ] `node apps/api/src/index.js` boots cleanly.
