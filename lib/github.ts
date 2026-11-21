import { site } from '@/site.config';
import { selectPublic, type RawRepo, type Repo } from './repos';

export type Profile = { login: string; name: string; avatar: string; url: string };

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, cache: 'force-cache' });
  if (!res.ok) throw new Error(`GitHub ${path} respondió ${res.status}`);
  return (await res.json()) as T;
}

/** Corre en el build. Si GitHub falla, la página sale vacía pero no rompe el deploy. */
export async function getPortfolioData(): Promise<{ repos: Repo[]; profile: Profile | null }> {
  try {
    const [raws, user] = await Promise.all([
      gh<RawRepo[]>(`/users/${site.user}/repos?per_page=100&type=owner&sort=pushed`),
      gh<{ login: string; name?: string | null; avatar_url: string; html_url: string }>(`/users/${site.user}`),
    ]);
    return {
      repos: selectPublic(raws, { exclude: site.exclude, includeForks: site.includeForks }),
      profile: { login: user.login, name: user.name || user.login, avatar: user.avatar_url, url: user.html_url },
    };
  } catch (error) {
    console.warn('[portafolio]', error);
    return { repos: [], profile: null };
  }
}
