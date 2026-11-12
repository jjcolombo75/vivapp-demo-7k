/* Vivapp · Inicio: ocupación, NPS, Tu mes, detalle de la métrica, chequeo del día, aviso y momentos del día.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 160
  // ===== Ocupación para todos los socios =====
  const lvTxt = { low:'Poca gente', mid:'Gente moderada', high:'Mucha gente', full:'Completa' };
  let occOpen = true;
  // Ocupación: mismo criterio de color que los tramos (amarillo · cian · magenta · espectro), por porcentaje
  const OCC_S = [ { n:'Sarmiento', occ:34, f:1 }, { n:'López y Planes', occ:57, f:1.12 }, { n:'Alberdi', occ:92, f:1.22 }, { n:'Costanera', occ:null }, { n:'Santa Ana', occ:null }, { n:'Posadas', occ:null, pronto:true } ];
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
      if (x.occ === null) return '<div class="occrow nod"><span class="ocn">' + x.n + '</span><span class="small muted">' + (x.pronto ? 'Abre pronto' : 'Sin datos todavía') + '</span></div>';
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
  // Semanas cumplidas de este mes, en orden, con si fueron completas (cada semana cuenta para el mes en que termina)
  function mesSemanas(){
    if (!MUR) return [];
    let L = (MUR.prevW || []).slice(0, MUR.prevMes);
    while (L.length < MUR.prevMes) L.push(false);
    if (semCumplida()) L.push(semCompleta());
    if (MUR.cerrado) { if (MUR.cerradoC) L = [true, true, true, true]; else while (L.length < 4) L.push(false); }
    return L.slice(0, 4);
  }
  // Semanas que todavía pueden contar este mes (simulado: el mes de la demo tiene 4 semanas)
  const mesQuedan = () => Math.max(0, 4 - (MUR ? MUR.prevMes + (MUR.prevMiss || 0) : 0));
  function renderMuralHome(){
    const c = $('#mesCard'); if (!c) return;
    c.hidden = !MUR; if (!MUR) return;
    const L = mesSemanas(), n = L.length, comp = n >= 4 && L.every(x => x), mes = meses[HOY_D.getMonth()];
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
    bar.setAttribute('aria-label', 'Tu mes, ' + mes + ': ' + n + ' de 4 semanas cumplidas' + (nc ? ', ' + nc + (nc === 1 ? ' completa' : ' completas') : '') + '. Ver tu mural.');
    const falta = 4 - n, quedan = mesQuedan() - (semCumplida() ? 0 : 0);
    $('#mesTxt').innerHTML = pausa ? 'Plan en pausa: tu mes no pierde nada.'
      : comp ? '<strong>¡Mes completo! ⚡</strong> Tu cartel de ' + mes + ' brilla con todo.'
      : n >= 4 ? '<strong>¡Mes cumplido!</strong> Tu cartel de ' + mes + ' ya es tuyo ⚡'
      : falta > quedan ? 'Este mes ya no llega al cartel. Cada semana igual suma a tu ritmo y a tus fichas.'
      : 'Te ' + (falta === 1 ? 'falta <strong>1 semana</strong>' : 'faltan <strong>' + falta + ' semanas</strong>') + ' para tu neón de ' + mes + ' ⚡';
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
  const semHasta = u => { let c = 0, d = 0; while (c < u / 100 && d < 400) { c += (1 - c) / TAU_F; d++; } return Math.round(d / 7); };
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
    $$('#fdMeta .opt').forEach(b => { const m = +b.dataset.m; b.setAttribute('aria-pressed', m === META_SEM); b.disabled = PLAN_TOPE !== null && m > PLAN_TOPE; });
    $('#fdPlan').textContent = PLAN_TOPE ? 'Tu plan: ' + PLAN_TOPE + ' veces por semana' : 'Plan Mensual libre';
    $('#fdMetaTxt').textContent = Cap(V().tu) + vb(' se mide', ' se miden') + ' contra esta meta: 100 es venir ' + META_SEM + ' veces todas las semanas. Si la cambiás, el número se recalcula con la nueva meta.';
    $('#fdZonas').innerHTML = zs.map((q, i) => { const top = i < zs.length - 1 ? zs[i + 1][0] - 1 : 100, cur = v >= q[0] && v <= top, sem = q[0] ? semHasta(q[0]) : 0;
      return '<div class="zrow' + (cur ? ' cur' : '') + '"><i' + (i === zs.length - 1 ? ' class="flow"' : '') + ' style="background:' + q[2] + '"></i><span><b>' + q[1] + (cur ? ' · estás acá' : '') + '</b><small>' + (sem ? 'Viniendo a tu meta, desde cero: unas ' + sem + ' semanas' : 'Las primeras semanas') + '</small></span><span class="small muted">' + q[0] + '–' + top + '</span></div>'; }).join('');
    const row = (sym, col, t, d) => '<div class="howrow"><span style="color:' + col + ';font-weight:700;width:30px;flex-shrink:0;text-align:center">' + sym + '</span><span><b>' + t + '</b>' + d + '</span></div>';
    $('#fdHow').innerHTML = row('+', 'var(--dat)', V().subeT, 'Entrás por el molinete, en cualquier sede, y suma. Cuenta igual si entrenás liviano o pesado. Dos veces el mismo día cuentan como una.') +
      row('−', 'var(--orange)', V().bajaT, V().bajaD) +
      row('=', 'var(--blue)', 'No cuenta cuando no depende de vos', 'Con tu plan pausado, en los feriados y los días que tu sede está cerrada no ' + vb('baja', 'bajan') + '.') +
      row('100', 'var(--txt)', 'Es venir a tu meta todas las semanas, sin cortar', 'Se llega en unos 6 meses. Mucho antes ya llegás a "' + zs[2][1] + '"' + (V().flow ? ', y a las 11 semanas, a "VIVA Flow".' : '.')) +
      row('?', 'var(--muted)', 'Lo que no mide', V().noMide + ' <button class="inlink" data-fitgo>Ver Índice FIT</button>');
    $('#fdPausa').hidden = !pausa;
    if (pausa) $('#fdPausa').textContent = 'Tu plan está pausado del ' + ddmm(pausa.desde) + ' al ' + ddmm(pausa.hasta) + ': mientras tanto ' + V().tu + vb(' no baja', ' no bajan') + ' (' + v + ').';
  }
  $('#fdMeta').addEventListener('click', e => {
    const b = e.target.closest('[data-m]'); if (!b || b.disabled) return; const m = +b.dataset.m; if (m === META_SEM) return;
    const antes = serie().slice(-1)[0].f; META_SEM = m; const ahora = serie().slice(-1)[0].f;
    renderFormaDet(); renderForma(); toast('Meta: ' + m + ' por semana · ' + V().tu + vb(' pasa', ' pasan') + ' de ' + antes + ' a ' + ahora);
  });

  // ===== Hoy: preparación del día (chequeo de 3 toques + cansancio de los últimos 7 días) =====
  const prep = { done:false, skip:false, score:null, resp:{} };
  function prepBaja(){ return prep.score !== null && prep.score < 45; }
  function cargaPts(){ // 0–40: cansancio de corto plazo contra la forma
    const s = serie(), h = s[s.length - 1], ratio = h.atl / Math.max(0.05, h.ctl);
    let p = ratio > 1.4 ? 18 : ratio > 1.15 ? 26 : 34; if (Object.values(recState).includes('mid')) p -= 4;
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
    $('#todayWhy').textContent = v === null ? 'Elegida según tu recuperación: tus piernas todavía descansan del lunes.'
      : v >= 70 ? 'Elegida según cómo estás hoy (' + v + '): tus piernas descansan del lunes, la espalda está lista.'
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
      if (MOM === 'sesion') { lbl = 'Volver a tu sesión'; cls = 'on'; ico = ICO_SES; }
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
  $('.app').dataset.ah = 'quieto';
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
      ['fitBox', nIB > 0 && !!FIT_NOV],
      ['fitPromo', nIB === 0 && !fitPromoNo],
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

