import * as React from 'react';

import {
  deleteProject,
  fetchImportedProjects,
  fetchRepositories,
  GitHubRepository,
  importRepositories,
  Project,
  setFeaturedProject,
} from '../utils/api';

const styles = {
  page: {
    display: 'grid',
    gap: 24,
    padding: 32,
  },
  header: {
    display: 'grid',
    gap: 6,
  },
  title: {
    color: '#212134',
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    color: '#666687',
    fontSize: 14,
    margin: 0,
  },
  toolbar: {
    alignItems: 'end',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    display: 'grid',
    gap: 6,
  },
  label: {
    color: '#32324d',
    fontSize: 12,
    fontWeight: 600,
  },
  input: {
    border: '1px solid #dcdce4',
    borderRadius: 4,
    color: '#32324d',
    fontSize: 14,
    minHeight: 40,
    minWidth: 260,
    padding: '9px 12px',
  },
  button: {
    background: '#4945ff',
    border: '1px solid #4945ff',
    borderRadius: 4,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    minHeight: 40,
    padding: '9px 14px',
  },
  secondaryButton: {
    background: '#ffffff',
    border: '1px solid #dcdce4',
    borderRadius: 4,
    color: '#32324d',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    minHeight: 36,
    padding: '7px 12px',
  },
  dangerButton: {
    background: '#ffffff',
    border: '1px solid #f5c0b8',
    borderRadius: 4,
    color: '#b72b1a',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    minHeight: 36,
    padding: '7px 12px',
  },
  section: {
    display: 'grid',
    gap: 12,
  },
  sectionTitle: {
    color: '#32324d',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  table: {
    background: '#ffffff',
    border: '1px solid #dcdce4',
    borderCollapse: 'collapse' as const,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  th: {
    background: '#f6f6f9',
    borderBottom: '1px solid #dcdce4',
    color: '#666687',
    fontSize: 12,
    padding: 12,
    textAlign: 'left' as const,
  },
  td: {
    borderBottom: '1px solid #f0f0ff',
    color: '#32324d',
    fontSize: 14,
    padding: 12,
    verticalAlign: 'top' as const,
  },
  status: {
    color: '#666687',
    fontSize: 14,
  },
};

const formatOwner = (value: string) =>
  value
    .trim()
    .replace(/^https:\/\/github.com\//i, '')
    .replace(/^@/, '')
    .split('/')[0];

const App = () => {
  const [owner, setOwner] = React.useState('octocat');
  const [repositories, setRepositories] = React.useState<GitHubRepository[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState('Ready');
  const [isBusy, setIsBusy] = React.useState(false);

  const refreshImportedProjects = React.useCallback(async () => {
    const importedProjects = await fetchImportedProjects();
    setProjects(importedProjects);
  }, []);

  React.useEffect(() => {
    refreshImportedProjects().catch((error) => {
      setStatus(error instanceof Error ? error.message : 'Could not load imported projects.');
    });
  }, [refreshImportedProjects]);

  const loadRepositories = async () => {
    setIsBusy(true);
    setStatus('Fetching GitHub repositories...');

    try {
      const normalizedOwner = formatOwner(owner);
      const nextRepositories = await fetchRepositories(normalizedOwner);

      setOwner(normalizedOwner);
      setRepositories(nextRepositories);
      setSelectedIds(nextRepositories.map((repo) => repo.githubId));
      setStatus(`Fetched ${nextRepositories.length} repositories.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'GitHub request failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const importSelected = async () => {
    setIsBusy(true);
    setStatus('Importing selected repositories...');

    try {
      const selectedRepositories = repositories.filter((repo) => selectedIds.includes(repo.githubId));
      const importedProjects = await importRepositories(owner, selectedRepositories);

      setStatus(`Imported ${importedProjects.length} projects.`);
      await refreshImportedProjects();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const toggleSelection = (githubId: string) => {
    setSelectedIds((current) =>
      current.includes(githubId) ? current.filter((id) => id !== githubId) : [...current, githubId]
    );
  };

  const toggleFeatured = async (project: Project) => {
    await setFeaturedProject(project.documentId, !project.featured);
    await refreshImportedProjects();
  };

  const removeProject = async (project: Project) => {
    await deleteProject(project.documentId);
    await refreshImportedProjects();
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>GitHub Showcase</h1>
        <p style={styles.subtitle}>Fetch public repositories and import them as project documents.</p>
      </header>

      <section style={styles.toolbar}>
        <label style={styles.field}>
          <span style={styles.label}>Owner</span>
          <input
            disabled={isBusy}
            onBlur={(event) => setOwner(formatOwner(event.currentTarget.value))}
            onChange={(event) => setOwner(event.currentTarget.value)}
            placeholder="octocat"
            style={styles.input}
            value={owner}
          />
        </label>
        <button disabled={isBusy} onClick={loadRepositories} style={styles.button} type="button">
          Fetch repositories
        </button>
        <button disabled={isBusy || selectedIds.length === 0} onClick={importSelected} style={styles.button} type="button">
          Import selected
        </button>
        <span style={styles.status}>{status}</span>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Fetched repositories</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Import</th>
              <th style={styles.th}>Repository</th>
              <th style={styles.th}>Language</th>
              <th style={styles.th}>Stars</th>
              <th style={styles.th}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.githubId}>
                <td style={styles.td}>
                  <input
                    checked={selectedIds.includes(repo.githubId)}
                    onChange={() => toggleSelection(repo.githubId)}
                    type="checkbox"
                  />
                </td>
                <td style={styles.td}>
                  <strong>{repo.fullName}</strong>
                  <br />
                  <span>{repo.description ?? 'No description'}</span>
                </td>
                <td style={styles.td}>{repo.language ?? '-'}</td>
                <td style={styles.td}>{repo.stars}</td>
                <td style={styles.td}>{repo.pushedAt ? new Date(repo.pushedAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {repositories.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.td}>
                  No repositories fetched yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Imported projects</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Stars</th>
              <th style={styles.th}>Featured</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.documentId}>
                <td style={styles.td}>
                  <strong>{project.fullName}</strong>
                  <br />
                  <a href={project.url} rel="noreferrer" target="_blank">
                    {project.url}
                  </a>
                </td>
                <td style={styles.td}>{project.stars}</td>
                <td style={styles.td}>{project.featured ? 'Yes' : 'No'}</td>
                <td style={styles.td}>
                  <button onClick={() => toggleFeatured(project)} style={styles.secondaryButton} type="button">
                    {project.featured ? 'Unfeature' : 'Feature'}
                  </button>{' '}
                  <button onClick={() => removeProject(project)} style={styles.dangerButton} type="button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} style={styles.td}>
                  No projects imported yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default App;
