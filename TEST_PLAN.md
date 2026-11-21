# Plan de pruebas

Sitio estático (Next.js export) con datos de la API de GitHub al momento del build. El riesgo real está en tres sitios: la transformación de datos, los filtros/orden de la UI y que el build no se rompa cuando GitHub falla.

## Pirámide

| Capa | Qué cubre | Herramienta | Meta |
|---|---|---|---|
| Unitarias | `lib/repos.ts`, `lib/i18n.ts`: normalizar, excluir privados/forks/archivados/propio repo, buscar, ordenar, fijados, tonos, fechas | Vitest | 95% líneas, 90% ramas |
| Componentes | `Projects` (filtro, búsqueda, orden, vacíos, demo opcional, aria-live) y `Site` (idioma, persistencia, sin perfil, lente decorativo) | Vitest + Testing Library | 90% líneas |
| Integración de build | `getPortfolioData` con GitHub caído (403/500/red): devuelve vacío y el build termina | Vitest con `fetch` simulado | casos de fallo cubiertos |
| E2E humo | Página exportada en `out/`: carga, hay tarjetas, filtro de lenguaje, cambio ES/EN, enlaces externos con `rel="noreferrer"` | Playwright contra `npx serve out` | 5 flujos, 3 viewports |
| Accesibilidad | Contraste, foco visible, teclado, `prefers-reduced-motion` | axe-core en Playwright + revisión manual | 0 violaciones serias |
| Visual | Hero con lente y bento en 390, 820 y 1440 px | Capturas Playwright | revisión en cada cambio de CSS |

## Qué no se prueba
Getters triviales, el código de Next/React y la fuente de Google Fonts.

## Casos clave (ya escritos en `*.test.ts(x)`)
- Excluye `I-Am-Me`, forks, archivados y privados; lista vacía no rompe.
- Búsqueda insensible a mayúsculas en nombre, descripción, tema y lenguaje; combina con filtro de lenguaje.
- Orden por recientes y por estrellas con desempate; fijados siempre primero; no muta el arreglo.
- Estado vacío con botón para limpiar; sin repos no hay barra de filtros.
- Demo solo si hay `homepage`; fecha inválida no rompe; tono estable por lenguaje.
- Cambio de idioma persiste y actualiza `<html lang>`.

## Huecos por cerrar
1. Prueba de `getPortfolioData` con `fetch` simulado (hoy solo está cubierto por diseño: `try/catch` devuelve vacío).
2. E2E y axe con Playwright (no incluidos para no sumar dependencias pesadas).
3. Verificar a mano en un iPhone real: `backdrop-filter` del lente y la barra flotante.

## Riesgos conocidos
- Si la API de GitHub falla durante el build, la página sale con el mensaje de vacío. El cron diario la repara solo.
- El límite de la API sin token es 60 peticiones/hora; en Actions se usa `GITHUB_TOKEN`.

## Cómo correr
```bash
npm test                  # una vez
npm run test:watch        # mientras desarrollas
npx vitest run --coverage # requiere @vitest/coverage-v8
```
