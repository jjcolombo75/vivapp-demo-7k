/* Vivapp · Panel de demo: cajas, trama, coach flotante, modo, panel general y panel de Entrenar.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 050
  // Cajas apagadas (por defecto) o encendidas
  $('.app').dataset.cajas = 'off';
  $('.app').dataset.barras = 'eq';
  ['tono', 'trama', 'esq', 'barras'].forEach(k => $('#' + k + 'Pick').addEventListener('click', e => { const b = e.target.closest('[data-' + k + ']'); if (!b) return; $('.app').dataset[k] = b.dataset[k]; $$('#' + k + 'Pick [data-' + k + ']').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  // Trama en las cajas: una capa de vectores detrás del contenido de cada caja (también en las que se dibujan después)
  const TBOX = '.k-caja'; // T16: la lista vive en SISTEMA (comun.js, bloque 015)
  const esqOn = () => /^(cajas|ambos)$/.test($('.app').dataset.esq || '');
  function tramaCajas(){
    if (esqOn()) $$(TBOX).forEach(el => { if (el.querySelector(':scope > .ecj')) return;
      if (getComputedStyle(el).position === 'static') el.classList.add('tcjRel');
      el.classList.add('tcjBox'); el.insertAdjacentHTML('afterbegin', '<span class="ecj" aria-hidden="true"></span>'); });
    if ($('.app').dataset.trama !== 'cajas') return;
    $$(TBOX).forEach(el => { if (el.querySelector(':scope > .tcj')) return;
      if (getComputedStyle(el).position === 'static') el.classList.add('tcjRel');
      el.classList.add('tcjBox'); el.insertAdjacentHTML('afterbegin', '<svg class="tcj" aria-hidden="true" focusable="false"><rect width="100%" height="100%" fill="url(#patTileC)"/></svg>'); });
  }
  let tramaT = null; new MutationObserver(() => { if ($('.app').dataset.trama === 'cajas' || esqOn()) { clearTimeout(tramaT); tramaT = setTimeout(tramaCajas, 60); } }).observe($('.app'), { childList:true, subtree:true });
  $('#barrasPick').addEventListener('click', () => setTimeout(() => { if (typeof renderOccChart === 'function' && !$('#occChart').hidden) renderOccChart(); }, 0));
  ['#tramaPick', '#esqPick'].forEach(q => $(q).addEventListener('click', () => setTimeout(tramaCajas, 0)));
  // v49 · intensidad de las esquinas, fondo y cajas (100% = hasta v47); si están apagadas, las enciende en el fondo
  $('#esqInt').addEventListener('input', e => { const v = +e.target.value, ap = $('.app'); ap.style.setProperty('--esqO', v / 250); $('#esqIntV').textContent = v + '%';
    if (!ap.dataset.esq || ap.dataset.esq === 'no') { const n = 'fondo'; ap.dataset.esq = n; $$('#esqPick [data-esq]').forEach(x => x.setAttribute('aria-pressed', x.dataset.esq === n)); setTimeout(tramaCajas, 0); } });
  $('#cajaPick').addEventListener('click', e => { const b = e.target.closest('[data-cajas]'); if (!b) return; $('.app').dataset.cajas = b.dataset.cajas; $$('#cajaPick [data-cajas]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  // Coach IA (futuro): solo como opción de demo
  const COACH_ICO = {
    rayo:'<svg viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>',
    chispa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C12.8 8 16 11.2 22 12C16 12.8 12.8 16 12 22C11.2 16 8 12.8 2 12C8 11.2 11.2 8 12 2Z" fill="currentColor"/></svg>',
    globo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5A8.5 8.5 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.2 6.5 9 12.6h3l-1.2 4.9 4.2-6.3h-3l1.2-4.7z" fill="currentColor"/></svg>'
  };
  let coach = { on:false, ico:'rayo', col:'#07b0f2', nuevo:false };
  const APP = $('.app'), CF = $('#coachFab'), CB = $('#coachBox');
  let cpos = null, cprev = null, cOpen = false, cT = 0;
  const appR = () => APP.getBoundingClientRect();
  const clampC = p => { const r = appR(); return { x:Math.max(8, Math.min(r.width - 64, p.x)), y:Math.max(8, Math.min(r.height - 64, p.y)) }; };
  const placeC = p => { CF.style.left = p.x + 'px'; CF.style.top = p.y + 'px'; };
  const specSync = el => { el.style.animationDelay = -((Date.now() % 9000) / 1000) + 's'; };
  function renderCoach(){
    const spec = coach.col === 'espectro';
    CF.innerHTML = COACH_ICO[coach.ico]; [CF, CB].forEach(el => { el.style.setProperty('--cc', spec ? '#07b0f2' : coach.col); el.classList.toggle('spec', spec); });
    CF.classList.toggle('nuevo', coach.nuevo); specSync(CF);
    const show = coach.on && !$('#nav').hidden; CF.hidden = !show; APP.classList.toggle('coachon', coach.on);
    if (show && !cpos) { const r = appR(); cpos = clampC({ x:r.width - 68, y:r.height - 148 }); }
    if (show && !cOpen) placeC(cpos);
    if (!show && cOpen) closeCoach(true);
    $('#coachNew').textContent = coach.nuevo ? 'Sin novedades del Coach' : 'Simular que el Coach tiene algo nuevo';
  }
  function openCoach(){
    if (cOpen) return; cOpen = true; clearTimeout(cT); coach.nuevo = false; renderCoach();
    const r = appR(), xr = r.width - 68, moved = Math.abs(cpos.x - xr) > 2;
    cprev = { ...cpos }; placeC({ x:xr, y:cpos.y });
    cT = setTimeout(() => {
      const W = Math.min(320, r.width - 24), down = cpos.y + 28 < r.height / 2;
      CB.classList.toggle('down', down); CB.classList.toggle('up', !down);
      CB.style.right = (r.width - (xr + 56)) + 'px';
      if (down) { CB.style.top = cpos.y + 'px'; CB.style.bottom = 'auto'; } else { CB.style.bottom = (r.height - (cpos.y + 56)) + 'px'; CB.style.top = 'auto'; }
      $('#coachIn').style.width = W + 'px';
      CB.style.width = '56px'; CB.style.height = '56px'; CB.hidden = false; CB.classList.remove('open'); specSync(CB); specSync($('#coachClose'));
      void CB.offsetWidth;
      const H = $('#coachIn').scrollHeight;
      CB.classList.add('open'); CB.style.width = W + 'px'; CB.style.height = Math.max(56, H) + 'px';
    }, moved ? 280 : 0);
  }
  function closeCoach(now){
    if (!cOpen) return; cOpen = false; clearTimeout(cT);
    CB.classList.remove('open'); CB.style.width = '56px'; CB.style.height = '56px';
    cT = setTimeout(() => { CB.hidden = true; if (cprev) { cpos = cprev; placeC(cpos); } }, now ? 0 : 360);
  }
  // Arrastrar el botón a cualquier lugar; un toque (sin arrastre) abre o cierra la caja
  let dragS = null;
  CF.addEventListener('pointerdown', e => { dragS = { x:e.clientX, y:e.clientY, px:parseFloat(CF.style.left) || 0, py:parseFloat(CF.style.top) || 0, moved:false }; CF.setPointerCapture(e.pointerId); });
  CF.addEventListener('pointermove', e => {
    if (!dragS) return; const dx = e.clientX - dragS.x, dy = e.clientY - dragS.y;
    if (!dragS.moved && Math.hypot(dx, dy) < 6) return;
    if (!dragS.moved) { dragS.moved = true; CF.classList.add('drag'); if (cOpen) { closeCoach(true); dragS.px = parseFloat(CF.style.left); dragS.py = parseFloat(CF.style.top); } }
    cpos = clampC({ x:dragS.px + dx, y:dragS.py + dy }); placeC(cpos);
  });
  CF.addEventListener('pointerup', () => { if (!dragS) return; const m = dragS.moved; dragS = null; CF.classList.remove('drag'); if (!m) (cOpen ? closeCoach() : openCoach()); });
  CF.addEventListener('pointercancel', () => { dragS = null; CF.classList.remove('drag'); });
  CF.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cOpen ? closeCoach() : openCoach(); } });
  $('#coachClose').addEventListener('click', () => closeCoach());
  const pick = (id, attr, key, conv) => $(id).addEventListener('click', e => { const b = e.target.closest('[' + attr + ']'); if (!b) return; coach[key] = conv(b.getAttribute(attr)); $$(id + ' [' + attr + ']').forEach(x => x.setAttribute('aria-pressed', x === b)); renderCoach(); });
  pick('#coachOn', 'data-coach', 'on', v => v === '1'); pick('#coachIco', 'data-ci', 'ico', v => v); pick('#coachCol', 'data-cc', 'col', v => v);
  $('#coachNew').addEventListener('click', () => { coach.nuevo = !coach.nuevo; renderCoach(); });
  new MutationObserver(renderCoach).observe($('#nav'), { attributes:true, attributeFilter:['hidden'] });
  const setEst = v => { const a = $('.app'); a.dataset.btn = v; if (v === 'rellenos') delete a.dataset.crit; else a.dataset.crit = '1'; };
  setEst('tubos'); // elegida por el dueño (26/10)
  $('#btnPick').addEventListener('click', e => { const b = e.target.closest('[data-btn]'); if (!b) return; setEst(b.dataset.btn); $$('#btnPick [data-btn]').forEach(x => x.setAttribute('aria-pressed', x === b)); });

//#bloque 100
  // Modo claro / oscuro para toda la app
  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function setMode(m){
    $('#app').dataset.mode = m;
    try { localStorage.setItem('vivaModo', m); } catch(_){}
    $$('[data-theme-toggle]').forEach(b => { b.innerHTML = m === 'light' ? moon : sun; b.setAttribute('aria-label', m === 'light' ? 'Pasar a modo oscuro' : 'Pasar a modo claro'); });
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-theme-toggle]')) { setMode($('#app').dataset.mode === 'light' ? 'dark' : 'light'); toast($('#app').dataset.mode === 'light' ? 'Modo claro activado' : 'Modo oscuro activado'); } });
  let modoGuardado = 'dark'; try { modoGuardado = localStorage.getItem('vivaModo') || 'dark'; } catch(_){}
  setMode('dark'); // sin modo claro (pedido de Juanjo, 30/10)

//#bloque 280
  // ----- Panel de demo -----
  $('#muralPick').addEventListener('click', e => {
    const b = e.target.closest('[data-mur]'); if (!b) return; MURK = b.dataset.mur; MUR = Object.assign(MURALES[MURK](), { cerrado:false }); muralNuevo = null; renderMuralHome();
    $$('#muralPick [data-mur]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#demoSheet').hidden = true; renderMural(); renderPremios(); renderForma(); renderDesafios(); go('muralScr');
  });
  var CIERRE_C = false;
  $('#cerrarMesC').addEventListener('click', () => { CIERRE_C = true; cerrarMesDemo(); });
  $('#cerrarMes').addEventListener('click', () => { CIERRE_C = false; cerrarMesDemo(); });
  function cerrarMesDemo(){
    if (MURK === 'nueva') { toast('La socia nueva todavía no tiene un mes entero: elegí 3 meses o 1 año'); return; }
    $('#demoSheet').hidden = true;
    const now = HOY_D, id = 'm' + now.getFullYear() + '-' + now.getMonth();
    const v = serie().slice(-1)[0].f; let ti = 0; zonas().forEach((q, k) => { if (v >= q[0]) ti = k; });
    const prevM = MUR.meses.find(m => m.m === now.getMonth() && m.y === now.getFullYear()); if (prevM) prevM.c = CIERRE_C;
    if (!prevM) { MUR.meses.push({ m:now.getMonth(), y:now.getFullYear(), t:ti, c:CIERRE_C }); MUR.sem += Math.max(0, 4 - MUR.prevMes - (semCumplida() ? 1 : 0)); }
    MUR.cerrado = true; MUR.cerradoC = CIERRE_C; muralNuevo = id;
    renderMural(); renderPremios(); renderForma(); renderDesafios(); go('inicio');
    abrirCartel(muralEventos().find(x => x.id === id));
  }
  $('#benPick').addEventListener('click', e => { const b = e.target.closest('[data-bm]'); if (!b) return; BEN_MES = b.dataset.bm === '1'; $$('#benPick [data-bm]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderPremios(); toast(BEN_MES ? 'Con beneficio del mes de un aliado del Club' : 'Sin beneficio del mes'); });
  renderMural(); renderPremios(); renderDesafios();
  $('#demoFab').addEventListener('click', () => $('#demoSheet').hidden = false);
  $('#demoClose').addEventListener('click', () => $('#demoSheet').hidden = true);
  $('#demoSheet').addEventListener('click', e => { if (e.target.id === 'demoSheet' || e.target.closest('[data-go]')) $('#demoSheet').hidden = true; if (e.target.closest('#deudaToggle')) { $('#demoSheet').hidden = true; go('inicio'); } });
  $('#formaHow').addEventListener('click', () => { renderFormaDet(); go('forma'); });
  $('#formaHit').addEventListener('click', () => { renderFormaDet(); go('forma'); });

//#bloque 310
  // ===== v42 · Panel de demo, Entrenar =====
  function entDemo(dest, msg){ $('#demoSheet').hidden = true; renderAcc(); renderHoy(); renderEntHoy(); renderToday(); if (dest) go(dest); if (msg) toast(msg); }
  $('#genPick').addEventListener('click', e => { const b = e.target.closest('[data-gen]'); if (!b) return; GENERO = b.dataset.gen || null;
    $$('#genPick [data-gen]').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (MAPA.pintar) { const h = $('#pr3d'); h.querySelectorAll('canvas').forEach(c => c.remove()); $('#pr3dWait').hidden = false; MAPA.pintar = null; MAPA.vista = null; }
    renderProg(); });
  const rehacerCuerpo = () => { if (MAPA.pintar) { $('#pr3d').querySelectorAll('canvas').forEach(c => c.remove()); $('#pr3dWait').hidden = false; MAPA.pintar = null; MAPA.vista = null; } };
  $('#mapaLayPick').addEventListener('click', e => { const b = e.target.closest('[data-lay]'); if (!b) return;
    $$('#mapaLayPick [data-lay]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#prMapa').classList.toggle('lat', b.dataset.lay === 'lat'); rehacerCuerpo(); renderProg(); });
  $('#perfPick').addEventListener('click', e => { const b = e.target.closest('[data-perf]'); if (!b) return; PERFIL_MAPA = b.dataset.perf || null;
    $$('#perfPick [data-perf]').forEach(x => x.setAttribute('aria-pressed', x === b));
    const ex = PERFIL_MAPA && PERFILES[PERFIL_MAPA].exp, eb = ex && document.querySelector('#expPick [data-exp="' + ex + '"]');
    if (eb) eb.click(); else renderProg(); });
  window.demoVer = () => { $('#verCnt').textContent = '"Ver" el cuerpo: Hoy ' + VER_CNT.hoy + ' · ficha ' + VER_CNT.ficha + ' · sesión ' + VER_CNT.sesion + ' (métrica de la Prueba: ≥20 % lo abre más de una vez por semana)'; };
  window.demoCuerpo = () => { $('#genMs').textContent = 'Cuerpo de Progreso: modelo ' + (MAPA.genero === 'F' ? 'femenino' : 'masculino') + (GENERO === 'F' ? ' (el mismo para todos: el femenino llega con la compra)' : '') + ', cargó en ' + (MAPA.ms / 1000).toFixed(1).replace('.', ',') + ' s. El género sale de EVO y nunca se pregunta.'; };
  $('#expPick').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (!b) return; EXP = b.dataset.exp; renderProg(); $$('#expPick [data-exp]').forEach(x => x.setAttribute('aria-pressed', x === b)); SALA && salaRehacer(); entDemo('hoy', { arranco:'Arranco: la carga no sube en las primeras 4 semanas', habitual:'Habitual', avanzado:'Avanzado' }[EXP]); });
  $('#etPick').addEventListener('click', e => {
    const b = e.target.closest('[data-et]'); if (!b) return; ETAPA = b.dataset.et; $('.app').dataset.etapa = ETAPA;
    $$('#etPick [data-et]').forEach(x => x.setAttribute('aria-pressed', x === b));
    MOLESTIA = ETAPA === 'molestia' ? { zona:'Hombro', bien:0 } : null; chkReset();
    if (MOM !== 'antes' && MOM !== 'sala') setMom('antes', true);
    entDemo(ETAPA === 'molestia' || ETAPA === 'menor' ? 'inicio' : 'hoy', { normal:'Etapa normal', vuelvo:'Vuelve de una pausa: primera sesión al 80%', molestia:'Tiene guardada una molestia en el hombro', menor:'Menor de 18: sin carga sugerida y sin guardar molestias', '60':'60 o más: letra más grande en la sesión' }[ETAPA]);
  });
  $('#demoSheet').addEventListener('click', e => { // T13: Sala en Cuándo, Señal en Quién es
    const l = e.target.closest('[data-sl]'), g = e.target.closest('[data-sg]'); if (!l && !g) return;
    if (l) { SALA_LLENA = l.dataset.sl === '1'; $$('#demoSheet [data-sl]').forEach(x => x.setAttribute('aria-pressed', x === l)); if (SALA) SALA.llenaOk = false; }
    if (g) { SIN_SENAL = g.dataset.sg === '1'; $$('#demoSheet [data-sg]').forEach(x => x.setAttribute('aria-pressed', x === g)); }
    entDemo(SALA ? 'sala' : 'hoy', l ? (SALA_LLENA ? 'Noche llena: aparece en el primer ejercicio de fuerza' : 'Sala normal') : (SIN_SENAL ? 'Sin señal: la sesión funciona igual' : 'Con señal'));
    if (SALA) renderSala();
  });
  $('#segBien').addEventListener('click', () => {
    if (!MOLESTIA) { ETAPA = 'molestia'; $('.app').dataset.etapa = ETAPA; $$('#etPick [data-et]').forEach(x => x.setAttribute('aria-pressed', x.dataset.et === 'molestia')); MOLESTIA = { zona:'Hombro', bien:0 }; }
    MOLESTIA.bien = 1; chkReset(); if (MOM !== 'antes' && MOM !== 'sala') setMom('antes', true);
    entDemo('inicio', 'Ayer dijo "Bien". Respondé "Bien" hoy');
  });
  $('#noEnt').addEventListener('click', () => {
    NOENT = !NOENT; $('#noEnt').textContent = NOENT ? 'Volver: llegó la entrada' : 'Simular que no llegó la entrada';
    if (NOENT) { SALA = null; setMom('antes', true); } else setMom('antes', true);
    renderForma(); renderAcc(); avisosLater();
    entDemo('hoy', NOENT ? 'No llegó la entrada: Empezar queda como secundario' : 'Llegó la entrada');
  });
  $('#limRemo').addEventListener('click', () => { LIM.remo = 2; if (SALA) salaRehacer(); entDemo('hoy', 'Las dos últimas en remo fueron "Al límite": hoy no sube'); });
//#bloque 315
  // ===== v46 · T7: pantalla bloqueada simulada y tocable (actividad en vivo y notificaciones de un toque) y panel del acompañante =====
  // Simula al sistema operativo, no una pantalla del socio. Nada de salud y "Tu sede" en lugar del nombre.
  var BLOQ = false, LK_OLV = false, LK_FIN = false, NOTI = { chk:false, lun:false, olv:false };
  const lk = document.createElement('div'); lk.className = 'lock'; lk.id = 'lockScr'; lk.hidden = true; lk.setAttribute('role', 'dialog'); lk.setAttribute('aria-label', 'Pantalla bloqueada (simulada)');
  $('.app').appendChild(lk);
  const LKB = '<svg class="vbolt" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>';
  const lkHd = t => '<div class="lkhd">' + LKB + '<span>VIVA · ' + t + '</span></div>';
  const lkBt = a => '<div class="lkbtns">' + a.map(x => '<button' + (x[2] ? ' class="pri"' : '') + ' data-lk="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function lkAct(S){
    const st = steps()[S.step], fi = curF(), pr = salaProg();
    let h = '<div class="lkcard lkact">' + lkHd('Tu sede · en curso') + '<div class="lkprog">' + pr.map(p => '<i><b style="width:' + Math.round(p * 100) + '%"></b></i>').join('') + '</div>';
    if (S.pausa) return h + '<b>En pausa</b><span>Abrí la app para seguir.</span></div>';
    if (!MANUAL && S.vence) return h + '<b>' + (S.repreg ? mtRepTxt(st) : mtPropTxt(st)) + '</b>' + lkBt(fi >= 0 ? [['listo', 'Listo', 1], ['cambiar', 'Cambiar']] : [['listo', 'Listo', 1]]) + '</div>';
    if (st === 'act') return h + '<b>Activación · ' + S.P.act.min + ' min</b>' + lkBt([['listo', 'Listo', 1]]) + '</div>';
    if (st === 'car') return h + '<b>' + S.P.car.maq + ' · ' + S.carMin + ' min</b><span class="lkbig">' + mmss(S.crono) + '</span>' + lkBt([['listo', 'Listo · terminar', 1]]) + '</div>';
    const f = fx(fi), F = S.F[fi];
    if (S.rest > 0) { const nx = F.sets.indexOf(false) >= 0 ? 'serie ' + (F.sets.indexOf(false) + 1) + ' de ' + f.sr : (fi + 1 < S.F.length ? fx(fi + 1).n + (S.F[fi + 1].kg ? ' · ' + fmtKg(S.F[fi + 1].kg) + ' kg' : '') : 'el cardio'); return h + '<span>Descanso</span><span class="lkbig">' + mmss(S.rest) + '</span><span>Siguiente: ' + nx + '</span>' + lkBt([['saltear', 'Saltear']]) + '</div>'; }
    return h + '<b>' + f.n + '</b><span class="lkbig">' + f.sr + ' × ' + F.reps[0] + (F.kg ? ' · ' + fmtKg(F.kg) + ' kg' : '') + '</span>' + lkBt([['listo', 'Listo', 1], ['cambiar', 'Cambiar']]) + '</div>';
  }
  function lockRen(){
    if (!BLOQ) return;
    const now = ahora(), hh = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    let fe = ''; try { fe = now.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' }); } catch (_) {}
    let h = '<div class="lktop"><span class="lkfecha">' + fe + '</span><span class="lkhora">' + hh + '</span></div><div class="lkstack">';
    const S = SALA;
    if (S) h += lkAct(S);
    else if (LK_FIN) h += '<div class="lkcard">' + lkHd('ahora') + '<b>Sesión cerrada ⚡</b><span>Desbloqueá para ver tu semana.</span></div>';
    if (S && LK_OLV && !NOTI.olv) h += '<div class="lkcard">' + lkHd('hace 1 min') + '<b>¿Terminaste?</b><span>Tu sesión sigue abierta.</span>' + lkBt([['olv-cerrar', 'Cerrala', 1], ['olv-sigo', 'Sigo']]) + '</div>';
    if (!S && !LK_FIN && !NOTI.chk && !prep.done) h += '<div class="lkcard">' + lkHd('antes de tu horario') + '<b>¿Cómo venís hoy?</b><span>Tu sede está tranquila.</span>' + lkBt([['chk-todo', 'Con todo'], ['chk-normal', 'Normal'], ['chk-sinen', 'Sin energía']]) + '</div>';
    if (!S && !LK_FIN && !NOTI.lun) { const m = META_SEM, sube = LAST_WK >= m; h += '<div class="lkcard">' + lkHd('lunes') + '<b>La semana pasada viniste ' + LAST_WK + '.</b><span>' + (sube ? '¿Repetimos o subimos a ' + (m + 1) + '?' : 'Tu meta es ' + m + ': ¿la mantenemos o la ponemos en ' + LAST_WK + '?') + '</span>' + lkBt(sube ? [['lun-rep', 'Repetir'], ['lun-sub', 'Subir a ' + (m + 1), 1]] : [['lun-rep', 'Seguir con ' + m, 1], ['lun-baj', 'Poner ' + LAST_WK]]) + '</div>'; }
    h += '</div><button class="lkunlock" data-lk="abrir">Tocá para desbloquear</button>';
    lk.innerHTML = h;
  }
  function lockAbrir(olv){ $('#demoSheet').hidden = true; LK_OLV = !!olv; LK_FIN = false; if (olv) NOTI.olv = false; BLOQ = true; lk.hidden = false; lockRen(); }
  function lockCerrar(){ BLOQ = false; lk.hidden = true; const fin = LK_FIN; LK_FIN = false; if (SALA) { renderSala(); cajaAbrir(); } else if (fin) go('cierre'); }
  lk.addEventListener('click', e => {
    const b = e.target.closest('[data-lk]'); if (!b) return; const v = b.dataset.lk;
    if (v === 'abrir') return lockCerrar();
    if (v === 'listo' && SALA) { const st = steps()[SALA.step]; salaListo(); if (st === 'car') LK_FIN = true; }
    if (v === 'saltear' && SALA) { SALA.rest = 0; renderSala(); }
    if (v === 'cambiar' && SALA) { lockCerrar(); salaCambiar(); return; } // puede tocar salud: pide desbloquear
    if (v.indexOf('chk-') === 0) { NOTI.chk = true; chkAnswer(v.slice(4)); }
    if (v.indexOf('lun-') === 0) { NOTI.lun = true; if (v !== 'lun-rep') { META_SEM = v === 'lun-sub' ? META_SEM + 1 : LAST_WK; renderForma(); renderHoy(); renderAcc(); } }
    if (v === 'olv-cerrar' && SALA) { NOTI.olv = true; salaCerrar(); LK_FIN = true; }
    if (v === 'olv-sigo') NOTI.olv = true;
    lockRen();
  });
  $('#verBloq').addEventListener('click', () => lockAbrir(false));
  $('#verBloqRut').addEventListener('click', () => { if (!SALA) { if (MOM !== 'sala') setMom('sala', true); salaStart(); } lockAbrir(false); }); // T-R v76: la rutina vista desde la pantalla bloqueada
  $('#verOlvido').addEventListener('click', () => { if (!SALA) { if (MOM !== 'sala') setMom('sala', true); salaStart(); } lockAbrir(true); });
  $('#demoSheet').addEventListener('click', e => { // T13: los botones data-ac viven en Cuándo y Entrenar
    const b = e.target.closest('[data-ac]'); if (!b) return; const k = b.dataset.ac;
    if (k === 'voz1' || k === 'voz0') { vozCambiar(k === 'voz1'); if (SALA) renderSala(); return; }
    if (k === 'au1' || k === 'au0') { AURIC = k === 'au1'; if (!AURIC) callar(); toast(AURIC ? 'Auriculares conectados' : 'Sin auriculares: la voz queda en pantalla'); }
    if (k === 'rap1' || k === 'rap0') { RAPIDO = k === 'rap1'; toast(RAPIDO ? 'Reloj rápido: 1 segundo vale 10' : 'Reloj real'); }
    if (k === 'man1' || k === 'man0') { MANUAL = k === 'man1'; if (SALA) { SALA.vence = false; SALA.repreg = false; } toast(MANUAL ? 'Anota el socio: sin reloj' : 'La app lo lleva por tiempo'); }
    acSync(); if (SALA) renderSala();
  });
  $('#dcPick').addEventListener('click', e => { const b = e.target.closest('[data-dc2]'); if (!b) return; DECI = b.dataset.dc2; acSync(); $('#demoSheet').hidden = true; if (SALA) { renderSala(); cajaAbrir(); } toast('Mantené apretado Decímelo en la sesión'); });
  $('#dsPick').addEventListener('click', e => { const b = e.target.closest('[data-ds]'); if (!b) return; DSEG = +b.dataset.ds; acSync(); entDemo('hoy', DSEG >= 5 ? (semCumplida() ? '5 días seguidos y la semana cumplida: Hoy propone descanso' : '5 días seguidos sin la semana cumplida: nunca "no vengas", solo qué entrenar') : '2 días seguidos'); });
//#bloque 340
  // ===== T13 · Panel de demo en tres niveles: escenarios de un toque · la socia y el momento · por sección =====
  // Agregar un escenario = una línea en ESCENARIOS (nombre, lo que fija, a dónde lleva). Lo que no fija queda como en BASE.
  // Agregar un control = una fila en html/demo.html, en su sección; si es transversal, también su clave en BASE y en aplicar().
  const ESCENARIOS = [
    ['Socia nueva, semana 1', { ant:'nueva', est:0, fit:0 }, 'inicio'],
    ['Socia nueva, día 14 sin entrar', { ant:'nueva', est:0, aus:14, fit:0 }, 'inicio'],
    ['Habitual que viene menos: 10 días sin venir', { exp:'habitual', est:1, aus:10 }, 'inicio'],
    ['Habitual en la sala, noche llena, con auriculares', { exp:'habitual', mom:'sala', sl:1, voz:1, au:1 }, 'hoy'],
    ['Avanzado, semana completa, VIVA Flow', { ant:'1a', est:3, sem:'completa' }, 'inicio'],
    ['Avanzado edita su rutina', { ant:'1a', dia:1 }, 'hoy'],
    ['Vuelve de una pausa (4 semanas sin venir)', { exp:'habitual', et:'vuelvo', aus:28 }, 'hoy'],
    ['Menor de 18, rutina del profe', { et:'menor' }, 'hoy'],
    ['Con molestia en el hombro', { exp:'habitual', et:'molestia' }, 'inicio'],
    ['60 o más', { et:'60' }, 'hoy'],
    ['Sin registros en Entrenar', { exp:'habitual', sem:'sinreg' }, 'inicio'],
    ['6 meses: Progreso con historia e Índice FIT', { ant:'6m', fit:3 }, 'progreso'],
    ['Plan que vence y saldo pendiente', { plan:true, saldo:true }, 'inicio'],
    ['Primera vez (onboarding de Entrenar)', { prim:true }, null]
  ];
  const BASE = { ant:'3m', et:'normal', est:2, aus:0, sem:'mitad', mom:'antes', sl:0, sg:0, voz:0, au:1, rap:1, ds:2, fit:3, obj:null, dia:1, plan:false, saldo:false };
  var AUS_N = 0, DM_ESC = -1;
  const DM_LS = 'vivapp.demo.panel';
  const dmMem = (() => { try { return JSON.parse(localStorage.getItem(DM_LS)) || {}; } catch (e) { return {}; } })();
  const dmSave = () => { try { localStorage.setItem(DM_LS, JSON.stringify(dmMem)); } catch (e) {} };
  const dmB = q => $('#demoSheet ' + q);
  const dmTap = q => { const b = dmB(q); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); };
  // Antigüedad: un solo selector para la historia del cuerpo (perfiles de T12) y Tu mural (socia nueva · 3 meses · 1 año)
  const ANT = { nueva:['mes', 'nueva'], '3m':['', '3m'], '6m':['seis', '3m'], '1a':['anio', '1a'] };
  const ANT_EXP = { nueva:'arranco', '3m':'arranco', '6m':'habitual', '1a':'avanzado' };
  const antAct = () => { const p = PERFIL_MAPA || ''; return Object.keys(ANT).find(k => ANT[k][0] === p) || '3m'; };
  function setAnt(k){ dmTap('[data-perf="' + ANT[k][0] + '"]'); dmTap('[data-mur="' + ANT[k][1] + '"]'); }
  function setAus(n){ sacados.splice(0).forEach(d => entrenoDia.add(d)); for (let d = 1; d <= n; d++) if (entrenoDia.has(d)) { entrenoDia.delete(d); sacados.push(d); } ausente = n > 0; AUS_N = n; renderForma(); renderHoy(); }
  function setObj(k){ OBJ.length = 0; if (k) OBJ.push(k); renderForma(); renderProg(); }
  function setDia(i){ rutinas.profe.next = i; HR = -1; renderEntHoy(); renderToday(); renderRoutines(); }
  const venceCorto = () => Math.round((VENCE - HOY0) / 864e5) <= 5;
  function setPlan(v){ if (venceCorto() !== v) $('#venceDemo').click(); }
  function setSaldo(v){ if (deuda !== v) $('#deudaToggle').click(); }
  function dmSync(){
    $$('#etPick [data-etg]').forEach(g => { const xs = [...g.querySelectorAll('[data-et]')], v = xs.some(x => x.dataset.et === ETAPA) ? ETAPA : 'normal'; xs.forEach(x => x.setAttribute('aria-pressed', x.dataset.et === v)); });
    if (!ausente) AUS_N = 0;
    $$('#ausPick [data-aus]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.aus === AUS_N));
    const a = antAct(); $$('#antPick [data-ant]').forEach(x => x.setAttribute('aria-pressed', x.dataset.ant === a));
    const o = OBJ[0] || 'forma'; $$('#objPick [data-objd]').forEach(x => x.setAttribute('aria-pressed', x.dataset.objd === o));
    $$('#planPick [data-plan]').forEach(x => x.setAttribute('aria-pressed', (x.dataset.plan === 'vence') === venceCorto()));
    $$('#saldoPick [data-saldo]').forEach(x => x.setAttribute('aria-pressed', (x.dataset.saldo === '1') === deuda));
    const di = rutinas.profe.next; $$('#diaPick [data-dia]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.dia === di));
    $$('#escPick [data-esc]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.esc === DM_ESC));
  }
  function dmFin(dest, msg){ $('#demoSheet').hidden = true; if (dest) go(dest); if (msg) toast(msg); dmSync(); }
  function aplicar(c){
    c = Object.assign({}, BASE, c);
    if (NOENT) $('#noEnt').click();
    for (const k in LIM) delete LIM[k];
    setAnt(c.ant); dmTap('[data-exp="' + (c.exp || ANT_EXP[c.ant]) + '"]');
    if (ETAPA !== c.et) dmB('[data-et="' + c.et + '"]').click();
    setAus(0); dmB('[data-est="' + c.est + '"]').click(); setAus(c.aus);
    if (MOM !== 'antes') setMom('antes', true);
    dmB('[data-sem="' + c.sem + '"]').click();
    if (c.mom !== 'antes') dmB('[data-mom="' + c.mom + '"]').click();
    dmTap('[data-sl="' + c.sl + '"]'); dmTap('[data-sg="' + c.sg + '"]');
    dmTap('[data-ac="voz' + c.voz + '"]'); dmTap('[data-ac="au' + c.au + '"]'); dmTap('[data-ac="rap' + c.rap + '"]');
    dmTap('[data-ds="' + c.ds + '"]'); dmTap('[data-fit="' + c.fit + '"]');
    setObj(c.obj); setDia(c.dia); setPlan(c.plan); setSaldo(c.saldo);
  }
  $('#escPick').innerHTML = ESCENARIOS.map((s, i) => '<button data-esc="' + i + '" aria-pressed="false">' + s[0] + '</button>').join('');
  $('#escPick').addEventListener('click', e => { const b = e.target.closest('[data-esc]'); if (!b) return; const s = ESCENARIOS[+b.dataset.esc];
    DM_ESC = +b.dataset.esc; aplicar(s[1]);
    if (s[1].prim) { dmFin(null, null); $('#verPrim').click(); return; }
    dmFin(s[2], s[0]); });
  $('#dmReset').addEventListener('click', () => { dmTap('[data-gen=""]'); DM_ESC = 0; aplicar(ESCENARIOS[0][1]); dmFin('inicio', 'Demo reiniciada: ' + ESCENARIOS[0][0]); });
  // Controles nuevos del nivel 2
  $('#demoSheet').addEventListener('click', e => { const t = e.target; let b;
    if ((b = t.closest('[data-ant]'))) { setAnt(b.dataset.ant); return dmFin('progreso', 'Antigüedad: ' + b.textContent + '. Progreso y Tu mural con esa historia'); }
    if ((b = t.closest('[data-aus]'))) { setAus(+b.dataset.aus); return dmFin('inicio', AUS_N ? 'La socia no viene hace ' + AUS_N + ' días' : 'La socia viene seguido'); }
    if ((b = t.closest('[data-objd]'))) { setObj(b.dataset.objd); return dmFin('inicio', 'Objetivo: ' + b.textContent); }
    if ((b = t.closest('[data-plan]'))) { setPlan(b.dataset.plan === 'vence'); return dmFin('inicio', venceCorto() ? 'El plan vence en 3 días: aviso en Inicio' : 'Plan al día'); }
    if ((b = t.closest('[data-saldo]'))) { setSaldo(b.dataset.saldo === '1'); return dmFin('inicio', deuda ? 'Con saldo pendiente' : 'Sin saldo pendiente'); }
    if ((b = t.closest('[data-dia]'))) { setDia(+b.dataset.dia); return dmFin('hoy', 'Hoy: Día ' + b.textContent); }
    setTimeout(dmSync, 0); });
  $('#demoFab').addEventListener('click', dmSync);
  // Plegado recordado entre visitas (nivel 1 y 2 abiertos, nivel 3 cerrado la primera vez)
  $$('#demoSheet details.dmdet').forEach(d => { if (dmMem.pleg && d.dataset.k in dmMem.pleg) d.open = dmMem.pleg[d.dataset.k];
    d.addEventListener('toggle', () => { (dmMem.pleg = dmMem.pleg || {})[d.dataset.k] = d.open; dmSave(); }); });
  window.demoEstado = () => ({ exp:EXP, etapa:ETAPA, mom:MOM, aus:AUS_N, ant:antAct(), mural:MURK, dia:rutinas.profe.next, vence:venceCorto(), deuda:deuda, obj:OBJ[0] || 'forma', sala:SALA_LLENA, voz:VOZ, esc:DM_ESC }); // para pruebas y T6
  dmSync();

//#bloque 985
  // T16 · gancho de prueba para tools/barrido.py: abre pantallas que necesitan estado. Ninguna pantalla lo usa.
  window.VK_PRUEBA = { abrir: function (id) {
    if (id === 'sala') { if (!SALA) salaDemo(); renderSala(); cajaAbrir(); return; }
    if (id === 'cierre') { if (!SALA) salaDemo(); salaCerrar(); return; }
    if (id === 'onbE') { OB.step = 'inv'; OB.obj = []; OB.zonaAbierta = false; OB.zona = null; OB.meta = 3; OB.res = {}; obRender(); go('onbE'); return; }
    if (id === 'chat') { openChat(conv[0].id); return; }
    go(id);
  } };
