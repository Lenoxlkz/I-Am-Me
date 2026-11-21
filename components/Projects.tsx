'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { fmt, type Dict, type Lang } from '@/lib/i18n';
import { filterRepos, formatDate, languageHue, languagesOf, sortRepos, type Repo, type Sort } from '@/lib/repos';

type Props = { repos: Repo[]; pinned?: string[]; t: Dict; lang: Lang };

const hue = (h: number) => ({ '--h': h }) as CSSProperties;

const Star = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M8 1.5l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.3 4 13.5l.9-4.4-3.3-3 4.5-.5z" /></svg>
);
const Fork = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.5" d="M4.5 2.5v4a2 2 0 002 2h3a2 2 0 002-2v-4M8 8.5v5" /><circle cx="4.5" cy="2.5" r="1.3" fill="currentColor" /><circle cx="11.5" cy="2.5" r="1.3" fill="currentColor" /><circle cx="8" cy="13.5" r="1.3" fill="currentColor" /></svg>
);

function Card({ repo, index, t, lang }: { repo: Repo; index: number; t: Dict; lang: Lang }) {
  return (
    <li className={`card s${index % 7}`} style={hue(languageHue(repo.language, repo.name))}>
      <h3 className="card-title">
        <a className="card-link" href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a>
      </h3>
      <p className="card-desc">{repo.description ?? t.noDesc}</p>
      {repo.topics.length > 0 && (
        <ul className="topics">
          {repo.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
      )}
      <div className="card-foot">
        <div className="meta">
          {repo.language && <span className="lang"><i className="dot" />{repo.language}</span>}
          <span><Star />{repo.stars}<span className="sr"> {t.stars}</span></span>
          <span><Fork />{repo.forks}<span className="sr"> {t.forks}</span></span>
          <span className="when">{fmt(t.updated, { when: formatDate(repo.updatedAt, lang) })}</span>
        </div>
        <div className="actions">
          {repo.homepage && (
            <a className="mini" href={repo.homepage} target="_blank" rel="noreferrer">{t.demo}</a>
          )}
          <span className="mini mini-solid" aria-hidden="true">{t.code}</span>
        </div>
      </div>
    </li>
  );
}

export default function Projects({ repos, pinned = [], t, lang }: Props) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('recent');

  const languages = useMemo(() => languagesOf(repos), [repos]);
  const visible = useMemo(
    () => sortRepos(filterRepos(repos, { query, language }), sort, pinned),
    [repos, query, language, sort, pinned],
  );
  const reset = () => { setQuery(''); setLanguage(null); };

  return (
    <section id="proyectos" className="projects" aria-labelledby="proyectos-titulo">
      <header className="projects-head">
        <h2 id="proyectos-titulo">{t.projectsTitle}</h2>
        {repos.length > 0 && <p>{fmt(t.summary, { n: repos.length, l: languages.length })}</p>}
      </header>

      {repos.length === 0 ? (
        <div className="empty">
          <h3>{t.noRepos}</h3>
          <p>{t.noReposHint}</p>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <label className="search">
              <span className="sr">{t.search}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              <input type="search" value={query} placeholder={t.search} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="chips" role="group" aria-label={t.filterLang}>
              <button type="button" className="chip" aria-pressed={language === null} onClick={() => setLanguage(null)}>{t.all}</button>
              {languages.map((l) => (
                <button
                  key={l.name}
                  type="button"
                  className="chip"
                  style={hue(languageHue(l.name, l.name))}
                  aria-pressed={language === l.name}
                  onClick={() => setLanguage(language === l.name ? null : l.name)}
                >
                  <i className="dot" />{l.name}
                </button>
              ))}
            </div>
            <div className="chips sort" role="group" aria-label={t.sortBy}>
              <button type="button" className="chip" aria-pressed={sort === 'recent'} onClick={() => setSort('recent')}>{t.sortRecent}</button>
              <button type="button" className="chip" aria-pressed={sort === 'stars'} onClick={() => setSort('stars')}>{t.sortStars}</button>
            </div>
          </div>

          <p className="sr" aria-live="polite">{fmt(t.results, { n: visible.length })}</p>

          {visible.length === 0 ? (
            <div className="empty">
              <h3>{t.emptyTitle}</h3>
              <p>{t.emptyHint}</p>
              <button type="button" className="btn btn-solid" onClick={reset}>{t.clear}</button>
            </div>
          ) : (
            <ul className="grid">
              {visible.map((repo, i) => <Card key={repo.id || repo.name} repo={repo} index={i} t={t} lang={lang} />)}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
