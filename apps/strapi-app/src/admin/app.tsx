import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['en', 'it'],
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'DevLog CMS',
      },
      it: {
        'app.components.LeftMenu.navbrand.title': 'DevLog CMS',
      },
    },
    tutorials: false,
    notifications: {
      releases: false,
    },
  },
  bootstrap(app: StrapiApp) {
    app.customFields.register({
      name: 'github-owner',
      type: 'string',
      intlLabel: {
        id: 'course.fields.github-owner.label',
        defaultMessage: 'GitHub owner',
      },
      intlDescription: {
        id: 'course.fields.github-owner.description',
        defaultMessage: 'GitHub username or organization used by the GitHub Showcase plugin.',
      },
      components: {
        Input: async () => import('./components/GithubOwnerInput'),
      },
    });
  },
};
