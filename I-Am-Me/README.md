# I-Am-Me

Portafolio de mis proyectos públicos de GitHub. Next.js + React, exportado estático y publicado con GitHub Pages. Se reconstruye cada día.

## Publicar
1. Sube este contenido a la rama `main` de `I-Am-Me`.
2. En GitHub: Settings, Pages, Source: **GitHub Actions**.
3. Cada push y cada día a las 09:17 UTC corre `.github/workflows/deploy.yml`.

Queda en `https://<usuario>.github.io/I-Am-Me/`.

## Personalizar
Todo en `site.config.ts`: usuario, repos excluidos, forks, repos fijados.
Textos en `lib/i18n.ts`. Colores y tipografía en `app/globals.css`.

## Local
```bash
npm install
npm run dev     # http://localhost:3000
npm test
npm run build   # genera ./out
```
Más sobre pruebas en `TEST_PLAN.md`.
