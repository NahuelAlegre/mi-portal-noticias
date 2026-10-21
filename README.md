# Mi resumen del día

Un sitio estático y personal para leer las noticias esenciales del día, agrupadas por tema (Argentina, Mundo, Inteligencia Artificial). Sin frameworks ni paso de build: HTML, CSS y JavaScript plano.

![Vista de escritorio](docs/preview.png)

## Estructura

```
index.html     Estructura de la página
styles.css     Estilos (incluye modo oscuro automático)
app.js         Genera el contenido a partir de los datos
noticias.js    Los datos: las noticias del día
docs/          Capturas de pantalla para este README
```

## Cómo actualizar las noticias

Editá `noticias.js`:

```js
window.NOTICIAS = {
  "fecha": "2026-10-20",       // AAAA-MM-DD
  "ejemplo": false,             // true muestra el aviso "Datos de ejemplo"
  "temas": [
    { "nombre": "Argentina",
      "noticias": [
        { "titulo": "...", "resumen": "1-2 oraciones.", "fuente": "Nombre del medio", "url": "https://..." }
      ] }
  ]
};
```

Podés agregar o quitar temas; el menú y los contadores se generan solos. Se usa un archivo `.js` (no `.json`) para que `index.html` funcione también abierto directamente desde el disco.

## Ver en local

Abrí `index.html` en el navegador, o levantá un servidor:

```
python3 -m http.server 8000
```

y entrá a http://localhost:8000

## Publicar en Vercel

1. Subí este repositorio a GitHub.
2. En Vercel: **Add New → Project** e importá el repo.
3. Framework Preset: **Other**. Build Command: vacío. Output Directory: vacío (raíz del repo).
4. **Deploy**. Cada `git push` a `main` vuelve a publicar el sitio.
