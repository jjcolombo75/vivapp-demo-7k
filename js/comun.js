/* Vivapp · Utilidades, fecha, Tu ritmo (modelo de forma), Tu semana, sesión registrada y el arranque final.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 010
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  let modo = 'socio';
  const withNav = ['inicio','hoy','rutinas','progreso','muralScr','beneficios','social','plan'];
  let curScr = 'login', prevScr = 'login';

//#bloque 015
  // T16 · SISTEMA: quién es cada componente visual. Única lista; css/sistema.css estiliza solo las clases k-*.
  // Markup nuevo: usá la clase k-* directamente. Para sacar algo de la lista, cambiá su markup, no esta lista.
  var SISTEMA = {
    'k-caja': '.card,.tile,.promo,.choice,.gcard,.slide,.passcard,.list,.post,.pcard,.ben,.cup,.sede,.wk,.slot,.rest,.smaq',
    'k-btn': '.btn:not(.ghost):not(.light),.qrbtn,.passbar,.sendb,.dbtn,.salalisto',
    'k-btn2': '.btn.ghost,.btn.light,.salamic,.qchip',
    'k-barra': '.bar,.occ,.ocb,.salaprog .sp,.msbar',
    'k-elige': '.opt,.chk,.clap,.npsg button,.varopt,.tabs button,.seg button,.prvistas button,.day.sel'
  };
  function sistemaEstampar(){ Object.keys(SISTEMA).forEach(k => { $$(SISTEMA[k]).forEach(el => { if (!el.classList.contains(k)) el.classList.add(k); }); }); }
  sistemaEstampar();
  new MutationObserver(sistemaEstampar).observe(document.querySelector('.app'), { childList:true, subtree:true });

  function go(id){
    if (id !== curScr) { prevScr = curScr; curScr = id; }
    $$('.scr').forEach(s => s.hidden = s.id !== id);
    $('#nav').hidden = !withNav.includes(id);
    const ppuIds = ['ppuHome','ppuTrain'];
    $('#nav2').hidden = !ppuIds.includes(id);
    if (withNav.includes(id)) modo = 'socio'; if (ppuIds.includes(id)) modo = 'ppu';
    $$('#nav2 button').forEach(b => { if (b.dataset.go === id) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    $$('#nav button').forEach(b => { if (b.dataset.go === (['progreso','clases','rutinas','ia','entrenando'].includes(id) ? 'hoy' : id === 'muralScr' ? 'inicio' : id)) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    const body = $('#'+id+' .body'); if (body) body.scrollTop = 0;
    if (id === 'entrenando') startClock();
    if (id === 'inicio' && typeof semMarcarVisto === 'function') semMarcarVisto();
    if (typeof renderAcc === 'function' && typeof MOM !== 'undefined') { renderAcc(); avisosLater(); }
    $('.app').dataset.scr = id; if (id === 'hoy' && typeof renderEntHoy === 'function') renderEntHoy(); if (id === 'progreso') renderProg();
  }
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
    const t = e.target.closest('[data-toast]'); if (t) toast(t.dataset.toast);
  });
  $('#qrClose').addEventListener('click', () => $('#qrOverlay').hidden = true);

  let tt;
  function toast(msg){ const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(() => el.hidden = true, 2200); }

  // ===== Calendario de la demo: la FECHA se fija acá y todo lo demás se deriva (la hora es la real del teléfono) =====
  // Miércoles 18/11/2026: tercera semana del mes, dos semanas cumplidas cerradas (Tu mes 2 de 4) y Mes cumplido todavía alcanzable.
  function ahora(){ const r = new Date(); return new Date(2026, 10, 18, r.getHours(), r.getMinutes(), r.getSeconds(), r.getMilliseconds()); }
  function diaAtras(n){ const d = ahora(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; }
  function dmLbl(d){ return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
  function mesTxt(i){ return ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][((i % 12) + 12) % 12]; }
  function diasDesde(lbl){ const p = lbl.split('/').map(Number), h = ahora(); h.setHours(12, 0, 0, 0); const d = new Date(h.getFullYear(), p[1] - 1, p[0], 12); if (d > h) d.setFullYear(d.getFullYear() - 1); return Math.round((h - d) / 864e5); }

  // Fecha de la demo
  try {
    const d = ahora();
    const s = d.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
    $('#hoy').textContent = s.charAt(0).toUpperCase() + s.slice(1);
  } catch(_){}

//#bloque 230
  // ===== Tu forma · fuente: ingresos por molinete (entries de EVO) + base propia =====
  // Modelo de forma y fatiga (Banister): forma = promedio de 42 días, cansancio = promedio de 7 días.
  const cargaHist = [9800, 11200, 10400, 11900, 7600];
  // Meta personal: con plan limitado, la de su plan; con plan libre, la elige el socio (2 a 5). Martina eligió 4.
  let META_SEM = 4; const TAU_F = 42, TAU_C = 7, PLAN_TOPE = null;
  // Variantes de nombre (decisión 45): el número y el modelo son los mismos; cambian nombre, zonas y textos.
  const ZC = ['var(--z1)', 'var(--z2)', 'var(--z3)', 'var(--z4)'];
  const VARS = {
    P:{ nom:'Tus pilas VIVA', tu:'tus pilas', pl:true, z:[[0,'Pila baja'],[30,'Con pila'],[60,'Pila cargada'],[85,'A full']], col:[0,1,2,3],
        sub:'Se cargan cada vez que venís', subeT:'Se cargan cada día que venís', bajaT:'Se gastan de a poco si dejás de venir', bajaD:'Descansar un día no las gasta; una semana sin venir, sí.',
        up:(a, b) => '¡Cargaste pila! ⚡ Pasaste de ' + a + ' a ' + b + '.', hoy:'Hoy cargaste pila ⚡ Ahora toca descansar bien.',
        down:n => 'Se te están bajando las pilas. ' + (n ? 'Con ' + (n === 1 ? 'una visita' : n + ' visitas') + ' esta semana recargás ⚡' : 'Con una visita esta semana empezás a recargar ⚡'),
        paso2:'Cargá pila', baja:'bajaron', noMide:'No miden tu cuerpo ni cuánto levantás: miden cuán seguido venís. Tu cuerpo lo mide el Índice FIT, con tu medición InBody, que es voluntaria.' },
    R:{ nom:'Tu ritmo VIVA', tu:'tu ritmo', z:[[0,'Tranqui'],[30,'Parejo'],[60,'Firme'],[85,'Imparable']], col:[0,1,2,3],
        sub:'Sube cada vez que venís', subeT:'Sube cada día que venís', bajaT:'Baja de a poco si dejás de venir', bajaD:'Un día de descanso casi no se nota. Una semana sin venir, sí.',
        up:(a, b) => '¡Subió tu ritmo! ⚡ Pasaste de ' + a + ' a ' + b + '.', hoy:'Hoy sumaste ritmo ⚡ Ahora toca descansar bien.',
        down:n => 'Estás perdiendo ritmo. ' + (n ? 'Con ' + (n === 1 ? 'una visita' : n + ' visitas') + ' esta semana lo recuperás ⚡' : 'Con una visita esta semana vuelve a subir ⚡'),
        paso2:'Agarrá ritmo', baja:'bajó', noMide:'No mide tu cuerpo ni cuánto levantás: mide cuán seguido venís. Tu cuerpo lo mide el Índice FIT, con tu medición InBody, que es voluntaria.' }
  };
  VARS.F = Object.assign({}, VARS.R, { z:[[0,'Tranqui'],[30,'Parejo'],[60,'Firme'],[85,'VIVA Flow']], flow:true });
  // Los nombres de la métrica y de los tramos son configuración por gimnasio (white-label): se cambian acá sin tocar el diseño.
  const vb = (sing, plur) => V().pl ? plur : sing;
  let VAR = 'F'; const V = () => VARS[VAR], Cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const zonas = () => V().z.map((x, i) => [x[0], x[1], ZC[V().col[i]]]);
  // Posición visual (0 a 100): los cuatro tramos ocupan el mismo largo y, dentro de cada uno, la posición es proporcional al número
  const posV = v => { const zs = zonas(), n = zs.length; let i = 0; zs.forEach((q, k) => { if (v >= q[0]) i = k; }); const a = zs[i][0], b = i < n - 1 ? zs[i + 1][0] : 100; return (i + Math.max(0, Math.min(1, (v - a) / (b - a)))) * 100 / n; };
  const REFv = () => META_SEM / 7;
  const cerrado = new Map([[37, 'Feriado']]); // días atrás con la sede cerrada (calendario de la base propia): la forma se congela
  const todayWd = ahora().getDay();
  const entrenoDia = new Set(); // días atrás con ingreso (simulado como si viniera de entries)
  for (let d = 120; d >= 1; d--) {
    const wd = ((todayWd - d) % 7 + 7) % 7;
    if (d >= 45 && d <= 56) continue; // 12 días de vacaciones: la forma cae y se ve
    if ([1, 3, 5].includes(wd) || (wd === 6 && d < 21)) entrenoDia.add(d);
  }
  cerrado.forEach((v, d) => entrenoDia.delete(d));
  { const o = (todayWd + 6) % 7; let t = 0; for (let d = o + 1; d <= o + 28; d++) if (entrenoDia.has(d)) t++; META_SEM = Math.min(META_SEM, Math.round(t / 4) + 1); } // T12: la meta simulada no supera lo que viene haciendo + 1
  let hoyEntreno = false, fFmt = 'aguja';
  function serie(){
    const out = []; let ctl = 0, atl = 0;
    for (let d = 120; d >= 0; d--) {
      const L = d === 0 ? (hoyEntreno ? 1 : 0) : (entrenoDia.has(d) ? 1 : 0), fr = cerrado.has(d);
      if (!fr) { ctl += (L - ctl) / TAU_F; atl += (L - atl) / TAU_C; }
      out.push({ d:d, ctl:ctl, atl:atl, L:L, fr:fr, f:Math.min(100, Math.round(ctl / REFv() * 100)) });
    }
    return out;
  }
  const zona = v => { let r = zonas()[0]; zonas().forEach(q => { if (v >= q[0]) r = q; }); return [r[1], r[2]]; };
  // Semanas para llegar a un valor viniendo a la meta, desde el estado actual
  const semA = u => { let c = serie().slice(-1)[0].ctl / REFv(), d = 0; while (c * 100 < u && d < 400) { c += (1 - c) / TAU_F; d++; } return Math.max(1, Math.round(d / 7)); };
  // InBody simulado (solo variante B): siempre contra la primera medición del socio
  const IB = [{ f:'12/08', m:24.1, g:31.0 }, { f:'18/09', m:24.6, g:29.8 }, { f:'20/10', m:25.0, g:28.9 }];
  let fitPromoNo = false, fitPedido = false;
  // Tendencia del Índice FIT para la caja de Inicio (siempre contra la propia primera medición)
  function fitTrendTxt(){
    if (nIB === 1) return 'Tu punto de partida: ' + IB[0].f;
    const a = IB[0], u = IB[nIB - 1], f = n => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1).replace('.', ',');
    return inbodyOk() ? '<b>▲</b> músculo ' + f(u.m - a.m) + ' kg<br><b>▼</b> grasa ' + f(u.g - a.g) + ' %' : 'Todavía sin un cambio claro';
  }
  let nIB = 3; const IBv = () => IB.slice(0, nIB);
  const inbodyOk = () => nIB > 1 && IBv()[nIB - 1].m > IB[0].m && IBv()[nIB - 1].g < IB[0].g;
  // Simulación de ausencia: la socia deja de venir 10 días (para ver el mensaje de caída)
  let ausente = false; const sacados = [];
  let alTope = false; const sumados = [];
  const vez = n => n === 1 ? '1 vez' : n + ' veces';
  // Forma el domingo si entrena n veces más (en los últimos días que quedan)
  function alDomingo(n){
    const s = serie(); let ctl = s[s.length - 2].ctl;
    const dias = ((7 - todayWd) % 7) + 1;
    for (let i = 0; i < dias; i++) {
      const L = (i === 0 && hoyEntreno) ? 1 : (dias - i <= n && !(i === 0 && hoyEntreno) ? 1 : 0);
      ctl += (L - ctl) / TAU_F;
    }
    return Math.min(100, Math.round(ctl / REFv() * 100));
  }
  function metaSemana(v){
    const dias = ((7 - todayWd) % 7) + 1, libres = dias - (hoyEntreno ? 1 : 0);
    // La meta pide como mucho el ritmo de su meta semanal (no empuja a entrenar todos los días)
    const nRitmo = Math.min(libres, Math.max(1, Math.round(dias * META_SEM / 7))), xD = alDomingo(nRitmo), m5 = Math.floor(xD / 5) * 5, meta = m5 > v ? m5 : Math.round(xD);
    if (meta > v) { let n = 0; while (n < libres && alDomingo(n) < meta) n++; return { meta:meta, n:n, sube:true }; }
    let n = 0; while (n < libres && alDomingo(n) < v) n++; return { meta:v, n:n, sube:false };
  }
  const goalTick = (cx, cy, r1, r2, v) => { const a = (v * 3.6 - 90) * Math.PI / 180; return '<line x1="' + (cx + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (cy + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (cx + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (cy + r2 * Math.sin(a)).toFixed(1) + '" stroke="var(--txt)" stroke-width="3" stroke-linecap="round"/>'; };
  // Firma del manual: la primera palabra en Archivo Black, el resto en Archivo Expanded Light
  function firma(t){ const i = t.indexOf(' '); return i < 0 ? '<b>' + t + '</b>' : '<b>' + t.slice(0, i) + '</b> <i>' + t.slice(i + 1) + '</i>'; }
  function renderForma(){
    const s = serie(), v = s[s.length - 1].f, dv = v - s[s.length - 8].f, z = zona(v), g = metaSemana(v), zs = zonas(), nom = V().nom;
    $$('[data-mname]').forEach(e => e.innerHTML = firma(nom)); $$('#estPick [data-est]').forEach((b, i) => b.textContent = zonas()[i][1]); $$('[data-mtu]').forEach(e => e.textContent = V().tu); $$('[data-msub]').forEach(e => e.textContent = V().sub); $$('[data-msubaja]').forEach(e => e.textContent = Cap(V().tu.replace('tu', 'su')) + ' ' + V().baja); $('#altaLbl').textContent = nom + vb(' arranca hoy', ' arrancan hoy'); $('#altaZ').textContent = zonas()[0][1]; $('#onbPaso2').textContent = V().paso2;
    const delta = '<span class="fdelta" style="color:' + (dv >= 0 ? 'var(--dat)' : 'var(--orange)') + '">' + (dv > 0 ? '▲ +' + dv + ' contra la semana pasada' : dv < 0 ? '▼ ' + dv + ' contra la semana pasada' : '= igual que la semana pasada') + '</span>';
    const aria = nom + ': ' + z[0] + ', ' + v + ' de 100. ' + (dv >= 0 ? 'Subió ' : 'Bajó ') + Math.abs(dv) + ' contra la semana pasada. ' + V().sub + '.';
    const top = v >= zs[zs.length - 1][0], tr = dv > 1 ? 'tup' : dv < -1 ? 'tdown' : 'tflat', hc = 'fhito ' + tr + (top ? ' flow' : '');
    const num = '<span class="fnumsm">' + v + '<small> de 100</small></span>';
    const big = () => '<div class="between" style="align-items:flex-end"><span class="' + hc + '" style="color:' + z[1] + '" role="img" aria-label="' + aria + '">' + z[0] + '</span><span class="stack" style="gap:4px;align-items:flex-end;flex-shrink:0">' + num + delta + '</span></div>';
    let h = '';
    if (fFmt === 'anillo') {
      const C = 2 * Math.PI * 52;
      h = '<div class="frow"><svg class="fring" viewBox="0 0 128 128" role="img" aria-label="' + aria + '"><circle cx="64" cy="64" r="52" class="fbg"/><circle cx="64" cy="64" r="52" class="farc" style="stroke:' + z[1] + ';stroke-dasharray:' + C.toFixed(1) + ';stroke-dashoffset:' + (C * (1 - v / 100)).toFixed(1) + '"/>' + goalTick(64, 64, 42, 62, g.meta) + '<text x="64" y="74" text-anchor="middle" class="fnum" style="font-size:30px">' + v + '</text></svg>' +
        '<span class="stack" style="gap:6px"><span class="' + hc + '" style="color:' + z[1] + ';font-size:36px">' + z[0] + '</span>' + delta + '<span class="small muted">' + v + ' de 100 · la marca es tu objetivo del domingo</span></span></div>';
    } else if (fFmt === 'barra') {
      let bg = [], lab = '';
      zs.forEach((q, i) => { const t = i < zs.length - 1 ? zs[i + 1][0] : 100; bg.push((i % 2 ? 'var(--line)' : 'var(--panel2)') + ' ' + q[0] + '% ' + t + '%'); lab += '<span style="width:' + (t - q[0]) + '%">' + q[1] + '</span>'; });
      h = big() + '<div class="fbar" aria-hidden="true" style="background:linear-gradient(90deg,' + bg.join(',') + ')"><i style="width:' + v + '%;background:' + z[1] + '"></i><b style="left:' + g.meta + '%"></b></div>' +
        '<div class="fbarl" aria-hidden="true">' + lab + '</div>';
    } else if (fFmt === 'aguja') {
      const P = (a, r) => [120 + r * Math.cos(Math.PI * (1 - a / 100)), 122 - r * Math.sin(Math.PI * (1 - a / 100))];
      const arcD = (a0, a1) => { const p0 = P(a0, 96), p1 = P(a1, 96); return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A96 96 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1); };
      let ci = 0; zs.forEach((q, k) => { if (v >= q[0]) ci = k; });
      const last = zs.length - 1, Z = 100 / zs.length, gt = P(posV(g.meta), 113), gi = P(posV(g.meta), 104), pf0 = P(last * Z + 2.6, 96), pf1 = P(99.6, 96);
      let defs = '<defs><filter id="nfB1" filterUnits="userSpaceOnUse" x="-40" y="-40" width="320" height="220"><feGaussianBlur stdDeviation="7"/></filter><filter id="nfB2" filterUnits="userSpaceOnUse" x="-40" y="-40" width="320" height="220"><feGaussianBlur stdDeviation="2.2"/></filter>' +
        '<linearGradient id="nfFlow" gradientUnits="userSpaceOnUse" x1="' + pf0[0].toFixed(1) + '" y1="' + pf0[1].toFixed(1) + '" x2="' + pf1[0].toFixed(1) + '" y2="' + pf1[1].toFixed(1) + '"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient>';
      const arcR = (a0, a1, r) => { const p0 = P(a0, r), p1 = P(a1, r); return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1); };
      let labs = ''; zs.forEach((q, i) => { defs += '<path id="nfL' + i + '" d="' + arcR(i * Z, (i + 1) * Z, 117) + '" fill="none"/>';
        labs += '<text class="zl' + (i === ci ? ' cur' : i < ci ? ' on' : '') + '" aria-hidden="true"><textPath href="#nfL' + i + '" startOffset="50%" text-anchor="middle">' + q[1] + '</textPath></text>'; });
      defs = defs.replace('</defs>', '') + '<filter id="nfBolt" x="-40%" y="-20%" width="180%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="sb"/><feOffset in="sb" dy="2" result="so"/><feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="so" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="nfBG" filterUnits="userSpaceOnUse" x="-80" y="-160" width="160" height="210"><feGaussianBlur stdDeviation="8"/></filter><filter id="nfBG3" filterUnits="userSpaceOnUse" x="-90" y="-170" width="180" height="230"><feGaussianBlur stdDeviation="16"/></filter><filter id="nfBG2" filterUnits="userSpaceOnUse" x="-70" y="-150" width="140" height="190"><feGaussianBlur stdDeviation="2.5"/></filter><filter id="nfDesat" filterUnits="userSpaceOnUse" x="-40" y="-40" width="320" height="220"><feColorMatrix type="saturate" values=".35"/></filter></defs>';
      let arcs = ''; zs.forEach((q, i) => {
        const st = i === ci ? 'on cur tz' : i < ci ? 'on' : 'off';
        const d = arcD(i * Z + (i ? 2.6 : 0.4), (i + 1) * Z - (i < last ? 2.6 : 0.4)), c = i === last ? 'url(#nfFlow)' : q[2];
        const P_ = (cls, extra) => '<path class="' + cls + '" d="' + d + '" stroke="' + c + '"' + (extra || '') + '/>';
        arcs += '<g class="tube ' + st + (i === last ? ' fl' : '') + '"' + (i === ci && tr === 'tdown' ? ' filter="url(#nfDesat)"' : '') + '>' + (st === 'off'
          ? P_('glass') + '<path class="glassHi" d="' + d + '"/>'
          : P_('halo', ' filter="url(#nfB1)"') + P_('halo2', ' filter="url(#nfB2)"') + P_('body') + '<path class="core" d="' + d + '"/>') + '</g>';
      });
      h = '<svg class="gauge ' + tr + '" viewBox="0 -10 240 142" role="img" aria-label="' + aria + '">' + defs + arcs + labs +
        '<line x1="' + gi[0].toFixed(1) + '" y1="' + gi[1].toFixed(1) + '" x2="' + gt[0].toFixed(1) + '" y2="' + gt[1].toFixed(1) + '" stroke="var(--muted)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<g class="boltn" transform="translate(120 122) rotate(' + (posV(v) * 1.8 - 90).toFixed(1) + ')"><g class="boltglow ' + tr + '" style="color:' + (ci === last ? 'var(--z3)' : z[1]) + '"><path d="M12.3 -14.5 L-12.3 1.1 L-8.3 -39.8 L-20.7 -33.3 L0.0 -112.0 L-0.6 -62.8 L11.6 -69.7 Z" fill="currentColor" filter="url(#nfBG3)"/><path d="M12.3 -14.5 L-12.3 1.1 L-8.3 -39.8 L-20.7 -33.3 L0.0 -112.0 L-0.6 -62.8 L11.6 -69.7 Z" fill="currentColor" filter="url(#nfBG)"/><path d="M12.3 -14.5 L-12.3 1.1 L-8.3 -39.8 L-20.7 -33.3 L0.0 -112.0 L-0.6 -62.8 L11.6 -69.7 Z" fill="currentColor" filter="url(#nfBG)"/><path d="M12.3 -14.5 L-12.3 1.1 L-8.3 -39.8 L-20.7 -33.3 L0.0 -112.0 L-0.6 -62.8 L11.6 -69.7 Z" fill="currentColor" filter="url(#nfBG2)" opacity=".8"/></g><path filter="url(#nfBolt)" d="M12.3 -14.5 L-12.3 1.1 L-8.3 -39.8 L-20.7 -33.3 L0.0 -112.0 L-0.6 -62.8 L11.6 -69.7 Z" fill="var(--txt)" stroke="var(--panel)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"/></g></svg>' +
        '<div class="stack" style="align-items:center;gap:6px;margin-top:-2px;text-align:center"><span class="' + hc + '" style="color:' + z[1] + '">' + z[0] + '</span><span class="small muted"><strong style="color:var(--txt)">' + v + '</strong> de 100 · ' + delta + '</span></div>';
    } else if (fFmt === 'vumetro') {
      // Vúmetro: 20 segmentos de 5 puntos, agrupados por tramo; el rayo al final es la meta
      const N = 20, SW = 8.6, GP = 4.4, GG = 7, BX = 26, H0 = 14, HS = 40, last = zs.length - 1;
      const SPG = N / zs.length, grp = k => Math.floor(k / SPG), pv = posV(v);
      const lit = k => pv >= k * 5 + 2.5, nLit = Array.from({ length: N }, (_, k) => k).filter(lit).length;
      let x = 4, segs = '', gx0 = null, gx1 = 0, xs = [];
      for (let k = 0; k < N; k++) { if (k && grp(k) !== grp(k - 1)) x += GG; xs.push(x); if (grp(k) === last) { if (gx0 === null) gx0 = x; gx1 = x + SW; } x += SW + GP; }
      const W = x - GP + 10 + BX;
      let defs = '<defs><filter id="nvB1" filterUnits="userSpaceOnUse" x="-30" y="-30" width="' + (W + 60) + '" height="130"><feGaussianBlur stdDeviation="5"/></filter><filter id="nvB2" filterUnits="userSpaceOnUse" x="-30" y="-30" width="' + (W + 60) + '" height="130"><feGaussianBlur stdDeviation="1.8"/></filter>' +
        '<linearGradient id="nvFlow" gradientUnits="userSpaceOnUse" x1="' + gx0.toFixed(1) + '" y1="0" x2="' + gx1.toFixed(1) + '" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient><filter id="nvDesat" filterUnits="userSpaceOnUse" x="-30" y="-30" width="' + (W + 60) + '" height="130"><feColorMatrix type="saturate" values=".35"/></filter></defs>';
      for (let k = 0; k < N; k++) {
        const gi = grp(k), c = gi === last ? 'url(#nvFlow)' : zs[gi][2], cx = xs[k] + SW / 2, d = 'M' + cx.toFixed(1) + ' ' + (H0 + 4) + ' V' + (H0 + HS - 4);
        const tz = lit(k) && gi === grp(Math.max(0, nLit - 1)), st = lit(k) ? (k === nLit - 1 ? 'on cur' : 'on') + (tz ? ' tz' : '') : 'off';
        segs += '<g class="tube ' + st + (gi === last ? ' fl' : '') + '"' + (tz && tr === 'tdown' ? ' filter="url(#nvDesat)"' : '') + '>' + (st === 'off'
          ? '<path class="glass" d="' + d + '" stroke="' + c + '"/><path class="glassHi" d="' + d + '"/>'
          : '<path class="halo" d="' + d + '" stroke="' + c + '" filter="url(#nvB1)"/><path class="halo2" d="' + d + '" stroke="' + c + '" filter="url(#nvB2)"/><path class="body" d="' + d + '" stroke="' + c + '"/><path class="core" d="' + d + '"/>') + '</g>';
      }
      const mk = Math.min(N - 1, Math.max(0, Math.ceil((posV(g.meta) - 2.5) / 5))), mx = xs[mk] + SW / 2;
      const topOn = v >= zs[last][0], bx = x - GP + 8;
      defs = defs.replace('</defs>', '<filter id="nvBolt" x="-80%" y="-40%" width="260%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="gb1"/><feFlood class="nfGlowFlood" style="flood-color:var(--z3)" result="gc"/><feComposite in="gc" in2="gb1" operator="in" result="glow1"/><feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="gb2"/><feComposite in="gc" in2="gb2" operator="in" result="glow2"/><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="sb"/><feOffset in="sb" dy="2" result="so"/><feFlood flood-color="#000" flood-opacity=".5"/><feComposite in2="so" operator="in" result="shadow"/><feMerge><feMergeNode in="glow1"/><feMergeNode in="glow2"/><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>');
      const bolt = '<g transform="translate(' + bx.toFixed(1) + ' ' + (H0 + 2) + ') scale(1.5)" class="' + (topOn ? 'vbolt on' : 'vbolt') + '"' + (topOn ? ' filter="url(#nvBolt)"' : '') + '><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="' + (topOn ? 'var(--z1)' : 'none') + '" stroke="' + (topOn ? 'none' : 'var(--muted)') + '" stroke-width="1.2" stroke-linejoin="round"/></g>';
      let vci = 0; zs.forEach((q, i) => { if (v >= q[0]) vci = i; });
      let vl = ''; zs.forEach((q, i) => { const ks = xs.filter((_, k) => grp(k) === i); const cx = (ks[0] + ks[ks.length - 1] + SW) / 2;
        vl += '<text class="zl' + (i === vci ? ' cur' : i < vci ? ' on' : '') + '" x="' + cx.toFixed(1) + '" y="' + (H0 + HS + 26) + '" text-anchor="middle" aria-hidden="true">' + q[1] + '</text>'; });
      h = '<svg class="vumeter ' + tr + '" viewBox="0 0 ' + W.toFixed(0) + ' 84" role="img" aria-label="' + aria + '">' + defs + segs + bolt + vl +
        '<path d="M' + mx.toFixed(1) + ' ' + (H0 + HS + 5) + ' l-4 6 h8 z" fill="var(--muted)"/></svg>' +
        '<div class="stack" style="align-items:center;gap:6px;margin-top:6px;text-align:center"><span class="' + hc + '" style="color:' + z[1] + '">' + z[0] + '</span><span class="small muted"><strong style="color:var(--txt)">' + v + '</strong> de 100 · ' + delta + '</span></div>';
    } else if (fFmt === 'camino') {
      // Paradas equidistantes; el punto avanza dentro de cada tramo según el número
      const n = zs.length, pos = val => { let i = 0; zs.forEach((q, k) => { if (val >= q[0]) i = k; }); if (i === n - 1) return 100; const lo = zs[i][0], hi = zs[i + 1][0]; return (i + (val - lo) / (hi - lo)) * 100 / (n - 1); };
      const nx = zs.find(q => q[0] > v);
      let stops = ''; zs.forEach((q, i) => { stops += '<span class="cstop' + (v >= q[0] ? ' on' : '') + (i === n - 1 ? ' flow' : '') + (i % 2 ? ' up' : '') + (i === 0 ? ' first' : '') + (i === n - 1 ? ' last' : '') + '" style="left:' + (i * 100 / (n - 1)) + '%;--c:' + q[2] + '"><i></i><em>' + q[1] + '</em></span>'; });
      h = big() + '<div class="camino" aria-hidden="true"><div class="ctrack"><i style="width:' + pos(v).toFixed(1) + '%"></i></div>' + stops + '<span class="cme" style="left:' + pos(v).toFixed(1) + '%"></span></div>' +
        '<span class="small" style="line-height:1.45">' + (nx ? 'Próxima parada: <strong>' + nx[1] + '</strong>, a ' + (nx[0] - v) + ' puntos. Viniendo a tu meta, en unas <strong>' + semA(nx[0]) + ' semanas</strong>.' : 'Llegaste a la última parada: ahora se trata de sostenerla.') + '</span>';
    } else if (fFmt === 'curva') {
      const pts = s.slice(-57), W = 320, H = 130, L = 26, R = 10, T = 10, B = 22, X = i => L + i * (W - L - R) / (pts.length - 1), Y = val => T + (1 - val / 100) * (H - T - B);
      const line = pts.map((p, i) => X(i).toFixed(1) + ',' + Y(p.f).toFixed(1)).join(' ');
      let svg = '<svg class="fcurve" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + aria + ' Evolución de las últimas 8 semanas.">';
      [0, 50, 100].forEach(t => svg += '<text x="' + (L - 6) + '" y="' + (Y(t) + 3).toFixed(1) + '" text-anchor="end">' + t + '</text>');
      svg += '<line class="cg" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g.meta).toFixed(1) + '" y2="' + Y(g.meta).toFixed(1) + '"/><text x="' + (W - R) + '" y="' + (Y(g.meta) - 4).toFixed(1) + '" text-anchor="end">domingo ' + g.meta + '</text>';
      svg += '<polygon class="ca" points="' + X(0).toFixed(1) + ',' + (H - B) + ' ' + line + ' ' + X(pts.length - 1).toFixed(1) + ',' + (H - B) + '"/><polyline class="cl" points="' + line + '"/>';
      svg += '<circle cx="' + X(pts.length - 1).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="5" fill="var(--dat)"/>';
      svg += '<text x="' + L + '" y="' + (H - 6) + '">hace 8 semanas</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">hoy</text></svg>';
      h = big() + svg + '<span class="small muted">La caída es cuando te fuiste de vacaciones; la subida, cuando volviste.</span>';
    } else {
      const off = (todayWd + 6) % 7; // lunes = 0
      let cells = '';
      ['L','M','M','J','V','S','D'].forEach(d => cells += '<span>' + d + '</span>');
      for (let w = 5; w >= 0; w--) for (let c = 0; c < 7; c++) {
        const d = w * 7 + off - c;
        if (d < 0) { cells += '<i class="fut"></i>'; continue; }
        const on = d === 0 ? hoyEntreno : entrenoDia.has(d), op = on ? (0.25 + 0.75 * Math.exp(-d / TAU_F)).toFixed(2) : 1;
        cells += '<i class="' + (on ? 'on' : '') + (cerrado.has(d) ? ' cerr' : '') + (d === 0 ? ' hoy' : '') + '"' + (on ? ' style="opacity:' + op + '"' : '') + '></i>';
      }
      h = '<div class="frow" style="align-items:flex-start"><div class="fgrid" role="img" aria-label="' + aria + ' Cada punto es un día de las últimas 6 semanas.">' + cells + '</div>' +
        '<span class="stack" style="gap:6px;width:116px;flex-shrink:0"><span class="' + hc + '" style="color:' + z[1] + ';font-size:30px">' + z[0] + '</span>' + num + delta + '</span></div>' +
        '<span class="small muted">Cada día que venís se prende y se va apagando con las semanas. Los círculos vacíos son feriados: no cuentan.</span>';
    }
    $('#formaViz').innerHTML = h;
    const rec = recupera(s[s.length - 8].f);
    renderSemana(z[1], top && !!V().flow);
    const wmsg = EQ_ON ? semMsg(dv, rec) : null;
    $('#formaGoal').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dat)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg><span>' + (wmsg !== null ? wmsg :
      (dv < 0 ? V().down(rec) : top && V().flow ? '<strong>¡Estás en VIVA Flow! ⚡</strong> Sostenelo viniendo a tu meta.' : g.sube ? (g.n ? 'Venís <strong>' + vez(g.n) + ' más</strong> esta semana y llegás a <strong>' + g.meta + '</strong> el domingo.' : 'Vas bien: llegás a <strong>' + g.meta + '</strong> el domingo.')
        : (g.n ? 'Venís <strong>' + vez(g.n) + ' más</strong> esta semana y ' + V().tu + vb(' se mantiene', ' se mantienen') + ' en ' + g.meta + '.' : 'Esta semana ya cumpliste. Descansar también suma.'))) + '</span>';
    $('#flowShare').hidden = !top;
    $('#varZonas').textContent = nom + ': ' + zs.map(q => q[1]).join(' · ');
    const fb = $('#fitBadge'); fb.hidden = true; $('#fitBox').hidden = nIB === 0; $('#fitTrend').innerHTML = fitTrendTxt(); $('#fitPromo').hidden = nIB !== 0 || fitPromoNo; avisosLater(); fb.innerHTML = '<span class="fbw">Índice</span><b>FIT</b>' + (nIB === 1 ? 'Tu punto de partida' : nIB + ' mediciones') + ' <span aria-hidden="true">›</span>';
    return { v:v, g:g, dv:dv, rec:rec };
  }
  $('#fmtPick').addEventListener('click', e => { const b = e.target.closest('[data-fmt]'); if (!b) return; fFmt = b.dataset.fmt; $$('#fmtPick [data-fmt]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderForma(); if (curScr === 'forma') renderFormaDet(); });
  $('#varPick').addEventListener('click', e => { const b = e.target.closest('[data-var]'); if (!b) return; VAR = b.dataset.var; $$('#varPick .varopt').forEach(x => x.setAttribute('aria-pressed', x === b)); renderForma(); renderHoy(); if (curScr === 'forma') renderFormaDet(); });
  // Visitas que necesita esta semana para volver al valor de hace 7 días (o 0 si no alcanza)
  function recupera(target){ const dias = ((7 - todayWd) % 7) + 1, libres = dias - (hoyEntreno ? 1 : 0); for (let n = 1; n <= Math.min(libres, META_SEM + 1); n++) if (alDomingo(n) >= target) return n; return 0; }
  $('#fitPick').addEventListener('click', e => { const b = e.target.closest('[data-fit]'); if (!b) return; nIB = +b.dataset.fit; FIT_NOV = nIB ? 'medicion' : null; fitPromoNo = false; fitPedido = false; fitPromoReset(); $$('#fitPick .opt').forEach(x => x.setAttribute('aria-pressed', x === b)); renderForma(); renderFit(); });
  $('#ausDemo').addEventListener('click', () => {
    ausente = !ausente;
    if (ausente) { for (let d = 1; d <= 10; d++) if (entrenoDia.has(d)) { entrenoDia.delete(d); sacados.push(d); } }
    else { sacados.splice(0).forEach(d => entrenoDia.add(d)); }
    $('#ausDemo').textContent = ausente ? 'Volver a la socia que viene seguido' : 'Ver a la socia después de 10 días sin venir';
    renderForma(); renderHoy(); $('#demoSheet').hidden = true; go('inicio'); toast(ausente ? 'La socia no viene hace 10 días' : 'La socia volvió a su ritmo');
  });
  const ENTRENO0 = [...entrenoDia];
  // Patrones simulados para llevar a la socia a cada tramo (meta 4): unas visitas recientes · 4 semanas a 3 por semana · su historia · 4 por semana hace meses
  const PATS = [d => [1, 3, 6, 8].includes(d), d => d <= 28 && [1, 3, 5].includes(d % 7), null, d => [1, 2, 4, 6].includes(d % 7)];
  const EST_TXT = ['La socia recién arranca: vino 4 veces en 10 días', 'La socia viene 3 veces por semana hace un mes', 'La socia de siempre: 3 por semana, con vacaciones', 'La socia viene 4 veces por semana hace meses'];
  $('#estPick').addEventListener('click', e => {
    const b = e.target.closest('[data-est]'); if (!b) return; const k = +b.dataset.est;
    ausente = false; sacados.length = 0; $('#ausDemo').textContent = 'Ver a la socia después de 10 días sin venir';
    entrenoDia.clear(); if (k === 2) ENTRENO0.forEach(d => entrenoDia.add(d)); else for (let d = 1; d <= 120; d++) if (!cerrado.has(d) && PATS[k](d)) entrenoDia.add(d);
    $$('#estPick [data-est]').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderForma(); renderHoy(); $('#demoSheet').hidden = true; go('inicio'); toast(EST_TXT[k]);
  });
  function fitPromoReset() { $('#fitPromoTxt').textContent = 'Lo que la balanza no te cuenta.'; $('#fitPromoGo').hidden = false; $('#fitPromoWhat').hidden = false; }
  $('#fitPromoNo').addEventListener('click', () => { fitPromoNo = true; $('#fitPromo').hidden = true; if (!fitPedido) toast('Listo. Lo tenés siempre en el detalle de tu ritmo'); });
  $('#fitPromoWhat').addEventListener('click', () => { $('#fitSheet').hidden = false; });
  $('#fitSheetX').addEventListener('click', () => { $('#fitSheet').hidden = true; });
  $('#fitSheet').addEventListener('click', e => { if (e.target.id === 'fitSheet') $('#fitSheet').hidden = true; });
  $('#fitSheetGo').addEventListener('click', () => { $('#fitSheet').hidden = true; $('#fitPromoGo').click(); toast('¡Pedido! Te escribimos por WhatsApp para darte turno'); });
  $('#fitPromoGo').addEventListener('click', () => { fitPedido = true; $('#fitPromoTxt').innerHTML = '<strong>¡Pedido! ⚡</strong> Te escribimos por WhatsApp para darte turno.'; $('#fitPromoGo').hidden = true; $('#fitPromoWhat').hidden = true; $('#fitPromoNo').setAttribute('aria-label', 'Cerrar'); });
  $('#flowShare').addEventListener('click', () => { const tn = zonas()[zonas().length - 1][1], w = tn.split(' ');
    openStory({ type:'ach', a:{ id:'top', t:tn, s:'', big:(w[0] === 'VIVA' ? 'VIVA' : tn).toUpperCase(), unit:(w[0] === 'VIVA' ? w.slice(1).join(' ').toUpperCase() + ' ' : '') + '⚡', cap:'vengo a mi meta todas las semanas', feedT:tn } }); });
  let fitFrom = 'inicio';
  $('#fitBadge').addEventListener('click', () => { fitFrom = 'inicio'; renderFit(); go('fit'); });
  $('#fitBox').addEventListener('click', () => { FIT_NOV = null; fitFrom = 'inicio'; renderFit(); go('fit'); });
  $('#fitBack').addEventListener('click', () => go(fitFrom));
  document.addEventListener('click', e => { if (e.target.closest('[data-fitgo]')) { fitFrom = curScr; renderFit(); go('fit'); } });
  function renderFit(){
    const f = n => n.toFixed(1).replace('.', ','), L = IBv(), el = $('#fitBody');
    if (!nIB) { el.innerHTML = '<span class="lbl">Todavía no te mediste</span><span style="line-height:1.5">Con una medición InBody en tu sede ves cuánto músculo y cuánta grasa tenés. La primera es tu punto de partida; desde la segunda, ves cómo cambiaste vos.</span><span class="small muted" style="line-height:1.45">Tu ritmo no depende de esto: es de todos los socios, te midas o no.</span>'; return; }
    const a = L[0], u = L[L.length - 1];
    if (nIB === 1) { el.innerHTML = '<div class="between"><span class="lbl">Tu punto de partida</span><span class="src">Ejemplo</span></div><div class="ibgrid"><span></span><b>Músculo</b><b>Grasa</b><span>' + a.f + '</span><span>' + f(a.m) + ' kg</span><span>' + f(a.g) + ' %</span></div><span style="line-height:1.5">Es desde donde arrancás: no hay nada que aprobar. En tu próxima medición vas a ver cómo cambiaste.</span>'; return; }
    const ok = inbodyOk(), dm = u.m - a.m, dg = u.g - a.g;
    el.innerHTML = '<div class="between"><span class="lbl">Tus mediciones</span><span class="src">Ejemplo</span></div>' +
      '<div class="ibgrid"><span></span><b>Músculo</b><b>Grasa</b>' + L.map((x, i) => '<span>' + (i === 0 ? 'Punto de partida · ' : i === L.length - 1 ? 'Última · ' : '') + x.f + '</span><span>' + f(x.m) + ' kg</span><span>' + f(x.g) + ' %</span>').join('') + '</div>' +
      '<div class="note' + (ok ? ' lime' : '') + '"><span>' + (ok ? '<strong>Cómo cambiaste desde tu punto de partida:</strong> ' + (dm >= 0 ? '+' : '') + f(dm) + ' kg de músculo y ' + (dg >= 0 ? '+' : '') + f(dg) + ' puntos de grasa.' : '<strong>Todavía no se ve un cambio claro.</strong> El cuerpo tarda más que el hábito: seguí con tu ritmo y medite de nuevo en unas semanas.') + '</span></div>';
  }

  // ===== Tu semana (v30): ecualizador Visitas · Activación · Fuerza · Cardio =====
  // Metas por objetivo principal: valores de demo; los define el profe (configuración por gimnasio). 'v' = igual a la meta de visitas.
  const OBJS = [['bien', 'Sentirme bien', 'Cuidarme, moverme sin dolores, despejarme', 2, 90], ['forma', 'Estar en forma', 'Sentirme bien y tonificar', 'v', 90], ['ver', 'Verme mejor', 'Bajar de peso', 2, 150], ['musc', 'Ganar músculo', 'Ponerme fuerte', 'v', 60], ['rend', 'Mejorar mi rendimiento', 'En mi deporte (fútbol, pádel, running…)', 'v', 90]];
  let OBJ = []; // sin onboarding: se usa "Estar en forma"
  const objP = () => OBJS.find(o => o[0] === (OBJ[0] || 'forma'));
  const CARD_SEG = 15;
  function semMetas(){ const o = objP(), M = META_SEM; return { vis:M, act:M, fue:o[3] === 'v' ? M : Math.min(o[3], M), car:o[4] }; }
  let EQ_ON = true, semKey = 'mitad', WK = null, lunesVisto = false;
  const LAST_WK = 3; // semana pasada en el estado "Lunes" (simulado): no llegó a la meta, no hay etiqueta
  function semPreset(k){
    const m = semMetas();
    if (k === 'lunes') return { vis:0, act:0, fue:0, car:0, reg:true };
    if (k === 'mitad') return { vis:2, act:1, fue:2, car:45, reg:true };
    if (k === 'cumplida') return { vis:m.vis, act:m.act, fue:m.fue, car:m.car - 30, reg:true };
    if (k === 'completa') return { vis:m.vis, act:m.act, fue:m.fue, car:m.car, reg:true };
    return { vis:2, act:0, fue:0, car:0, reg:false };
  }
  WK = semPreset('mitad');
  // Segmentos por barra: cada barra se divide en tantas partes como su meta (cardio, de a 15 minutos); tope en el 100%
  function semSegs(){
    const m = semMetas(), nC = Math.max(1, Math.round(m.car / CARD_SEG)), cl = (a, b) => Math.max(0, Math.min(a, b));
    return [
      { k:'vis', n:'Visitas', N:m.vis, on:cl(WK.vis, m.vis), val:WK.vis, meta:m.vis },
      { k:'act', n:'Activación', N:m.act, on:cl(WK.act, m.act), val:WK.act, meta:m.act },
      { k:'fue', n:'Fuerza', N:m.fue, on:cl(WK.fue, m.fue), val:WK.fue, meta:m.fue },
      { k:'car', n:'Cardio', N:nC, on:cl(Math.floor(WK.car / CARD_SEG + 1e-9), nC), val:WK.car, meta:m.car, min:true }
    ];
  }
  const semCumplida = () => WK.vis >= semMetas().vis;
  const semCompleta = () => { const m = semMetas(); return WK.reg && WK.vis >= m.vis && WK.act >= m.act && WK.fue >= m.fue && WK.car >= m.car; };
  // Lo que ya vio la socia: los segmentos nuevos se encienden uno por uno al abrir Inicio (arranca con la última sesión sin ver)
  let semVisto = { vis:WK.vis - 1, act:WK.act - 1, fue:WK.fue - 1, car:Math.max(0, Math.floor(WK.car / CARD_SEG) - 2) };
  function semMarcarVisto(){ semSegs().forEach(b => semVisto[b.k] = b.on); }
  // Intensidad de cada barra según cuánto se llenó: arranca casi como vidrio apagado y llega a pleno al completarla
  const eqLuz = p => ({ bd:(0.32 + 0.68 * p).toFixed(2), co:(0.12 + 0.66 * p).toFixed(2), ha:(0.06 + 0.6 * p).toFixed(2), hb:(2.5 + 4 * p).toFixed(1) });
  var MH_POS = 'tumes'; let EQ_HALO = false, EQ_EST = 'real', eqCol = 'var(--z3)', eqFlow = false;
  function renderSemana(col, flow){
    if (col) { eqCol = col; eqFlow = !!flow; }
    const box = $('#wkBox'); if (!box) return;
    box.hidden = !EQ_ON;
    if (!EQ_ON) return;
    if (pausa) { box.innerHTML = '<div class="wkqh"><span class="wktit"><span class="sig"><b>Tu</b> <i>semana</i></span></span>' + (MH_POS === 'no' ? mesHtml() : '') + '</div><span class="wkpausa">Semana en pausa: no perdés ninguna semana ni ficha</span>'; return; }
    const B = semSegs(), comp = semCompleta(), cump = semCumplida();
    const leg = comp ? '<span class="tagi sm"><span>Completa</span></span>' : cump ? '<span class="wkleg2" style="color:' + (eqFlow ? 'var(--txt)' : eqCol) + '">· Cumplida</span>' : '';
    const F = eqFlow ? 'url(#eqFlowG)' : eqCol;
    const showBars = WK.reg ? B : B.slice(0, 1);
    // Geometría: columnas angostas con aire para el rótulo; Visitas un poco aparte; el rayo al final
    const BAR = EQ_EST === 'barras', PX = 64, CW = BAR ? 30 : 20, H0 = 6, HB = 46, BOLT = 26;
    const xs = [0]; for (let i = 1; i < 4; i++) xs.push(xs[i - 1] + PX + (i === 1 ? 8 : 0));
    const W = WK.reg ? xs[3] + PX + BOLT : PX, cxc = i => xs[i] + PX / 2;
    const onIns = curScr === 'inicio' && !$('#inicio').hidden;
    let segs = '', labs = '', delay = 0;
    showBars.forEach((b, i) => {
      const full = b.on >= b.N, L = eqLuz(b.on / b.N), x0 = cxc(i) - CW / 2;
      let g = '<g class="bar' + (full ? ' full' : '') + '">';
      // Realista: una ranura oscura con LEDs finos adentro, como un medidor de verdad (sin imitar materiales)
      if (!BAR) g += '<rect class="rl-slot" x="' + (x0 - 4) + '" y="' + (H0 - 4) + '" width="' + (CW + 8) + '" height="' + (HB + 8) + '" rx="5"/>';
      const GP = BAR ? Math.max(3, Math.min(6, 24 / b.N)) : 2.2, sh = (HB - GP * (b.N - 1)) / b.N;
      for (let j = 0; j < b.N; j++) {
        const y = H0 + HB - (j + 1) * sh - j * GP, on = j < b.on, nw = on && j >= Math.max(0, semVisto[b.k]);
        let el;
        if (!BAR) {
          el = on ? '<rect class="rl-gl" x="' + (x0 - 2) + '" y="' + (y - 1.5).toFixed(1) + '" width="' + (CW + 4) + '" height="' + (sh + 3).toFixed(1) + '" rx="2" fill="' + F + '" opacity="' + (L.ha * (EQ_HALO ? 1.4 : .7)).toFixed(2) + '" filter="url(#eqBl' + i + ')"/>' +
                    '<rect x="' + x0 + '" y="' + y.toFixed(1) + '" width="' + CW + '" height="' + sh.toFixed(1) + '" rx="1.5" fill="' + F + '" opacity="' + L.bd + '"/>' +
                    '<rect class="rl-hi" x="' + (x0 + 2) + '" y="' + (y + .5).toFixed(1) + '" width="' + (CW - 4) + '" height="' + Math.min(1.1, sh * .3).toFixed(2) + '" fill="#fff" opacity="' + (.45 * L.bd).toFixed(2) + '"/>'
                  : '<rect x="' + x0 + '" y="' + y.toFixed(1) + '" width="' + CW + '" height="' + sh.toFixed(1) + '" rx="1.5" fill="' + F + '" fill-opacity=".22" stroke="' + F + '" stroke-opacity=".5" stroke-width=".8"/>';
        } else {
          // Barritas: tubos de neón cortos, con las mismas capas que los tubos del dial
          const cy = (y + sh / 2).toFixed(1), sw = Math.min(8.5, sh * .95), x1 = (x0 + sw / 2).toFixed(1), x2 = (x0 + CW - sw / 2).toFixed(1);
          const ln = (c, w, ex) => '<line class="' + c + '" x1="' + x1 + '" x2="' + x2 + '" y1="' + cy + '" y2="' + cy + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"' + ex + '/>';
          el = on ? ln('nb-ha', sw + 5, ' stroke="' + F + '" opacity="' + (L.ha * (EQ_HALO ? 1.3 : .8)).toFixed(2) + '" filter="url(#eqBl' + i + ')"') + ln('nb-bd', sw, ' stroke="' + F + '" opacity="' + L.bd + '"') + ln('nb-co', Math.max(1, sw * .32), ' stroke="#fff" opacity="' + L.co + '"')
                  : ln('nb-gl', sw, ' stroke="' + F + '" stroke-opacity=".34"') + ln('nb-gi', Math.max(1, sw - 2.4), ' stroke="var(--panel)" stroke-opacity=".55"') + ln('nb-gh', Math.max(.8, sw * .2), ' stroke="#fff" stroke-opacity=".12"');
        }
        g += '<g class="sg ' + (on ? 'on' : 'off') + (nw ? ' nw' : '') + '"' + (nw ? ' style="animation-delay:' + (delay * 0.14).toFixed(2) + 's"' : '') + '>' + el + '</g>';
        if (nw) delay++;
      }
      segs += g + '</g>';
      labs += '<text class="el' + (full ? ' full' : '') + '" x="' + cxc(i) + '" y="' + (H0 + HB + 17) + '" text-anchor="middle">' + b.n + '</text>';
    });
    const bolt = WK.reg ? '<g class="eqbolt' + (comp ? ' on' : '') + '" transform="translate(' + (xs[3] + PX + 6) + ' ' + (H0 + HB / 2 - 12) + ') scale(1)"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z"/></g>' : '';
    const aria = 'Tu semana. ' + (WK.reg ? B : B.slice(0, 1)).map(b => b.n + ': ' + Math.min(b.val, b.meta) + ' de ' + b.meta + (b.min ? ' minutos' : '')).join('. ') + '.' + (comp ? ' Semana completa.' : cump ? ' Semana cumplida.' : '');
    const fl = showBars.map((b, i) => '<filter id="eqBl' + i + '" filterUnits="userSpaceOnUse" x="-30" y="-30" width="' + (W + 60) + '" height="' + (H0 + HB + 60) + '"><feGaussianBlur stdDeviation="' + (eqLuz(b.on / b.N).hb * (BAR ? .7 : .45)).toFixed(1) + '"/></filter>').join('');
    const gr = '<linearGradient id="eqFlowG" gradientUnits="userSpaceOnUse" x1="0" y1="' + (H0 + HB) + '" x2="0" y2="' + H0 + '"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient>';
    const svg = '<svg class="eqsvg" data-halo="' + (EQ_HALO ? 1 : 0) + '" viewBox="-4 0 ' + (W + 8) + ' ' + (H0 + HB + 21) + '" style="max-width:' + (W + 8) + 'px" aria-hidden="true"><defs>' + fl + gr + '</defs>' + segs + bolt + labs + '</svg>';
    box.innerHTML = '<div class="wkqh"><span class="wktit"><span class="sig"><b>Tu</b> <i>semana</i></span>' + leg + '</span>' + (MH_POS === 'no' ? mesHtml() : '') + '</div>' +
      (WK.reg ? '<button class="eqhit" id="eqHit" aria-label="' + aria + ' Ver el detalle de tu semana.">' + svg + '</button>'
              : '<div style="display:flex;align-items:flex-end;gap:16px"><button class="eqhit" id="eqHit" style="width:auto" aria-label="' + aria + ' Ver el detalle de tu semana.">' + svg + '</button>' +
                '<div class="stack" style="flex:1;gap:8px;padding-bottom:20px"><span class="small muted" style="line-height:1.4">Activación, fuerza y cardio se encienden cuando registrás tu sesión.</span><button class="btn ghost sm wkinv" id="wkInv">Registrá tu sesión y mirá cómo entrenás</button></div></div>');
    if (onIns) semMarcarVisto();
    renderMuralHome();
  }
  function semMsg(dv, rec){
    if (pausa) return 'Semana en pausa: ' + V().tu + vb(' no baja', ' no bajan') + ' mientras tanto.';
    if (dv < 0) return V().down(rec);
    const m = semMetas();
    const fx = fichaProx(), fT = fx ? ' Te ' + (fx.falta === 1 ? 'falta 1 semana' : 'faltan ' + fx.falta + ' semanas') + ' para ' + fx.art + '.' : '';
    if (semCompleta()) return '<strong>¡Semana completa! ⚡</strong>' + (fT || ' Así se entrena.');
    if (semKey === 'lunes' && WK.vis === 0) return LAST_WK >= m.vis ? 'La semana pasada fue <strong>semana cumplida</strong>. ¡Vamos por otra! ⚡' : 'La semana pasada viniste ' + LAST_WK + ' de ' + m.vis + '. ¡Vamos con esta! ⚡';
    if (!semCumplida()) { const f = m.vis - WK.vis, fv = 'Te ' + (f === 1 ? 'falta <strong>1 visita</strong>' : 'faltan <strong>' + f + ' visitas</strong>');
      if (fx && fx.falta === 1) return fv + ' y esta semana te da ' + fx.art + ' ⚡';
      if (mesMarcas() === 3 && !MUR.cerrado) return fv + ' y cerrás tu <strong>Mes cumplido</strong> ⚡';
      return fv + ' para la semana cumplida ⚡'; }
    if (!WK.reg) return '<strong>¡Semana cumplida! ⚡</strong>' + (fT || ' Registrá tu sesión y mirá cómo entrenás.');
    const falta = [];
    if (WK.car < m.car) falta.push('<strong>' + (m.car - WK.car) + ' minutos de cardio</strong>');
    if (WK.fue < m.fue) { const f = m.fue - WK.fue; falta.push('<strong>' + (f === 1 ? '1 sesión' : f + ' sesiones') + ' de fuerza</strong>'); }
    if (WK.act < m.act) { const f = m.act - WK.act; falta.push('<strong>la activación</strong> ' + (f === 1 ? 'en 1 visita' : 'en ' + f + ' visitas')); }
    return 'Sumá ' + falta.slice(0, 2).join(' y ') + ' y la completás ⚡';
  }
  // Una sesión registrada en Entrenar: la visita (si todavía no entró hoy) y la fuerza. La rutina de hoy no tiene activación: llega con la sesión en tres partes.
  function semSesion(){ if (!hoyEntreno) WK.vis++; WK.fue++; WK.reg = true; }
  function semWeeks(){
    // Últimas 8 semanas desde las entradas simuladas: cumplida con la meta; "completa" simulada en parte de las cumplidas
    const off = (todayWd + 6) % 7, out = [];
    for (let w = 8; w >= 1; w--) {
      let n = 0; for (let c = 0; c < 7; c++) { const d = off + 1 + (w - 1) * 7 + c; if (entrenoDia.has(d)) n++; }
      const lunes = new Date(+ahora() - (off + w * 7) * 864e5), cu = n >= META_SEM;
      out.push({ n:n, cu:cu, co:cu && (w % 3 !== 2), f:lunes.getDate() + '/' + (lunes.getMonth() + 1) });
    }
    return out;
  }
  function renderSemanaDet(){
    const B = semSegs(), m = semMetas(), o = objP();
    $('#swBars').innerHTML = B.map((b, i) => {
      const v = Math.min(b.val, b.meta), sinReg = !WK.reg && i > 0;
      return '<div class="swk"><div class="between"><span style="font-weight:700">' + b.n + '</span><span class="small' + (v >= b.meta ? '' : ' muted') + '" style="' + (v >= b.meta ? 'color:var(--dat);font-weight:700' : '') + '">' +
        (sinReg ? 'Sin registros todavía' : v + ' de ' + b.meta + (b.min ? ' minutos' : '')) + '</span></div>' +
        '<div class="swsegs" aria-hidden="true">' + Array.from({ length:b.N }, (_, j) => '<i>' + (j < b.on ? '<b style="background:' + (eqFlow ? 'var(--zflow)' : eqCol) + ';opacity:' + eqLuz(b.on / b.N).bd + (EQ_HALO ? ';box-shadow:0 0 ' + Math.round(4 + 8 * b.on / b.N) + 'px ' + (eqFlow ? 'var(--z2)' : eqCol) : '') + '"></b>' : '') + '</i>').join('') + '</div>' +
        (i === 0 ? '<span class="small muted">Sale de tus entradas por molinete.</span>' : i === 3 ? '<span class="small muted">Cuenta el de la sala y el de afuera.</span>' : '') + '</div>';
    }).join('') + (WK.reg ? '' : '<div class="swk"><button class="btn ghost sm" data-go="rutinas">Registrá tu sesión y mirá cómo entrenás</button></div>');
    const fz = m.fue === m.vis ? 'fuerza en cada visita' : 'fuerza ' + m.fue + ' veces por semana';
    $('#swPorque').innerHTML = 'Tu objetivo es <strong>' + o[1] + '</strong>' + (OBJ.length ? '' : ' (el de partida, hasta que elijas el tuyo)') + ': tu profe te propone activación al empezar, ' + fz + ' y <strong>' + m.car + ' minutos de cardio</strong> por semana. Tu meta es venir <strong>' + m.vis + ' veces</strong>.';
    $('#swHist').innerHTML = semWeeks().map(w => '<div class="stack" style="gap:4px;align-items:center"><span class="mk' + (w.co ? ' co' : w.cu ? ' cu' : '') + '">' + (w.co ? '<svg width="11" height="16" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>' : '') + '</span><small>' + w.f + '</small></div>').join('');
    $('#swHist').setAttribute('aria-label', semWeeks().map(w => 'semana del ' + w.f + ': ' + (w.co ? 'completa' : w.cu ? 'cumplida' : 'sin marca')).join('; '));
    // Resumen del lunes: la primera vez que se abre en la semana. La app sugiere; la socia decide.
    const rs = $('#swResumen');
    if (semKey === 'lunes' && !lunesVisto) {
      rs.hidden = false;
      const met = LAST_WK >= m.vis;
      rs.innerHTML = '<span class="lbl">Tu semana pasada</span><span style="font-size:17px;font-weight:700;line-height:1.35">' +
        (met ? 'La semana pasada viniste ' + LAST_WK + '. ' + (m.vis < 5 ? '¿Repetimos o subimos a ' + (m.vis + 1) + '?' : '¿Repetimos?') : 'La semana pasada viniste ' + LAST_WK + ' de ' + m.vis + '. ¿Seguimos con ' + m.vis + ' o la ajustamos a ' + LAST_WK + '?') + '</span>' +
        '<div class="opts g2"><button class="opt" data-lw="keep">' + (met ? 'Repetir' : 'Seguir con ' + m.vis) + '</button>' + (met && m.vis >= 5 ? '' : '<button class="opt" data-lw="' + (met ? 'up' : 'down') + '">' + (met ? 'Subir a ' + (m.vis + 1) : 'Ajustar a ' + LAST_WK) + '</button>') + '</div>';
    } else rs.hidden = true;
  }
  function openSemana(){ renderSemanaDet(); go('semana'); }
  document.addEventListener('click', e => {
    if (e.target.closest('#eqHit')) { openSemana(); return; }
    if (e.target.closest('#wkInv')) { go('rutinas'); return; }
    const lw = e.target.closest('[data-lw]');
    if (lw) {
      lunesVisto = true; const m = semMetas();
      if (lw.dataset.lw === 'up') { META_SEM = Math.min(5, m.vis + 1); toast('Meta: ' + META_SEM + ' por semana. ¡Vamos! ⚡'); }
      else if (lw.dataset.lw === 'down') { META_SEM = Math.max(2, LAST_WK); toast('Meta: ' + META_SEM + ' por semana'); }
      else toast('Seguimos con ' + m.vis + ' por semana ⚡');
      renderForma(); renderSemanaDet();
    }
  });
  $('#swCardio').addEventListener('click', () => { $('#cardioSheet').hidden = false; });
  $('#cdX').addEventListener('click', () => { $('#cardioSheet').hidden = true; });
  $('#cardioSheet').addEventListener('click', e => { if (e.target.id === 'cardioSheet') $('#cardioSheet').hidden = true; });
  ['#cdMin', '#cdTipo'].forEach(id => $(id).addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; $$(id + ' .opt').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('#cdGo').addEventListener('click', () => {
    const min = +($('#cdMin [aria-pressed="true"]') || { dataset:{ min:30 } }).dataset.min, t = ($('#cdTipo [aria-pressed="true"]') || { textContent:'Otro' }).textContent;
    WK.car += min; WK.reg = true; $('#cardioSheet').hidden = true; renderForma(); renderSemanaDet();
    toast('Sumaste ' + min + ' minutos (' + t.toLowerCase() + ') a tu semana ⚡');
  });
  function renderObj(){
    $('#obOpts').innerHTML = OBJS.map(o => { const i = OBJ.indexOf(o[0]);
      return '<button class="objopt" data-obj="' + o[0] + '" aria-pressed="' + (i >= 0) + '"><span style="font-weight:700;font-size:16px">' + o[1] + '</span><small>' + o[2] + '</small>' + (i === 0 ? '<em>Principal</em>' : i === 1 ? '<em>Segundo</em>' : '') + '</button>'; }).join('');
  }
  $('#swObj').addEventListener('click', () => { renderObj(); $('#objSheet').hidden = false; });
  $('#obX').addEventListener('click', () => { $('#objSheet').hidden = true; });
  $('#objSheet').addEventListener('click', e => { if (e.target.id === 'objSheet') { $('#objSheet').hidden = true; return; }
    const b = e.target.closest('[data-obj]'); if (!b) return; const k = b.dataset.obj, i = OBJ.indexOf(k);
    if (i >= 0) OBJ.splice(i, 1); else { if (OBJ.length >= 2) OBJ.pop(); OBJ.push(k); }
    renderObj(); });
  $('#obGo').addEventListener('click', () => { $('#objSheet').hidden = true; renderForma(); renderSemanaDet(); toast('Objetivo: ' + objP()[1] + '. Tu semana se ajustó ⚡'); });
  $('#semPick').addEventListener('click', e => {
    const b = e.target.closest('[data-sem]'); if (!b) return; semKey = b.dataset.sem; lunesVisto = false; WK = semPreset(semKey);
    if (semKey === 'lunes') semMarcarVistoCero();
    $$('#semPick [data-sem]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; renderForma(); go('inicio');
  });
  $('#eqHalo').addEventListener('click', e => {
    const b = e.target.closest('[data-h]'); if (!b) return; EQ_HALO = b.dataset.h === '1';
    $$('#eqHalo [data-h]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; semMarcarVisto(); renderForma(); go('inicio');
  });
  $('#eqEst').addEventListener('click', e => {
    const b = e.target.closest('[data-ee]'); if (!b) return; EQ_EST = b.dataset.ee;
    $$('#eqEst [data-ee]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; semMarcarVisto(); renderForma(); go('inicio');
  });
  function semMarcarVistoCero(){ semVisto = { vis:0, act:0, fue:0, car:0 }; }
  $('#eqPick').addEventListener('click', e => {
    const b = e.target.closest('[data-eq]'); if (!b) return; EQ_ON = b.dataset.eq === '1';
    $$('#eqPick [data-eq]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; renderForma(); go('inicio');
  });

//#bloque 330
  renderEx();
  syncMomPick(); renderAcc(); renderToday(); renderHoy(); renderMuralHome(); avisosLater();
  step(0);
  go('login');
