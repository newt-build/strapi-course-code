import type { Core } from '@strapi/strapi';

type Strapi = Core.Strapi;
type AnyDocument = Record<string, any>;

const PUBLIC_READ_ACTIONS = [
  'api::author.author.find',
  'api::author.author.findOne',
  'api::home-page.home-page.find',
  'api::post.post.find',
  'api::post.post.findOne',
  'api::site-setting.site-setting.find',
  'api::static-page.static-page.find',
  'api::static-page.static-page.findOne',
  'api::tag.tag.find',
  'api::tag.tag.findOne',
];

const AUTHENTICATED_ACTIONS = ['api::post.post.bookmark'];
const AUTHENTICATED_READ_AND_WRITE_ACTIONS = [...PUBLIC_READ_ACTIONS, ...AUTHENTICATED_ACTIONS];

const paragraph = (text: string) => [
  {
    type: 'paragraph',
    children: [{ type: 'text', text }],
  },
];

const findFirst = async (strapi: Strapi, uid: string, slug: string): Promise<AnyDocument | null> => {
  return strapi.documents(uid as any).findFirst({
    filters: { slug: { $eq: slug } },
  } as any);
};

const createIfMissing = async (
  strapi: Strapi,
  uid: string,
  slug: string,
  data: Record<string, any>,
  status?: 'draft' | 'published'
) => {
  const existing = await findFirst(strapi, uid, slug);

  if (existing) {
    return existing;
  }

  return strapi.documents(uid as any).create({
    data,
    status,
  } as any);
};

export const grantCoursePublicReadPermissions = async (strapi: Strapi) => {
  const shouldGrant =
    process.env.NODE_ENV !== 'production' && process.env.STRAPI_BOOTSTRAP_PERMISSIONS === 'true';

  if (!shouldGrant) {
    return;
  }

  await grantPermissions(strapi, 'public', PUBLIC_READ_ACTIONS, 'public read');
  await grantPermissions(
    strapi,
    'authenticated',
    AUTHENTICATED_READ_AND_WRITE_ACTIONS,
    'authenticated read and custom action'
  );
};

const grantPermissions = async (strapi: Strapi, roleType: string, actions: string[], label: string) => {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: roleType },
  });

  if (!role) {
    strapi.log.warn(`${roleType} role not found. Skipping ${label} permission bootstrap.`);
    return;
  }

  for (const action of actions) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action,
        role: {
          id: role.id,
        },
      },
    });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: role.id,
        },
      });
    }
  }

  strapi.log.info(`Course ${label} permissions are ready.`);
};

export const seedCourseContent = async (strapi: Strapi) => {
  const shouldSeed = process.env.NODE_ENV !== 'production' && process.env.STRAPI_BOOTSTRAP_SEED === 'true';

  if (!shouldSeed) {
    return;
  }

  const author = await createIfMissing(strapi, 'api::author.author', 'alex-rivera', {
    name: 'Alex Rivera',
    slug: 'alex-rivera',
    bio: 'Full-stack developer writing about backend systems, content platforms, and product engineering.',
    website: 'https://example.com',
    socialLinks: [
      {
        platform: 'github',
        label: 'GitHub',
        url: 'https://github.com/octocat',
      },
    ],
  });

  const strapiTag = await createIfMissing(strapi, 'api::tag.tag', 'strapi', {
    name: 'Strapi',
    slug: 'strapi',
    description: 'Strapi tutorials, patterns, and production notes.',
  });

  const backendTag = await createIfMissing(strapi, 'api::tag.tag', 'backend', {
    name: 'Backend',
    slug: 'backend',
    description: 'API design, databases, auth, and server-side development.',
  });

  await createIfMissing(
    strapi,
    'api::post.post',
    'building-a-strapi-5-backend',
    {
      title: 'Building a Strapi 5 backend',
      slug: 'building-a-strapi-5-backend',
      excerpt: 'A practical walkthrough of the core ideas behind a Strapi 5 project.',
      content: paragraph(
        'Strapi 5 is document-first. This post introduces content modeling, public APIs, and backend customization.'
      ),
      isPremium: false,
      author: { connect: [author.documentId] },
      tags: { connect: [strapiTag.documentId, backendTag.documentId] },
      seo: {
        metaTitle: 'Building a Strapi 5 backend',
        metaDescription: 'Learn the core ideas behind a practical Strapi 5 backend.',
      },
    },
    'published'
  );

  await createIfMissing(
    strapi,
    'api::post.post',
    'premium-strapi-customization-patterns',
    {
      title: 'Premium Strapi customization patterns',
      slug: 'premium-strapi-customization-patterns',
      excerpt: 'Advanced backend customization patterns for authenticated readers.',
      content: paragraph(
        'This premium post gives us a realistic reason to customize controllers, services, policies, and GraphQL.'
      ),
      isPremium: true,
      author: { connect: [author.documentId] },
      tags: { connect: [strapiTag.documentId] },
      seo: {
        metaTitle: 'Premium Strapi customization patterns',
        metaDescription: 'Advanced Strapi 5 backend customization patterns.',
        noIndex: true,
      },
    },
    'published'
  );

  const existingHome = await strapi.documents('api::home-page.home-page' as any).findFirst({} as any);

  if (!existingHome) {
    await strapi.documents('api::home-page.home-page' as any).create({
      data: {
        title: 'Home',
        hero: {
          eyebrow: 'DevLog CMS',
          heading: 'A Strapi 5 backend for a developer portfolio',
          subheading: 'A compact course project for learning content modeling, APIs, customization, plugins, and deployment.',
          primaryLink: {
            label: 'Read the blog',
            url: '/blog',
          },
        },
        featuredPosts: {
          heading: 'Latest writing',
        },
        seo: {
          metaTitle: 'DevLog CMS',
          metaDescription: 'A Strapi 5 course backend for a developer blog and portfolio.',
        },
      },
      status: 'published',
    } as any);
  }

  const existingSettings = await strapi.documents('api::site-setting.site-setting' as any).findFirst({} as any);

  if (!existingSettings) {
    await strapi.documents('api::site-setting.site-setting' as any).create({
      data: {
        siteName: 'DevLog CMS',
        tagline: 'A practical Strapi 5 course project',
        githubOwner: 'octocat',
        navigationLinks: [
          {
            label: 'Blog',
            url: '/blog',
          },
          {
            label: 'Projects',
            url: '/projects',
          },
        ],
        socialLinks: [
          {
            platform: 'github',
            label: 'GitHub',
            url: 'https://github.com/octocat',
          },
        ],
        defaultSeo: {
          metaTitle: 'DevLog CMS',
          metaDescription: 'A Strapi 5 backend for a developer blog and portfolio.',
        },
      },
    } as any);
  } else if (!existingSettings.githubOwner) {
    await strapi.documents('api::site-setting.site-setting' as any).update({
      documentId: existingSettings.documentId,
      data: {
        githubOwner: 'octocat',
      },
    } as any);
  }

  strapi.log.info('Course seed content is ready.');
};
