type BlocksNode = {
  text?: string;
  children?: BlocksNode[];
};

const flattenBlocksText = (nodes: BlocksNode[] = []): string =>
  nodes
    .flatMap((node) => [node.text, flattenBlocksText(node.children)])
    .filter(Boolean)
    .join(' ');

const calculateReadingTimeMinutes = (content: BlocksNode[] = []) => {
  const words = flattenBlocksText(content).trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 200));
};

export const registerPostDocumentMiddleware = (strapi) => {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== 'api::post.post') {
      return next();
    }

    if (['create', 'update'].includes(context.action)) {
      const data = context.params.data ?? {};

      if (Array.isArray(data.content)) {
        data.readingTimeMinutes = calculateReadingTimeMinutes(data.content);
      }
    }

    return next();
  });
};
