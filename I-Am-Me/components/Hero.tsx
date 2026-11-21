'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/i18n';

type Props = { t: Dict; githubUrl: string };

/** El lente invierte los colores de lo que tiene debajo. Sigue al cursor; sin cursor, deriva solo. */
export default function Hero({ t, githubUrl }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const lens = lensRef.current;
    if (!hero || !lens) return;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const box = hero.getBoundingClientRect();
      const half = lens.offsetWidth / 2;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.style.setProperty('--x', `${e.clientX - box.left - half}px`);
        hero.style.setProperty('--y', `${e.clientY - box.top - half}px`);
      });
      setFollowing(true);
    };
    const onLeave = () => setFollowing(false);

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-body">
        <h1 className="title">
          <span>{t.tagline1}</span> <span>{t.tagline2}</span>
        </h1>
        <p className="lede">{t.lede}</p>
        <div className="cta">
          <a className="btn btn-solid" href="#proyectos">{t.ctaProjects}</a>
          <a className="btn btn-glass" href={githubUrl} target="_blank" rel="noreferrer">{t.ctaGithub}</a>
        </div>
      </div>
      <div ref={lensRef} className={following ? 'lens' : 'lens drift'} aria-hidden="true" />
    </section>
  );
}
