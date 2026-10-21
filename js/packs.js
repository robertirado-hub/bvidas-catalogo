/* Dibujo de envases de ejemplo y armado de las vistas (fotos) de cada producto. */
function nameLines(s){
  const w=s.split(' ');let a='',b='';
  w.forEach(x=>{ if((a+' '+x).trim().length<=9 && !b) a=(a+' '+x).trim(); else b=(b+' '+x).trim(); });
  return b?[a,b]:[a];
}
export function pack(p,mode,cls){
  const lines=nameLines(p.short);
  const fs=lines.some(l=>l.length>8)?15:18;
  const txt=lines.map((l,i)=>`<text x="100" y="${(p.fmt==='Lata'?160:212)+i*(fs+3)}" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="800" font-size="${fs}" fill="${p.fmt==='Lata'?p.ci:'#0B2545'}">${l}</text>`).join('');
  const motifCol=p.fmt==='Lata'?p.ci:p.c;
  const motif=(cy)=>{let s=`<circle cx="100" cy="${cy}" r="24" fill="none" stroke="${motifCol}" stroke-width="3.5"/>`;
    for(let i=0;i<6;i++){const a=i*Math.PI/3;s+=`<line x1="${100+Math.cos(a)*4}" y1="${cy+Math.sin(a)*4}" x2="${100+Math.cos(a)*21}" y2="${cy+Math.sin(a)*21}" stroke="${motifCol}" stroke-width="3"/>`;}return s;};
  let body='',vb='36 0 128 300';
  if(p.fmt==='Lata'){
    body=`<rect x="52" y="32" width="96" height="238" rx="9" fill="${p.c}"/>
      <rect x="57" y="20" width="86" height="15" rx="4" fill="#C9D4DA"/><rect x="57" y="266" width="86" height="12" rx="4" fill="#C9D4DA"/>
      <rect x="60" y="44" width="7" height="214" fill="#fff" opacity=".2"/>
      ${motif(96)}${txt}
      <text x="100" y="${p.short.length>9?232:218}" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="600" font-size="9" fill="${p.ci}">355 ml · sin alcohol</text>`;
    if(mode==='close') vb='54 62 92 124';
  } else {
    body=`<rect x="84" y="22" width="32" height="82" rx="5" fill="${p.c}"/><rect x="82" y="8" width="36" height="17" rx="3" fill="#0B2545"/>
      <path d="M84 96 C84 118 54 126 54 156 L54 268 Q54 278 64 278 L136 278 Q146 278 146 268 L146 156 C146 126 116 118 116 96Z" fill="${p.c}"/>
      <rect x="54" y="150" width="92" height="108" fill="#F7FBFC"/>
      ${motif(184-14)}${txt}
      <text x="100" y="${212+lines.length*(fs+3)+8}" text-anchor="middle" font-family="Bricolage Grotesque,system-ui,sans-serif" font-weight="600" font-size="9" fill="#0B2545">355 ml · sin alcohol</text>
      <rect x="62" y="130" width="6" height="140" fill="#fff" opacity=".18"/>`;
    if(mode==='close') vb='54 140 92 120';
  }
  return `<svg viewBox="${vb}" class="${cls||''}" role="img" aria-label="${p.n}, ${p.fmt.toLowerCase()} 355 ml" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
export function ingHtml(p){
  return `<div class="ing" style="--c:${p.c};--ci:${p.ci}"><h3>Qué tomas</h3><ul>${p.ing.map(i=>`<li>${i}</li>`).join('')}</ul><div class="spec">${p.fmt} 355 ml · Sin alcohol<br>${p.when}</div></div>`;
}
export function frames(p){
  const f=[];
  if(p.imgs&&p.imgs.length) p.imgs.forEach((file,i)=>{const u=/^(https?:|data:|\/)/.test(file)?file:`images/products/${p.id}/${file}`;f.push({k:'img',h:`<img src="${u}" alt="${p.n}, foto ${i+1}" loading="lazy">`,t:`<img src="${u}" alt="">`})});
  else { f.push({k:'a',h:pack(p,'full'),t:pack(p,'full')}); f.push({k:'b',h:pack(p,'close'),t:pack(p,'close')}); }
  f.push({k:'ing',h:ingHtml(p),t:`<div class="t-ing" style="--c:${p.c};--ci:${p.ci}">Qué<br>tomas</div>`});
  return f;
}
