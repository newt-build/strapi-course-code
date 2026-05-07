# DevLog CMS GraphQL Requests

The course keeps GraphQL pragmatic: install the official plugin, query content, then add a custom resolver when the automatic shadow CRUD would expose the wrong business behavior.

## Local Endpoint

```sh
GRAPHQL_URL=http://127.0.0.1:1337/graphql
```

## Public Featured Posts

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { featuredPosts(limit: 2) { documentId title slug readingTimeMinutes isPremium tags { name } } }"}' \
  "$GRAPHQL_URL"
```

Expected checks:

- `featuredPosts` returns only non-premium posts
- relation fields such as `tags` are resolved
- Strapi 5 `documentId` is available

## Public Premium Guard

The automatic `posts` GraphQL query is intentionally disabled for the `post` type. It would not use the REST controller customization that hides premium posts.

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { posts { documentId title isPremium } }"}' \
  "$GRAPHQL_URL"
```

Expected check: GraphQL validation error, because the `posts` field is not exposed.

Public single-post reads should use the custom resolver.

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { publicPost(documentId: \"<premium-document-id>\") { documentId title isPremium } }"}' \
  "$GRAPHQL_URL"
```

Expected check: `publicPost` returns `null` for premium content.

## Authenticated Reader Query

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query { readerPosts { documentId title isPremium } }"}' \
  "$GRAPHQL_URL"
```

Expected checks:

- anonymous requests are blocked
- authenticated requests include public and premium posts

## Authenticated Bookmark Mutation

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"mutation { bookmarkPost(documentId: \"<public-document-id>\") { documentId title readingTimeMinutes } }"}' \
  "$GRAPHQL_URL"
```

Expected check: authenticated requests return the updated post.
