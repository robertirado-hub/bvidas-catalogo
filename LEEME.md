# bvidas - catálogo

Sitio estático (HTML + CSS + JavaScript, sin instalar nada). Ábrelo desde un servidor
(los módulos de JS no cargan con doble clic al archivo).

## Carpetas
- `index.html`             estructura de la página
- `css/styles.css`         colores y tipografía (paleta "Mar y cítricos" en `:root`, arriba del archivo)
- `js/config.js`           TU WHATSAPP, piezas para envío gratis y los tipos de bebida
- `js/products.js`         productos de respaldo (se usan si no conectas Google Sheets)
- `js/sheet.js`            lee el catálogo desde Google Sheets
- `plantilla-productos.csv` plantilla para importar a Google Sheets
- `js/packs.js`            dibujo de envases de ejemplo y armado de las fotos por producto
- `js/cart.js`             pedido, totales y mensaje de WhatsApp
- `js/app.js`              pinta el catálogo, la ventana de producto y los movimientos
- `images/products/<id>/`  una carpeta por producto para sus fotos

## Lo primero que debes cambiar
1. `js/config.js` -> `WA_NUM` con tu número de WhatsApp Business (lada, sin +). Ej: "5215512345678".
2. `js/products.js` -> reemplaza los productos de ejemplo por los reales (nombre, precio, ingredientes).
3. Fotos: copia los archivos a `images/products/<id>/` y escribe sus nombres en `imgs`:
   `imgs: ["1.jpg", "2.jpg", "3.jpg"]`. Sin fotos se dibujan vistas de ejemplo.
   El panel "Qué tomas" siempre aparece como última imagen.

## Agregar un producto
Copia un bloque de `js/products.js`, cambia `id` (único, sin espacios) y `cat` (un id de `config.js`),
y crea la carpeta `images/products/<id>/`. Aparece solo en su sección.

## Agregar un tipo de bebida
En `js/config.js` agrega una línea a `CATS` con `id`, `t` (nombre), `f` (color: tang, aqua, teal o navy) y `d` (descripción).
Evita dos tipos seguidos con el mismo color.

## Conectar Google Sheets (nombre, precio, fotos, etc.)
Tu hoja de Google ES el catálogo: cambias un precio o una foto en la hoja y el sitio lo toma al cargar.
1. En Google Sheets: Archivo > Importar > Subir > `plantilla-productos.csv` > "Reemplazar hoja de cálculo".
2. Comparte la hoja: botón Compartir > "Cualquier persona con el enlace" > Lector. Copia el enlace de la barra del navegador.
   (Alternativa: Archivo > Compartir > Publicar en la web > CSV, que tarda unos 5 minutos en reflejar cambios.)
3. Pega el enlace en `js/config.js`, en `SHEET_CSV_URL`, o pruébalo con el botón "Sincronizar catálogo" del pie de la página.

Columnas (primera fila): `id, tipo, nombre, precio, presentacion, descripcion, ingredientes, cuando, origen, fotos, nombre_corto, color, color_texto, activo`
- Obligatorias: `tipo`, `nombre`, `precio`.
- `presentacion`: Lata o Botella. `ingredientes` y `fotos` van separados por `|`.
- `fotos`: enlaces https (o nombres de archivo en `images/products/<id>/`). Los enlaces de Google Drive funcionan si el archivo está compartido como "cualquier persona con el enlace".
- `activo`: escribe NO para ocultar un producto sin borrarlo.
- Un `tipo` nuevo crea su sección solo.
- Los cambios en la hoja tardan unos minutos en publicarse. Si la hoja falla, el sitio muestra la última copia guardada o `js/products.js`.
- Cualquiera con el enlace puede ver la hoja publicada. No pongas costos ni datos privados en esa pestaña.
