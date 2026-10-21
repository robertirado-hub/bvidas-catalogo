/* bvidas - interfaz: pinta el catálogo, la ventana de producto, el pedido y los movimientos. */
import { FREE_FROM, CATS, SHEET_CSV_URL } from './config.js';
import { P, byId, specOf } from './products.js';
import { pack, frames } from './packs.js';
import { cart, money, count, total, waLink, setQty, onChange, pruneCart } from './cart.js';
import { applyCSV, restoreLocal, normalizeSheetUrl } from './sheet.js';

function stepHtml(id){
  const q=cart[id]||0;
  return q? `<span class="step"><button type="button" data-act="dec" data-id="${id}" aria-label="Quitar una">−</button><b>${q}</b><button type="button" data-act="inc" data-id="${id}" aria-label="Agregar una">+</button></span>`
          : `<button class="add" type="button" data-act="inc" data-id="${id}">Agregar</button>`;
}

function sync(){
  document.querySelectorAll('[data-buy]').forEach(el=>{el.innerHTML=`<span class="price">${money(byId[el.dataset.buy].price)}</span>`+stepHtml(el.dataset.buy)});
  const n=count();
  document.getElementById('topCount').textContent='('+n+')';
  const bar=document.getElementById('bar');bar.classList.toggle('on',n>0);
  document.body.style.paddingBottom=n>0?'96px':'0';
  if(n>0){
    document.getElementById('barTitle').textContent=`${n} ${n===1?'pieza':'piezas'} · ${money(total())}`;
    document.getElementById('barFill').style.width=Math.min(100,n/FREE_FROM*100)+'%';
    document.getElementById('barNote').textContent=n>=FREE_FROM?'¡Listo! Tu pedido en CDMX lleva envío gratis.':`Te faltan ${FREE_FROM-n} para envío gratis en CDMX.`;
    document.getElementById('barWa').href=waLink();
  }
  if(document.getElementById('ov').classList.contains('on')&&ovMode==='order')renderOrder();
}

onChange(sync);

/* ===== Render ===== */
const chipsEl=document.getElementById('chips');
const PAGE_SIZE = 4;            // productos por página (2x2 en celular y escritorio)
const pageOf = {};
function cardHtml(p, i, anim){
  const fr = frames(p);
  return `<article class="card"${anim ? ` data-r style="--d:${i*80}ms"` : ''}>
    <button class="frame open" type="button" data-act="open" data-id="${p.id}" aria-label="Ver ${p.n}">
      <span class="f a">${fr[0].h}</span><span class="f b">${fr[1].h}</span>
      <span class="dots" aria-hidden="true">${fr.map(()=>'<i></i>').join('')}</span>
    </button>
    <div class="card-body">
      <button class="name open" type="button" data-act="open" data-id="${p.id}">${p.n}</button>
      <div class="meta">${p.style?p.style+' · ':''}${specOf(p)} · Sin alcohol</div>
      <div class="buy" data-buy="${p.id}"></div>
    </div></article>`;
}
function pagerHtml(c, total, page){
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return '';
  const from = (page-1)*PAGE_SIZE + 1, to = Math.min(total, page*PAGE_SIZE);
  const btn = (n, label, txt, extra) => `<button type="button" class="pg${extra||''}" data-act="page" data-cat="${c.id}" data-p="${n}" aria-label="${label}"${extra===' on'?' aria-current="page"':''}${n<1||n>pages?' disabled':''}>${txt}</button>`;
  let mid = '';
  if (pages <= 5) for (let n=1; n<=pages; n++) mid += btn(n, 'Página '+n, n, n===page?' on':'');
  else mid = `<span class="pg-cur">${page} / ${pages}</span>`;
  return `<nav class="pager" aria-label="Páginas de ${c.t}">
    <div class="pg-row">${btn(page-1,'Página anterior','‹')}${mid}${btn(page+1,'Página siguiente','›')}</div>
    <div class="pg-info">Mostrando ${from}–${to} de ${total}</div></nav>`;
}
function renderCat(c, anim){
  const items = P.filter(p => p.cat === c.id);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(pageOf[c.id] || 1, pages);
  pageOf[c.id] = page;
  const slice = items.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  document.getElementById('list-'+c.id).innerHTML =
    `<div class="cards${anim?'':' swap'}">${slice.map((p,i)=>cardHtml(p,i,anim)).join('')}</div>` + pagerHtml(c, items.length, page);
}
function renderAll(){
  pruneCart();
  const cats = CATS.filter(c => P.some(p => p.cat === c.id));
  chipsEl.innerHTML = cats.map(c => `<a class="chip ${c.f}" href="#${c.id}">${c.t}</a>`).join('');
  const n5 = Math.min(5, P.length);
  document.getElementById('stage').innerHTML = Array.from({length:n5}, (_, i) => pack(P[Math.floor(i * P.length / n5)], 'full', 'c' + (i + 1))).join('');
  document.getElementById('cats').innerHTML = cats.map(c=>{
    const n = P.filter(p=>p.cat===c.id).length;
    return `<section class="cat ${c.f}" id="${c.id}"><div class="wrap">
      <div class="cat-head" data-r><h2>${c.t}</h2>${c.d?`<p>${c.d}</p>`:''}<div class="n">${n} ${n===1?'bebida':'bebidas'}</div></div>
      <div class="list" id="list-${c.id}"></div>
    </div></section>`;
  }).join('');
  cats.forEach(c => renderCat(c, true));
  observeReveals();
  sync();
  updateStatus();
}

/* ===== Catálogo: hoja de Google (con copia guardada) o js/products.js ===== */
const CACHE_KEY = 'bvidas-sheet-csv', URL_KEY = 'bvidas-sheet-url';
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sheetUrl = () => lsGet(URL_KEY) || SHEET_CSV_URL;
const state = { source: 'respaldo', at: null };
function statusText(){
  const src = { hoja: 'hoja de Google', copia: 'copia guardada de la hoja', respaldo: 'productos de respaldo' }[state.source];
  const hora = state.at ? ' · ' + state.at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
  return `${P.length} productos · ${src}${hora}`;
}
function updateStatus(){ const el = document.getElementById('syncMsg'); if (el) el.textContent = statusText(); }

async function fetchSheet(url){
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(normalizeSheetUrl(url), { cache: 'no-store', signal: ctl.signal });
    if (!res.ok) throw new Error('El enlace respondió con error ' + res.status + '. Revisa que la hoja esté compartida como "Cualquier persona con el enlace" o publicada en la web como CSV.');
    return await res.text();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('La hoja tardó demasiado en responder.');
    if (e instanceof TypeError) throw new Error('No se pudo conectar con la hoja. Revisa el enlace, o si este sitio permite conexiones externas.');
    throw e;
  } finally { clearTimeout(timer); }
}
async function syncNow(url){
  const text = await fetchSheet(url);
  applyCSV(text);
  lsSet(CACHE_KEY, text);
  state.source = 'hoja'; state.at = new Date();
  renderAll();
}
async function boot(){
  const url = sheetUrl();
  if (!url) { renderAll(); return; }
  const cached = lsGet(CACHE_KEY);
  let shown = false;
  if (cached) { try { applyCSV(cached); state.source = 'copia'; renderAll(); shown = true; } catch (e) {} }
  if (!shown) document.getElementById('cats').innerHTML = '<section class="cat aqua"><div class="wrap"><h2>Cargando</h2></div></section>';
  try {
    const text = await fetchSheet(url);
    if (text !== cached) { applyCSV(text); lsSet(CACHE_KEY, text); renderAll(); shown = true; }
    state.source = 'hoja'; state.at = new Date();
  } catch (e) {
    console.warn('bvidas: no se pudo leer la hoja de Google, se usa el catálogo guardado.', e);
  }
  if (!shown) renderAll(); else updateStatus();
}
function renderSyncPanel(msg, kind){
  panel.innerHTML = `<div class="order"><button class="x" type="button" data-act="close" aria-label="Cerrar">×</button>
    <h2>Sincronizar catálogo</h2>
    <p class="note">Pega el enlace de tu hoja de Google (compartida como "Cualquier persona con el enlace") y toca Sincronizar. También sirve el enlace CSV de Archivo > Compartir > Publicar en la web.</p>
    <label class="note" for="sheetUrl">Enlace de la hoja</label>
    <input id="sheetUrl" class="field" type="url" inputmode="url" autocomplete="off" placeholder="https://docs.google.com/spreadsheets/d/..." value="${esc(sheetUrl() || '')}">
    <button class="btn" type="button" data-act="syncgo">Sincronizar ahora</button>
    <button class="btn alt" type="button" data-act="syncreset">Volver a los productos de respaldo</button>
    <div class="msg ${kind || ''}" id="syncOut" role="status">${msg || 'Ahora: ' + statusText()}</div></div>`;
}
async function runSync(){
  const url = document.getElementById('sheetUrl').value.trim();
  if (!url) { renderSyncPanel('Pega primero el enlace CSV de tu hoja.', 'err'); return; }
  lsSet(URL_KEY, url);
  document.getElementById('syncOut').textContent = 'Sincronizando…';
  try {
    await syncNow(url);
    const n = CATS.filter(c => P.some(p => p.cat === c.id)).length;
    renderSyncPanel(`Listo: ${P.length} productos en ${n} secciones. ${new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}`, 'ok');
  } catch (e) { renderSyncPanel(e.message, 'err'); }
}
function resetSync(){
  lsSet(URL_KEY, null); lsSet(CACHE_KEY, null);
  restoreLocal(); state.source = 'respaldo'; state.at = null; renderAll();
  renderSyncPanel(SHEET_CSV_URL ? 'Se usan los productos de respaldo. Al recargar la página se volverá a leer la hoja configurada en js/config.js.' : 'Se usan los productos de respaldo (js/products.js).', 'ok');
}

/* ===== Overlay ===== */
const ov=document.getElementById('ov'),panel=document.getElementById('panel');
let ovMode='',lastFocus=null,gal={id:null,i:0};
function openOv(mode){ovMode=mode;lastFocus=document.activeElement;ov.classList.add('on');document.documentElement.style.overflow='hidden';setTimeout(()=>{const x=panel.querySelector('.x');x&&x.focus()},30)}
function closeOv(){ov.classList.remove('on');document.documentElement.style.overflow='';ovMode='';lastFocus&&lastFocus.focus&&lastFocus.focus()}
function renderDetail(){
  const p=byId[gal.id],fr=frames(p),cat=CATS.find(c=>c.id===p.cat);
  const cardCol={tang:'#F8C79F',aqua:'#CBEBF1',teal:'#8AD3DB',navy:'#17375F'}[cat.f];
  panel.innerHTML=`<button class="x" type="button" data-act="close" aria-label="Cerrar">×</button>
  <div class="det">
    <div class="gal" style="--card:${cardCol}">
      <div class="frame">${fr.map((f,i)=>`<div class="f ${i===gal.i?'show':''}" data-fr="${i}">${f.h}</div>`).join('')}</div>
      <div class="thumbs">${fr.map((f,i)=>`<button type="button" class="${i===gal.i?'on':''}" data-act="thumb" data-i="${i}" style="--c:${p.c};--ci:${p.ci}" aria-label="Foto ${i+1} de ${fr.length}">${f.t}</button>`).join('')}</div>
    </div>
    <div class="info">
      <h2>${p.n}</h2>
      <div class="tags"><span class="tag alc">Sin alcohol</span><span class="tag">${specOf(p)}</span>${p.style?`<span class="tag">${p.style}</span>`:''}${p.origin?`<span class="tag">${p.origin}</span>`:''}</div>
      ${p.desc?`<p class="desc">${p.desc}</p>`:''}
      <dl>${p.ing.length?`<div><dt>Qué tomas</dt><dd>${p.ing.join(', ')}.</dd></div>`:''}${p.when?`<div><dt>Cuándo va</dt><dd>${p.when}</dd></div>`:''}</dl>
      <div class="buy" data-buy="${p.id}"></div>
    </div></div>`;
  sync();
}
function renderOrder(){
  const ids=Object.keys(cart);
  panel.innerHTML=`<div class="order"><button class="x" type="button" data-act="close" aria-label="Cerrar">×</button><h2>Tu pedido</h2>`+
  (ids.length?`<div class="lines">${ids.map(id=>`<div class="line"><div class="l"><b>${byId[id].n}</b><span>${specOf(byId[id])} · ${money(byId[id].price)}</span></div>${stepHtml(id)}</div>`).join('')}</div>
    <div class="total"><span>Total</span><span>${money(total())}</span></div>
    <p class="note">${count()>=FREE_FROM?'Tu pedido en CDMX lleva envío gratis.':`Te faltan ${FREE_FROM-count()} piezas para envío gratis en CDMX.`} El costo de envío al interior se confirma por WhatsApp.</p>
    <a class="btn" href="${waLink()}" target="_blank" rel="noopener">Pedir por WhatsApp</a>`
   :`<p class="empty">Todavía no agregas nada. Cierra esta ventana y elige lo que se te antoje.</p>`)+`</div>`;
}
document.addEventListener('click',e=>{
  if(e.target===ov){closeOv();return}
  const t=e.target.closest('[data-act]');if(!t)return;
  const a=t.dataset.act,id=t.dataset.id;
  if(a==='open'){gal={id,i:0};renderDetail();openOv('detail')}
  else if(a==='close')closeOv();
  else if(a==='page'){pageOf[t.dataset.cat]=+t.dataset.p;renderCat(CATS.find(c=>c.id===t.dataset.cat),false);sync();document.getElementById('list-'+t.dataset.cat).scrollIntoView({behavior:'smooth',block:'start'})}
  else if(a==='inc')setQty(id,(cart[id]||0)+1);
  else if(a==='dec')setQty(id,(cart[id]||0)-1);
  else if(a==='order'){renderOrder();openOv('order')}
  else if(a==='sync'){renderSyncPanel();openOv('sync')}
  else if(a==='syncgo')runSync();
  else if(a==='syncreset')resetSync();
  else if(a==='thumb'){gal.i=+t.dataset.i;panel.querySelectorAll('.frame .f').forEach((el,i)=>el.classList.toggle('show',i===gal.i));panel.querySelectorAll('.thumbs button').forEach((el,i)=>el.classList.toggle('on',i===gal.i))}
});
document.addEventListener('keydown',e=>{
  if(!ov.classList.contains('on'))return;
  if(e.key==='Escape')closeOv();
  if(ovMode==='detail'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){
    const n=panel.querySelectorAll('.thumbs button').length;
    gal.i=(gal.i+(e.key==='ArrowRight'?1:n-1))%n;
    panel.querySelectorAll('.frame .f').forEach((el,i)=>el.classList.toggle('show',i===gal.i));
    panel.querySelectorAll('.thumbs button').forEach((el,i)=>el.classList.toggle('on',i===gal.i));
  }
});

/* ===== Entradas al hacer scroll ===== */
let io=null;
function observeReveals(){
  const rs=[...document.querySelectorAll('[data-r]:not(.in)')];
  if('IntersectionObserver' in window){
    io=io||new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.08});
    rs.forEach(el=>io.observe(el));
    setTimeout(()=>rs.forEach(el=>el.classList.add('in')),2500);
  }else rs.forEach(el=>el.classList.add('in'));
}

/* alto del header para anclas */
function hh(){const h=document.querySelector('.top').offsetHeight;document.documentElement.style.setProperty('--hh',h+'px')}
hh();addEventListener('resize',hh);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(hh);
boot();
