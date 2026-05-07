const CONTENT_UIDS = [
  'api::author.author',
  'api::home-page.home-page',
  'api::post.post',
  'api::site-setting.site-setting',
  'api::static-page.static-page',
  'api::tag.tag',
];

const clampLimit = (limit = 3) => Math.min(Math.max(limit, 1), 6);

export const registerCourseGraphQLExtension = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  for (const uid of CONTENT_UIDS) {
    extensionService.shadowCRUD(uid).disableActions(['create', 'update', 'delete']);
  }

  extensionService.shadowCRUD('api::post.post').disableActions(['find', 'findOne']);

  extensionService.use(() => ({
    typeDefs: `
      extend type Query {
        featuredPosts(limit: Int = 3): [Post!]!
        publicPost(documentId: ID!): Post
        readerPosts: [Post!]!
      }

      extend type Mutation {
        bookmarkPost(documentId: ID!): Post
      }
    `,
    resolvers: {
      Query: {
        featuredPosts: async (_parent, args) => {
          return strapi.documents('api::post.post').findMany({
            filters: {
              isPremium: {
                $eq: false,
              },
            },
            limit: clampLimit(args.limit),
            sort: ['publishedAt:desc'],
            status: 'published',
            populate: {
              author: true,
              tags: true,
            },
          } as any);
        },
        publicPost: async (_parent, args) => {
          return strapi.documents('api::post.post').findFirst({
            filters: {
              documentId: {
                $eq: args.documentId,
              },
              isPremium: {
                $eq: false,
              },
            },
            status: 'published',
            populate: {
              author: true,
              tags: true,
            },
          } as any);
        },
        readerPosts: async (_parent, _args, context) => {
          if (!context.state.user) {
            throw new Error('You must be authenticated to read premium posts.');
          }

          return strapi.documents('api::post.post').findMany({
            sort: ['publishedAt:desc'],
            status: 'published',
            populate: {
              author: true,
              tags: true,
            },
          } as any);
        },
      },
      Mutation: {
        bookmarkPost: async (_parent, args, context) => {
          const user = context.state.user;

          if (!user) {
            throw new Error('You must be authenticated to bookmark posts.');
          }

          return (strapi.service('api::post.post') as any).bookmark({
            documentId: args.documentId,
            userId: user.id,
          });
        },
      },
    },
    resolversConfig: {
      'Query.featuredPosts': {
        auth: false,
      },
      'Query.publicPost': {
        auth: false,
      },
      'Query.readerPosts': {
        auth: {
          scope: ['api::post.post.find'],
        },
      },
      'Mutation.bookmarkPost': {
        auth: {
          scope: ['api::post.post.bookmark'],
        },
      },
    },
  }));
};
