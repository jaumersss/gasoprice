# GasoPrice · Gasolina Barata

Comparador de precios de carburantes en España con datos oficiales del Ministerio. Incluye búsqueda por municipio, filtros por combustible, favoritos y calculadora de repostaje.

Web: https://gasolinabarata.me/

## Desarrollo local

Requiere Node.js 18 o posterior.

```sh
node server.js
```

Abre http://localhost:4173. El servidor local sirve la web y redirige las peticiones `/api/` al servicio oficial de carburantes.

## Estructura

- `index.html`, `styles.css`, `app.js`: interfaz web.
- `src/index.js`: Worker de Cloudflare para la API y las redirecciones.
- `wrangler.toml`: configuración del Worker y los archivos estáticos.
- `sw.js`, `manifest.webmanifest`, `icons/`: soporte PWA.
- `assets/`: recursos gráficos.

Los archivos locales de Netlify, Cloudflare y las variables de entorno se excluyen de Git.
