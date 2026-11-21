export type RawRepo = {
  id?: number;
  name?: string;
  description?: string | null;
  html_url?: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  pushed_at?: string | null;
  updated_at?: string | null;
  topics?: string[];
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
  visibility?: string;
};

export type Repo = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
};

export type Sort = 'recent' | 'stars';

export function normalizeHomepage(value?: string | null): string | null {
  const v = value?.trim();
  if (!v) return null;
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

export function normalizeRepo(raw: RawRepo): Repo {
  const name = raw.name ?? '';
  return {
    id: raw.id ?? 0,
    name,
    description: raw.description?.trim() || null,
    url: raw.html_url ?? '',
    homepage: normalizeHomepage(raw.homepage),
    language: raw.language ?? null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    updatedAt: raw.pushed_at ?? raw.updated_at ?? new Date(0).toISOString(),
    topics: raw.topics ?? [],
  };
}

export function selectPublic(raws: RawRepo[], opts: { exclude?: string[]; includeForks?: boolean } = {}): Repo[] {
  const exclude = new Set((opts.exclude ?? []).map((n) => n.toLowerCase()));
  return raws
    .filter((r) => r.name && r.private !== true && r.visibility !== 'private')
    .filter((r) => r.archived !== true)
    .filter((r) => opts.includeForks || r.fork !== true)
    .filter((r) => !exclude.has((r.name ?? '').toLowerCase()))
    .map(normalizeRepo);
}

export function languagesOf(repos: Repo[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function filterRepos(repos: Repo[], f: { query?: string; language?: string | null }): Repo[] {
  const q = (f.query ?? '').trim().toLowerCase();
  return repos.filter((r) => {
    if (f.language && r.language !== f.language) return false;
    if (!q) return true;
    return [r.name, r.description ?? '', r.language ?? '', ...r.topics].some((s) => s.toLowerCase().includes(q));
  });
}

export function sortRepos(repos: Repo[], sort: Sort, pinned: string[] = []): Repo[] {
  const pins = new Map(pinned.map((n, i) => [n.toLowerCase(), i]));
  const rank = (r: Repo) => pins.get(r.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
  const time = (r: Repo) => Date.parse(r.updatedAt) || 0;
  return [...repos].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra < rb ? -1 : 1;
    const primary = sort === 'stars' ? b.stars - a.stars : 0;
    return primary || time(b) - time(a) || a.name.localeCompare(b.name);
  });
}

const HUES = new Map<string, number>([
  ['TypeScript', 212], ['JavaScript', 48], ['Python', 205], ['HTML', 14], ['CSS', 268],
  ['Kotlin', 280], ['Java', 28], ['C#', 130], ['C', 200], ['C++', 330], ['Go', 188],
  ['Rust', 20], ['Swift', 8], ['Shell', 140], ['PHP', 240], ['Ruby', 350], ['Dart', 195], ['Vue', 150],
]);

/** Tono (0-359) estable por lenguaje; sin lenguaje, se deriva del nombre. */
export function languageHue(language: string | null, seed: string): number {
  const known = language ? HUES.get(language) : undefined;
  if (known !== undefined) return known;
  let h = 0;
  for (const ch of `${language ?? ''}${seed}`) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

/** Fecha corta y determinista (UTC) para evitar diferencias servidor/cliente. */
export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}
