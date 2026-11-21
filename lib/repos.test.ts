import { describe, expect, it } from 'vitest';
import {
  filterRepos, formatDate, languageHue, languagesOf, normalizeHomepage, normalizeRepo, selectPublic, sortRepos,
  type RawRepo, type Repo,
} from './repos';
import { fmt } from './i18n';

const repo = (o: Partial<Repo>): Repo => ({
  id: 1, name: 'a', description: null, url: 'https://github.com/u/a', homepage: null,
  language: null, stars: 0, forks: 0, updatedAt: '2026-01-01T00:00:00Z', topics: [], ...o,
});

describe('normalizeHomepage', () => {
  it('devuelve null para vacío o espacios', () => {
    expect(normalizeHomepage('')).toBeNull();
    expect(normalizeHomepage('   ')).toBeNull();
    expect(normalizeHomepage(null)).toBeNull();
  });
  it('agrega https si falta', () => {
    expect(normalizeHomepage('example.com')).toBe('https://example.com/');
  });
  it('respeta http/https existentes', () => {
    expect(normalizeHomepage('http://example.com/x')).toBe('http://example.com/x');
  });
  it('descarta valores que no son URL', () => {
    expect(normalizeHomepage('no es url')).toBeNull();
  });
});

describe('normalizeRepo', () => {
  it('rellena valores por defecto', () => {
    const r = normalizeRepo({ name: 'x', html_url: 'https://github.com/u/x' });
    expect(r).toMatchObject({ name: 'x', stars: 0, forks: 0, topics: [], language: null, description: null });
  });
  it('prefiere pushed_at sobre updated_at', () => {
    const r = normalizeRepo({ name: 'x', pushed_at: '2026-05-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' });
    expect(r.updatedAt).toBe('2026-05-01T00:00:00Z');
  });
  it('trata descripción en blanco como ausente', () => {
    expect(normalizeRepo({ name: 'x', description: '   ' }).description).toBeNull();
  });
});

describe('selectPublic', () => {
  const raws: RawRepo[] = [
    { name: 'ok' },
    { name: 'priv', private: true },
    { name: 'priv2', visibility: 'private' },
    { name: 'forked', fork: true },
    { name: 'old', archived: true },
    { name: 'I-Am-Me' },
    { name: '' },
  ];
  it('excluye privados, forks, archivados, excluidos y sin nombre', () => {
    expect(selectPublic(raws, { exclude: ['i-am-me'] }).map((r) => r.name)).toEqual(['ok']);
  });
  it('puede incluir forks', () => {
    expect(selectPublic(raws, { exclude: ['I-Am-Me'], includeForks: true }).map((r) => r.name)).toEqual(['ok', 'forked']);
  });
  it('lista vacía no rompe', () => {
    expect(selectPublic([])).toEqual([]);
  });
});

describe('languagesOf', () => {
  it('cuenta, ordena por frecuencia y luego alfabético, ignora null', () => {
    const list = [
      repo({ language: 'Python' }), repo({ language: 'Go' }), repo({ language: 'Go' }),
      repo({ language: 'CSS' }), repo({ language: null }),
    ];
    expect(languagesOf(list)).toEqual([
      { name: 'Go', count: 2 }, { name: 'CSS', count: 1 }, { name: 'Python', count: 1 },
    ]);
  });
});

describe('filterRepos', () => {
  const list = [
    repo({ id: 1, name: 'Mortal-Reader', description: 'Lector de manga', language: 'Kotlin', topics: ['manga'] }),
    repo({ id: 2, name: 'Glass-Nav', description: 'Navbar translúcida', language: 'TypeScript', topics: ['ui'] }),
  ];
  it('sin filtros devuelve todo', () => {
    expect(filterRepos(list, {})).toHaveLength(2);
  });
  it('busca en nombre, descripción, tema y lenguaje sin importar mayúsculas', () => {
    expect(filterRepos(list, { query: 'READER' })).toHaveLength(1);
    expect(filterRepos(list, { query: 'translúcida' })).toHaveLength(1);
    expect(filterRepos(list, { query: 'manga' })).toHaveLength(1);
    expect(filterRepos(list, { query: 'typescript' })).toHaveLength(1);
  });
  it('filtra por lenguaje exacto y combina con la búsqueda', () => {
    expect(filterRepos(list, { language: 'Kotlin' })).toHaveLength(1);
    expect(filterRepos(list, { language: 'Kotlin', query: 'glass' })).toHaveLength(0);
  });
  it('ignora espacios alrededor de la búsqueda', () => {
    expect(filterRepos(list, { query: '  glass  ' })).toHaveLength(1);
  });
});

describe('sortRepos', () => {
  const list = [
    repo({ id: 1, name: 'b', stars: 1, updatedAt: '2026-03-01T00:00:00Z' }),
    repo({ id: 2, name: 'a', stars: 9, updatedAt: '2026-01-01T00:00:00Z' }),
    repo({ id: 3, name: 'c', stars: 9, updatedAt: '2026-02-01T00:00:00Z' }),
  ];
  it('recientes primero', () => {
    expect(sortRepos(list, 'recent').map((r) => r.name)).toEqual(['b', 'c', 'a']);
  });
  it('estrellas, desempata por fecha', () => {
    expect(sortRepos(list, 'stars').map((r) => r.name)).toEqual(['c', 'a', 'b']);
  });
  it('los fijados van primero, en su orden, sin importar el criterio', () => {
    expect(sortRepos(list, 'stars', ['A', 'b']).map((r) => r.name)).toEqual(['a', 'b', 'c']);
  });
  it('no muta el arreglo original', () => {
    const copy = [...list];
    sortRepos(list, 'stars');
    expect(list).toEqual(copy);
  });
});

describe('languageHue', () => {
  it('usa el tono conocido', () => {
    expect(languageHue('TypeScript', 'x')).toBe(212);
  });
  it('es determinista y está en 0-359 para lenguajes desconocidos o nulos', () => {
    const h = languageHue(null, 'mi-repo');
    expect(h).toBe(languageHue(null, 'mi-repo'));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
  });
  it('no confunde propiedades heredadas con lenguajes', () => {
    expect(languageHue('constructor', 'x')).toBeLessThan(360);
  });
});

describe('formatDate', () => {
  it('formatea en UTC y es estable', () => {
    expect(formatDate('2026-11-20T23:59:00Z', 'en')).toContain('2026');
    expect(formatDate('2026-11-20T23:59:00Z', 'en')).toContain('20');
  });
  it('fecha inválida devuelve vacío', () => {
    expect(formatDate('nope', 'es')).toBe('');
  });
});

describe('fmt', () => {
  it('reemplaza variables y deja intactas las desconocidas', () => {
    expect(fmt('{n} de {x}', { n: 3 })).toBe('3 de {x}');
  });
});
