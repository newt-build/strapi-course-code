import { getFetchClient } from '@strapi/strapi/admin';

export type GitHubRepository = {
  name: string;
  slug: string;
  fullName: string;
  description?: string | null;
  url: string;
  homepage?: string | null;
  language?: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  githubId: string;
  owner: string;
  topics?: string[];
  pushedAt?: string;
  importedAt?: string;
};

export type Project = GitHubRepository & {
  id: number;
  documentId: string;
  featured: boolean;
};

const endpoint = '/github-showcase';

export const fetchRepositories = async (owner: string) => {
  const { get } = getFetchClient();
  const response = await get(`${endpoint}/repositories`, {
    params: {
      owner,
    },
  });

  return response.data.data as GitHubRepository[];
};

export const fetchImportedProjects = async () => {
  const { get } = getFetchClient();
  const response = await get(`${endpoint}/projects`);

  return response.data.data as Project[];
};

export const importRepositories = async (owner: string, repositories: GitHubRepository[]) => {
  const { post } = getFetchClient();
  const response = await post(`${endpoint}/projects/import`, {
    owner,
    repositories,
  });

  return response.data.data as Project[];
};

export const setFeaturedProject = async (documentId: string, featured: boolean) => {
  const { put } = getFetchClient();
  const response = await put(`${endpoint}/projects/${documentId}/featured`, {
    featured,
  });

  return response.data.data as Project;
};

export const deleteProject = async (documentId: string) => {
  const { del } = getFetchClient();
  const response = await del(`${endpoint}/projects/${documentId}`);

  return response.data.data as Project;
};
