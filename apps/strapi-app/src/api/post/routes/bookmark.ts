export default {
  routes: [
    {
      method: 'PUT',
      path: '/posts/:documentId/bookmark',
      handler: 'post.bookmark',
      config: {
        policies: ['is-authenticated'],
      },
    },
  ],
};
