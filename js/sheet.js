/* Lectura del catálogo desde Google Sheets (CSV).
   Columnas de la hoja (primera fila = encabezados, el orden no importa):
   SKU | CATEGORIA | NOMBRE | UNIDADES | MILILITROS | PRECIO | ESTILO o dato | DESCRIPCION | IMAGEN 1 | IMAGEN 2 | IMAGEN 3
   Obligatorias: CATEGORIA, NOMBRE y PRECIO. Opcionales extra: PRESENTACION (Lata/Botella),
   INGREDIENTES (separados por |), CUANDO, ORIGEN, ACTIVO (NO oculta el producto). */
import { CATS } from './config.js';
import { P, setProducts } from './products.js';

const LOCAL = P.slice();   // copia de los productos de js/products.js

const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Acepta el enlace normal de la hoja (el de la barra del navegador) o el CSV publicado.
   Con el enlace normal, la hoja debe estar compartida como "Cualquier persona con el enlace: lector". */
export function normalizeSheetUrl(url) {
  url = String(url).trim();
  const m = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!m || /\/d\/e\//.test(url) || /[?&]output=csv/.test(url) || /\/gviz\//.test(url)) return url;
  const gid = (url.match(/[?#&]gid=(\d+)/) || [])[1];
  return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv&headers=1` + (gid ? `&gid=${gid}` : '');
}

export function parseCSV(text) {
  text = String(text).replace(/^﻿/, '');
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(f); f = ''; rows.push(row); row = [];
    } else f += ch;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

/* Enlaces de Google Drive -> enlace directo de imagen (el archivo debe estar compartido "cualquiera con el enlace") */
function photoUrl(u) {
  u = u.trim();
  if (/drive\.google\.com/.test(u)) {
    const m = u.match(/\/file\/d\/([^/?#]+)/) || u.match(/[?&]id=([^&#]+)/);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  }
  return u;
}

function inkFor(hex) {
  const m = String(hex).replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return '#F7FBFC';
  let h = m[1]; if (h.length === 3) h = h.split('').map(x => x + x).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? '#0B2545' : '#F7FBFC';
}

const FIELD_CYCLE = ['aqua', 'teal', 'navy', 'tang'];
const HEX = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i;

export function csvToProducts(text) {
  if (/^\s*</.test(text)) throw new Error('La hoja no está publicada como CSV (llegó una página web).');
  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error('La hoja está vacía.');
  const head = rows[0].map(norm);
  // busca una columna por nombre exacto o que empiece con él (ej. "estilo" encuentra "ESTILO o dato")
  const find = (...names) => { for (const n of names) { const i = head.findIndex(h => h === n || h.startsWith(n + '_')); if (i >= 0) return i; } return -1; };
  const C = {
    sku: find('sku', 'id', 'codigo'), cat: find('categoria', 'tipo'), nombre: find('nombre', 'producto'),
    unidades: find('unidades', 'piezas'), ml: find('mililitros', 'ml'), precio: find('precio'),
    estilo: find('estilo', 'dato'), desc: find('descripcion'), pres: find('presentacion', 'envase'),
    ing: find('ingredientes'), cuando: find('cuando'), origen: find('origen'), short: find('nombre_corto'),
    color: find('color'), ctext: find('color_texto'), activo: find('activo')
  };
  const imgCols = head.map((h, i) => /^(imagen|foto|fotos)(_?\d+)?$/.test(h) ? i : -1).filter(i => i >= 0);
  const falta = [['categoria', C.cat], ['nombre', C.nombre], ['precio', C.precio]].filter(x => x[1] < 0).map(x => x[0].toUpperCase());
  if (falta.length) throw new Error('Faltan columnas en la primera fila de la hoja: ' + falta.join(', ') + '.');
  const cell = (r, i) => i < 0 ? '' : String(r[i] == null ? '' : r[i]).trim();

  const used = new Set(), list = [], order = [];
  rows.slice(1).forEach(r => {
    if (['no', 'n', '0', 'false', 'x'].includes(norm(cell(r, C.activo)))) return;
    const nombre = cell(r, C.nombre), tipoRaw = cell(r, C.cat);
    const price = parseFloat(cell(r, C.precio).replace(/[^0-9.]/g, ''));
    if (!nombre || !tipoRaw || !isFinite(price)) return;

    const slug = norm(tipoRaw);
    let cat = CATS.find(c => c.id === slug || norm(c.t) === slug);
    if (!cat) { cat = { id: slug, t: esc(tipoRaw), f: 'aqua', d: '' }; CATS.push(cat); }
    if (!order.includes(cat.id)) order.push(cat.id);

    let id = norm(cell(r, C.sku)) || norm(nombre), base = id, k = 2;
    while (used.has(id)) id = base + '-' + (k++);
    used.add(id);

    const color = HEX.test(cell(r, C.color)) ? '#' + cell(r, C.color).replace('#', '') : '#13A6B5';
    const ctext = HEX.test(cell(r, C.ctext)) ? '#' + cell(r, C.ctext).replace('#', '') : inkFor(color);
    const pres = norm(cell(r, C.pres));
    const units = parseInt(cell(r, C.unidades), 10), ml = parseInt(cell(r, C.ml).replace(/[^0-9]/g, ''), 10);
    list.push({
      id, cat: cat.id, n: esc(nombre), short: esc(cell(r, C.short) || nombre),
      fmt: pres === 'botella' ? 'Botella' : pres === 'lata' ? 'Lata' : '',
      shape: pres === 'botella' ? 'Botella' : 'Lata',
      units: units > 0 ? units : 1, ml: ml > 0 ? ml : 355,
      style: esc(cell(r, C.estilo)),
      c: color, ci: ctext, price,
      origin: esc(cell(r, C.origen)), desc: esc(cell(r, C.desc)),
      ing: cell(r, C.ing).split(/[|;,\n]+/).map(x => x.trim()).filter(Boolean).map(esc),
      when: esc(cell(r, C.cuando)),
      imgs: imgCols.flatMap(i => cell(r, i).split(/[|\n]+/)).map(x => x.trim()).filter(Boolean).map(photoUrl).map(esc)
    });
  });
  if (!list.length) throw new Error('No hay productos válidos en la hoja (revisa CATEGORIA, NOMBRE y PRECIO).');

  // secciones en el orden de la hoja, con colores alternados para que nunca se junten dos iguales
  const rest = CATS.filter(c => !order.includes(c.id));
  const sorted = order.map(id => CATS.find(c => c.id === id)).concat(rest);
  CATS.length = 0; CATS.push(...sorted);
  order.forEach((id, i) => { CATS.find(c => c.id === id).f = FIELD_CYCLE[i % 4]; });
  return list;
}

export function applyCSV(text) { setProducts(csvToProducts(text)); }
export function restoreLocal() { setProducts(LOCAL); }
