/* Vivapp · Inicio: ocupación, NPS, Tu mes, detalle de la métrica, chequeo del día, aviso y momentos del día.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 160
  // ===== Ocupación para todos los socios =====
  const lvTxt = { low:'Poca gente', mid:'Gente moderada', high:'Mucha gente', full:'Completa' };
  let occOpen = true;
  // Ocupación: mismo criterio de color que los tramos (amarillo · cian · magenta · espectro), por porcentaje
  const OCC_S = [ { n:'Sarmiento', occ:34, f:1 }, { n:'López y Planes', occ:57, f:1.12 }, { n:'Alberdi', occ:92, f:1.22 }, { n:'Corrientes', occ:74, f:1.18 }, { n:'Santa Ana', occ:22, f:0.9 }, { n:'Posadas', occ:41, f:1.05 } ];
  // Promedio por hora (simulado con la forma de las entradas de Viva: picos a la mañana temprano y de 18 a 21)
  const OCC_H = { lv:[[5,10],[6,28],[7,52],[8,60],[9,45],[10,35],[11,30],[12,34],[13,30],[14,18],[15,16],[16,24],[17,46],[18,72],[19,86],[20,80],[21,62],[22,34]],
                  sa:[[8,30],[9,48],[10,62],[11,58],[12,44],[13,30],[14,20],[15,18],[16,22],[17,16]],
                  do:[[9,26],[10,38],[11,42],[12,34],[13,22],[14,14]] };
  const occLv = o => o >= cfg.tope ? 'full' : o >= 70 ? 'high' : o >= 40 ? 'mid' : 'low';
  const OCC_C = { low:'var(--z1)', mid:'var(--z2)', high:'var(--z3)', full:'url(#ocFlow)' }, OCC_N = { low:1, mid:2, high:3, full:4 };
  const OCC_T = { low:'Poca gente', mid:'Gente moderada', high:'Mucha gente', full:'Completa' };
  let occHow = false, occDia = (() => { const d = ahora().getDay(); return d === 6 ? 'sa' : d === 0 ? 'do' : 'lv'; })(), occSede = miSede;
  const occBg = k => k === 'full' ? 'var(--zflow)' : OCC_C[k];
  function renderOcc(){
    const mine = OCC_S.find(x => x.n === miSede), k = occLv(mine.occ);
    // Fila de Inicio: Tu sede · la sede · la ocupación
    const so = $('#sedeOcc');
    if (so) { so.style.setProperty('--oc', occBg(k)); so.dataset.lv = k;
      so.querySelectorAll('i').forEach((i, n) => i.classList.toggle('on', n < OCC_N[k]));
      $('#sedeChip').setAttribute('aria-label', 'Tu sede: ' + miSede + '. ' + OCC_T[k] + ' ahora, ' + mine.occ + '%. Ver todas las sedes y la gente por hora.'); }
    // Lista de sedes
    $('#occList').innerHTML = OCC_S.map(x => {
      const q = occLv(x.occ);
      return '<div class="occrow"><span class="ocn">' + x.n + (x.n === miSede ? ' <em>tu sede</em>' : '') + '</span><span class="ocb" style="--oc:' + occBg(q) + '"><i style="width:' + x.occ + '%"></i></span><span class="ocp" style="--oc:' + occBg(q) + '">' + x.occ + '%</span></div>';
    }).join('');
    $('#occHow').setAttribute('aria-expanded', occHow); $('#occHow').classList.toggle('open', occHow); $('#occChart').hidden = !occHow;
    if (occHow) renderOccChart();
  }
  function renderOccChart(){
    const sd = OCC_S.find(x => x.n === occSede), H = OCC_H[occDia].map(([h, v]) => [h, Math.min(99, Math.round(v * sd.f))]);
    $('#occSedes').innerHTML = OCC_S.filter(x => x.occ !== null).map(x => '<button class="opt" data-os="' + x.n + '" aria-pressed="' + (x.n === occSede) + '">' + x.n + '</button>').join('');
    $$('#occDia [data-od]').forEach(b => b.setAttribute('aria-pressed', b.dataset.od === occDia));
    const W = 340, Hh = 150, top = 14, base = 118, n = H.length, bw = (W - 8) / n, now = ahora(), hoyT = (d => d === 6 ? 'sa' : d === 0 ? 'do' : 'lv')(now.getDay()), hNow = now.getHours();
    let g = '<defs><linearGradient id="ocFlow" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient><filter id="ocGl" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>';
    [40, 70].forEach(t => { const y = base - (base - top) * t / 100; g += '<line x1="0" x2="' + W + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-dasharray="3 4"/>'; });
    H.forEach(([h, v], i) => {
      const q = occLv(v), x = 4 + i * bw + bw * .18, w = bw * .64, y = base - (base - top) * v / 100, c = OCC_C[q], cur = occDia === hoyT && h === hNow;
      if ($('.app').dataset.barras === 'eq') {
        const SH = 4.2, SG = 1.8, nOn = Math.max(1, Math.round((base - y) / (SH + SG))), nAll = Math.round((base - top) / (SH + SG));
        for (let q2 = 0; q2 < nAll; q2++) { const yy = base - (q2 + 1) * (SH + SG) + SG, on = q2 < nOn;
          g += on ? '<rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + SH + '" rx="1" fill="' + c + '" opacity=".5" filter="url(#ocGl)"/><rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + SH + '" rx="1" fill="' + c + '"/>'
                  : '<rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + SH + '" rx="1" fill="#fff" opacity=".05"/>'; }
        if (cur) g += '<rect x="' + (x - 2).toFixed(1) + '" y="' + (y - 2).toFixed(1) + '" width="' + (w + 4).toFixed(1) + '" height="' + (base - y + 3).toFixed(1) + '" rx="3" fill="none" stroke="#fff" stroke-width="1.4"/>';
      } else
      g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (base - y).toFixed(1) + '" rx="2.5" fill="' + c + '" opacity=".55" filter="url(#ocGl)"/>' +
           '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (base - y).toFixed(1) + '" rx="2.5" fill="' + c + '"' + (cur ? ' stroke="#fff" stroke-width="1.6"' : ' opacity=".9"') + '/>';
      if (cur) g += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" text-anchor="middle" class="ocnow">ahora</text>';
      if (i % 2 === 0 || n <= 8) g += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (base + 15) + '" text-anchor="middle" class="ocx">' + h + '</text>';
    });
    $('#occSvg').innerHTML = '<svg class="ocsvg" viewBox="0 0 ' + W + ' ' + (Hh - 10) + '" role="img" aria-label="Gente promedio por hora en ' + occSede + ', ' + { lv:'de lunes a viernes', sa:'los sábados', do:'los domingos' }[occDia] + '. ' + H.map(([h, v]) => h + ' h: ' + v + '%').join(', ') + '.">' + g + '</svg>';
    // La franja más tranquila de 2 horas (sin la primera hora de apertura)
    let best = 1; for (let i = 1; i < n - 1; i++) if (H[i][1] + H[i + 1][1] < H[best][1] + H[best + 1][1]) best = i;
    const pico = H.reduce((a, b) => b[1] > a[1] ? b : a);
    $('#occTip').innerHTML = 'Lo más tranquilo: <strong>de ' + H[best][0] + ' a ' + (H[best + 1][0] + 1) + ' h</strong>. Lo más lleno: alrededor de las ' + pico[0] + ' h.';
  }
  $('#occHow').addEventListener('click', () => { occHow = !occHow; renderOcc(); });
  $('#occDia').addEventListener('click', e => { const b = e.target.closest('[data-od]'); if (!b) return; occDia = b.dataset.od; renderOccChart(); });
  $('#occSedes').addEventListener('click', e => { const b = e.target.closest('[data-os]'); if (!b) return; occSede = b.dataset.os; renderOccChart(); });

//#bloque 210
  // ===== Señales de satisfacción: NPS trimestral en fecha fija =====
  let npsVal = null, npsDone = false;
  $('#npsOpts').innerHTML = Array.from({ length:11 }, (_, i) => '<button type="button" data-nps="' + i + '" aria-pressed="false" aria-label="' + i + '">' + i + '</button>').join('');
  $('#npsOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-nps]'); if (!b) return;
    npsVal = +b.dataset.nps; $$('#npsOpts button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#npsMore').hidden = false;
  });
  $('#npsSend').addEventListener('click', () => {
    npsDone = true;
    $('#npsCard').innerHTML = '<span class="lbl">¡Gracias!</span><span style="font-weight:700">Tu respuesta llega al equipo de Viva.</span><span class="small muted">La próxima te la hacemos en 3 meses. Mirá abajo lo que ya cambiamos gracias a lo que nos dicen los socios.</span>';
    toast(npsVal <= 6 ? 'Gracias. Te va a escribir alguien de Viva' : 'Gracias por tu respuesta');
  });
  $('#npsLater').addEventListener('click', () => { npsDone = true; $('#npsCard').hidden = true; avisosLater(); toast('Te la volvemos a mostrar más adelante'); });

//#bloque 250
  // ----- Tu mes en Inicio: 4 segmentos, uno por semana del mes (apagado · tenue = cumplida · pleno con ⚡ = completa) -----
  // Semanas cumplidas de este mes, en orden, con si fueron completas (cada semana cuenta para el mes de su jueves)
  function mesSemanas(){
    if (!MUR) return [];
    let L = (MUR.prevW || []).slice(0, MUR.prevMes);
    while (L.length < MUR.prevMes) L.push(false);
    if (semCumplida()) L.push(semCompleta());
    if (MUR.cerrado) { if (MUR.cerradoC) L = L.map(() => true); while (L.length < 3) L.push(!!MUR.cerradoC); }
    return L.slice(0, 4);
  }
  function renderMuralHome(){
    const c = $('#mesCard'); if (!c) return;
    c.hidden = !MUR || !nvVer('mes'); if (c.hidden) return;   // T11 · Mes cumplido aparece en la semana 4
    const L = mesSemanas(), n = L.length, comp = n >= 3 && L.filter(x => x).length >= 3, mes = meses[HOY_D.getMonth()];
    const col = eqFlow ? 'var(--z2)' : eqCol;
    $('#mesNm').textContent = MES_ABR[HOY_D.getMonth()];
    const BAR = EQ_EST === 'barras', W = 340, H = BAR ? 16 : 18, GP = BAR ? 10 : 6, sw = (W - 3 * GP) / 4, F = eqFlow ? 'url(#msFlow)' : eqCol;
    let g = '<defs><linearGradient id="msFlow" x1="0" x2="1"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient>' +
      '<filter id="msBl" filterUnits="userSpaceOnUse" x="-20" y="-20" width="' + (W + 40) + '" height="' + (H + 40) + '"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="msBl2" filterUnits="userSpaceOnUse" x="-20" y="-20" width="' + (W + 40) + '" height="' + (H + 40) + '"><feGaussianBlur stdDeviation="1.6"/></filter></defs>';
    // Realista: una ranura oscura con 4 LEDs; cumplida = encendida a media luz; completa = plena, con halo y rayo
    if (!BAR) g += '<rect class="rl-slot" x="-4" y="-4" width="' + (W + 8) + '" height="' + (H + 8) + '" rx="6"/>';
    const BOLT = 'M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z';
    for (let i = 0; i < 4; i++) {
      const st = i >= n ? 'off' : L[i] ? 'full' : 'half', x = i * (sw + GP), Lz = eqLuz(st === 'full' ? 1 : st === 'half' ? .45 : 0);
      if (!BAR) {
        g += eqCeldaFila(x, 0, sw, H, st !== 'off', F, Lz, 'msBl');   // T16: la misma celda que usan los demás medidores
      } else {
        const y = H / 2, x1 = (x + H / 2).toFixed(1), x2 = (x + sw - H / 2).toFixed(1), ln = (w, ex) => '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y + '" y2="' + y + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"' + ex + '/>';
        g += st === 'off'
          ? ln(H * .62, ' stroke="' + F + '" stroke-opacity=".34"') + ln(H * .62 - 2.4, ' stroke="var(--panel)" stroke-opacity=".55"') + ln(H * .14, ' stroke="#fff" stroke-opacity=".12"')
          : ln(H * .62 + 6, ' stroke="' + F + '" opacity="' + (Lz.ha * 1.2).toFixed(2) + '" filter="url(#msBl)"') + ln(H * .62, ' stroke="' + F + '" opacity="' + Lz.bd + '"') + ln(H * .2, ' stroke="#fff" opacity="' + Lz.co + '"');
      }
      if (st === 'full') g += '<path d="' + BOLT + '" transform="translate(' + (x + sw / 2 - 5.2).toFixed(1) + ' ' + (H / 2 - 7.8).toFixed(1) + ') scale(.65)" fill="#06080c"' + (BAR ? ' stroke="#fff" stroke-width="1.4" paint-order="stroke"' : '') + '/>';
    }
    const bar = $('#mesBar'); bar.innerHTML = '<svg class="mssvg" viewBox="-6 -6 ' + (W + 12) + ' ' + (H + 12) + '" aria-hidden="true">' + g + '</svg>';
    const nc = L.filter(x => x).length;
    bar.setAttribute('aria-label', 'Tu mes, ' + mes + ': ' + (n >= 3 ? 'Mes cumplido, ' + n + ' semanas cumplidas' : n + ' de 3 semanas cumplidas') + (nc ? ', ' + nc + (nc === 1 ? ' completa' : ' completas') : '') + '. Ver tu mural.');
    $('#mesTxt').innerHTML = pausa ? 'Plan en pausa: tu mes no pierde nada.'
      : comp ? '<strong>Mes cumplido ⚡</strong> Tu cartel de ' + mes + ' brilla con todo.'
      : n >= 3 ? '<strong>¡Mes cumplido!</strong> Tu cartel de ' + mes + ' ya es tuyo.'
      : n === 0 ? 'Tu neón de ' + mes + ' arranca con tu primera semana cumplida ⚡'
      : 'Llevás <strong>' + n + ' de 3</strong> semanas cumplidas en ' + mes + ' ⚡';
  }
  const irMural = () => { renderMural(); go('muralScr'); };
  $('#mesVer').addEventListener('click', irMural); $('#mesBar').addEventListener('click', irMural);
  $('#mtPick').addEventListener('click', e => {
    const b = e.target.closest('[data-mt]'); if (!b) return; MUR_TXT = b.dataset.mt;
    $$('#mtPick [data-mt]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; renderForma(); irMural();
  });

//#bloque 290
  // ===== Métrica principal · detalle =====
  // Semanas desde 0 hasta cada zona viniendo a la meta (no depende de la meta: la escala es relativa a ella)
  const lunesProx = () => { const d = new Date(+ahora() + (((8 - todayWd) % 7) || 7) * 864e5); return d.getDate() + '/' + (d.getMonth() + 1); };
  const semHasta = u => { const L = patMeta(400), vs = ritmoCorre(L, L.map(() => false)), k = vs.findIndex(v => v * 100 >= u); return Math.max(1, Math.ceil((k + 1) / 7)); };
  function renderFormaDet(){
    const s = serie(), v = s[s.length - 1].f, dv = v - s[s.length - 8].f, z = zona(v), zs = zonas(), nom = V().nom;
    const pts = s.slice(-85), W = 320, H = 150, L = 26, R = 8, T = 8, B = 22, X = i => L + i * (W - L - R) / (pts.length - 1), Y = val => T + (1 - val / 100) * (H - T - B);
    let svg = '<svg class="fcurve" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + nom + ' en las últimas 12 semanas: hoy ' + v + ', ' + z[0] + '.">';
    zs.forEach((q, i) => { const top = i < zs.length - 1 ? zs[i + 1][0] : 100; svg += '<rect x="' + L + '" width="' + (W - L - R) + '" y="' + Y(top).toFixed(1) + '" height="' + (Y(q[0]) - Y(top)).toFixed(1) + '" fill="' + q[2] + '" opacity=".08"/>'; });
    zs.map(q => q[0]).concat([100]).forEach(t => svg += '<text x="' + (L - 6) + '" y="' + (Y(t) + 3).toFixed(1) + '" text-anchor="end">' + t + '</text>');
    pts.forEach((p, i) => { if (p.fr) svg += '<rect x="' + (X(i) - 2).toFixed(1) + '" width="4" y="' + T + '" height="' + (H - T - B) + '" fill="var(--blue)" opacity=".35"/>'; });
    const line = pts.map((p, i) => X(i).toFixed(1) + ',' + Y(p.f).toFixed(1)).join(' ');
    svg += '<polygon class="ca" points="' + X(0).toFixed(1) + ',' + (H - B) + ' ' + line + ' ' + X(pts.length - 1).toFixed(1) + ',' + (H - B) + '"/><polyline class="cl" points="' + line + '"/>';
    svg += '<circle cx="' + X(pts.length - 1).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="5" fill="var(--dat)"/>';
    svg += '<text x="' + L + '" y="' + (H - 6) + '">hace 12 semanas</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">hoy</text></svg>';
    $('#fdHead').innerHTML = '<div class="between" style="align-items:flex-end"><span class="fhito' + (v >= zs[zs.length - 1][0] ? ' flow' : '') + '" style="color:' + z[1] + '">' + z[0] + '</span><span class="stack" style="gap:4px;align-items:flex-end;flex-shrink:0"><span class="fnumsm">' + v + '<small> de 100</small></span><span class="fdelta" style="color:' + (dv >= 0 ? 'var(--dat)' : 'var(--orange)') + '">' + (dv > 0 ? '▲ +' + dv + ' contra la semana pasada' : dv < 0 ? '▼ ' + dv + ' contra la semana pasada' : '= igual que la semana pasada') + '</span></span></div>' + svg +
      '<div class="flegend"><span><i style="background:var(--txt)"></i>' + nom + '</span><span><i style="background:var(--blue);opacity:.5"></i>Feriado (no cuenta)</span></div>' +
      '<span class="small muted" style="line-height:1.45">La caída de hace unas 7 semanas son tus 12 días de vacaciones. Si la próxima vez pausás tu plan, no baja.</span>';
    $$('#fdMeta .opt').forEach(b => { const m = +b.dataset.m; b.setAttribute('aria-pressed', m === (META_PROX || META_SEM)); b.disabled = PLAN_TOPE !== null && m > PLAN_TOPE; });
    $('#fdPlan').textContent = PLAN_TOPE ? 'Tu plan: ' + PLAN_TOPE + ' veces por semana' : 'Plan Mensual libre';
    $('#fdMetaTxt').textContent = Cap(V().tu) + vb(' se mide', ' se miden') + ' contra esta meta: 100 es venir ' + META_SEM + ' veces en 7 días. ' + (META_PROX ? 'Desde el lunes ' + lunesProx() + ', tu meta es ' + META_PROX + ': esta semana cierra con ' + META_SEM + '.' : 'Si la cambiás, rige desde el lunes: esta semana cierra con la meta con la que empezó.');
    $('#fdZonas').innerHTML = zs.map((q, i) => { const top = i < zs.length - 1 ? zs[i + 1][0] - 1 : 100, cur = v >= q[0] && v <= top, sem = q[0] ? semHasta(q[0]) : 0;
      return '<div class="zrow' + (cur ? ' cur' : '') + '"><i' + (i === zs.length - 1 ? ' class="flow"' : '') + ' style="background:' + q[2] + '"></i><span><b>' + q[1] + (cur ? ' · estás acá' : '') + '</b><small>' + (sem === 1 ? 'Con tu primera semana completa' : sem ? 'Viniendo a tu meta, desde cero: unas ' + sem + ' semanas' : 'Las primeras semanas') + '</small></span><span class="small muted">' + q[0] + '–' + top + '</span></div>'; }).join('');
    const row = (sym, col, t, d) => '<div class="howrow"><span style="color:' + col + ';font-weight:700;width:30px;flex-shrink:0;text-align:center">' + sym + '</span><span><b>' + t + '</b>' + d + '</span></div>';
    $('#fdHow').innerHTML = row('+', 'var(--dat)', V().subeT, 'Entrás por el molinete, en cualquier sede, y suma. Cuenta igual si entrenás liviano o pesado. Dos veces el mismo día cuentan como una.') +
      row('−', 'var(--orange)', V().bajaT, V().bajaD) +
      row('=', 'var(--blue)', 'No cuenta cuando no depende de vos', 'Con tu plan pausado, en los feriados y los días que tu sede está cerrada no ' + vb('baja', 'bajan') + '.') +
      row('100', 'var(--txt)', 'Es cumplir tu meta en los últimos 7 días', 'Tu primera semana completa ya es "' + zs[2][1] + '"' + (V().flow ? '; a las 2 semanas, "VIVA Flow". Faltar una semana no te saca de ahí.' : '.')) +
      row('?', 'var(--muted)', 'Lo que no mide', V().noMide + ' <button class="inlink" data-fitgo>Ver Índice FIT</button>');
    $('#fdPausa').hidden = !pausa;
    if (pausa) $('#fdPausa').textContent = 'Tu plan está pausado del ' + ddmm(pausa.desde) + ' al ' + ddmm(pausa.hasta) + ': mientras tanto ' + V().tu + vb(' no baja', ' no bajan') + ' (' + v + ').';
  }
  $('#fdMeta').addEventListener('click', e => {
    const b = e.target.closest('[data-m]'); if (!b || b.disabled) return; const m = +b.dataset.m; if (m === (META_PROX || META_SEM)) return;
    META_PROX = m === META_SEM ? null : m; renderFormaDet(); renderForma();   // T11 · rige desde el lunes: el número de hoy no cambia
    toast(META_PROX ? 'Desde el lunes ' + lunesProx() + ', tu meta es ' + m + ' por semana. Esta semana cierra con ' + META_SEM + '.' : 'Tu meta sigue en ' + META_SEM + ' por semana');
  });

  // ===== Hoy: preparación del día (chequeo de 3 toques + cansancio de los últimos 7 días) =====
  const prep = { done:false, skip:false, score:null, resp:{} };
  function prepBaja(){ return prep.score !== null && prep.score < 45; }
  function cargaPts(){ // 0–40: cuánto vino en los últimos 7 días contra su meta (T11: sin modelo de fatiga aparte)
    let n = hoyEntreno ? 1 : 0; for (let d = 1; d <= 6; d++) if (entrenoDia.has(d)) n++;
    let p = n > META_SEM + 1 ? 18 : n > META_SEM ? 26 : 34; if (Object.values(recState).includes('mid')) p -= 4;
    return Math.max(0, Math.min(40, p));
  }
  function calcPrep(){
    const r = prep.resp, c = cargaPts();
    const sc = prep.skip ? Math.min(69, Math.round(c * 2.5)) : c + (r.pSueno || 0) + (r.pDolor || 0) + (r.pEnergia || 0);
    prep.score = Math.max(5, Math.min(100, sc)); prep.done = true; renderHoy(); renderToday(); updWhy();
  }
  function renderHoy(){
    // El chequeo del día es UNA pregunta (ficha de Inicio 2.2; instrucción de Entrenar, 7). Solo antes de ir o en la sala.
    const mm = typeof MOM === 'undefined' ? 'antes' : MOM, chq = mm === 'antes' || mm === 'sala';
    const fu = typeof chkFuHtml === 'function' ? chkFuHtml() : '';
    if (!chq) {
      $('#prepAsk').hidden = true;
      $('#hoyRow').innerHTML = mm === 'sesion' ? '' : '<span class="hdot" style="background:var(--dat)"></span><span style="flex:1">' + (mm === 'descanso' ? '<strong>Hoy descansás:</strong> tu semana ya está cumplida.' : (typeof NOENT !== 'undefined' && NOENT && mm === 'despues') ? '<strong>Entrenaste hoy ⚡</strong> <span class="muted">La visita se suma cuando llegue tu entrada.</span>' : '<strong>' + V().hoy + '</strong>') + '</span>';
      $('#hoyRow').hidden = mm === 'sesion'; avisosLater(); return; }
    if (!prep.done) { $('#hoyRow').hidden = true; $('#prepAsk').hidden = false; $('#prepAsk').innerHTML = chkHtml(false); avisosLater(); return; }
    $('#prepAsk').hidden = !fu; $('#prepAsk').innerHTML = fu;
    $('#hoyRow').hidden = false;
    let dot = 'var(--muted)', txt;
    const zt = typeof zonaTxt === 'function' && CUIDA ? zonaTxt(CUIDA) : '';
    const res = { bien:MOLESTIA ? '<strong>Hoy: ' + zonaTxt(MOLESTIA.zona) + ' está bien.</strong> <span class="muted">Sesión normal.</span>' : '<strong>Resuelto ⚡</strong> <span class="muted">Hoy, sesión normal.</span>',
      igual:'<strong>Hoy cuidamos ' + zt + '.</strong> <span class="muted">Con alternativas y sin subir la carga.</span>',
      peor:'<strong>Hoy ' + zt + ' descansa.</strong> <span class="muted">Evitamos los ejercicios que la cargan.</span>',
      cuidar:'<strong>Hoy cuidamos ' + zt + '.</strong> <span class="muted">Ya cambiamos tu rutina.</span>',
      profe:'<strong>Hoy: lo hablás con Lucas.</strong> <span class="muted">Ya le avisamos.</span>',
      menor:'<strong>Hoy: contale a tu profe.</strong> <span class="muted">Lucas te ayuda a cuidarte.</span>' }[CHK];
    if (res) txt = '<span style="flex:1">' + res + '</span>';
    else { const v = prep.score; dot = v >= 70 ? 'var(--dat)' : v >= 45 ? 'var(--orange)' : 'var(--pink)';
      txt = '<span style="flex:1"><strong>Hoy: ' + (prep.skip ? 'entrená normal' : v >= 70 ? 'estás para darlo todo' : v >= 45 ? 'entrená normal, sin buscar récords' : 'conviene algo suave') + '.</strong> <span class="muted">Preparación ' + v + (prep.skip ? ', solo con tu entrenamiento' : '') + '.</span></span>'; }
    $('#hoyRow').innerHTML = '<span class="hdot" style="background:' + dot + '"></span>' + txt + '<button class="link lime" id="prepRedo" style="min-height:44px;padding:0;font-size:13px">Cambiar</button>';
    avisosLater();
  }
  let askOpen = false;
  $('#hoyRow').addEventListener('click', e => {
    if (e.target.closest('#prepRedo')) { chkReset(); renderHoy(); updWhy(); renderEntHoy(); }
  });
  function updWhy(){
    const v = prep.score;
    $('#todayWhy').textContent = v === null ? 'Elegida con lo que registraste: el lunes hiciste piernas.'
      : v >= 70 ? 'Elegida según cómo venís hoy (' + v + ') y lo que registraste: el lunes hiciste piernas.'
      : v >= 45 ? 'Preparación ' + v + ': hacela completa, pero sin buscar récords hoy.'
      : 'Preparación ' + v + ': te bajamos 10% las cargas. Si preferís, cambiá a una rutina de movilidad.';
    $('#todayWhy').style.color = v === null || v >= 70 ? 'var(--dat)' : v >= 45 ? 'var(--orange)' : 'var(--yel)';
  }
  $('#prepAsk').addEventListener('click', e => { if (typeof chkClick === 'function') chkClick(e); });

  // ===== Aviso antes del horario habitual (muestra; el horario sale de entries de EVO) =====
  let notifT;
  $('#notifDemo').addEventListener('click', () => {
    const r = renderForma(), n = $('#notif');
    n.innerHTML = '<div class="between"><span class="small" style="font-weight:700">VIVA · ahora</span><span class="small muted">Solés venir a las 19:00</span></div>' +
      '<span style="font-size:15px;line-height:1.4"><strong>¡Hola Martina!</strong> ' + (r.dv < 0 ? V().down(r.rec) : Cap(V().tu) + ': ' + zona(r.v)[0] + ' ⚡ ' + (r.g.n ? 'Si venís ' + vez(r.g.n) + ' más esta semana, ' + (r.g.sube ? 'llegás a ' + r.g.meta : vb('se mantiene', 'se mantienen')) + '.' : 'Vas bien esta semana.')) + ' ¿Cómo venís hoy?</span>' +
      '<div class="opts g2"><button class="opt" data-nf="todo">Con todo</button><button class="opt" data-nf="normal">Normal</button><button class="opt" data-nf="sinen">Sin energía</button><button class="opt" data-nf="cuidar">Con algo para cuidar</button></div>';
    n.hidden = false; clearTimeout(notifT); notifT = setTimeout(() => n.hidden = true, 9000);
  });
  $('#notif').addEventListener('click', e => {
    const b = e.target.closest('[data-nf]'); if (!b) return;
    const v = b.dataset.nf; $('#notif').hidden = true;
    if (v === 'cuidar') { go('inicio'); chkAnswer('cuidar'); return; } // elegir la zona pide abrir la app
    chkAnswer(v); toast('Respondido desde el aviso');
  });

  // Volumen por músculo (Avanzado): series registradas en los últimos 7 días. Sin promedio ni déficit: sirve para repartir el trabajo.
  function renderCarga(){
    if (!$('#volList')) return; // v58: el volumen vive en el informe de Progreso (T12)
    const g = {};
    Object.keys(hist).forEach(k => hist[k].forEach(e => { if (diasDesde(e[0]) <= 7) g[lib[k].grupo] = (g[lib[k].grupo] || 0) + lib[k].sets.length; }));
    const L = Object.keys(g).map(k => [k, g[k]]).sort((a, b) => b[1] - a[1]), mx = L.length ? L[0][1] : 1;
    $('#volList').innerHTML = !L.length ? '<span class="small muted">Cuando registres tus series, acá ves cómo repartís el trabajo.</span>' : L.map(([n, v]) =>
      '<div class="restrow"><span style="width:150px;font-size:14px;font-weight:500;line-height:1.25">' + n + '</span><span class="bar"><i style="width:' + Math.round(v / mx * 100) + '%;background:var(--dat)"></i></span><span class="small muted" style="width:70px;text-align:right">' + v + ' series</span></div>').join('');
  }
  function showSum(sum){
    const kgTxt = sum.kg ? Math.round(sum.kg).toLocaleString('es-AR') + ' kg' : '—';
    PROG_MIN = sum.min;
    $('#sesSumGrid').innerHTML = '<span><b>' + sum.min + ' min</b>Duración</span><span><b>' + sum.series + ' de ' + sum.total + '</b>Series</span>' + (expProg() === 'arranco' ? '' : '<span><b>' + kgTxt + '</b>Levantados</span>');
    $('#sesKcal').textContent = !sum.series ? 'No registraste series hoy. Tocá el tilde de cada serie y acá ves lo que hiciste.' : '';
    const prev = hoyEntreno; hoyEntreno = false; const f0 = serie().slice(-1)[0].f; hoyEntreno = true; const f1 = serie().slice(-1)[0].f; hoyEntreno = prev;
    const zt = zonas()[zonas().length - 1][0];
    $('#sesForma').hidden = false; $('#sesForma').innerHTML = '<span><strong>' + (V().flow && f1 >= zt && f0 < zt ? '¡Estás en VIVA Flow! ⚡' : V().up(f0, f1)) + '</strong> Cuenta porque viniste, entrenes liviano o pesado.</span>';
    $('#sesSum').hidden = false;
  }


  const SV_BOLT = '<svg class="vbolt" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>';

//#bloque 320
  // ===== v38 · Inicio por momentos (claude/ficha-seccion-inicio.md, 2.1 y 3) =====
  var MOM = 'antes', ACC_POS = 'abajo', visHoy = false, sesHecha = false, FIT_NOV = 'medicion', PREM_N = PREM_N || 0, PLAN_AV = !!PLAN_AV, avT = null;
  const ICO_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>';
  const ICO_SES = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>';
  const ICO_ENT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/></svg>';
  function syncMomPick(){ $$('#momPick [data-mom]').forEach(x => x.setAttribute('aria-pressed', x.dataset.mom === MOM)); $('.app').dataset.mom = MOM; }
  function setMom(k, quiet){
    // La visita de hoy cuenta apenas entra por el molinete (provisoria): en la sala, con la sesión abierta y después
    const conVis = k === 'sala' || k === 'sesion' || k === 'despues';
    if (k === 'antes' && semCumplida() && !visHoy) { semKey = 'mitad'; WK = semPreset('mitad'); $$('#semPick [data-sem]').forEach(x => x.setAttribute('aria-pressed', x.dataset.sem === 'mitad')); }
    if (k === 'descanso') { if (visHoy) { WK.vis = Math.max(0, WK.vis - 1); visHoy = false; } if (!semCumplida()) { semKey = 'cumplida'; WK = semPreset('cumplida'); $$('#semPick [data-sem]').forEach(x => x.setAttribute('aria-pressed', x.dataset.sem === 'cumplida')); } }
    if (conVis && !visHoy) { WK.vis++; visHoy = true; }
    if (!conVis && visHoy) { WK.vis = Math.max(0, WK.vis - 1); visHoy = false; }
    hoyEntreno = conVis; sesHecha = false; MOM = k; syncMomPick();
    if (k !== 'sesion' && k !== 'despues') SALA = null;
    if (k === 'sesion' && !SALA) salaDemo();
    if (!quiet) { renderForma(); renderHoy(); renderToday(); renderAcc(); avisosLater(); }
    if (typeof renderEntHoy === 'function') renderEntHoy();
  }
  function renderAcc(){
    const r = rutinas[actual], dk = 'Día ' + r.dias[r.next].k;
    let lbl = null, cls = '', ico = '';
    if (!pausa) {
      if (MOM === 'antes' || MOM === 'sala') { lbl = 'Empezar · ' + dk; cls = 'on go'; ico = ICO_PLAY; }
      else if (MOM === 'sesion') { lbl = 'Volver a tu sesión'; cls = 'on'; ico = ICO_SES; }
    }
    const cen = ACC_POS === 'centro';
    $('#accBar').hidden = !lbl || cen;
    if (lbl) { const b = $('#accBtn'); b.className = 'accbtn ' + cls; b.innerHTML = ico.replace('<svg ', '<svg width="20" height="20" ') + '<span>' + lbl + '</span>'; b.setAttribute('aria-label', lbl.replace(' ⚡', '')); }
    const na = $('#navAcc'), tab = $('#nav [data-go="hoy"]');
    na.hidden = !cen; tab.hidden = cen;
    const on = MOM === 'sala' || MOM === 'sesion';
    na.className = 'navacc' + (on ? ' on' : '') + (MOM === 'sala' ? ' go' : '');
    na.querySelector('.nai').innerHTML = MOM === 'sala' ? ICO_PLAY : MOM === 'sesion' ? ICO_SES : ICO_ENT;
    na.querySelector('.nal').textContent = MOM === 'sala' ? 'Empezar' : MOM === 'sesion' ? 'Tu sesión' : 'Entrenar';
    $('.app').dataset.accbar = !$('#accBar').hidden && curScr === 'inicio' ? '1' : '0';
    if (['hoy', 'rutinas', 'progreso', 'ia', 'entrenando', 'sala', 'cierre'].includes(curScr)) na.setAttribute('aria-current', 'page'); else na.removeAttribute('aria-current');
  }
  function accGo(){ if (MOM === 'sesion') { if (!SALA) salaDemo(); renderSala(); go('sala'); } else go('hoy'); }
  $('#accBtn').addEventListener('click', accGo);
  $('#navAcc').addEventListener('click', accGo);
  $('#momPick').addEventListener('click', e => {
    const b = e.target.closest('[data-mom]'); if (!b) return; setMom(b.dataset.mom);
    $('#demoSheet').hidden = true; go('inicio');
    toast({ antes:'Antes de ir: todavía no vino hoy', sala:'En la sala: entró por el molinete', sesion:'Sesión abierta: está entrenando', despues:'Después: ya entrenó hoy', descanso:'Día sin entrenar: la semana ya está cumplida' }[MOM]);
  });
  $('.app').dataset.ah = 'espectro';
  $('#haloPick').addEventListener('click', e => { const b = e.target.closest('[data-ah]'); if (!b) return; $('.app').dataset.ah = b.dataset.ah; $$('#haloPick [data-ah]').forEach(x => x.setAttribute('aria-pressed', x === b)); if (MOM !== 'sala') setMom('sala'); $('#demoSheet').hidden = true; go('inicio'); });
  $('#accPick').addEventListener('click', e => {
    const b = e.target.closest('[data-acc]'); if (!b) return; ACC_POS = b.dataset.acc;
    $$('#accPick [data-acc]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; renderAcc(); go('inicio');
  });
  // Ocupación: el chip de la sede abre el detalle
  $('#sedeChip').addEventListener('click', () => { renderOcc(); $('#occSheet').hidden = false; });
  $('#occX').addEventListener('click', () => { $('#occSheet').hidden = true; });
  $('#occSheet').addEventListener('click', e => { if (e.target.id === 'occSheet') $('#occSheet').hidden = true; });
  // Avisos de contexto: como mucho 2 y solo cuando corresponden, en este orden
  function avisosLater(){ clearTimeout(avT); avT = setTimeout(renderAvisos, 0); }
  function renderAvisos(){
    const ref = $('#todayCard'); if (!ref) return;
    const cands = [
      ['clubPromo', PREM_N > 0],
      ['planAviso', PLAN_AV],
      ['fitBox', nIB > 0 && !!FIT_NOV && nvVer('fit')],
      ['fitPromo', nIB === 0 && !fitPromoNo && nvVer('fit')],
      ['npsCard', (MOM === 'despues' || MOM === 'descanso') && !npsDone && !prep.done]
    ];
    let shown = 0, last = ref;
    cands.forEach(([id, ok]) => {
      const el = $('#' + id); if (!el) return;
      const vis = ok && shown < 2; el.hidden = !vis;
      if (vis) { shown++; if (last.nextElementSibling !== el) last.insertAdjacentElement('afterend', el); last = el; }
    });
    const ev = ['fitBox', 'fitPromo'].map(i => $('#' + i)).find(e => e && !e.hidden); if (ev && ref.previousElementSibling !== ev) ref.insertAdjacentElement('beforebegin', ev); // Tu evolución: siempre arriba de Tu rutina hoy
    const hr = $('#hoyRow'), ic = $('#iniChk'); if (hr && ic) { const sh = !hr.hidden && !!hr.textContent.trim(); ic.hidden = !sh; if (sh) { const c = hr.cloneNode(true), x = c.querySelector('#prepRedo'); if (x) x.remove(); ic.innerHTML = c.innerHTML; } } // v57 · Inicio muestra el resultado del día, no la pregunta
    const cp = $('#clubPromo'); if (cp && !cp.hidden && cp.parentElement.lastElementChild !== cp) cp.parentElement.appendChild(cp); // Club Viva: siempre la última caja
    const fbx = $('#fitBox'); fbx.classList.toggle('nov', !!FIT_NOV); $('#fitNov').textContent = FIT_NOV ? (nIB === 1 ? 'tu punto de partida' : 'medición nueva') : '';
  }
  setSmode('desafios'); renderMatches(); renderEvol(); renderCorr(); renderGente(); syncInt();
  renderOcc(); renderClases(); renderPlan(); renderNuevo(); renderFit(); renderForma(); renderHoy(); renderCarga(); renderLanding();


//#bloque 318
  // ===== T11 · Primeras 8 semanas: un estado de la app, no otra app (tickets/T11-primeras-8-semanas.md, propuesta del 13/11) =====
  // Fuentes: fecha de alta (EVO members) + entries (un día de atraso) + base propia (meta, cómo se sintió, comentario y revisión del profe).
  // NUEVO = semana del programa (0 = día del alta … 8) o null fuera de la etapa. Lo que se esconde vuelve solo en su semana (revelado de a uno, registro 13/11).
  var NUEVO = null, NV_VOLVIO = false, NV_PREV = null, PR_MAS = false, VMN = { toca:0 };
  var NV_PROFE = 'Lucas', NV_COM = 'Vas muy bien con la sentadilla: bajás derecha y sin apuro. El jueves sumamos el remo.';
  function nvVer(k){ return NUEVO == null || ({ mes:4, fit:4, mas:4, bandas:4, sede:9, variantes:9 }[k] || 0) <= NUEVO; }
  function nvTiene(d){ return d === 0 ? hoyEntreno : entrenoDia.has(d); }
  function nvSemCount(a, b){ let n = 0; for (let d = a; d <= b; d++) if (nvTiene(d)) n++; return n; }   // entradas entre a y b días atrás
  function nvVino(){ return nvSemCount(0, NUEVO * 7) > 0; }
  function nvFecha(n){ const d = new Date(+ahora() + n * 864e5); return ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1); }
  function nvRev(k){ return k === NUEVO ? 'mañana, ' + nvFecha(1) + ', 18 h' : nvFecha((k - NUEVO) * 7 + 1) + ', 18 h'; }   // el turno lo da Viva Gestión (simulado)
  // Disparadores (punto 7): día 7 sin primera visita → un mensaje · 14 → bandera · 7 ya viniendo → nada · 10 a 14 → un mensaje sin culpa + bandera · 28 → silencio · vuelve → "Volviste"
  function nvDisp(){
    if (NUEVO == null) return null;
    if (NV_VOLVIO) return 'volvio';
    if (!nvVino()) return NUEVO * 7 >= 14 ? 'sin14' : NUEVO * 7 >= 7 ? 'sin7' : 'alta';
    const a = AUS_N || 0; return a >= 28 ? 'silencio' : a >= 10 ? 'falta' : null;
  }
  function nvGoal(dv){   // el texto bajo Tu ritmo: en las primeras semanas, nunca "estás perdiendo ritmo"
    if (NUEVO == null) return null;
    if (!nvVino()) return 'Tu ritmo arranca con tu primera visita y sube rápido: tu primera semana completa ya es <strong>Firme</strong>.';
    if (dv < 0) return 'Sube rápido cuando venís y baja despacio cuando faltás.';
    return null;
  }
  function nvAplicar(s){
    if (s == null) { if (NUEVO != null) { NUEVO = null; NV_VOLVIO = false; PR_MAS = false; entrenoDia.clear(); NV_PREV.dias.forEach(d => entrenoDia.add(d)); META_SEM = NV_PREV.meta; META_PROX = null; NV_PREV = null; WK = semPreset(semKey); } }
    else {
      if (NUEVO == null) NV_PREV = { dias:[...entrenoDia], meta:META_SEM };
      NUEVO = s; NV_VOLVIO = false; META_SEM = 3; META_PROX = null; sacados.length = 0; ausente = false; AUS_N = 0;
      entrenoDia.clear(); for (let d = 1; d < s * 7; d++) { const wd = ((todayWd - d) % 7 + 7) % 7; if ([1, 3, 5].includes(wd) && !cerrado.has(d)) entrenoDia.add(d); }
    }
    nvRefresh();
  }
  function nvVolvio(){ for (let d = 2; d <= 15; d++) if (entrenoDia.has(d)) { entrenoDia.delete(d); sacados.push(d); } entrenoDia.add(1); NV_VOLVIO = true; ausente = false; AUS_N = 0; nvRefresh(); }
  function nvRefresh(){
    if (NUEVO != null) { const m = semMetas(), off = (todayWd + 6) % 7; let c = hoyEntreno ? 1 : 0; for (let d = 1; d <= off; d++) if (entrenoDia.has(d)) c++;
      WK = { vis:c, act:Math.min(c, m.act), fue:Math.min(c, m.fue), car:Math.min(m.car, c * 20), reg:c > 0 }; }
    const db = $('#desafBox'); if (db) db.hidden = !nvVer('sede');   // La sede del mes, después de la semana 8
    renderForma(); renderMuralHome(); renderAvisos(); nvRender(); renderProg(); if (typeof renderEntHoy === 'function') renderEntHoy();
  }
  // La caja "Tus primeras 8 semanas": ocupa el lugar de Tu mes hasta la semana 4; después va arriba de Tu mes
  function nvRender(){
    let c = $('#nvCard'); if (!c) { c = document.createElement('div'); c.className = 'card'; c.id = 'nvCard'; c.style.gap = '10px'; $('#mesCard').insertAdjacentElement('beforebegin', c); }
    const dp = nvDisp(); c.hidden = NUEVO == null || dp === 'silencio'; if (c.hidden) return;
    const s = NUEVO, P = 'tu profe <b>' + NV_PROFE + '</b>', rev = s === 4 || s === 8;
    const arriba = !!dp || rev || s === 3, ref = arriba ? $('#formaCard') : $('#mesCard'); if (c.nextElementSibling !== ref) ref.insertAdjacentElement('beforebegin', c);   // con algo que hacer o leer hoy, arriba de Tu ritmo
    const t = dp === 'alta' ? '<b>Bienvenida a Viva ⚡</b> En tu primera visita, ' + P + ' te recibe, te muestra la sala y te deja la rutina lista. Tu meta: <b>' + META_SEM + ' por semana</b>. Tu profe sabe cuando llegás, para recibirte.'
      : dp === 'sin7' || dp === 'sin14' ? 'Tu rutina está lista y ' + P + ' te espera para tu primera visita, el día que te quede bien.'
      : dp === 'falta' ? 'Cuando quieras volver, tu rutina está lista y ' + P + ' también.'
      : dp === 'volvio' ? '<b>Volviste ⚡</b> Tu rutina sigue lista y ' + P + ' sabe que llegaste.'
      : rev ? '<b>Tu revisión de la semana ' + s + '</b> con ' + P + ': ' + nvRev(s) + ', en tu sede. Tu resumen ya está armado.'
      : s === 3 ? '<b>' + NV_PROFE + ':</b> “' + NV_COM + '”'
      : s === 6 ? 'Tus primeras 3 semanas: <b>' + nvSemCount(22, 42) + ' visitas</b>. Las últimas 3: <b>' + nvSemCount(0, 21) + '</b>. Tu próxima revisión: semana 8, ' + nvRev(8) + '.'
      : s < 4 ? 'Tu profe <b>' + NV_PROFE + '</b> te acompaña en tus primeras visitas. Tu revisión con él: <b>semana 4</b>, ' + nvRev(4) + '.'
      : 'Tu próxima revisión con ' + P + ': <b>semana 8</b>, ' + nvRev(8) + '.';
    c.innerHTML = '<div class="between"><span class="wktit"><span class="sig"><b>Tus</b> <i>primeras 8 semanas</i></span></span><span class="small muted">' + (s ? 'Semana ' + s + ' de 8' : 'Hoy arrancás') + '</span></div>' +
      '<span style="line-height:1.5">' + t + '</span>' + (rev && !dp ? '<button class="btn ghost sm" id="nvRevGo">Ver tu resumen</button>' : '');
  }
  // La revisión de las semanas 4 y 8 (reemplaza al premio "Tu punto de partida con tu profe"; registro 13/11)
  const nvSh = document.createElement('div'); nvSh.className = 'sheet'; nvSh.id = 'nvRevSheet'; nvSh.hidden = true; nvSh.setAttribute('role', 'dialog'); nvSh.setAttribute('aria-labelledby', 'nvRevT');
  nvSh.innerHTML = '<div class="sheetin" id="nvRevIn" style="gap:14px"></div>'; $('#demoSheet').insertAdjacentElement('beforebegin', nvSh);
  const NV_MIRA = { bien:'Tu movilidad: cómo te movés y qué conviene cuidar.', forma:'Tu rutina, y una medición InBody si la querés.', ver:'Tu primera medición InBody: tu punto de partida.', musc:'Tu primera medición InBody: tu punto de partida.', rend:'Una evaluación funcional pensada para tu deporte.' };
  function nvRevAbrir(){
    const k = NUEVO >= 8 ? 8 : 4, base = NUEVO * 7, W = []; for (let i = 1; i <= k; i++) W.push(nvSemCount(base - i * 7 + 1, base - (i - 1) * 7));
    const tot = W.reduce((a, b) => a + b, 0), pv = primerasVeces().length, fila = (l, n) => '<div class="between"><span>' + l + '</span><span><b>' + n + '</b> ' + (n === 1 ? 'visita' : 'visitas') + (n >= META_SEM ? ' ⚡' : '') + '</span></div>';
    const blk = (t, h) => '<div class="card" style="gap:8px"><span class="lbl">' + t + '</span>' + h + '</div>';
    $('#nvRevIn').innerHTML = '<div class="between"><h2 class="h2" id="nvRevT">Tu revisión de la semana ' + k + '</h2><button class="link lime" id="nvRevX" style="min-height:44px">Listo</button></div>' +
      '<span class="small muted" style="line-height:1.45">Con tu profe ' + NV_PROFE + ' · ' + nvRev(k) + ', en tu sede. La app arma este resumen y tu profe lo ve antes.</span>' +
      blk('Tus visitas · tu meta: ' + META_SEM + ' por semana', W.map((n, i) => fila('Semana ' + (i + 1), n)).join('')) +
      (k === 8 ? blk('Tu mes 1 y tu mes 2', '<span>Semanas 1 a 4: <b>' + W.slice(0, 4).reduce((a, b) => a + b, 0) + '</b> visitas · semanas 5 a 8: <b>' + W.slice(4).reduce((a, b) => a + b, 0) + '</b></span>') : '') +
      blk('Lo que hiciste', '<span style="line-height:1.5">' + tot + ' entrenamientos registrados · ' + pv + (pv === 1 ? ' primera vez' : ' primeras veces') + '. Cómo te sentiste: casi siempre <b>Justa</b>; una vez <b>Al límite</b>.</span><span class="src">Ejemplo</span>') +
      blk('Qué miran juntos', '<span style="line-height:1.5">' + NV_MIRA[OBJ[0] || 'forma'] + (k === 4 ? ' Y tu profe te explica tu informe de Progreso: desde la revisión lo ves completo.' : '') + '</span>') +
      blk('Después, elegís tu meta', '<div class="opts" id="nvRevMeta" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">' + [2, 3, 4, 5].map(m => '<button class="opt" data-nvm="' + m + '" aria-pressed="' + (m === (META_PROX || META_SEM)) + '">' + m + '</button>').join('') + '</div><span class="small muted">Por semana. Rige desde el lunes ' + lunesProx() + '; bajarla también está bien.</span>') +
      (k === 8 ? '<span class="small" style="line-height:1.45">Tu próxima revisión, la de la semana 12, ya quedó agendada: ' + nvFecha(29) + ', 18 h.</span>' : '');
    nvSh.hidden = false;
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#nvRevGo')) { nvRevAbrir(); return; }
    if (e.target.closest('#nvRevX') || e.target === nvSh) { nvSh.hidden = true; return; }
    const b = e.target.closest('[data-nvm]'); if (b) { const m = +b.dataset.nvm; META_PROX = m === META_SEM ? null : m; nvRevAbrir(); renderForma(); toast(META_PROX ? 'Desde el lunes ' + lunesProx() + ', tu meta es ' + m + ' por semana' : 'Tu meta sigue en ' + META_SEM + ' por semana'); return; }
    if (e.target.closest('#vmnBtn')) { PR_MAS = !PR_MAS; if (PR_MAS) VMN.toca++; renderProg(); return; }
  });
  // Progreso: hasta la revisión de la semana 4, lo que hizo y su profe arriba; nada de bandas, "por debajo" ni ceros (punto 11)
  function expMas(){ const e = expProg(); return e === 'arranco' && PR_MAS && nvVer('mas') && !(typeof esMenor === 'function' && esMenor()) ? 'habitual' : e; }
  var NV_ANC = null;
  function nvProg(x){
    const pf = $('#prProfe'), bc = $('#bienCard'), mp = $('#prMapa'); if (!pf || !bc || !mp) return;
    if (!NV_ANC) { NV_ANC = [document.createComment('prProfe'), document.createComment('bienCard')]; pf.before(NV_ANC[0]); bc.before(NV_ANC[1]); }
    const ve = nvVer('bandas');
    mp.hidden = !ve; $('#prEq').hidden = !ve; if (!ve) { $('#prVol').hidden = true; mp.before(pf); mp.before(bc); bc.hidden = false; } else { NV_ANC[0].after(pf); NV_ANC[1].after(bc); }
    if (NUEVO != null) {
      $$('#pvList > div > .small').forEach(e => e.textContent = '');   // las fechas de la demo son anteriores al alta simulada: se omiten antes que mostrar algo que no pasó
      $('#prProfeF').textContent = NUEVO >= 3 ? 'semana 3' : '';
      $('#prProfeTxt').textContent = NUEVO >= 3 ? NV_COM : 'En tu semana 3, tu profe te deja un comentario sobre lo que registraste.';
      $('#prProfeRev').innerHTML = NUEVO < 8 ? '<b>Tu revisión: semana ' + (NUEVO < 4 ? 4 : 8) + '</b><span>Con ' + NV_PROFE + ', en tu sede · ' + nvRev(NUEVO < 4 ? 4 : 8) + '.</span>' : '<b>Tu próxima revisión: semana 12</b><span>Con ' + NV_PROFE + ', ya agendada.</span>';
    }
    let vb = $('#vmnBtn'); if (!vb) { vb = document.createElement('button'); vb.className = 'link lime'; vb.id = 'vmnBtn'; vb.style.cssText = 'min-height:44px;align-self:center'; bc.parentElement.lastElementChild.insertAdjacentElement('beforebegin', vb); }
    const ar = expProg() === 'arranco' && !(typeof esMenor === 'function' && esMenor()) && nvVer('mas');
    vb.hidden = !ar; vb.textContent = PR_MAS ? 'Ver menos números' : 'Ver más números';
  }
  // Lo que ve el profe (punto 12): solo en el panel de demo
  function nvProfeTxt(){
    if (NUEVO == null) return 'Elegí una semana para ver lo que le llega al profe.';
    const dp = nvDisp(), s = NUEVO, L = [];
    if (dp === 'alta') L.push('Alta nueva asignada a vos: recibila en su primera visita y dejale la rutina cargada en 48 h.');
    else if (dp === 'sin7') L.push('Día 7 sin primera visita: el encargado la contacta. A vos no te llega nada todavía.');
    else if (dp === 'sin14') L.push('<b>Bandera:</b> 14 días desde el alta sin primera visita.');
    else if (dp === 'falta') L.push('<b>Bandera:</b> ' + AUS_N + ' días sin venir. A la socia le salió un mensaje sin culpa.');
    else if (dp === 'silencio') L.push('28 días sin venir: la app no le escribe más. Queda en la lista de gestión.');
    else if (dp === 'volvio') L.push('Aviso de entrada: volvió después de 14 días. Saludala como siempre, sin contar los días.');
    else if (AUS_N >= 7) L.push('7 días sin venir: nada. Es normal al arrancar.');
    else if (s <= 2) L.push('Aviso de entrada en cada visita de las dos primeras semanas: saludala y preguntale cómo le fue.');
    if (s === 3 && !dp) L.push('Pedido: una línea de comentario. La app te arma el dato: ' + nvSemCount(0, 21) + ' visitas y ' + primerasVeces().length + ' primeras veces.');
    if ((s === 4 || s === 8) && !dp) L.push('Revisión de la semana ' + s + ': resumen listo (visitas contra la meta, sesiones, cómo se sintió).');
    L.push('Avisos a la socia esta semana: ' + (s === 0 ? 'ninguno; la bienvenida está en la app.' : s <= 2 ? 'hasta 2 (la víspera del día que eligió y la pregunta del lunes).' : '1 (la pregunta del lunes).') + ' Nunca el fin de semana.');
    return L.join('<br>');
  }
