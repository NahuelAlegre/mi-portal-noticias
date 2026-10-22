# Mi resumen del día

Un sitio estático y personal para leer las noticias esenciales del día, agrupadas por tema (Argentina, Mundo, Inteligencia Artificial). Sin frameworks ni paso de build: HTML, CSS y JavaScript plano.

![Vista de escritorio](docs/preview.png)

## Estructura

```
index.html     Estructura de la página
styles.css     Estilos (incluye modo oscuro automático)
app.js         Genera el contenido a partir de los datos
noticias.js    Los datos: las noticias del día
hilos.js       Historial persistente de hilos (historias en el tiempo)
glosario.js    Glosario persistente (fichas emergentes de personas, leyes, siglas…)
docs/          Capturas de pantalla para este README
```

## Cómo actualizar las noticias

Editá `noticias.js`:

```js
window.NOTICIAS = {
  "fecha": "2026-10-20",       // AAAA-MM-DD
  "actualizado": "2026-10-22T07:00:00-03:00", // opcional: hora REAL de generación (ISO con zona)
  "ejemplo": false,             // true muestra el aviso "Datos de ejemplo"

  // Opcional: hasta 3 noticias de `temas` (misma url), arriba de todo ("Lo esencial"). Puede ser []
  "esencial": [
    { "titulo": "...", "resumen": "...", "tema": "Mundo", "fuente": "BBC", "url": "https://..." }
  ],

  "temas": [
    { "nombre": "Argentina",
      "noticias": [
        { "titulo": "...", "resumen": "1-2 oraciones.",
          "porQueImporta": "Opcional: una oración sobre por qué importa o qué sigue.",
          "fuente": "Nombre del medio", "url": "https://...",
          "hilo": "guerra-ucrania",    // opcional: id del hilo al que pertenece
          "glosario": ["witkoff"] }    // opcional: hasta 4 ids de glosario.js
      ] }
  ],

  // Opcional: hilos que tuvieron novedades hoy y que ya existían antes
  "seguimiento": [
    { "hilo": "guerra-ucrania", "novedad": "Qué cambió desde la última entrada.", "fuente": "BBC", "url": "https://..." }
  ]
};
```

`actualizado` se muestra en la barra como `act. HH:MM` (hora de Argentina); si falta, se omite. Cada ítem de `esencial` debe usar **la misma `url`** que su nota en `temas`: la página la busca primero por `url` y, si no la encuentra, por `titulo`.

Todos los campos nuevos son opcionales: si faltan, esa parte simplemente no se muestra. El campo `tema` de `esencial` y `seguimiento` debe coincidir con el `nombre` de un tema para tomar su color.

Podés agregar o quitar temas; el menú y los contadores se generan solos. Se usa un archivo `.js` (no `.json`) para que `index.html` funcione también abierto directamente desde el disco.

## Hilos (historias que se siguen en el tiempo)

`hilos.js` guarda el historial completo de cada historia en curso. **Crece cada día y nunca se reinicia.**

```js
window.HILOS = {
  "guerra-ucrania": {
    "nombre": "Guerra en Ucrania y negociaciones de paz",
    "tema": "Mundo",                 // debe coincidir con un tema para tomar su color
    "creado": "2026-10-20",
    "actualizado": "2026-10-20",     // fecha de la entrada más reciente
    "entradas": [                    // la más nueva primero
      { "fecha": "2026-10-20", "titulo": "...", "resumen": "...", "fuente": "BBC", "url": "https://..." }
    ]
  }
};
```

En la página, cada noticia con `hilo` muestra en su línea de metadatos el ícono de historial con la cantidad de entradas (el nombre del hilo aparece al pasar el mouse); al tocarlo (o "Ampliar") la nota se despliega y muestra "Antes en este hilo". Al final, **Hilos abiertos** lista cada hilo en una fila con su estado: "hoy ↑" (hay nota hoy, enlace a la nota), "novedad hoy" (está en `seguimiento` sin nota) o "ayer"/"hace N días"; al abrir la fila se ve la línea de tiempo completa.

**Archivo automático:** un hilo cuyo `actualizado` tiene más de 30 días respecto de `fecha` (en `noticias.js`) pasa solo al bloque plegado "Archivo · N hilos sin novedades hace más de 30 días" al final de Hilos abiertos. Se calcula con las fechas; no hay que tocar los datos. Si un hilo archivado recibe una entrada nueva, vuelve a estar activo. El contador del menú cuenta solo los hilos activos.

### Procedimiento diario (actualización de las 7:00)

1. Para cada noticia nueva, revisá **todos** los hilos de `hilos.js`, incluidos los viejos, inactivos y **archivados** (más de 30 días sin novedades), comparando id, `nombre` y contenido de las entradas.
2. Si la noticia continúa una historia existente, **reutilizá ese id** en `hilo` (aunque no haya tenido novedades en días o semanas).
3. Si no existe y la historia probablemente siga en los próximos días, creá un hilo nuevo con un id estable en kebab-case (ej. `ley-malvinas`), `creado` = hoy. Las noticias puntuales no llevan `hilo`.
4. Agregá la entrada del día **al principio** de `entradas` y actualizá `actualizado`.
5. En `noticias.js`, `seguimiento` lista solo los hilos que tuvieron novedad hoy **y** ya existían antes de hoy, con `novedad` = qué cambió desde la entrada anterior.
6. Nunca borres entradas ni hilos.
7. Glosario: revisá cada noticia con la regla editorial del glosario (abajo); reutilizá o creá entradas en `glosario.js` y agregá `glosario` a la noticia.

### Reglas editoriales

- **Sin cupos mínimos: vacío antes que relleno.** Entre 0 y 6 noticias por tema, máximo 14 en total. Un tema sin nada relevante va con `"noticias": []`.
- `resumen`: 1–2 oraciones (~250 caracteres) con datos concretos (cifras, nombres, fechas).
- `porQueImporta`: solo si agrega algo que el resumen no dice; hechos, no opiniones.
- **Argentina:** cuando la cobertura difiere, contrastar al menos dos líneas editoriales.
- `esencial`: hasta 3 noticias tomadas de `temas`, con la misma `url`. Puede ser `[]`.
- `actualizado`: siempre la hora real de generación, en ISO con zona (`2026-10-22T07:04:00-03:00`).
- Un hilo no recibe una entrada nueva si no hay un hecho nuevo.

## Diseño

Página de diario, minimalista y densa: en escritorio el día entero entra en 1–2 pantallas y ninguna noticia se repite.

- **Barra fija** de una línea: marca, fecha y `act. HH:MM`; a la derecha los filtros `Todo · Argentina · Mundo · IA · Hilos` (los nombres de tema de más de 14 caracteres y varias palabras se abrevian con iniciales). El filtro elegido se guarda en `localStorage`.
- **Lo esencial:** franja de 3 columnas con número, tema y título; cada ítem lleva a su nota (scroll y resaltado). Si `esencial` es `[]`, no aparece.
- **Columnas por tema** (hasta 3), sin cajas: líneas finas y espacio. La bajada se recorta a 3 líneas; "Ampliar" despliega en el lugar la bajada completa, "Por qué importa" y "Antes en este hilo". Tema vacío: "Hoy, nada relevante." Si todos están vacíos: "Hoy no pasó nada que valga la pena contar." y los hilos.
- **Hilos abiertos** al final, en 2 columnas, y el archivo plegado.
- Responsive: ≤1100 px barra en dos renglones; ≤980 px una columna de 680 px; ≤600 px márgenes de 16 px y filtros con scroll horizontal. Modo oscuro automático.

## Glosario (fichas emergentes)

`glosario.js` se carga después de `hilos.js` y antes de `app.js`. Igual que los hilos, **es persistente: crece cada día y nunca se reinicia.**

```js
window.GLOSARIO = {
  "witkoff": {
    "nombre": "Steve Witkoff",      // nombre completo; es el que se muestra en la ficha
    "tipo": "persona",              // persona | ley | organizacion | lugar | concepto
    "texto": "Empresario inmobiliario y enviado especial de Donald Trump. Negocia en su nombre con Rusia y en Medio Oriente.",
    "alias": ["Witkoff"],           // forma exacta en que aparece en la noticia
    "actualizado": "2026-10-22"
  }
};
```

Cada noticia puede llevar `"glosario": ["witkoff", "ley-malvinas"]` (máx. 4). La página marca con subrayado punteado la primera aparición de cada término (busca el nombre y los alias, del más largo al más corto, sin distinguir mayúsculas, en título → resumen → porQueImporta). Al pasar el mouse o enfocar el término aparece una ficha con ícono del tipo, nombre, tipo y texto. Si el término no aparece en el texto, se lista al final de la parte ampliada.

**Regla editorial del glosario** (en el procedimiento diario): ¿un lector argentino informado, pero que no sigue este tema, entendería todos los nombres y siglas? Lo que no entendería va al glosario.
- **Sí van:** funcionarios, enviados, jueces y empresarios que no son figuras mundiales; proyectos de ley y leyes por su nombre coloquial; siglas y organismos (AmCham, CCL, C-24, SEC, S-1); grupos armados; lugares no obvios (Matignon, Ormuz); jerga financiera o técnica.
- **No van:** figuras que conoce cualquiera (Milei, Trump, Putin, Lula, Zelensky, el papa, FMI, ONU, OTAN) ni cosas que la noticia ya explica.
- `texto`: máx. 2 oraciones (~200 caracteres): quién/qué es y por qué aparece; solo hechos verificables, sin adjetivos ni valoraciones.
- Reutilizá ids existentes (buscá por `nombre` y `alias`). Actualizá `texto` y `actualizado` cuando cambie lo esencial. Nunca borres entradas.
- `alias` = forma exacta en que aparece en la noticia. Máx. 4 términos por noticia; si no hace falta, no agregues el campo.

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
