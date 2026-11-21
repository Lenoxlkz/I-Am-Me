export type Lang = 'es' | 'en';

const es = {
  skip: 'Saltar al contenido',
  langLabel: 'Cambiar idioma',
  github: 'GitHub',
  tagline1: 'Código bonito.',
  tagline2: 'Intenciones serias.',
  lede: 'Todo lo que he publicado en GitHub, ordenado, vivo y al día.',
  ctaProjects: 'Ver proyectos',
  ctaGithub: 'Mi GitHub',
  projectsTitle: 'Proyectos públicos',
  summary: 'Proyectos: {n}. Lenguajes: {l}. Se actualiza solo cada día.',
  search: 'Buscar por nombre, tema o descripción',
  filterLang: 'Filtrar por lenguaje',
  all: 'Todos',
  sortBy: 'Ordenar',
  sortRecent: 'Recientes',
  sortStars: 'Más estrellas',
  results: 'Resultados: {n}',
  stars: 'estrellas',
  forks: 'forks',
  updated: 'Actualizado {when}',
  code: 'Ver código',
  demo: 'Demo en vivo',
  noDesc: 'Sin descripción, pero con carácter.',
  emptyTitle: 'Nada coincide con eso',
  emptyHint: 'Prueba otra palabra o quita los filtros.',
  clear: 'Limpiar filtros',
  noRepos: 'Todavía no hay proyectos públicos',
  noReposHint: 'Esta página se reconstruye sola cada día. Vuelve pronto.',
  footer: 'Hecho a mano y publicado con GitHub Pages.',
};

export type Dict = Record<keyof typeof es, string>;

const en: Dict = {
  skip: 'Skip to content',
  langLabel: 'Change language',
  github: 'GitHub',
  tagline1: 'Pretty code.',
  tagline2: 'Serious intentions.',
  lede: 'Everything I have published on GitHub, organised, alive and up to date.',
  ctaProjects: 'See projects',
  ctaGithub: 'My GitHub',
  projectsTitle: 'Public projects',
  summary: 'Projects: {n}. Languages: {l}. Refreshes itself daily.',
  search: 'Search by name, topic or description',
  filterLang: 'Filter by language',
  all: 'All',
  sortBy: 'Sort',
  sortRecent: 'Recent',
  sortStars: 'Most starred',
  results: 'Results: {n}',
  stars: 'stars',
  forks: 'forks',
  updated: 'Updated {when}',
  code: 'View code',
  demo: 'Live demo',
  noDesc: 'No description, but plenty of character.',
  emptyTitle: 'Nothing matches that',
  emptyHint: 'Try another word or clear the filters.',
  clear: 'Clear filters',
  noRepos: 'No public projects yet',
  noReposHint: 'This page rebuilds itself every day. Check back soon.',
  footer: 'Handmade and published with GitHub Pages.',
};

export const dict: Record<Lang, Dict> = { es, en };

export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
