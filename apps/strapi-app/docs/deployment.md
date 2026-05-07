# Deployment Notes

The course v1 includes two deployment paths: Strapi Cloud and Render. Render is the code-first deployment path; Strapi Cloud is the official managed path.

## Production Dependencies

The app includes `pg` because production deployments should use Postgres, not SQLite.

## Render

The root `render.yaml` defines:

- a Node web service
- a managed Postgres database
- generated Strapi secrets
- production-safe bootstrap flags
- optional `GITHUB_TOKEN` as a non-synced secret

High-level flow:

1. Push the repo to GitHub.
2. Create a Render Blueprint from `render.yaml`.
3. Let Render provision the web service and Postgres database.
4. Create the first Strapi admin user from `/admin`.
5. Configure any optional secrets, including `GITHUB_TOKEN`.

Important note: uploads need a production decision. For the course v1, the project can avoid requiring media uploads during Render deployment. If uploads become central, use Strapi Cloud or add a persistent disk/object storage provider lesson.

## Strapi Cloud

Strapi Cloud is the official hosted path and is useful for students who do not want to manage server/database wiring. In the course, treat it as the fastest successful deployment route:

- connect the Git repository
- configure environment variables
- deploy the app
- create the first admin user
- validate REST, GraphQL, and plugin content API routes

## Required Environment Variables

```sh
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=...
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
ENCRYPTION_KEY=...
STRAPI_BOOTSTRAP_PERMISSIONS=false
STRAPI_BOOTSTRAP_SEED=false
GITHUB_SHOWCASE_IMPORT_ON_BOOT=false
GITHUB_SHOWCASE_OWNER=octocat
GITHUB_TOKEN=
```

Never enable the dev bootstrap flags in production.
