import type { Core } from '@strapi/strapi';
import { grantCoursePublicReadPermissions, seedCourseContent } from './bootstrap/seed';
import { registerPostDocumentMiddleware } from './document-service/post-middleware';
import { registerCourseGraphQLExtension } from './graphql/course-extension';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    registerPostDocumentMiddleware(strapi);
    registerCourseGraphQLExtension(strapi);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantCoursePublicReadPermissions(strapi);
    await seedCourseContent(strapi);
  },
};
