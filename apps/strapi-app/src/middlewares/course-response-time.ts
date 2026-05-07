export default () => {
  return async (ctx, next) => {
    const startedAt = Date.now();

    await next();

    if (ctx.path.startsWith('/api')) {
      ctx.set('X-Course-Response-Time', `${Date.now() - startedAt}ms`);
    }
  };
};
