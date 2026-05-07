# DevLog CMS API Requests

These requests document the verified runtime flows for the finished course project. They are intentionally plain `curl` commands so they can become lesson notes, Postman requests, or Bruno requests later.

## Local Base URL

```sh
BASE_URL=http://127.0.0.1:1337
```

## Public Reads

Anonymous readers only receive non-premium posts.

```sh
curl -i "$BASE_URL/api/posts?populate=*"
```

Expected checks:

- `200 OK`
- `X-Course-Response-Time` header is present
- `data` contains only posts where `isPremium` is `false`
- each post exposes a `documentId`
- each post exposes `readingTimeMinutes`

## Public Detail

```sh
curl "$BASE_URL/api/posts/<public-document-id>?populate=*"
```

Premium posts are intentionally hidden from anonymous readers.

```sh
curl "$BASE_URL/api/posts/<premium-document-id>?populate=*"
```

Expected check: `404 Post not found`.

## Query Parameters

Use `curl -g` when the URL contains Strapi's square-bracket query syntax.

Fields and sorting:

```sh
curl -g "$BASE_URL/api/posts?fields[0]=title&fields[1]=slug&sort[0]=title:asc"
```

Filters and pagination:

```sh
curl -g "$BASE_URL/api/posts?filters[title][$containsi]=strapi&pagination[page]=1&pagination[pageSize]=1"
```

Publication status and nested populate:

```sh
curl -g "$BASE_URL/api/posts?status=published&populate[author][fields][0]=name&populate[tags][fields][0]=name"
```

## Register A Demo User

```sh
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"student","email":"student@example.com","password":"Strapi5Course!"}' \
  "$BASE_URL/api/auth/local/register"
```

Save the returned `jwt` as `TOKEN`.

## Authenticated Reads

Authenticated readers can also see premium posts.

```sh
curl -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/posts?populate=*"
```

Expected checks:

- `200 OK`
- `data` includes public and premium posts

## Bookmark A Post

Anonymous users are blocked by the route policy.

```sh
curl -X PUT "$BASE_URL/api/posts/<public-document-id>/bookmark"
```

Expected check: `403 Forbidden`.

Authenticated users can bookmark a post.

```sh
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/posts/<public-document-id>/bookmark"
```

Expected check: `200 OK`.
