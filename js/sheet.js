/* Lectura del catálogo desde Google Sheets (CSV publicado).
   Columnas de la hoja (primera fila = encabezados, en cualquier orden):
   id, tipo, nombre, precio, presentacion, descripcion, ingredientes, cuando, origen,
   fotos, nombre_corto, color, color_texto, activo
   Obligatorias: tipo, nombre, precio. El resto es opcional.
   ingredientes y fotos van separados por | (barra vertical).
   activo = NO oculta el producto sin borrarlo. */
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

export function csvToProducts(text) {
  if (/^\s*</.test(text)) throw new Error('La hoja no está publicada como CSV (llegó una página web).');
  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error('La hoja está vacía.');
  const head = rows[0].map(norm);
  const col = n => head.indexOf(n);
  const get = (r, n) => { const i = col(n); return i < 0 ? '' : String(r[i] == null ? '' : r[i]).trim(); };
  ['tipo', 'nombre', 'precio'].forEach(n => { if (col(n) < 0) throw new Error('Falta la columna "' + n + '".'); });

  const used = new Set(), list = [];
  rows.slice(1).forEach(r => {
    if (['no', 'n', '0', 'false', 'x'].includes(norm(get(r, 'activo')))) return;
    const nombre = get(r, 'nombre'), tipoRaw = get(r, 'tipo');
    const price = parseFloat(get(r, 'precio').replace(/[^0-9.]/g, ''));
    if (!nombre || !tipoRaw || !isFinite(price)) return;

    const slug = norm(tipoRaw);
    let cat = CATS.find(c => c.id === slug || norm(c.t) === slug);
    if (!cat) { // tipo nuevo: se crea solo
      cat = { id: slug, t: esc(tipoRaw), f: FIELD_CYCLE[CATS.length % 4], d: '' };
      CATS.push(cat);
    }
    let id = norm(get(r, 'id')) || norm(nombre), base = id, k = 2;
    while (used.has(id)) id = base + '-' + (k++);
    used.add(id);

    const color = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(get(r, 'color')) ? '#' + get(r, 'color').replace('#', '') : '#13A6B5';
    const ctext = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(get(r, 'color_texto')) ? '#' + get(r, 'color_texto').replace('#', '') : inkFor(color);
    list.push({
      id, cat: cat.id, n: esc(nombre), short: esc(get(r, 'nombre_corto') || nombre),
      fmt: norm(get(r, 'presentacion')) === 'botella' ? 'Botella' : 'Lata',
      c: color, ci: ctext, price,
      origin: esc(get(r, 'origen')), desc: esc(get(r, 'descripcion')),
      ing: get(r, 'ingredientes').split(/[|;,\n]+/).map(s => s.trim()).filter(Boolean).map(esc),
      when: esc(get(r, 'cuando')),
      imgs: get(r, 'fotos').split(/[|\n]+/).map(s => s.trim()).filter(Boolean).map(photoUrl).map(esc)
    });
  });
  if (!list.length) throw new Error('No hay productos válidos en la hoja.');
  return list;
}

export function applyCSV(text) { setProducts(csvToProducts(text)); }
export function restoreLocal() { setProducts(LOCAL); }
