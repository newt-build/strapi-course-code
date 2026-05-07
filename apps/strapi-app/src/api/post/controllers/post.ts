import { factories } from '@strapi/strapi';

const forcePublicPostFilter = (query: Record<string, any>) => ({
  ...query,
  filters: {
    ...(query.filters ?? {}),
    isPremium: {
      $eq: false,
    },
  },
});

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    if (!ctx.state.user) {
      ctx.query = forcePublicPostFilter(ctx.query as Record<string, any>);
    }

    return super.find(ctx);
  },

  async findOne(ctx) {
    if (ctx.state.user) {
      return super.findOne(ctx);
    }

    const documentId = ctx.params.documentId ?? ctx.params.id;
    const post = await strapi.documents('api::post.post').findOne({
      documentId,
      status: 'published',
      fields: ['documentId', 'isPremium'],
    } as any);

    if (!post || post.isPremium) {
      return ctx.notFound('Post not found');
    }

    return super.findOne(ctx);
  },

  async bookmark(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be authenticated to bookmark posts.');
    }

    const post = await (strapi.service('api::post.post') as any).bookmark({
      documentId: ctx.params.documentId,
      userId: user.id,
    });

    const sanitizedPost = await this.sanitizeOutput(post, ctx);
    return this.transformResponse(sanitizedPost);
  },
}));
