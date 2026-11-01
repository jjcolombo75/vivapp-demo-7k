/* Vivapp · Progreso: avance y récords, sede del mes, logros, Tus fotos, historia para Instagram, mural y cartel.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 070
  // ===== Progreso: avance por ejercicio y récords =====
  let avKey = 'remo';
  function renderAvance(){
    const keys = Object.keys(hist);
    $('#avChips').innerHTML = keys.map(k => '<button class="opt" data-av="' + k + '" aria-pressed="' + (k === avKey) + '">' + lib[k].n + '</button>').join('');
    const h = hist[avKey], vals = h.map(x => x[1]), u = unidad(avKey);
    let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    const pad = Math.max(1, (hi - lo) * 0.25); lo = Math.max(0, lo - pad); hi = hi + pad;
    const W = 320, H = 170, L = 34, R = 14, T = 16, B = 26;
    const X = i => L + (h.length === 1 ? 0 : i * (W - L - R) / (h.length - 1));
    const Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
    let g = '';
    for (let t = 0; t <= 2; t++) { const v = lo + (hi - lo) * t / 2; g += '<line class="avg" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/><text class="avt" x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + fmtN(Math.round(v * 2) / 2) + '</text>'; }
    const pts = h.map((x, i) => X(i).toFixed(1) + ',' + Y(x[1]).toFixed(1));
    g += '<polygon class="ava" points="' + X(0).toFixed(1) + ',' + (H - B) + ' ' + pts.join(' ') + ' ' + X(h.length - 1).toFixed(1) + ',' + (H - B) + '"/>';
    g += '<polyline class="avl" points="' + pts.join(' ') + '"/>';
    h.forEach((x, i) => { const last = i === h.length - 1; g += '<circle class="' + (last ? 'avp last' : 'avp') + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(x[1]).toFixed(1) + '" r="' + (last ? 5.5 : 3.5) + '"/>'; g += '<text class="avt" x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + x[0] + '</text>'; });
    const lx = h[h.length - 1];
    g += '<text class="avv" x="' + Math.min(X(h.length - 1), W - R - 4).toFixed(1) + '" y="' + (Y(lx[1]) - 10).toFixed(1) + '" text-anchor="end">' + fmtN(lx[1]) + ' ' + u + '</text>';
    $('#avChart').innerHTML = g;
    $('#avChart').setAttribute('aria-label', lib[avKey].n + ': mejor marca por sesión, de ' + fmtN(vals[0]) + ' a ' + fmtN(vals[vals.length - 1]) + ' ' + u);
    const delta = vals[vals.length - 1] - vals[0];
    $('#avUnit').textContent = esTiempo(avKey) ? 'Segundos máximos por sesión' : 'Peso máximo por sesión';
    $('#avFrom').textContent = 'Desde el ' + h[0][0];
    $('#avDelta').textContent = (delta >= 0 ? '+' : '') + fmtN(delta) + ' ' + u;
    const rp = num((lib[avKey].sets[0] || [])[2]) || 10;
    $('#av1rm').textContent = esTiempo(avKey) || !lx[1] ? '' : 'Tu máximo estimado para una sola repetición: ' + fmtN(Math.round(lx[1] * (1 + rp / 30) * 2) / 2) + ' kg (calculado con ' + fmtN(lx[1]) + ' kg × ' + rp + '). Es una estimación: no hace falta probarlo.';
  }
  $('#avChips').addEventListener('click', e => { const b = e.target.closest('[data-av]'); if (b) { avKey = b.dataset.av; renderAvance(); } });
  function renderRecords(){
    $('#recList').innerHTML = Object.keys(hist).map(k => {
      const h = hist[k], b = Math.max.apply(null, h.map(x => x[1])), nuevo = h[h.length - 1][0] === hoyLbl && h[h.length - 1][1] === b && b > prevBest(k);
      return '<div><span style="flex:1;font-weight:500">' + lib[k].n + '</span>' + (nuevo ? '<span class="pill ok">NUEVO</span>' : '') + '<span class="num" style="font-size:22px">' + (b ? fmtN(b) + ' ' + unidad(k) : 'Corporal') + '</span></div>';
    }).join('');
  }
  renderAvance(); renderRecords();

//#bloque 130
  // ===== La sede del mes: % de socios con Mes completo por sede (agregado; en producción, de las entradas por molinete) =====
  const sedesMes = [ ['Sarmiento', 34], ['López y Planes', 31], ['Alberdi', 27] ];
  const diasRestantes = () => { const d = ahora(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate(); };
  const mesNombre = () => meses[ahora().getMonth()];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fmt1 = v => String(Math.round(v * 10) / 10).replace('.', ',');
  const misEntrenos = () => +$('#mesCount').textContent || 0;
  const segsHtml = (n, tot) => Array.from({ length:tot }, (_, i) => '<i' + (i < n ? ' class="on"' : '') + '></i>').join('');
  const entr = n => n + (n === 1 ? ' entrenamiento' : ' entrenamientos');
  function renderDesafios(){
    const left = diasRestantes();
    $('#chLeft').textContent = left === 0 ? 'Último día' : left === 1 ? 'Queda 1 día' : 'Quedan ' + left + ' días';
    $('#chalName').textContent = cap(mesNombre());
    { const m0 = ahora().getMonth(); $('#mesAnt1').textContent = cap(mesTxt(m0 - 1)) + ' · Sarmiento, tu sede'; $('#mesAnt2').textContent = cap(mesTxt(m0 - 2)) + ' · López y Planes'; }
    const sorted = sedesMes.slice().sort((a, b) => b[1] - a[1]), pos = sorted.findIndex(x => x[0] === miSede);
    $('#sedeRank').innerHTML = sorted.map((x, i) => '<div class="rank' + (x[0] === miSede ? ' me' : '') + '"><span>' + (i + 1) + '. ' + x[0] + '</span><span class="occ"><i style="width:' + x[1] * 2 + '%"></i></span><b>' + x[1] + '%</b></div>').join('') +
      '<span class="small muted">De cada sede, cuántos socios van camino a su Mes cumplido. ' + (pos === 0 ? miSede + ' va primera.' : miSede + ' va ' + (pos + 1) + 'ª.') + '</span>';
    const n = mesMarcas();
    $('#chMine').innerHTML = '<span>' + (n >= 4 ? '¡Tu Mes cumplido ya suma para ' + miSede + '! ⚡' : 'Llevás <strong>' + n + ' de 4</strong> semanas cumplidas en ' + mesNombre() + '. Con tu Mes cumplido, sumás para ' + miSede + '.') + '</span>';
  }

  // ===== Logros: se arman solos con los datos; el socio elige qué se ve =====
  const trophy = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>';
  const igIco = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
  const clapIco = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.5.6-2.6 1.5-3.5.2 1.6 1 2.5 2 2.5 0-3-1-4.5.5-7.5zM6 14a6 6 0 0 0 12 0"/></svg>';
  const published = new Set();
  const feed = [
    { n:'Joaquín', sede:'Sarmiento', c:['#4f7d3a','#152410'], t:'12 semanas cumplidas', s:'Encendió su rayo en el mural', when:'Hace 2 h', claps:18 },
    { n:'Carla', sede:'Alberdi', c:['#9a4f8a','#2c1028'], t:'Primer mes cumplido', s:'Cumplió su primer mes en Viva', when:'Hace 5 h', claps:31 },
    { n:'Diego', sede:'Sarmiento', c:['#7a7a3a','#262610'], t:'Récord en sentadilla', s:'Superó su mejor marca personal', when:'Ayer', claps:12 },
    { n:'Florencia', sede:'Sarmiento', c:['#3a6a9a','#0f2034'], t:'Mes cumplido de ' + mesTxt(ahora().getMonth() - 1), s:'4 semanas cumplidas', when:'Ayer', claps:22 },
    { n:'Joaquín', sede:'Sarmiento', c:['#4f7d3a','#152410'], t:'Terminó el Día B · Espalda', s:'6 ejercicios · 52 min · se sintió genial', when:'Hace 1 h', claps:7 },
    { n:'Martín', sede:'López y Planes', c:['#3a8a7a','#0e2a24'], t:'Terminó Boxeo recreativo', s:'Clase de 45 min · Prof. Martín', when:'Hace 3 h', claps:5 }
  ];
  let achList = [];
  function misLogros(){
    const mine = misEntrenos(), mes = mesNombre(), prKeys = Object.keys(ses.prs || {});
    let pr;
    if (prKeys.length) {
      const k = prKeys[prKeys.length - 1], u = unidad(k);
      pr = { id:'pr-' + k, t:'Récord en ' + lib[k].n, s:'Hoy · ' + fmtN(ses.prs[k]) + ' ' + u, big:fmtN(ses.prs[k]), unit:u === 'kg' ? 'KG' : 'SEGUNDOS', cap:'nuevo récord en ' + lib[k].n.toLowerCase(), feedT:'Récord en ' + lib[k].n };
    } else pr = { id:'pr-jalon', t:'Récord en Jalón al pecho', s:'45 kg · +5 kg desde ' + mesTxt(+hist.jalon[0][0].split('/')[1] - 1), big:'45', unit:'KG', cap:'récord en jalón al pecho', feedT:'Récord en Jalón al pecho' };
    return [
      { id:'racha', ico:'5', t:'5 semanas cumplidas', s:'Cumpliste tu meta 5 semanas desde ' + mesTxt(diaAtras(35).getMonth()), big:'5', unit:'SEMANAS', cap:'cumplidas, sin vueltas a cero', feedT:'5 semanas cumplidas' },
      { id:'mes-' + mine, ico:String(mine), t:entr(mine) + ' en ' + mes, s:'Tu mejor mes desde que estás en Viva', big:String(mine), unit:'ENTRENAMIENTOS', cap:'en ' + mes + '. Constancia ante todo.', feedT:entr(mine) + ' en ' + mes },
      pr
    ];
  }
  function renderLogros(){
    achList = misLogros();
    $('#myAch').innerHTML = !$('#swAch').checked
      ? '<p class="small muted" style="margin:12px 0 4px">Desactivaste las sugerencias de logros en tu perfil.</p>'
      : achList.map((a, i) => { const on = published.has(a.id);
          return '<div class="ach"><span class="achi">' + (a.id.indexOf('pr') === 0 ? trophy : a.ico) + '</span>' +
            '<span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + a.t + '</span><span class="small muted">' + a.s + '</span></span>' +
            '<span class="achb"><button data-pub="' + i + '"' + (on ? ' class="done"' : '') + ' aria-label="' + (on ? 'Sacar del muro de Viva' : 'Publicar en el muro de Viva') + '">' + (on ? '✓ Muro' : 'Muro') + '</button>' +
            '<button data-story="' + i + '" aria-label="Compartir en historias de Instagram">' + igIco + '</button></span></div>'; }).join('');
    $$('#feedFil .opt').forEach(b => b.setAttribute('aria-pressed', b.dataset.ff === feedMode));
    const vis = feed.map((p, i) => [p, i]).filter(([p]) => feedMode === 'todos' || p.me || siguiendo.has(p.n));
    $('#feed').innerHTML = !vis.length ? '<p class="small muted" style="text-align:center;margin:8px 0;line-height:1.45">Seguí a gente desde la pestaña Gente para ver acá sus logros y entrenamientos.</p>' : vis.map(([p, i]) => '<div class="post"><div style="display:flex;align-items:center;gap:10px"><span class="av sm" style="background:' + grad(p.c) + '">' + inicial(p.n) + '</span>' +
      '<span class="stack" style="gap:0;flex:1"><span style="font-weight:700">' + p.n + (p.me ? ' <span class="mtag">Vos</span>' : '') + '</span><span class="small muted">' + p.sede + ' · ' + p.when + '</span></span></div>' +
      '<span class="big">' + p.t + '</span><span class="small muted" style="margin-top:-6px">' + p.s + '</span>' +
      '<button class="clap" data-clap="' + i + '" aria-pressed="' + !!p.clapped + '" aria-label="Aplaudir a ' + p.n + '">' + clapIco + ' ' + (p.claps + (p.clapped ? 1 : 0)) + '</button></div>').join('');
  }
  $('#myAch').addEventListener('click', e => {
    const p = e.target.closest('[data-pub]'), s = e.target.closest('[data-story]');
    if (p) {
      const a = achList[+p.dataset.pub];
      if (published.has(a.id)) { published.delete(a.id); const i = feed.findIndex(f => f.aid === a.id); if (i >= 0) feed.splice(i, 1); toast('Lo sacaste del muro'); }
      else { published.add(a.id); feed.unshift({ aid:a.id, me:true, n:'Martina', sede:miSede, c:['#5b6ea8','#1c2238'], t:a.feedT, s:a.s, when:'Ahora', claps:0 }); toast('Publicado en el muro de Viva'); }
      renderLogros();
    }
    if (s) openStory({ type:'ach', a:achList[+s.dataset.story] });
  });
  $('#feed').addEventListener('click', e => {
    const b = e.target.closest('[data-clap]'); if (!b) return;
    const p = feed[+b.dataset.clap];
    if (p.me) { toast('Los aplausos son de los demás'); return; }
    p.clapped = !p.clapped; renderLogros();
  });

  // ===== Mi evolución: álbum privado (fotos de ejemplo) =====
  const evFotos = [ { d:'23/07', c:['#39424f','#161b24'] }, { d:'20/08', c:['#3f4958','#161b24'] }, { d:'17/09', c:['#465163','#161b24'] }, { d:'15/10', c:['#4d596e','#161b24'] } ];
  let evSel = [0, 3];
  const silSvg = '<svg width="58%" viewBox="0 0 40 80" fill="#fff" aria-hidden="true"><circle cx="20" cy="9" r="7"/><path d="M8 20h24l-3 28h-4l-1 30h-8l-1-30h-4z"/></svg>';
  const parseDM = s => { const [d, m] = s.split('/').map(Number); return new Date(ahora().getFullYear(), m - 1, d); };
  const semanasEntre = (a, b) => { const w = Math.max(1, Math.round(Math.abs(parseDM(b) - parseDM(a)) / 6048e5)); return w + (w === 1 ? ' semana' : ' semanas'); };
  function evTile(f, i, lbl){
    return '<button class="evph" data-ev="' + i + '" aria-pressed="' + (lbl ? 'true' : 'false') + '" aria-label="Foto del ' + f.d + (lbl ? ', ' + lbl : '') + '" style="background:' + (f.src ? '#000' : 'linear-gradient(160deg,' + f.c[0] + ',' + f.c[1] + ')') + '">' +
      (f.src ? '<img src="' + f.src + '" alt="">' : '<span class="sil">' + silSvg + '</span>') + (lbl ? '<span class="sel">' + lbl + '</span>' : '') + '<span class="d">' + f.d + '</span></button>';
  }
  function renderEvol(){
    const s = evSel.slice().sort((a, b) => a - b), two = s.length === 2;
    $('#evGrid').innerHTML = evFotos.map((f, i) => evTile(f, i, two ? (i === s[0] ? 'Antes' : i === s[1] ? 'Ahora' : '') : (i === s[0] ? 'Elegida' : ''))).join('') +
      '<button class="evph add" id="evAdd" aria-label="Sumar una foto"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Sumar foto</button>';
    $('#evCmp').hidden = !two;
    if (two) { const a = evFotos[s[0]], b = evFotos[s[1]]; $('#evCmpImgs').innerHTML = evTile(a, -1, 'Antes') + evTile(b, -1, 'Ahora'); $('#evSpan').textContent = semanasEntre(a.d, b.d); }
  }
  $('#evGrid').addEventListener('click', e => {
    if (e.target.closest('#evAdd')) { $('#evFile').click(); return; }
    const t = e.target.closest('[data-ev]'); if (!t) return;
    const i = +t.dataset.ev, k = evSel.indexOf(i);
    if (k >= 0) evSel.splice(k, 1); else { evSel.push(i); if (evSel.length > 2) evSel.shift(); }
    renderEvol();
  });
  $('#evFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const d = ahora(), lbl = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
    evFotos.push({ d:lbl, c:['#4d596e','#161b24'], src:URL.createObjectURL(f) });
    evSel = [0, evFotos.length - 1]; e.target.value = ''; renderEvol(); toast('Foto guardada en tu álbum privado');
  });
  $('#evShare').addEventListener('click', () => { const s = evSel.slice().sort((a, b) => a - b); openStory({ type:'cmp', a:evFotos[s[0]], b:evFotos[s[1]] }); });
  $('#evBack').addEventListener('click', () => { go('social'); setSmode('logros'); });
  $('#swProfe').addEventListener('change', e => toast(e.target.checked ? 'Lucas va a poder ver tus fotos' : 'Tus fotos son solo tuyas'));

  // ===== Historia para Instagram: imagen 1080 × 1920 armada en el teléfono =====
  const loadImg = src => new Promise(r => { if (!src) return r(null); const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  function wrapText(x, t, cx, y, maxW, lh){ let line = ''; t.split(' ').forEach(w => { const test = line ? line + ' ' + w : w; if (x.measureText(test).width > maxW && line) { x.fillText(line, cx, y); line = w; y += lh; } else line = test; }); if (line) x.fillText(line, cx, y); }
  function fitFont(x, t, size, fam, maxW){ x.font = 'condensed 800 ' + size + 'px ' + fam; const w = x.measureText(t).width; if (w > maxW) x.font = 'condensed 800 ' + Math.floor(size * maxW / w) + 'px ' + fam; }
  function rrect(x, px, py, w, h, r){ x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
  function coverDraw(x, im, px, py, w, h){ const s = Math.max(w / im.width, h / im.height), iw = im.width * s, ih = im.height * s; x.drawImage(im, px + (w - iw) / 2, py + (h - ih) / 2, iw, ih); }
  async function drawStory(d){
    const cv = $('#storyCv'), x = cv.getContext('2d'), W = 1080, H = 1920;
    try { await Promise.all([document.fonts.load('900 100px "Archivo"'), document.fonts.load('500 40px "Archivo"'), document.fonts.load('700 40px "Archivo"')]); } catch(_){}
    const D = '"Archivo", "Arial Narrow", sans-serif', B = '"Archivo", system-ui, sans-serif';
    try { x.fontStretch = 'condensed'; } catch(_){}
    x.textBaseline = 'alphabetic';
    x.fillStyle = '#0a0d12'; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W * .8, H * .2, 40, W * .8, H * .2, 950); g.addColorStop(0, 'rgba(244,0,160,.34)'); g.addColorStop(1, 'rgba(244,0,160,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); const g2 = x.createRadialGradient(W * .15, H * .85, 40, W * .15, H * .85, 900); g2.addColorStop(0, 'rgba(7,176,242,.30)'); g2.addColorStop(1, 'rgba(7,176,242,0)'); x.fillStyle = g2; x.fillRect(0, 0, W, H); 
    { const sv = [455.5, 134.8, 257.6, 289.3], sc = 300 / sv[2]; x.save(); x.translate(90, 70); x.scale(sc, sc); x.translate(-sv[0], -sv[1]); x.fillStyle = '#ffffff'; x.fill(new Path2D("M561.06 252.8L550.67 254.27C550.05 254.35 549.5 254.94 549.35 255.38L536.41 287.94L535.94 288L523.12 259.07C522.96 258.67 522.42 258.23 521.8 258.32L511.41 259.78C510.24 259.95 509.61 261.13 510.08 262.16L534.33 315.44C534.57 315.91 535.03 316.27 535.66 316.18L536.43 316.07C537.06 315.98 537.53 315.5 537.77 314.95L562.38 254.81C562.85 253.65 562.23 252.64 561.06 252.8M573.83 250.96L564.47 252.29C563.68 252.41 562.98 253.27 562.98 254.14L562.88 310.7C562.87 311.55 563.58 312.22 564.36 312.11L573.72 310.77C574.5 310.66 575.21 309.79 575.21 308.94L575.31 252.38C575.31 251.52 574.61 250.85 573.83 250.96M621.04 247.51L628.39 244.64C628.4 243.83 627.82 243.25 626.91 243.38L616.54 244.84C615.91 244.92 615.36 245.5 615.21 245.95L602.29 278.46L601.82 278.53L589.01 249.62C588.86 249.23 588.31 248.8 587.69 248.89L577.32 250.35C576.15 250.51 575.53 251.69 575.99 252.71L600.21 305.94C600.44 306.4 600.91 306.76 601.53 306.67L602.31 306.56C602.94 306.47 603.4 305.98 603.64 305.45L614.99 277.72L611.19 279.07ZM621.04 247.51M630.61 282.49L636.48 267.79L636.56 267.77L642.46 280.83ZM662.62 296L638.32 242.8C638.09 242.33 637.55 241.98 637 242.06L636.22 242.17C635.82 242.23 635.41 242.51 635.13 242.88L625.99 265.09L625.44 266.44L634.08 263.67L610.39 304.75C610.61 305.18 611.08 305.43 611.71 305.34L620.29 304.13C621.84 303.91 622.7 302.78 623.09 301.71L625.91 294.59L647.11 291.61L649.91 297.86C650.61 299.36 651.23 299.78 652.63 299.59L661.29 298.37C662.45 298.21 663.08 297.02 662.62 296M503.18 358.21L495.93 364.41L504.83 374.84L502.27 377.02L493.37 366.59L484.95 373.77L482.42 370.79L503.23 353.04L515.76 367.72L513.17 369.93ZM503.18 358.21M521.37 371.9L524.43 374.33L507.45 395.76L504.39 393.34ZM521.37 371.9M535.54 385.61L527.24 381.23L528.82 378.23L548.84 388.78L547.25 391.78L538.96 387.41L527.79 408.6L524.37 406.79ZM535.54 385.61M589.2 395.87L586.85 423.12L582.96 422.79L584.01 410.64L568.36 409.29L567.31 421.43L563.41 421.1L565.77 393.85L569.66 394.18L568.65 405.9L584.3 407.25L585.31 395.54ZM589.2 395.87M623.02 403.49C621.65 397.59 616.23 394.27 610.34 395.64C604.36 397.02 600.95 402.38 602.31 408.27C603.68 414.18 609.09 417.5 615.07 416.11C620.97 414.75 624.38 409.39 623.02 403.49M598.5 409.16C596.7 401.35 601.37 394.14 609.55 392.25C617.66 390.38 625.01 394.77 626.82 402.61C628.64 410.45 623.96 417.62 615.85 419.5C607.67 421.39 600.31 416.96 598.5 409.16M637.2 399.89L629.18 386.59L632.52 384.57L640.47 397.74C643.59 402.93 647.38 403.84 651.59 401.3C655.81 398.76 656.8 394.96 653.68 389.78L645.73 376.6L648.98 374.64L657 387.96C661.1 394.75 659.54 400.56 653.36 404.29C647.2 408 641.3 406.69 637.2 399.89M671.34 387.21L670.1 384.07C672.83 383.84 676.18 382.21 678.59 379.65C681.82 376.2 681.87 373.46 680.13 371.83C675.26 367.26 667 382.23 659.59 375.28C656.52 372.39 656.14 367.54 661.06 362.29C663.25 359.96 666.15 358.12 668.84 357.54L670.23 360.62C667.5 361.31 665.14 362.8 663.48 364.57C660.3 367.96 660.36 370.75 662.1 372.38C666.97 376.95 675.26 362.01 682.58 368.88C685.63 371.74 685.95 376.65 681.01 381.92C678.15 384.97 674.32 387 671.34 387.21M702.31 343.89L705.29 345.52L695.77 362.94L671.77 349.82L681.02 332.88L684.01 334.51L676.62 348.02L684 352.05L690.57 340.01L693.49 341.61L686.91 353.64L694.66 357.88ZM702.31 343.89M461.6 203.59L469.18 209.36L477.5 198.45L480.17 200.49L471.86 211.4L480.65 218.1L478.29 221.21L456.53 204.63L468.22 189.28L470.93 191.34ZM461.6 203.59M477.07 180.5L479.9 177.8L498.73 197.66L495.9 200.35ZM477.07 180.5M497.62 167.81L489.91 173.14L487.98 170.34L506.59 157.48L508.52 160.28L500.8 165.61L514.42 185.32L511.24 187.51ZM497.62 167.81M555.3 138.84L562.67 165.18L558.91 166.23L555.62 154.49L540.5 158.72L543.79 170.46L540.02 171.51L532.65 145.18L536.41 144.12L539.58 155.45L554.71 151.22L551.54 139.89ZM555.3 138.84M595.51 149.74C595.44 143.68 590.86 139.29 584.8 139.36C578.66 139.42 574.18 143.93 574.25 149.99C574.32 156.04 578.91 160.45 585.05 160.38C591.1 160.3 595.58 155.8 595.51 149.74M570.35 150.04C570.25 142.02 576.36 135.97 584.76 135.88C593.08 135.78 599.32 141.65 599.42 149.7C599.51 157.75 593.41 163.76 585.09 163.86C576.68 163.95 570.44 158.04 570.35 150.04M610.13 153.24L613.98 138.17L617.76 139.14L613.95 154.06C612.45 159.93 614.46 163.26 619.23 164.48C624 165.7 627.41 163.75 628.91 157.88L632.72 142.96L636.39 143.9L632.54 158.96C630.57 166.65 625.34 169.63 618.34 167.84C611.37 166.06 608.16 160.93 610.13 153.24M638.14 170.46L640.82 168.43C641.78 171 644.25 173.78 647.37 175.4C651.57 177.58 654.21 176.89 655.32 174.78C658.4 168.85 641.75 164.95 646.45 155.93C648.39 152.19 652.96 150.51 659.34 153.84C662.18 155.31 664.73 157.61 666.02 160.04L663.44 162.22C662.02 159.77 659.96 157.9 657.81 156.78C653.68 154.63 651.02 155.45 649.91 157.56C646.83 163.49 663.46 167.43 658.82 176.34C656.89 180.05 652.25 181.68 645.84 178.35C642.13 176.42 639.14 173.28 638.14 170.46M679.31 197.43L677.15 200.06L661.84 187.43L679.23 166.33L694.12 178.61L691.96 181.23L680.09 171.44L674.74 177.92L685.32 186.64L683.21 189.21L672.63 180.48L667.01 187.29ZM679.31 197.43M469.93 296.84C470.12 296.84 470.3 296.91 470.42 297.06C470.57 297.23 470.61 297.48 470.53 297.69L462.02 320.21L484.39 287.06L476.51 288.38C476.28 288.41 476.04 288.32 475.9 288.12C475.76 287.94 475.73 287.68 475.84 287.47L486.28 266.38L471.79 269.73L461.72 298.45L469.81 296.85C469.85 296.84 469.89 296.84 469.93 296.84M459.5 325.69C459.41 325.69 459.3 325.67 459.21 325.62C458.93 325.47 458.8 325.13 458.91 324.83L468.94 298.31L460.88 299.9C460.66 299.95 460.43 299.87 460.28 299.7C460.13 299.52 460.09 299.29 460.16 299.07L470.71 268.98C470.78 268.77 470.95 268.62 471.16 268.57L487.29 264.84C487.53 264.79 487.78 264.87 487.93 265.06C488.09 265.26 488.11 265.52 488 265.74L477.52 286.92L485.64 285.57C485.89 285.53 486.14 285.64 486.28 285.86C486.41 286.07 486.41 286.34 486.27 286.55L460.03 325.41C459.91 325.59 459.71 325.69 459.5 325.69M693.9 263.32C694.09 263.32 694.27 263.41 694.39 263.55C694.54 263.72 694.57 263.97 694.5 264.18L685.98 286.7L708.36 253.55L700.48 254.86C700.25 254.9 700.01 254.81 699.87 254.62C699.73 254.43 699.7 254.17 699.81 253.96L710.25 232.86L695.76 236.22L685.69 264.93L693.78 263.34C693.82 263.33 693.86 263.32 693.9 263.32M683.47 292.18C683.38 292.18 683.27 292.16 683.18 292.11C682.9 291.96 682.77 291.62 682.88 291.32L692.91 264.8L684.85 266.39C684.62 266.43 684.39 266.36 684.25 266.18C684.1 266.01 684.05 265.77 684.13 265.56L694.68 235.47C694.75 235.27 694.92 235.11 695.14 235.06L711.26 231.33C711.5 231.27 711.75 231.36 711.9 231.55C712.05 231.75 712.08 232.01 711.97 232.23L701.49 253.41L709.61 252.06C709.86 252.02 710.11 252.13 710.25 252.34C710.38 252.55 710.38 252.83 710.24 253.04L684 291.9C683.88 292.08 683.68 292.18 683.47 292.18")); x.restore(); }
    x.textAlign = 'center';
    if (d.type === 'ach') {
      const a = d.a;
      x.fillStyle = '#e7ecf3'; fitFont(x, a.big, a.big.length > 3 ? 400 : 560, D, 900); x.fillText(a.big, W / 2, 1080);
      x.fillStyle = '#f400a0'; fitFont(x, a.unit, 130, D, 900); x.fillText(a.unit, W / 2, 1230);
      x.fillStyle = '#c9d1dc'; x.font = '500 52px ' + B; wrapText(x, a.cap, W / 2, 1320, 860, 66);
    } else {
      const [ia, ib] = await Promise.all([loadImg(d.a.src), loadImg(d.b.src)]);
      const pw = 420, ph = 640, y = 470;
      [[d.a, ia, 90, 'ANTES'], [d.b, ib, W - 90 - pw, 'AHORA']].forEach(([f, im, px, lab]) => {
        x.save(); rrect(x, px, y, pw, ph, 36); x.clip();
        if (im) coverDraw(x, im, px, y, pw, ph);
        else { const gg = x.createLinearGradient(px, y, px + pw, y + ph); gg.addColorStop(0, f.c[0]); gg.addColorStop(1, f.c[1]); x.fillStyle = gg; x.fillRect(px, y, pw, ph); x.fillStyle = 'rgba(255,255,255,.35)'; x.font = '500 34px ' + B; x.fillText('Foto de ejemplo', px + pw / 2, y + ph / 2); }
        x.restore();
        x.fillStyle = lab === 'AHORA' ? '#f400a0' : '#e7ecf3'; x.font = 'condensed 800 64px ' + D; x.fillText(lab, px + pw / 2, y + ph + 90);
        x.fillStyle = '#8b95a6'; x.font = '500 40px ' + B; x.fillText(f.d, px + pw / 2, y + ph + 145);
      });
      x.fillStyle = '#e7ecf3'; fitFont(x, semanasEntre(d.a.d, d.b.d).toUpperCase(), 130, D, 900); x.fillText(semanasEntre(d.a.d, d.b.d).toUpperCase(), W / 2, 1440);
      x.fillStyle = '#c9d1dc'; x.font = '500 50px ' + B; x.fillText('de constancia', W / 2, 1515);
    }
    x.fillStyle = '#8b95a6'; x.font = '500 42px ' + B; x.fillText(d.noSede ? 'Martina' : 'Martina · Sede ' + miSede, W / 2, d.type === 'ach' ? 1520 : 1620);
    x.fillStyle = '#07b0f2'; fitFont(x, 'WELCOME TO THE CLUB', 104, D, 920); x.fillText('WELCOME TO THE CLUB', W / 2, 1770);
    x.fillStyle = '#e7ecf3'; x.font = '700 44px ' + B; x.fillText('@vivafithouse', W / 2, 1845);
  }
  function openStory(d){ $('#storyOv').hidden = false; drawStory(d); }
  $('#stShare').addEventListener('click', () => {
    const fallback = () => toast('En el celular se abre Instagram');
    try {
      $('#storyCv').toBlob(async blob => {
        try {
          const file = new File([blob], 'viva-logro.png', { type:'image/png' });
          if (navigator.canShare && navigator.canShare({ files:[file] })) { await navigator.share({ files:[file], text:'Sentite bien. @vivafithouse' }); toast('Historia lista para publicar'); }
          else fallback();
        } catch(err) { if (!err || err.name !== 'AbortError') fallback(); }
      }, 'image/png');
    } catch(_) { fallback(); }
  });
  $('#stClose').addEventListener('click', () => $('#storyOv').hidden = true);

//#bloque 190
  // Compartir la racha desde Progreso; volver desde las primeras 4 semanas
  $('#onbBack').addEventListener('click', () => go(prevScr === 'onboarding' ? 'nuevo' : prevScr));

//#bloque 240
  // ===== v32 · Sistema de metas: la semana es el paso, el mes es la meta, el mural es tu trayectoria (claude/sistema-incentivos.md) =====
  // Colores del neón del mural: literales, porque el mural es un objeto oscuro también en modo claro
  const NEON = { z1:'#ffe94a', z2:'#07b0f2', z3:'#f400a0', flow:'url(#mgFlow)', blanco:'#f4f6ff', cian:'#07b0f2', mag:'#f400a0' };
  const PI_DIM = {"whey": [87.7, 97.2], "manzana": [70.7, 73.6], "botella": [43.4, 80.5], "mancuerna": [68.7, 72.6], "pesa": [75.9, 83.5], "rock": [127.4, 148.7], "reloj": [79.8, 119.9], "brazo": [117.9, 110.6], "smile": [76.4, 72.0], "yeah": [257.4, 137.6], "estallido": [90.7, 86.6], "rayoP": [62.1, 103.7], "play": [38.7, 37.9], "basquet": [120.8, 120.8], "silbato": [67.7, 45.4], "zapatilla": [108, 66], "rayo": [45.8, 93.0]};
  const TRAMO_NEON = ['z1', 'z2', 'z3', 'flow'];
  const MES_ABR = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  // Íconos de línea del vocabulario de las paredes de Viva (grilla de 24)
  const ICO = {
    mancuerna:'<path d="M6.5 8v8M9.5 6v12M14.5 6v12M17.5 8v8M9.5 12h5M4 10v4M20 10v4"/>',
    pesa:'<path d="M9 9V7.5a3 3 0 0 1 6 0V9"/><path d="M7.5 10.5h9l1.2 3A6 6 0 0 1 12 21a6 6 0 0 1-5.7-7.5z"/>',
    zapatilla:'<path d="M3 17v-4.5l4-1 2.5-4 3.5 3.5 4.5 1.2c2 .5 3.5 1.8 3.5 3.8z"/><path d="M3 17v1.5h18V17M8 12l1.5 1.5M10.5 10.5 12 12"/>',
    botella:'<path d="M10 2.5h4V5l1.5 2v13a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V7L10 5z"/><path d="M8.5 11h7"/>',
    manzana:'<path d="M12 7.5c-2-1.6-6.5-1.2-6.5 3.8 0 4.3 3 9.2 6.5 9.2s6.5-4.9 6.5-9.2c0-5-4.5-5.4-6.5-3.8z"/><path d="M12 7.5c0-2 1-3.5 3-4"/>',
    corazon:'<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.4 12 20 12 20z"/>',
    soga:'<path d="M5 3.5v5M19 3.5v5"/><path d="M5 8.5c0 9.5 14 9.5 14 0"/>',
    auriculares:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6.5" rx="1.5"/><rect x="17" y="14" width="4" height="6.5" rx="1.5"/>',
    joystick:'<path d="M6.5 8.5h11a4 4 0 0 1 3.8 5.2l-.9 3a2.5 2.5 0 0 1-4.3.8L14.6 16H9.4L8 17.5a2.5 2.5 0 0 1-4.3-.8l-.9-3A4 4 0 0 1 6.5 8.5z"/><path d="M7.5 11v3.5M5.8 12.8h3.4M15.8 12h.01M17.8 14h.01"/>',
    crono:'<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3h4M12 3v3.5M18 7l1.5-1.5"/>',
    estrella:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    regalo:'<path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9C10 5 6 5 6 7.5S12 9 12 9zM12 9c2-4 6-4 6-1.5S12 9 12 9z"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8.3 14.2c2 2.4 5.4 2.4 7.4 0M9 9.4v.8M15 9.4v.8"/>',
    rayo:'<path d="M13.5 2 4.5 14h7l-2 8 9-12h-7z"/>',
    trofeo:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
    pin:'<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
    pulso:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    disco:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>'
  };
  // Un ícono por mes, fijo en el calendario
  const MES_ICO = ['botella','manzana','whey','pesa','rock','reloj','basquet','silbato','play','brazo','zapatilla','estallido'];
  // Escalera de fichas: semanas cumplidas acumuladas (nunca consecutivas, nunca vuelve a cero)
  const FICHAS = [
    { n:0, k:'welcome', nom:'la bienvenida', art:'la bienvenida' },
    { n:1, k:'smile', nom:'Smile', art:'tu smile' },
    { n:4, k:'yeah', nom:'YEAH!', art:'tu YEAH!' },
    { n:12, k:'rayo', nom:'Rayo', art:'tu rayo' },
    { n:24, k:'reloj', nom:'Reloj con latido', art:'tu reloj con latido' },
    { n:36, k:'mancuerna', nom:'Mancuerna', art:'tu mancuerna' },
    { n:48, k:'viva', nom:'VIVA', art:'el VIVA' }
  ];
  const SORP = { semcomp:['estallido','Primera Semana completa'], record:['brazo','Primer récord en tu objetivo'], sede:['pin','Primera vez en otra sede'], afuera:['zapatilla','Primer cardio de afuera'], inbody:['reloj','Primer InBody'] };
  // Estado de la socia para el mural (simulado; en producción sale de las semanas cumplidas verificadas)
  const HOY_D = ahora(), semAtras = w => new Date(HOY_D.getTime() - w * 7 * 864e5);
  const mesAtras = k => { const d = new Date(HOY_D.getFullYear(), HOY_D.getMonth() - k, 1); return { m:d.getMonth(), y:d.getFullYear() }; };
  const MURALES = {
    nueva: () => ({ sem:0, alta:new Date(HOY_D.getTime() - 3 * 864e5), meses:[], sorp:[], prevMes:0 }),
    '3m': () => ({ sem:10, alta:semAtras(13), meses:[Object.assign(mesAtras(2), { t:1 }), Object.assign(mesAtras(1), { t:2, c:true })], sorp:[['semcomp', semAtras(9)], ['afuera', semAtras(4)]], prevMes:2, prevW:[false, true] }),
    '1a': () => ({ sem:49, alta:semAtras(54), meses:[[11,0],[10,1],[8,1],[7,2],[6,2],[4,2],[3,3],[2,3],[1,3]].map(([k, t]) => Object.assign(mesAtras(k), { t:t, c:[7, 3, 1].includes(k) })), sorp:[['semcomp', semAtras(50)], ['afuera', semAtras(44)], ['inbody', semAtras(41)], ['record', semAtras(30)], ['sede', semAtras(12)]], prevMes:2, prevW:[true, false] })
  };
  var MURK = '3m', MUR = Object.assign(MURALES['3m'](), { cerrado:false }), BEN_MES = true, muralLista = false, muralNuevo = null;
  // Semanas cumplidas acumuladas: las cerradas + la de esta semana si ya está cumplida
  const semAcum = () => MUR ? MUR.sem + (semCumplida() ? 1 : 0) : 0;
  function fichaProx(){ if (!MUR) return null; const n = semAcum(); let f = FICHAS.find(x => x.n > n); if (!f) { const k = Math.floor(n / 48) + 1; f = { n:k * 48, k:'viva', nom:(k === 2 ? 'tu segundo VIVA' : 'tu VIVA número ' + k), art:(k === 2 ? 'tu segundo VIVA' : 'tu VIVA número ' + k) }; } return { f:f, falta:f.n - n, art:f.art }; }
  // El mes: semanas cumplidas que ya cerraron en este mes + la actual si está cumplida (cada semana cuenta para el mes en que termina)
  function mesMarcas(){ if (!MUR) return 0; return MUR.cerrado ? 4 : Math.min(4, MUR.prevMes + (semCumplida() ? 1 : 0)); }
  function mesHtml(){
    if (!MUR) return '';
    const n = mesMarcas(), c = eqFlow ? 'url(#mmFlow)' : eqCol, dk = !$('.app').matches('[data-mode="light"]');
    let d = '<svg width="58" height="12" viewBox="0 0 58 12" aria-hidden="true"><defs><linearGradient id="mmFlow" x1="0" x2="1"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient>' + (dk ? '<filter id="mmGl" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2"/></filter>' : '') + '</defs>';
    for (let i = 0; i < 4; i++) { const cx = 6 + i * 15.3;
      d += i < n ? (dk ? '<circle cx="' + cx + '" cy="6" r="5" fill="' + c + '" opacity=".7" filter="url(#mmGl)"/>' : '') + '<circle cx="' + cx + '" cy="6" r="4.4" fill="' + c + '"/>' + (dk ? '<circle cx="' + cx + '" cy="6" r="1.6" fill="#fff" opacity=".7"/>' : '')
                 : '<circle cx="' + cx + '" cy="6" r="4.2" fill="' + c + '" fill-opacity=".1" stroke="' + c + '" stroke-opacity=".35" stroke-width="1.1"/>'; }
    return '<button class="mesHit" id="mesHit" aria-label="' + Cap(mesNombre()) + ': ' + n + ' de 4 semanas cumplidas para tu Mes cumplido. Ver tu mural.">' + MES_ABR[HOY_D.getMonth()] + d + '</svg></button>';
  }

  // ----- El mural: papel tapiz de íconos apagados + piezas de neón en collage -----
  function rnd(seed){ let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  // Papel tapiz: el patrón oficial de Viva (manual, p. 15), apagado: línea fina y baja opacidad
  function tapiz(W, H, seed){
    const th = W * 595 / 842; let g = '<g style="color:#d9dcff" opacity=".15">';
    for (let k = 0, y = -th * (seed % 3) * .12; y < H; k++, y += th)
      g += (k % 2 ? [-W / 2, W / 2] : [0]).map(x => '<use href="#patViva" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + W + '" height="' + th.toFixed(1) + '"/>').join('');
    return g + '</g>';
  }
  // Neón con los íconos del manual: halo ancho, halo cercano, tubo de color y brillo claro
  function neonSym(k, col, sz){
    const d = PI_DIM[k], sc = sz / Math.max(d[0], d[1]), w = d[0] * sc, h = d[1] * sc, fl = String(col).indexOf('url') === 0;
    const u = (c, ex) => '<use href="#pi-' + k + '" x="' + (-w / 2).toFixed(1) + '" y="' + (-h / 2).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" style="color:' + c + '"' + ex + '/>';
    return '<g>' + u(fl ? NEON.cian : col, ' filter="url(#mgB3)" opacity=".55"') + u(fl ? NEON.mag : col, ' filter="url(#mgH)" opacity=".9"') + u(fl ? NEON.mag : col, ' filter="url(#mgB2)" opacity=".8"') + u(fl ? NEON.z1 : col, ' filter="url(#mgB1)" opacity=".9"') + u(fl ? NEON.cian : col, '') + u('#fff', ' opacity=".4"') + '</g>';
  }
  const neonAny = (k, col, sz) => PI_DIM[k] ? neonSym(k, col, sz) : neonIco(k, col, sz / 24);
  // Ícono chico para listas: el del manual si existe, si no, el de línea
  const icoSm = (k, col, px) => PI_DIM[k] ? '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#pi-' + k + '" width="24" height="24" style="color:' + col + '"/></svg>'
    : '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + '</svg>';
  // Neón: halo ancho, halo cercano, tubo de color y núcleo claro
  function neonIco(k, col, sc){
    const t = ICO[k];
    return '<g fill="none" stroke="' + col + '" stroke-linecap="round" stroke-linejoin="round" transform="scale(' + sc + ') translate(-12 -12)">' +
      '<g filter="url(#mgB3)" opacity=".5" stroke-width="5">' + t + '</g><g filter="url(#mgB2)" opacity=".8" stroke-width="3.6">' + t + '</g><g filter="url(#mgB1)" opacity=".9" stroke-width="2">' + t + '</g><g stroke-width="1.5">' + t + '</g><g stroke="#fff" stroke-width=".55" opacity=".8">' + t + '</g></g>';
  }
  // Letras de los logros: "cartel" = letra hueca de tubo de neón encendido con halo (como el cartel WELCOME TO THE CLUB); "relleno" = letra llena con brillo
  var MUR_TXT = 'cartel';
  function neonTxt(txt, col, fs, opt){
    opt = opt || {};
    if (MUR_TXT === 'cartel') {
      const c = 'x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="Archivo, Arial Narrow, sans-serif" font-stretch="75%" font-weight="800" font-size="' + fs + '" letter-spacing="' + (fs * .05).toFixed(1) + '" fill="none" stroke-linejoin="round"';
      const tube = opt.white ? '#fff' : col;
      return '<g><text ' + c + ' stroke="' + col + '" stroke-width="' + (fs * .34).toFixed(1) + '" opacity=".5" filter="url(#mgB3)">' + txt + '</text>' +
        '<text ' + c + ' stroke="' + col + '" stroke-width="' + (fs * .22).toFixed(1) + '" opacity=".85" filter="url(#mgB2)">' + txt + '</text>' +
        '<text ' + c + ' stroke="' + col + '" stroke-width="' + (fs * .11).toFixed(1) + '" filter="url(#mgB1)">' + txt + '</text>' +
        '<text ' + c + ' stroke="' + tube + '" stroke-width="' + (fs * .07).toFixed(1) + '">' + txt + '</text>' +
        '<text ' + c + ' stroke="#fff" stroke-width="' + (fs * .028).toFixed(2) + '" opacity=".95">' + txt + '</text></g>';
    }
    const a = 'x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="Archivo, Arial Narrow, sans-serif" font-stretch="75%" font-weight="700" font-size="' + fs + '" letter-spacing="' + (opt.ls || 1) + '"';
    const fill = opt.white ? '#fff' : col;
    return '<g><text ' + a + ' fill="none" stroke="' + col + '" stroke-width="' + (fs * .3).toFixed(1) + '" opacity=".45" filter="url(#mgB3)">' + txt + '</text><text ' + a + ' fill="none" stroke="' + col + '" stroke-width="' + (fs * .16).toFixed(1) + '" opacity=".75" filter="url(#mgB2)">' + txt + '</text>' +
      '<text ' + a + ' fill="none" stroke="' + col + '" stroke-width="' + (fs * .06).toFixed(1) + '" opacity=".85" filter="url(#mgB1)">' + txt + '</text>' +
      '<text ' + a + ' fill="' + fill + '">' + txt + '</text>' + (opt.white ? '' : '<text ' + a + ' fill="#fff" opacity=".28">' + txt + '</text>') + '</g>';
  }
  // Cada pieza: su dibujo (centrado en 0,0), su caja aproximada y su texto
  function pieza(e, big){
    const k = big ? 1.28 : 1;
    if (e.tipo === 'mes') {
      const col = NEON[TRAMO_NEON[e.t]], nm = MES_ABR[e.m], fs = 30 * k, tw = nm.length * fs * (MUR_TXT === 'cartel' ? 0.6 : 0.52), w = tw + 40 * k;
      const rw = e.c ? 24 * k : 0, W2 = w + rw;
      return { w:W2, h:46 * k, g:'<g transform="translate(' + (-W2 / 2 + 15 * k) + ' 0)">' + neonSym(MES_ICO[e.m], col, 32 * k) + '</g><g transform="translate(' + (-W2 / 2 + 40 * k + tw / 2) + ' 0)">' + neonTxt(nm, col, fs) + '</g>' + (e.c ? '<g transform="translate(' + (W2 / 2 - 12 * k) + ' -2)">' + neonSym('rayo', NEON.z1, 30 * k) + '</g>' : '') };
    }
    if (e.tipo === 'ficha') {
      const f = e.f;
      if (f.k === 'welcome') return { w:178 * k, h:62 * k, g:'<g transform="translate(0 -14)">' + neonTxt('WELCOME', NEON.cian, 30 * k, { white:true, ls:3 }) + '</g><g transform="translate(0 ' + (17 * k) + ')">' + neonTxt('TO THE CLUB', NEON.mag, 18 * k, { white:true, ls:2 }) + '</g>' };
      if (f.k === 'yeah') return { w:112 * k, h:60 * k, g:neonSym('yeah', NEON.mag, 112 * k) };
      if (f.k === 'viva') {
        let b = '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'; const pts = [];
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = (i % 2 ? 40 : 62) * k; pts.push((Math.cos(a) * r * 1.35).toFixed(1) + ',' + (Math.sin(a) * r * .72).toFixed(1)); }
        const poly = '<polygon points="' + pts.join(' ') + '"/>';
        b += '<g stroke="' + NEON.mag + '" stroke-width="3" opacity=".55" filter="url(#mgB2)">' + poly + '</g><g stroke="' + NEON.mag + '" stroke-width="1.8">' + poly + '</g><g stroke="#fff" stroke-width=".6" opacity=".7">' + poly + '</g>';
        b += '<g transform="scale(.8)" stroke="' + NEON.cian + '" stroke-width="1.6" opacity=".9"><polygon points="' + pts.map(q => q.split(',').map(v => (v * 0.62).toFixed(1)).join(',')).join(' ') + '"/></g></g>';
        const lw = 118 * k, lh = 57.5 * k, lu = (c, ex) => '<use href="#vLogo" x="' + (-lw / 2).toFixed(1) + '" y="' + (-lh / 2).toFixed(1) + '" width="' + lw.toFixed(1) + '" height="' + lh.toFixed(1) + '" style="color:' + c + '"' + ex + '/>';
        return { w:170 * k, h:96 * k, g:b + lu(NEON.cian, ' filter="url(#mgB2)" opacity=".85"') + lu(NEON.cian, ' filter="url(#mgB1)"') + lu('#fff', '') };
      }
      const col = { smile:NEON.cian, rayo:NEON.cian, corazon:NEON.mag, reloj:NEON.mag, mancuerna:NEON.blanco }[f.k];
      return { w:64 * k, h:64 * k, g:neonAny(f.k, col, 60 * k) };
    }
    return { w:32 * k, h:32 * k, g:neonAny(SORP[e.s][0], NEON.mag, 30 * k) };
  }
  // Logros con fecha, del más nuevo al más viejo
  function muralEventos(){
    const ev = [];
    FICHAS.forEach(f => { if (f.n <= MUR.sem) ev.push({ tipo:'ficha', f:f, d:f.n === 0 ? MUR.alta : new Date(MUR.alta.getTime() + Math.round(f.n * 7 * 1.08) * 864e5), id:'f' + f.n }); });
    MUR.meses.forEach(m => ev.push({ tipo:'mes', m:m.m, y:m.y, t:m.t, c:!!m.c, d:new Date(m.y, m.m + 1, 0), id:'m' + m.y + '-' + m.m }));
    MUR.sorp.forEach(([k, d]) => ev.push({ tipo:'sorp', s:k, d:d, id:'s' + k }));
    ev.sort((a, b) => b.d - a.d);
    const h = ev.findIndex(e => e.tipo !== 'sorp'); if (h > 0) ev.unshift(ev.splice(h, 1)[0]);
    return ev;
  }
  const evNombre = e => e.tipo === 'mes' ? Cap(meses[e.m]) + (e.c ? ' · Mes completo ⚡' : ' · Mes cumplido') : e.tipo === 'ficha' ? (e.f.n === 0 ? 'Bienvenida · Welcome to the club' : e.f.n + (e.f.n === 1 ? ' semana cumplida' : ' semanas cumplidas') + ' · ' + e.f.nom) : SORP[e.s][1];
  const evFecha = e => meses[e.d.getMonth()].slice(0, 3) + ' ' + e.d.getFullYear();
  function muralSvg(evs, W, seed){
    // Collage: filas con piezas levemente giradas; la más nueva, más grande y más brillante
    const R = rnd(seed + 7), rows = []; let row = [], rw = 0;
    const ps = evs.map((e, i) => Object.assign({ e:e, big:i === 0 && evs.length > 1 }, pieza(e, i === 0 && evs.length > 1)));
    ps.forEach(pc => { const gap = 16 + R() * 10; if (row.length && rw + gap + pc.w > W - 24) { rows.push(row); row = []; rw = 0; } rw += (row.length ? gap : 0) + pc.w; pc.gap = gap; row.push(pc); });
    if (row.length) rows.push(row);
    let y = 26, g = '';
    rows.forEach(r => {
      const h = Math.max.apply(null, r.map(x => x.h)), tot = r.reduce((a, x, i) => a + x.w + (i ? x.gap : 0), 0);
      let x = (W - tot) / 2 + (R() - 0.5) * 12;
      r.forEach((pc, i) => {
        if (i) x += pc.gap; const cx = x + pc.w / 2, cy = y + h / 2 + (R() - 0.5) * 10, rot = (R() - 0.5) * 12;
        g += '<g class="mpz' + (muralNuevo === pc.e.id ? ' mnew' : '') + '" opacity="' + (pc.big || evs.length === 1 ? 1 : .95) + '" transform="translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')">' + pc.g + '</g>';
        x += pc.w;
      });
      y += h + 22;
    });
    const H = Math.max(evs.length === 1 ? 220 : 280, y + 10);
    // Si hay una sola pieza (socia nueva), va centrada en la pared
    if (evs.length === 1) g = g.replace(/translate\(([\d.]+) ([\d.]+)\) rotate/, (m0, a) => 'translate(' + a + ' ' + (H / 2).toFixed(1) + ') rotate');
    return '<svg viewBox="0 0 ' + W + ' ' + H.toFixed(0) + '" role="img" aria-label="Tu mural VIVA: ' + evs.map(evNombre).join('; ') + '"><defs><filter id="mgB1" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="mgB2" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="5"/></filter><filter id="mgB3" filterUnits="userSpaceOnUse" x="-400" y="-240" width="800" height="480"><feGaussianBlur stdDeviation="11"/></filter><filter id="mgH" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feMorphology operator="dilate" radius="1.6"/><feGaussianBlur stdDeviation="3.5"/></filter><linearGradient id="mgFlow" x1="0" x2="1"><stop offset="0" stop-color="#ffe94a"/><stop offset=".5" stop-color="#07b0f2"/><stop offset="1" stop-color="#f400a0"/></linearGradient></defs>' +
      tapiz(W, H, seed) + g + '</svg>';
  }
  function renderMural(){
    const evs = muralEventos(), fx = fichaProx();
    $('#mural').innerHTML = muralSvg(evs, 360, 11);
    $('#semAcum').textContent = semAcum();
    $('#muralNext').innerHTML = '<svg width="16" height="22" viewBox="0 0 16 24" aria-hidden="true" style="flex-shrink:0"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="var(--yel)"/></svg><span>' +
      (semAcum() === 0 ? 'Tu primera ficha es <b>el smile</b>: se enciende con tu primera semana cumplida.' : 'Tu próxima ficha: <b>' + fx.f.nom + '</b>. Te ' + (fx.falta === 1 ? 'falta 1 semana cumplida' : 'faltan ' + fx.falta + ' semanas cumplidas') + '.') + '</span>';
    $('#muralList').innerHTML = evs.map(e => '<div><span class="mli">' + (e.tipo === 'mes' ? icoSm(MES_ICO[e.m], e.t === 3 ? '#07b0f2' : NEON[TRAMO_NEON[e.t]], 28) : e.tipo === 'ficha' ? icoSm({ welcome:'regalo', smile:'smile', yeah:'yeah', rayo:'rayo', corazon:'corazon', reloj:'reloj', mancuerna:'mancuerna', viva:'rayo' }[e.f.k], '#07b0f2', 28) : icoSm(SORP[e.s][0], '#f400a0', 24)) + '</span>' +
      '<span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + evNombre(e) + '</span><span class="small muted">' + Cap(evFecha(e)) + (e.tipo === 'mes' ? ' · terminaste en ' + zonas()[e.t][1] : '') + '</span></span><button data-mshare="' + e.id + '">Compartir</button></div>').join('');
    $('#muralList').hidden = !muralLista; $('#mural').hidden = muralLista;
    $('#muralLista').textContent = muralLista ? 'Ver el mural' : 'Ver como lista';
  }
  function shareEv(e){
    const a = e.tipo === 'mes' ? (e.c ? { big:MES_ABR[e.m], unit:'MES COMPLETO ⚡', cap:'4 semanas completas en el mes', feedT:'Mes completo' } : { big:MES_ABR[e.m], unit:'MES CUMPLIDO ⚡', cap:'4 semanas cumplidas en el mes', feedT:'Mes cumplido' })
      : e.tipo === 'ficha' ? (e.f.n === 0 ? { big:'VIVA', unit:'ARRANQUÉ ⚡', cap:'empecé mi mural VIVA', feedT:'Bienvenida' } : { big:String(e.f.n), unit:(e.f.n === 1 ? 'SEMANA CUMPLIDA' : 'SEMANAS CUMPLIDAS') + ' ⚡', cap:'mi ficha VIVA: ' + e.f.nom.toLowerCase(), feedT:e.f.n + ' semanas cumplidas' })
      : { big:'⚡', unit:SORP[e.s][1].toUpperCase(), cap:'en mi mural VIVA', feedT:SORP[e.s][1] };
    openStory({ type:'ach', a:a, noSede:true });
  }
  $('#muralLista').addEventListener('click', () => { muralLista = !muralLista; renderMural(); });
  $('#muralList').addEventListener('click', e => { const b = e.target.closest('[data-mshare]'); if (!b) return; const ev = muralEventos().find(x => x.id === b.dataset.mshare); if (ev) shareEv(ev); });
  $('#muralShare').addEventListener('click', () => { const nm = MUR.meses.length + (MUR.cerrado ? 0 : 0);
    openStory({ type:'ach', a:{ big:String(semAcum()), unit:'SEMANAS CUMPLIDAS ⚡', cap:'mi mural VIVA' + (nm ? ': ' + nm + (nm === 1 ? ' mes cumplido' : ' meses cumplidos') : ''), feedT:'Mi mural VIVA' }, noSede:true }); });
  document.addEventListener('click', e => { if (e.target.closest('#mesHit')) { renderMural(); go('progreso'); setTimeout(() => { const c = $('#muralCard'); if (c) c.scrollIntoView({ block:'start' }); }, 30); } });

//#bloque 260
  // ----- El momento del cartel: al cerrarse un Mes completo -----
  function abrirCartel(e){
    const pc = pieza(e, true), W = 340, H = 190;
    $('#cartelWall').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><defs><filter id="mgB1" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="mgB2" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="5"/></filter><filter id="mgB3" filterUnits="userSpaceOnUse" x="-400" y="-240" width="800" height="480"><feGaussianBlur stdDeviation="11"/></filter><filter id="mgH" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feMorphology operator="dilate" radius="1.6"/><feGaussianBlur stdDeviation="3.5"/></filter><linearGradient id="mgFlow" x1="0" x2="1"><stop offset="0" stop-color="#ffe94a"/><stop offset=".5" stop-color="#07b0f2"/><stop offset="1" stop-color="#f400a0"/></linearGradient></defs>' +
      tapiz(W, H, 29) + '<g class="cpiece" transform="translate(' + W / 2 + ' ' + H / 2 + ') scale(1.35)">' + pc.g + '</g></svg>';
    $('#cartelTag').innerHTML = '<span>' + (e.c ? '¡Mes completo! ⚡' : '¡Mes cumplido!') + '</span>';
    $('#cartelTxt').textContent = Cap(meses[e.m]) + (e.c ? ': 4 semanas completas. Terminaste el mes en ' + zonas()[e.t][1] + ' y tu cartel suma el rayo y brilla con todo.' : ': 4 semanas cumplidas. Terminaste el mes en ' + zonas()[e.t][1] + ' y tu cartel ya está encendido en tu mural.');
    $('#cartelBen').hidden = !BEN_MES;
    $('#cartelBen').innerHTML = '<span><strong>Tu beneficio del mes:</strong> 25% en Mili Integral (Club VIVA), por tu Mes cumplido. Lo tenés en Tus premios.</span>';
    $('#cartelOv').hidden = false; $('#cartelOv').dataset.ev = e.id;
  }
  $('#cartelX').addEventListener('click', () => { $('#cartelOv').hidden = true; });
  $('#cartelMural').addEventListener('click', () => { $('#cartelOv').hidden = true; renderMural(); go('progreso'); });
  $('#cartelShare').addEventListener('click', () => { const ev = muralEventos().find(x => x.id === $('#cartelOv').dataset.ev); if (ev) shareEv(ev); });


//#bloque 335
  // ===== T1 · Progreso según la experiencia (Arranco · Habitual · Avanzado; menores como Arranco) =====
  // Fuentes: entries (entrenamientos, semanas), duración de la sesión en la app (minutos), registro de series (primeras veces, avance, récords, volumen).
  var PROG_MIN = 0;
  function expProg(){ return (typeof esMenor === 'function' && esMenor()) ? 'arranco' : (typeof EXP === 'string' ? EXP : 'habitual'); }
  const durDia = d => 48 + (d * 37) % 19; // simulado: minutos de cada sesión registrada
  function primerasVeces(){
    const L = Object.keys(hist).map(k => ({ t:'Primera vez en ' + lib[k].n, f:hist[k][0][0] }));
    if (MUR && MUR.sem > 0) L.push({ t:'Primera semana cumplida', f:dmLbl(new Date(MUR.alta.getTime() + 7 * 864e5)) });
    return L.map(x => Object.assign(x, { dd:diasDesde(x.f) })).sort((a, b) => a.dd - b.dd);
  }
  function avancePalabras(){
    const hoyPrimero = k => hist[k][hist[k].length - 1][0] === hoyLbl ? 0 : 1;
    return Object.keys(hist).sort((a, b) => hoyPrimero(a) - hoyPrimero(b)).map(k => {
      const h = hist[k], a = h[0][1], b = h[h.length - 1][1]; if (b <= a) return null;
      const w = Math.max(1, Math.round(diasDesde(h[0][0]) / 7)), cuando = w < 8 ? w + (w === 1 ? ' semana' : ' semanas') : Math.round(w / 4.3) + ' meses';
      return 'En ' + lib[k].n + ' pasaste de ' + (a ? fmtN(a) : 'peso corporal') + ' a ' + fmtN(b) + (esTiempo(k) ? ' segundos' : ' kg') + ' en ' + cuando + '.';
    }).filter(Boolean);
  }
  function renderSemanas(){
    const off = (todayWd + 6) % 7; let c = hoyEntreno ? 1 : 0;
    for (let d = 1; d <= off; d++) if (entrenoDia.has(d)) c++;
    const W = semWeeks().slice(1).map(x => ({ n:x.n, f:x.f })).concat([{ n:c, f:'Esta', now:true }]);
    $('#wkChart').innerHTML = '<span class="goal"></span>' + W.map(x => '<i class="' + (x.now ? 'now' : x.n >= META_SEM ? 'hit' : '') + '" style="height:' + Math.max(4, Math.min(118, Math.round(x.n / META_SEM * 100))) + 'px"></i>').join('');
    $('#wkChart').setAttribute('aria-label', 'Últimas 8 semanas: ' + W.map(x => x.n).join(', ') + ' entrenamientos. Meta: ' + META_SEM + ' por semana');
    $('#wkAxis').innerHTML = W.map(x => '<span>' + x.f + '</span>').join('');
    $('#wkMeta').textContent = 'Meta: ' + META_SEM;
  }
  function renderProg(){
    const x = expProg(), hoy = ahora(), dm = hoy.getDate(); let n = 0, mins = 0;
    for (let d = 1; d < dm; d++) if (entrenoDia.has(d)) { n++; mins += durDia(d); }
    if (hoyEntreno) { n++; mins += PROG_MIN || 55; }
    $('#mesCount').textContent = n; $('#mesLbl').textContent = 'entrenamientos en ' + mesTxt(hoy.getMonth());
    const pv = primerasVeces();
    if (x === 'arranco') { $('#tile3n').textContent = pv.length; $('#tile3l').textContent = pv.length === 1 ? 'primera vez' : 'primeras veces'; }
    else { $('#tile3n').textContent = n ? Math.round(mins / n) : '—'; $('#tile3l').textContent = 'min por sesión'; }
    renderSemanas();
    $('#bienCard').hidden = x === 'avanzado'; $('#palCard').hidden = x !== 'habitual';
    $('#avCard').hidden = x !== 'avanzado'; $('#recBox').hidden = x !== 'avanzado'; $('#volCard').hidden = x !== 'avanzado';
    $('#bienTxt').textContent = 'Este mes viniste ' + n + (n === 1 ? ' vez' : ' veces') + '. Lo estás haciendo bien ⚡';
    $('#pvList').innerHTML = pv.slice(0, 4).map(p => '<div><span style="flex:1;font-weight:500">' + p.t + '</span><span class="small muted">' + (p.dd === 0 ? 'Hoy' : p.f) + '</span></div>').join('');
    const ap = avancePalabras();
    $('#palList').innerHTML = ap.length ? ap.slice(0, 4).map(t => '<div><span style="flex:1;line-height:1.4">' + t + '</span></div>').join('') : '<div><span class="muted" style="flex:1">Cuando registres tus series, acá ves cuánto avanzás.</span></div>';
    if (x === 'avanzado') renderCarga();
  }
  renderProg();
