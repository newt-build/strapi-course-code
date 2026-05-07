'use strict';

const PROJECT_UID = 'plugin::github-showcase.project';
const GITHUB_API_BASE_URL = 'https://api.github.com';

const projectSchema = {
  kind: 'collectionType',
  collectionName: 'github_showcase_projects',
  info: {
    singularName: 'project',
    pluralName: 'projects',
    displayName: 'Project',
    description: 'Project imported from GitHub repositories',
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: 'string',
      required: true,
      maxLength: 120,
    },
    slug: {
      type: 'uid',
      targetField: 'name',
      required: true,
    },
    fullName: {
      type: 'string',
      required: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    url: {
      type: 'string',
      required: true,
    },
    homepage: {
      type: 'string',
    },
    language: {
      type: 'string',
    },
    stars: {
      type: 'integer',
      default: 0,
      min: 0,
    },
    forks: {
      type: 'integer',
      default: 0,
      min: 0,
    },
    openIssues: {
      type: 'integer',
      default: 0,
      min: 0,
    },
    githubId: {
      type: 'string',
      required: true,
      unique: true,
    },
    owner: {
      type: 'string',
      required: true,
    },
    topics: {
      type: 'json',
    },
    featured: {
      type: 'boolean',
      default: false,
    },
    pushedAt: {
      type: 'datetime',
    },
    importedAt: {
      type: 'datetime',
    },
  },
};

const getHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'strapi-5-course-github-showcase',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const toProjectData = (repo) => ({
  name: repo.name,
  slug: `${repo.owner.login}-${repo.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  fullName: repo.full_name,
  description: repo.description,
  url: repo.html_url,
  homepage: repo.homepage || null,
  language: repo.language,
  stars: repo.stargazers_count ?? 0,
  forks: repo.forks_count ?? 0,
  openIssues: repo.open_issues_count ?? 0,
  githubId: String(repo.id),
  owner: repo.owner.login,
  topics: repo.topics ?? [],
  pushedAt: repo.pushed_at,
  importedAt: new Date().toISOString(),
});

const getPluginConfig = (strapi) => ({
  githubOwner: strapi.plugin('github-showcase').config('githubOwner'),
  githubToken: strapi.plugin('github-showcase').config('githubToken'),
});

const findByGithubId = async (strapi, githubId) => {
  return strapi.documents(PROJECT_UID).findFirst({
    filters: {
      githubId: {
        $eq: githubId,
      },
    },
  });
};

module.exports = () => ({
  config: {
    default: {
      githubOwner: process.env.GITHUB_SHOWCASE_OWNER ?? 'octocat',
      githubToken: process.env.GITHUB_TOKEN,
    },
    validator() {},
  },
  async bootstrap({ strapi }) {
    const shouldImportOnBoot =
      process.env.NODE_ENV !== 'production' && process.env.GITHUB_SHOWCASE_IMPORT_ON_BOOT === 'true';

    if (!shouldImportOnBoot) {
      return;
    }

    const config = getPluginConfig(strapi);
    const repositories = await strapi.plugin('github-showcase').service('github').fetchRepositories({
      owner: config.githubOwner,
      token: config.githubToken,
      limit: 3,
    });

    await strapi.plugin('github-showcase').service('project').importRepositories(repositories);
    strapi.log.info(`GitHub Showcase imported ${repositories.length} repositories for ${config.githubOwner}.`);
  },
  contentTypes: {
    project: {
      schema: projectSchema,
    },
  },
  routes: {
    admin: {
      type: 'admin',
      routes: [
        {
          method: 'GET',
          path: '/repositories',
          handler: 'project.repositories',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
        },
        {
          method: 'GET',
          path: '/projects',
          handler: 'project.findImported',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
        },
        {
          method: 'POST',
          path: '/projects/import',
          handler: 'project.importRepositories',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
        },
        {
          method: 'PUT',
          path: '/projects/:documentId/featured',
          handler: 'project.setFeatured',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
        },
        {
          method: 'DELETE',
          path: '/projects/:documentId',
          handler: 'project.delete',
          config: {
            policies: ['admin::isAuthenticatedAdmin'],
          },
        },
      ],
    },
    'content-api': {
      type: 'content-api',
      routes: [
        {
          method: 'GET',
          path: '/projects',
          handler: 'project.find',
          config: {
            auth: false,
          },
        },
        {
          method: 'GET',
          path: '/projects/:documentId',
          handler: 'project.findOne',
          config: {
            auth: false,
          },
        },
      ],
    },
  },
  services: {
    github: ({ strapi }) => ({
      async fetchRepositories(args) {
        const owner = args.owner?.trim();

        if (!owner) {
          throw new Error('GitHub owner is required.');
        }

        const limit = Math.min(Math.max(args.limit ?? 12, 1), 30);
        const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(owner)}/repos?sort=updated&per_page=${limit}`;
        const response = await fetch(url, {
          headers: getHeaders(args.token),
        });

        if (!response.ok) {
          const message = await response.text();
          strapi.log.warn(`GitHub API request failed: ${response.status} ${message}`);
          throw new Error(`GitHub API request failed with status ${response.status}.`);
        }

        const repos = await response.json();
        return repos.map(toProjectData);
      },
    }),
    project: ({ strapi }) => ({
      async findPublic() {
        return strapi.documents(PROJECT_UID).findMany({
          sort: ['featured:desc', 'stars:desc', 'pushedAt:desc'],
          status: 'published',
        });
      },
      async findOnePublic(documentId) {
        return strapi.documents(PROJECT_UID).findOne({
          documentId,
          status: 'published',
        });
      },
      async findAdmin() {
        return strapi.documents(PROJECT_UID).findMany({
          sort: ['updatedAt:desc'],
        });
      },
      async importRepositories(repositories) {
        const imported = [];

        for (const repository of repositories) {
          const existing = await findByGithubId(strapi, repository.githubId);

          if (existing) {
            imported.push(
              await strapi.documents(PROJECT_UID).update({
                documentId: existing.documentId,
                data: repository,
                status: 'published',
              })
            );
          } else {
            imported.push(
              await strapi.documents(PROJECT_UID).create({
                data: repository,
                status: 'published',
              })
            );
          }
        }

        return imported;
      },
      async setFeatured(documentId, featured) {
        return strapi.documents(PROJECT_UID).update({
          documentId,
          data: {
            featured,
          },
          status: 'published',
        });
      },
      async delete(documentId) {
        return strapi.documents(PROJECT_UID).delete({
          documentId,
        });
      },
    }),
  },
  controllers: {
    project: ({ strapi }) => ({
      async find(ctx) {
        const projects = await strapi.plugin('github-showcase').service('project').findPublic();
        ctx.body = { data: projects };
      },
      async findOne(ctx) {
        const project = await strapi.plugin('github-showcase').service('project').findOnePublic(ctx.params.documentId);

        if (!project) {
          return ctx.notFound('Project not found');
        }

        ctx.body = { data: project };
      },
      async repositories(ctx) {
        const config = getPluginConfig(strapi);
        const owner = String(ctx.query.owner ?? config.githubOwner);
        const repositories = await strapi.plugin('github-showcase').service('github').fetchRepositories({
          owner,
          token: config.githubToken,
        });

        ctx.body = { data: repositories };
      },
      async findImported(ctx) {
        const projects = await strapi.plugin('github-showcase').service('project').findAdmin();
        ctx.body = { data: projects };
      },
      async importRepositories(ctx) {
        const config = getPluginConfig(strapi);
        const owner = String(ctx.request.body?.owner ?? config.githubOwner);
        const repositories =
          Array.isArray(ctx.request.body?.repositories) && ctx.request.body.repositories.length > 0
            ? ctx.request.body.repositories
            : await strapi.plugin('github-showcase').service('github').fetchRepositories({
                owner,
                token: config.githubToken,
              });

        const projects = await strapi.plugin('github-showcase').service('project').importRepositories(repositories);
        ctx.body = { data: projects };
      },
      async setFeatured(ctx) {
        const project = await strapi
          .plugin('github-showcase')
          .service('project')
          .setFeatured(ctx.params.documentId, Boolean(ctx.request.body?.featured));

        ctx.body = { data: project };
      },
      async delete(ctx) {
        const project = await strapi.plugin('github-showcase').service('project').delete(ctx.params.documentId);
        ctx.body = { data: project };
      },
    }),
  },
});
