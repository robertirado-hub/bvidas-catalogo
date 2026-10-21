/* Ajustes del negocio. Cambia aquí tu WhatsApp y las reglas de envío. */
export const WA_NUM = "";     // número de WhatsApp Business con lada, sin +. Ej: "5215512345678"
export const FREE_FROM = 8;   // piezas para envío gratis en CDMX

/* Catálogo desde Google Sheets. Pega aquí el enlace CSV publicado de tu hoja
   (Archivo > Compartir > Publicar en la web > pestaña de productos > formato CSV).
   Si lo dejas vacío, se usan los productos de js/products.js.
   Acepta también una ruta relativa, por ejemplo "plantilla-productos.csv". */
export const SHEET_CSV_URL = "";

/* Tipos de bebida. f = color del campo: tang (mandarina), aqua, teal o navy.
   Cada tipo con su id aparece como sección y como botón en la barra de arriba. */
export const CATS = [
  {id:'cervezas',   t:'Cervezas',    f:'aqua', d:'Cerveza sin alcohol, de las de verdad. Lager y ámbar con todo el sabor.'},
  {id:'minerales',  t:'Minerales',   f:'teal', d:'Agua mineral saborizada, artesanal y con burbuja fina.'},
  {id:'sodas',      t:'Sodas',       f:'navy', d:'Sodas artesanales hechas con fruta, no con jarabe.'},
  {id:'energeticas',t:'Energéticas', f:'tang', d:'Energía con ingredientes naturales para arrancar el día.'},
  {id:'funcionales',t:'Funcionales', f:'aqua', d:'Bebidas con una función extra: prebióticos y más.'},
  {id:'kombucha',   t:'Kombucha',    f:'teal', d:'Fermentada en México, con burbujas vivas.'},
  {id:'vino',       t:'Vino',        f:'tang', d:'Vino sin alcohol para brindar sin vueltas.'}
];
