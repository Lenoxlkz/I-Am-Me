'use client';

import { useEffect, useState } from 'react';
import { dict, type Lang } from '@/lib/i18n';
import type { Profile } from '@/lib/github';
import type { Repo } from '@/lib/repos';
import Hero from './Hero';
import Projects from './Projects';

type Props = { repos: Repo[]; profile: Profile | null; user: string; pinned?: string[] };

export default function Site({ repos, profile, user, pinned = [] }: Props) {
  const [lang, setLang] = useState<Lang>('es');
  const t = dict[lang];
  const githubUrl = profile?.url ?? `https://github.com/${user}`;
  const name = profile?.name ?? user;

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('lang'); } catch { /* sin almacenamiento */ }
    if (saved === 'es' || saved === 'en') setLang(saved);
    else if (navigator.language?.toLowerCase().startsWith('en')) setLang('en');
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const toggle = () => {
    const next: Lang = lang === 'es' ? 'en' : 'es';
    setLang(next);
    try { localStorage.setItem('lang', next); } catch { /* sin almacenamiento */ }
  };

  return (
    <>
      <a className="skip" href="#contenido">{t.skip}</a>
      <header className="nav">
        <a className="brand" href="#top">
          {profile?.avatar ? <img src={profile.avatar} alt="" width="34" height="34" /> : <span className="pearl" aria-hidden="true" />}
          <span>{name}</span>
        </a>
        <nav className="nav-actions" aria-label="Principal">
          <button type="button" className="pill" onClick={toggle} aria-label={t.langLabel}>{lang === 'es' ? 'EN' : 'ES'}</button>
          <a className="pill pill-solid" href={githubUrl} target="_blank" rel="noreferrer">{t.github}</a>
        </nav>
      </header>
      <main id="contenido">
        <span id="top" />
        <Hero t={t} githubUrl={githubUrl} />
        <Projects repos={repos} pinned={pinned} t={t} lang={lang} />
      </main>
      <footer className="foot"><p>{t.footer}</p></footer>
    </>
  );
}
