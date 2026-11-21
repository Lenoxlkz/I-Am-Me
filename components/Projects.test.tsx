import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from './Projects';
import { dict } from '@/lib/i18n';
import type { Repo } from '@/lib/repos';

afterEach(cleanup);

const t = dict.es;
const mk = (o: Partial<Repo>): Repo => ({
  id: 1, name: 'a', description: 'desc', url: 'https://github.com/u/a', homepage: null,
  language: null, stars: 0, forks: 0, updatedAt: '2026-01-01T00:00:00Z', topics: [], ...o,
});
const repos: Repo[] = [
  mk({ id: 1, name: 'alfa', language: 'TypeScript', stars: 1, updatedAt: '2026-03-01T00:00:00Z', homepage: 'https://alfa.dev/' }),
  mk({ id: 2, name: 'beta', language: 'Kotlin', stars: 9, updatedAt: '2026-02-01T00:00:00Z', description: null }),
  mk({ id: 3, name: 'gamma', language: 'TypeScript', stars: 4, updatedAt: '2026-01-01T00:00:00Z' }),
];
const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const renderIt = (list = repos) => render(<Projects repos={list} t={t} lang="es" />);

describe('Projects', () => {
  it('muestra una tarjeta por repo con enlace al repo y orden reciente', () => {
    renderIt();
    expect(titles()).toEqual(['alfa', 'beta', 'gamma']);
    expect(screen.getByRole('link', { name: 'alfa' }).getAttribute('href')).toBe('https://github.com/u/a');
  });

  it('usa el texto alterno cuando no hay descripción', () => {
    renderIt();
    expect(screen.getByText(t.noDesc)).toBeTruthy();
  });

  it('solo ofrece demo si el repo tiene homepage', () => {
    renderIt();
    expect(screen.getAllByRole('link', { name: t.demo })).toHaveLength(1);
  });

  it('filtra por lenguaje y vuelve a todos al tocar de nuevo', async () => {
    const user = userEvent.setup();
    renderIt();
    const ts = screen.getByRole('button', { name: 'TypeScript' });
    await user.click(ts);
    expect(ts.getAttribute('aria-pressed')).toBe('true');
    expect(titles()).toEqual(['alfa', 'gamma']);
    await user.click(ts);
    expect(titles()).toHaveLength(3);
  });

  it('ordena por estrellas', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.click(screen.getByRole('button', { name: t.sortStars }));
    expect(titles()).toEqual(['beta', 'gamma', 'alfa']);
  });

  it('muestra estado vacío con salida y se recupera al limpiar', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.type(screen.getByRole('searchbox'), 'zzzz');
    expect(screen.getByText(t.emptyTitle)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: t.clear }));
    expect(titles()).toHaveLength(3);
  });

  it('anuncia la cantidad de resultados para lectores de pantalla', async () => {
    const user = userEvent.setup();
    renderIt();
    await user.type(screen.getByRole('searchbox'), 'alfa');
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('Resultados: 1');
  });

  it('sin repos muestra mensaje y no muestra la barra de filtros', () => {
    renderIt([]);
    expect(screen.getByText(t.noRepos)).toBeTruthy();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('cada tarjeta tiene sus metadatos accesibles', () => {
    renderIt([repos[1]]);
    // Texto exacto: "Más estrellas" (botón de orden) no debe contar.
    expect(screen.getByText('estrellas')).toBeTruthy();
    expect(screen.getByText('forks')).toBeTruthy();
  });
});
