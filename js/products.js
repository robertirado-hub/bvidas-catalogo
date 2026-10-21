/* Catálogo. CADA PRODUCTO:
   id      identificador único, sin espacios (también es el nombre de su carpeta de fotos)
   cat     id de un tipo definido en config.js
   short   nombre corto que se dibuja en la etiqueta del envase de ejemplo
   fmt     "Lata" o "Botella"
   c / ci  color del envase de ejemplo y color del texto sobre él
   ing     ingredientes (se muestran en el panel "Qué tomas")
   imgs    nombres de archivo de sus fotos, dentro de images/products/<id>/
           Ej: imgs:["1.jpg","2.jpg","3.jpg"]. Si está vacío se dibujan las vistas de ejemplo.
   Los productos de abajo son EJEMPLOS: reemplázalos por los reales. */
export const P = [
  {id:'lager',cat:'cervezas',n:'Lager 0.0',short:'Lager 0.0',fmt:'Lata',c:'#F2C23B',ci:'#0B2545',price:38,origin:'Hecha en CDMX',desc:'Ligera, dorada y bien fría. La que pides cuando quieres cerveza sin la cruda.',ing:['Agua','Malta de cebada','Lúpulo','Levadura'],when:'Taco, partido o tarde de domingo.',imgs:[]},
  {id:'ambar',cat:'cervezas',n:'Ámbar 0.0',short:'Ámbar 0.0',fmt:'Botella',c:'#B8541B',ci:'#F7FBFC',price:42,origin:'Hecha en Guadalajara',desc:'Más cuerpo, notas tostadas y cero alcohol. Para ir despacio.',ing:['Agua','Malta caramelo','Lúpulo','Levadura'],when:'Carne asada o sobremesa.',imgs:[]},
  {id:'jamaica-mineral',cat:'minerales',n:'Mineral de jamaica',short:'Jamaica',fmt:'Lata',c:'#9B1B3F',ci:'#F7FBFC',price:34,origin:'Hecha en CDMX',desc:'Burbujas con el sabor de tu agua de jamaica favorita, sin azúcar de más.',ing:['Agua mineral','Flor de jamaica','Jugo de limón'],when:'Con la comida o a media tarde.',imgs:[]},
  {id:'pepino',cat:'minerales',n:'Mineral de pepino y limón',short:'Pepino y limón',fmt:'Botella',c:'#7FC47A',ci:'#0B2545',price:36,origin:'Hecha en Guadalajara',desc:'Fresca, limpia y con chispa. Como un spa pero en botella.',ing:['Agua mineral','Pepino','Jugo de limón'],when:'Calor, cocteles sin alcohol o after de gym.',imgs:[]},
  {id:'tamarindo',cat:'sodas',n:'Soda de tamarindo',short:'Tamarindo',fmt:'Botella',c:'#7A3E1D',ci:'#F7FBFC',price:35,origin:'Hecha en CDMX',desc:'Dulce, ácida y con un toque de chile. Una soda con carácter.',ing:['Agua carbonatada','Pulpa de tamarindo','Azúcar de caña','Chile'],when:'Botana y comida mexicana.',imgs:[]},
  {id:'mandarina',cat:'sodas',n:'Soda de mandarina',short:'Mandarina',fmt:'Lata',c:'#F58A2E',ci:'#0B2545',price:33,origin:'Hecha en Guadalajara',desc:'Naranja brillante y burbuja suave. Sabe a recreo, pero para adultos.',ing:['Agua carbonatada','Jugo de mandarina','Azúcar de caña'],when:'Cualquier hora.',imgs:[]},
  {id:'yerba',cat:'energeticas',n:'Energética de yerba mate y limón',short:'Yerba mate y limón',fmt:'Lata',c:'#2E8B57',ci:'#F7FBFC',price:48,origin:'Hecha en CDMX',desc:'Energía de yerba mate con limón. Te despierta sin hacerte sentir acelerado.',ing:['Agua','Yerba mate','Jugo de limón','Endulzante natural'],when:'Mañana o antes de entrenar.',imgs:[]},
  {id:'maracuya',cat:'energeticas',n:'Energética de maracuyá',short:'Maracuyá',fmt:'Lata',c:'#F7C531',ci:'#0B2545',price:48,origin:'Hecha en Guadalajara',desc:'Tropical, ácida y con empuje para el resto del día.',ing:['Agua','Pulpa de maracuyá','Extracto de té verde','Endulzante natural'],when:'Tarde de trabajo.',imgs:[]},
  {id:'prebiotica',cat:'funcionales',n:'Prebiótica de jamaica y jengibre',short:'Jamaica y jengibre',fmt:'Lata',c:'#C2345A',ci:'#F7FBFC',price:52,origin:'Hecha en CDMX',desc:'Soda prebiótica con jamaica y jengibre. Rica primero, funcional después.',ing:['Agua carbonatada','Flor de jamaica','Jengibre','Fibra prebiótica'],when:'Después de comer.',imgs:[]},
  {id:'nootropica',cat:'funcionales',n:'Nootrópica de frutos rojos',short:'Frutos rojos',fmt:'Lata',c:'#5B3F8C',ci:'#F7FBFC',price:56,origin:'Hecha en Guadalajara',desc:'Bebida con ingredientes pensados para enfocarte. Sabe a frutos rojos.',ing:['Agua','Jugo de frutos rojos','L-teanina','Cafeína natural'],when:'Para concentrarte.',imgs:[]},
  {id:'komb-jengibre',cat:'kombucha',n:'Kombucha de jengibre',short:'Kombucha jengibre',fmt:'Botella',c:'#E3A33B',ci:'#0B2545',price:58,origin:'Hecha en CDMX',desc:'Fermentada con jengibre fresco. Pica rico y burbujea bonito.',ing:['Té fermentado','Jengibre','Azúcar de caña (se consume al fermentar)'],when:'Desayuno o merienda.',imgs:[]},
  {id:'komb-jamaica',cat:'kombucha',n:'Kombucha de jamaica',short:'Kombucha jamaica',fmt:'Botella',c:'#A8284F',ci:'#F7FBFC',price:58,origin:'Hecha en Guadalajara',desc:'Ácida, floral y roja como un atardecer.',ing:['Té fermentado','Flor de jamaica','Azúcar de caña (se consume al fermentar)'],when:'Con botanas o sola.',imgs:[]},
  {id:'tinto',cat:'vino',n:'Tinto sin alcohol',short:'Tinto',fmt:'Botella',c:'#6B1F3A',ci:'#F7FBFC',price:95,origin:'Hecho en México',desc:'Uva tinta, cuerpo y taninos suaves. Para brindar y manejar.',ing:['Mosto de uva tinta','Agua','Extracto de uva'],when:'Cena o brindis.',imgs:[]},
  {id:'blanco',cat:'vino',n:'Blanco sin alcohol',short:'Blanco',fmt:'Botella',c:'#D9D17A',ci:'#0B2545',price:95,origin:'Hecho en México',desc:'Fresco, frutal y bien frío. Va con mariscos y con plática.',ing:['Mosto de uva blanca','Agua','Extracto de uva'],when:'Comida ligera o terraza.',imgs:[]},
  {id:'ipa',cat:'cervezas',n:'IPA 0.0',short:'IPA 0.0',fmt:'Lata',c:'#3E8E41',ci:'#F7FBFC',price:44,origin:'Hecha en Guadalajara',desc:'Lúpulo aromático y amargor bien portado. Para quien extrañaba una IPA.',ing:['Agua','Malta de cebada','Lúpulo','Levadura'],when:'Con hamburguesa o pizza.',imgs:[]},
  {id:'stout',cat:'cervezas',n:'Stout 0.0',short:'Stout 0.0',fmt:'Botella',c:'#2B1A14',ci:'#F7FBFC',price:46,origin:'Hecha en CDMX',desc:'Oscura, cremosa y con notas de café y cacao. Sin alcohol y con carácter.',ing:['Agua','Malta tostada','Lúpulo','Levadura'],when:'Postre o noche tranquila.',imgs:[]},
  {id:'limon',cat:'sodas',n:'Soda de limón',short:'Limón',fmt:'Lata',c:'#B7D83A',ci:'#0B2545',price:33,origin:'Hecha en CDMX',desc:'Limón de verdad, burbuja fina y un golpe de acidez que despierta.',ing:['Agua carbonatada','Jugo de limón','Azúcar de caña'],when:'Con tacos o con hielo.',imgs:[]},
  {id:'guayaba',cat:'sodas',n:'Soda de guayaba',short:'Guayaba',fmt:'Lata',c:'#F08A93',ci:'#0B2545',price:34,origin:'Hecha en Guadalajara',desc:'Aroma de guayaba recién cortada. Dulce, rosa y muy fácil de tomar.',ing:['Agua carbonatada','Pulpa de guayaba','Azúcar de caña'],when:'Tarde de calor.',imgs:[]},
  {id:'pina',cat:'sodas',n:'Soda de piña',short:'Piña',fmt:'Botella',c:'#F2D13B',ci:'#0B2545',price:35,origin:'Hecha en CDMX',desc:'Piña dulce con burbuja y un final fresco.',ing:['Agua carbonatada','Jugo de piña','Azúcar de caña'],when:'Fiesta o botana.',imgs:[]},
  {id:'cola',cat:'sodas',n:'Cola artesanal',short:'Cola',fmt:'Botella',c:'#4A2A1A',ci:'#F7FBFC',price:36,origin:'Hecha en Guadalajara',desc:'Cola con especias y caramelo, hecha en lotes pequeños.',ing:['Agua carbonatada','Caramelo de caña','Extractos de especias','Cítricos'],when:'Con comida o con hielo.',imgs:[]}
];

export const byId = Object.fromEntries(P.map(p => [p.id, p]));

/* Reemplaza el catálogo en memoria (lo usa js/sheet.js al leer Google Sheets). */
export function setProducts(list) {
  P.length = 0; P.push(...list);
  Object.keys(byId).forEach(k => delete byId[k]);
  list.forEach(x => { byId[x.id] = x; });
}
