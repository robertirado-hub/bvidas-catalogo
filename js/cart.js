/* Estado del pedido: cantidades, totales y mensaje de WhatsApp. */
import { byId, specOf, unitsOf } from './products.js';
import { WA_NUM } from './config.js';

export const cart = (() => { try { return JSON.parse(localStorage.getItem('bvidas-cart') || '{}') || {}; } catch (e) { return {}; } })();
export const money=n=>'$'+n.toLocaleString('es-MX',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2});
export const count=()=>Object.entries(cart).reduce((a,[k,q])=>a+q*(byId[k]?unitsOf(byId[k]):1),0);  // piezas (un paquete suma sus piezas)
export const total=()=>Object.entries(cart).reduce((a,[k,q])=>a+byId[k].price*q,0);
function save(){try{localStorage.setItem('bvidas-cart',JSON.stringify(cart))}catch(e){}}
export function waLink(){
  const lines=Object.entries(cart).map(([k,q])=>`• ${q} x ${byId[k].n} (${specOf(byId[k]).toLowerCase()}) – ${money(byId[k].price*q)}`);
  const msg=`¡Hola bvidas! 🍊 Quiero pedir:\n${lines.join('\n')}\n\nTotal: ${money(total())} (${count()} piezas)\nTe paso mi dirección por aquí 🙌`;
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
}

let listener = () => {};
export function onChange(fn) { listener = fn; }
export function setQty(id, q) {
  if (q <= 0) delete cart[id]; else cart[id] = q;
  save();
  listener();
}

/* Quita del pedido productos que ya no existen en el catálogo. */
export function pruneCart() {
  let changed = false;
  Object.keys(cart).forEach(k => { if (!byId[k] || !(cart[k] > 0)) { delete cart[k]; changed = true; } });
  if (changed) save();
}
