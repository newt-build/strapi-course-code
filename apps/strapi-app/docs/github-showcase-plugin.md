# GitHub Showcase Plugin

The local plugin lives in `src/plugins/github-showcase` and demonstrates a compact Strapi 5 plugin workflow:

- plugin registration through `config/plugins.ts`
- plugin-owned `project` content type
- public content API routes
- admin-only routes
- GitHub API fetch service
- import/update/delete project documents with the Document Service API
- a custom admin page

## Environment

```sh
GITHUB_SHOWCASE_OWNER=octocat
GITHUB_TOKEN=
GITHUB_SHOWCASE_IMPORT_ON_BOOT=false
```

`GITHUB_TOKEN` is optional for public repositories but useful when GitHub rate limits anonymous requests.

## Public Content API

List imported projects:

```sh
curl "$BASE_URL/api/github-showcase/projects"
```

Read one imported project:

```sh
curl "$BASE_URL/api/github-showcase/projects/<project-document-id>"
```

## Admin Routes

These routes are used by the custom admin page and require an authenticated Strapi admin session.

Fetch public GitHub repositories:

```sh
GET /github-showcase/repositories?owner=octocat
```

List imported project documents:

```sh
GET /github-showcase/projects
```

Import selected repositories:

```sh
POST /github-showcase/projects/import
```

Toggle the featured flag:

```sh
PUT /github-showcase/projects/<project-document-id>/featured
```

Delete an imported project:

```sh
DELETE /github-showcase/projects/<project-document-id>
```

## Dev Verification Import

For automated verification, the plugin has a dev-only bootstrap importer:

```sh
GITHUB_SHOWCASE_IMPORT_ON_BOOT=true GITHUB_SHOWCASE_OWNER=octocat pnpm dev:app
```

Expected checks:

- startup log includes `GitHub Showcase imported 3 repositories for octocat`
- `GET /api/github-showcase/projects` returns imported projects
- anonymous requests to `/github-showcase/repositories?owner=octocat` return `401`
