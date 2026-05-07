import type { StrapiApp } from '@strapi/strapi/admin';

import PluginIcon from './components/PluginIcon';
import pluginId from './pluginId';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'GitHub Showcase',
      },
      Component: () => import('./pages/App'),
      permissions: [],
      position: 4,
    });

    app.registerPlugin({
      id: pluginId,
      name: 'GitHub Showcase',
    });
  },

  bootstrap() {},

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) =>
        import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({
            data,
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }))
      )
    );

    return importedTrads;
  },
};
