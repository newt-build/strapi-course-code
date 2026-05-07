import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post', ({ strapi }) => ({
  async bookmark(args: { documentId: string; userId: number }) {
    const { documentId, userId } = args;

    return strapi.documents('api::post.post').update({
      documentId,
      data: {
        bookmarkedBy: {
          connect: [userId],
        },
      },
      status: 'published',
      populate: {
        author: true,
        tags: true,
        bookmarkedBy: {
          fields: ['id', 'username', 'email'],
        },
      },
    } as any);
  },
}));
