import type { Schema, Struct } from '@strapi/strapi';

export interface LayoutFeaturedPosts extends Struct.ComponentSchema {
  collectionName: 'components_layout_featured_posts';
  info: {
    description: 'Manual selection of posts to highlight';
    displayName: 'Featured Posts';
  };
  attributes: {
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Featured posts'>;
    posts: Schema.Attribute.Relation<'oneToMany', 'api::post.post'>;
  };
}

export interface LayoutHero extends Struct.ComponentSchema {
  collectionName: 'components_layout_heroes';
  info: {
    description: 'Main page intro block';
    displayName: 'Hero';
  };
  attributes: {
    eyebrow: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    image: Schema.Attribute.Media<'images'>;
    primaryLink: Schema.Attribute.Component<'layout.link', false>;
    secondaryLink: Schema.Attribute.Component<'layout.link', false>;
    subheading: Schema.Attribute.Text;
  };
}

export interface LayoutLink extends Struct.ComponentSchema {
  collectionName: 'components_layout_links';
  info: {
    description: 'Reusable CTA or navigation link';
    displayName: 'Link';
  };
  attributes: {
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_seo_metadata';
  info: {
    description: 'Reusable SEO metadata for public pages and entries';
    displayName: 'Metadata';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'A labeled external profile link';
    displayName: 'Social Link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    platform: Schema.Attribute.Enumeration<
      ['github', 'linkedin', 'x', 'youtube', 'website', 'other']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'website'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'layout.featured-posts': LayoutFeaturedPosts;
      'layout.hero': LayoutHero;
      'layout.link': LayoutLink;
      'seo.metadata': SeoMetadata;
      'shared.social-link': SharedSocialLink;
    }
  }
}
