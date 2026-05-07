import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'github-showcase': {
    enabled: true,
    resolve: './src/plugins/github-showcase',
    config: {
      githubOwner: env('GITHUB_SHOWCASE_OWNER', 'octocat'),
      githubToken: env('GITHUB_TOKEN'),
    },
  },
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      landingPage: env.bool('GRAPHQL_LANDING_PAGE', true),
      depthLimit: 10,
      amountLimit: 25,
    },
  },
});

export default config;
