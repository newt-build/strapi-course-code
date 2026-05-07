const hasProtocol = (url: string) => /^https?:\/\//i.test(url);

const normalizeWebsite = (data: Record<string, unknown>) => {
  if (typeof data.website !== 'string' || data.website.length === 0) {
    return;
  }

  data.website = hasProtocol(data.website) ? data.website : `https://${data.website}`;
};

export default {
  beforeCreate(event) {
    normalizeWebsite(event.params.data);
  },

  beforeUpdate(event) {
    normalizeWebsite(event.params.data);
  },
};
