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
  $('#cerrarMes').addEventListener('click', cerrarMesDemo);
  function cerrarMesDemo(){
    if (MURK === 'nueva') { toast('La socia nueva todavía no tiene un mes entero: elegí 3 meses o 1 año'); return; }
    $('#demoSheet').hidden = true;
    const now = HOY_D, id = 'm' + now.getFullYear() + '-' + now.getMonth();
    const v = tv(serie().slice(-1)[0].f); let ti = 0; zonas().forEach((q, k) => { if (v >= q[0]) ti = k; });
    const prevM = MUR.meses.find(m => m.m === now.getMonth() && m.y === now.getFullYear());
    if (!prevM) { MUR.meses.push({ m:now.getMonth(), y:now.getFullYear(), t:ti }); MUR.sem += Math.max(0, 3 - MUR.prevMes - (semCumplida() ? 1 : 0)); }
    MUR.cerrado = true; muralNuevo = id;
    renderMural(); renderPremios(); renderForma(); renderDesafios(); go('inicio');
    abrirCartel(muralEventos().find(x => x.id === id));
  }
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
    const b = e.target.closest('[data-et]'); if (!b) return; ETAPA = b.dataset.et; $('.app').dataset.etapa = ETAPA; if (NUEVO != null && b.closest('[data-etg="etapa"]')) nvAplicar(null);
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
    if (v.indexOf('lun-') === 0) { NOTI.lun = true; META_PROX = null; if (v !== 'lun-rep') { META_SEM = v === 'lun-sub' ? META_SEM + 1 : LAST_WK; renderForma(); renderHoy(); renderAcc(); } }
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
  $('#dsPick').addEventListener('click', e => { const b = e.target.closest('[data-ds]'); if (!b) return; DSEG = +b.dataset.ds; acSync(); entDemo('hoy', DSEG >= 5 ? (semCumplida() ? '5 días seguidos y la semana cumplida: Hoy propone descanso' : '5 días seguidos sin la semana cumplida: nunca "no vengas", solo qué entrenar') : '2 días seguidos'); });
//#bloque 340
  // ===== T13 · Panel de demo en tres niveles: escenarios de un toque · la socia y el momento · por sección =====
  // Agregar un escenario = una línea en ESCENARIOS (nombre, lo que fija, a dónde lleva). Lo que no fija queda como en BASE.
  // Agregar un control = una fila en html/demo.html, en su sección; si es transversal, también su clave en BASE y en aplicar().
  const ESCENARIOS = [
    ['Socia nueva, día del alta', { ant:'nueva', nv:0, fit:0 }, 'inicio'],
    ['Socia nueva, semana 1', { ant:'nueva', nv:1, fit:0 }, 'inicio'],
    ['Socia nueva, día 14 sin primera visita', { ant:'nueva', nv:2, aus:14, fit:0 }, 'inicio'],
    ['Socia nueva, revisión de la semana 4', { ant:'nueva', nv:4, fit:0 }, 'inicio'],
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
  function setAus(n){ sacados.splice(0).forEach(d => entrenoDia.add(d)); for (let d = 1; d <= n; d++) if (entrenoDia.has(d)) { entrenoDia.delete(d); sacados.push(d); } ausente = n > 0; AUS_N = n; NV_VOLVIO = false; renderForma(); renderHoy(); if (NUEVO != null) nvRefresh(); }
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
    $$('#nvPick [data-nv]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.nv === (NUEVO == null ? -1 : NUEVO)));
    $('#nvProfe').innerHTML = nvProfeTxt(); $('#vmnCnt').textContent = 'Progreso de Arranco, desde la semana 4: ' + VMN.toca + (VMN.toca === 1 ? ' toque' : ' toques') + ' en "Ver más números". La prueba: más del 30 % de las aperturas → Arranco ve más.';
  }
  function dmFin(dest, msg){ $('#demoSheet').hidden = true; if (dest) go(dest); if (msg) toast(msg); dmSync(); }
  function aplicar(c){
    c = Object.assign({}, BASE, c);
    if (NUEVO != null) nvAplicar(null);
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
    if (c.nv != null) { dmTap('[data-exp="arranco"]'); nvAplicar(c.nv); setAus(c.aus); }
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
    if ((b = t.closest('[data-debito]'))) { DEBITO = b.dataset.debito === '1'; renderClub(); $$('#debPick .opt').forEach(x => x.setAttribute('aria-pressed', x === b)); return dmFin('beneficios', DEBITO ? 'Con débito: entra al Club VIVA' : 'Sin débito: Club VIVA lo invita a adherirse'); }
    if ((b = t.closest('[data-saldo]'))) { setSaldo(b.dataset.saldo === '1'); return dmFin('inicio', deuda ? 'Con saldo pendiente' : 'Sin saldo pendiente'); }
    if ((b = t.closest('[data-nv]'))) { const k = +b.dataset.nv;   // T11 · semana del programa de las primeras 8 semanas
      if (k >= 0) { if (ETAPA !== 'normal') dmB('[data-etg="etapa"] [data-et="normal"]').click(); setAnt('nueva'); dmTap('[data-exp="arranco"]'); dmTap('[data-fit="0"]'); }
      nvAplicar(k < 0 ? null : k); return dmFin('inicio', k < 0 ? 'Fuera de las primeras 8 semanas' : k ? 'Socia nueva · semana ' + k + ' de 8' : 'Socia nueva · día del alta'); }
    if (t.closest('#nvVolvio')) { if (NUEVO == null || NUEVO < 3) { setAnt('nueva'); dmTap('[data-exp="arranco"]'); dmTap('[data-fit="0"]'); nvAplicar(5); } else nvAplicar(NUEVO);
      nvVolvio(); return dmFin('inicio', 'Volvió hoy después de 14 días'); }
    if ((b = t.closest('[data-dia]'))) { setDia(+b.dataset.dia); return dmFin('hoy', 'Hoy: Día ' + b.textContent); }
    setTimeout(dmSync, 0); });
  $('#demoFab').addEventListener('click', dmSync);
  // Plegado recordado entre visitas (nivel 1 y 2 abiertos, nivel 3 cerrado la primera vez)
  $$('#demoSheet details.dmdet').forEach(d => { if (dmMem.pleg && d.dataset.k in dmMem.pleg) d.open = dmMem.pleg[d.dataset.k];
    d.addEventListener('toggle', () => { (dmMem.pleg = dmMem.pleg || {})[d.dataset.k] = d.open; dmSave(); }); });
  window.demoEstado = () => ({ exp:EXP, etapa:ETAPA, mom:MOM, aus:AUS_N, ant:antAct(), mural:MURK, dia:rutinas.profe.next, vence:venceCorto(), deuda:deuda, obj:OBJ[0] || 'forma', sala:SALA_LLENA, voz:VOZ, esc:DM_ESC, social:SOC_V, socialB:SOC_B, socialC:SC.e, socialD:{ e:SD.e, dia:SD.dia, ig:SD.ig, tab:SD.tab }, socialE:{ soc:SE.soc, mom:SE.mom, tam:SE.tam, neu:SE.neu, ig:SE.ig, vid:SE.vid, vivo:SE.vivo }, socialF:{ puerta:SF.puerta, tipo:SF.tipo, est:SF.est, mom:SF.mom, ult:SF.ult, tab:SF.tab }, socialG:{ voc:SG.voc, vis:SG.vis, nombre:SG.nombre, sem:SG.semK, nov:SG.nov, riv:SG.rivSede, esp:SG.esp } }); // para pruebas y T6
  dmSync();
  $('#dmVer').textContent = 'Versión ' + (window.VK_V || '');

//#bloque 345
  // ===== T21 · Versiones Social: la sección social en versiones completas e intercambiables =====
  // Agregar una versión = una fila en SOC_VERS, su pantalla (#social + la letra; la A es #social) y su nota (data-socnota) en html/demo.html.
  const SOC_VERS = [
    ['I', 'Quién va hoy', 'I · Una pantalla que contesta "¿quién de los míos va hoy?": la tira de tu gente (aro = dijo voy hoy), el voy (hoy o mañana; la franja, opcional) y una pieza, el cruce o el dúo. Tres perfiles (abajo). Abre por defecto.'],
    ['F', 'Las puertas', 'F · Una pantalla, dos puertas para que nadie entrene solo: Traé a tu gente o Viva te presenta (abajo, Puerta). Con banda: la fecha, el cruce de la semana como protagonista y lo de Viva. Queda para comparar con la G.'],
    ['H', 'La placa', 'H · Tres zonas: la barra ("+", Desafíos y People), la tira de insignias y el muro de placas, todas con el mismo marco. Tres socios: con banda, nueva y sola, nueva en dúo (abajo, Perfil). Queda para comparar con la I.'],
    ['G', 'Las insignias', 'G · Cuatro niveles: arriba, la fila de insignias de las bandas; tu banda con cuatro acciones (Voy · Foto · Chat · Sumar); el cruce; lo último. Tocás una insignia y ves su semana en piezas gráficas; el lunes, el resumen para compartir. Sin fotos ni nada que moderar.']
  ];
  const SOC_EE = { sin:['Sin banda', 'El que llega solo (Mica, 19 años, semana 2): el ecualizador apagado con su lugar latiendo y una sola acción, Tu primer jueves.'],
    nueva:['Banda nueva', 'El jueves, en la bienvenida, el profe la suma a una banda: nombres recién sumados, la meta de la banda a la mitad la primera semana y la pregunta de si la banda ve su barra.'],
    con:['Con banda', 'Los del jueves: el ecualizador (una barra por integrante hacia su meta), Lo último, La fecha y El cruce. Debajo, lo de Viva.'] };
  const SOC_DE = { sin:['Sin banda', 'El que entrena solo: Traé a alguien (con uno ya son banda), Sumame a una banda (se lo decimos a su profe) y La vibra de Viva.'],
    con:['Con banda', 'Los del jueves: La fecha, El pulso (el cruce de la semana) y La vibra de la banda y de Viva. Mensajes abre WhatsApp.'] };
  const SOC_CE = { solo:['Solo', 'El socio nuevo (pone a la socia en la semana 1 de sus primeras 8): su Tu ritmo en chico, el primer jueves de la sede, Traé a alguien y Quiero sumarme a un grupo.'],
    dupla:['En dupla', 'Con Cris: el pulso de la dupla se enciende la semana en que cumplen los dos, cada uno con su meta. Contalo sale al WhatsApp de los dos.'],
    grupo:['En grupo', 'Los del jueves, 12 fechas: la próxima fecha, el pulso, el mes del grupo, el desafío, la foto, el WhatsApp y Contalo a tu grupo.'],
    flow:['Grupo en Flow', '16 fechas, 5 semanas seguidas: el pulso con el espectro, "En Flow" y el cruce del mes con otro grupo.'] };
  const SOC_BE = { sin:['Sin grupo', 'El socio nuevo: "Quiero sumarme" (se lo dice a su profe), "Traé a alguien" y lo que viene en Viva.'],
    primer:['Primer encuentro', 'Se sumó esta semana: el primer encuentro destacado y la presentación del profe.'],
    con:['Con grupo', '12 encuentros: el próximo encuentro, el grupo, lo que logran juntos, el WhatsApp y la foto del encuentro.'] };
  if (dmMem.soc) { if (SOC_VERS.some(v => v[0] === dmMem.soc.v)) SOC_V = dmMem.soc.v; if (dmMem.soc.b in SOC_BE) SOC_B = dmMem.soc.b;
    const c = dmMem.soc.c; if (c) { if (c.e in SOC_CE) SC.e = c.e; SC.mes = !!c.mes; SC.anf = !!c.anf; if (SC_TABS.includes(c.tab)) SC.tab = c.tab; }
    const d = dmMem.soc.d; if (d) { if (d.e in SOC_DE) SD.e = d.e; if (d.dia in SD_CRUCE) SD.dia = d.dia; if (d.ig === 'ej' || d.ig === 'vivo') SD.ig = d.ig; if (SD_TABS.includes(d.tab)) SD.tab = d.tab; }
    const x = dmMem.soc.e; if (x) { if (x.soc in SOC_EE) SE.soc = x.soc; if (x.mom in SE_MOM) seMomento(x.mom); if (x.tam in SE_TAM) SE.tam = +x.tam; SE.neu = !!x.neu; if (x.ig === 'ej' || x.ig === 'vivo') SE.ig = x.ig; SE.vid = x.vid !== false; } }
  function socSync(){
    $('#socVPick').innerHTML = SOC_VERS.map(v => '<button class="opt" data-socv="' + v[0] + '" aria-pressed="' + (SOC_V === v[0]) + '">' + v[0] + '<small>' + v[1] + '</small></button>').join('') +
      '';   // T27: solo F y G
    $('#socVTxt').textContent = SOC_VERS.find(v => v[0] === SOC_V)[2];
    $('#socBRow').hidden = SOC_V !== 'B'; $('#socBTxt').textContent = SOC_BE[SOC_B][1];
    $$('#socBPick [data-socb]').forEach(x => x.setAttribute('aria-pressed', x.dataset.socb === SOC_B));
    $('#socCRow').hidden = SOC_V !== 'C'; $('#socCTxt').textContent = SOC_CE[SC.e][1];
    const pr = (s, v) => $$('#socCRow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === v));
    pr('data-socc', SC.e); pr('data-sccmes', SC.mes ? '1' : '0'); pr('data-sccanf', SC.anf ? '1' : '0'); pr('data-scctab', SC.tab);
    $('#socDRow').hidden = SOC_V !== 'D'; $('#socDTxt').textContent = SOC_DE[SD.e][1];
    const pd = (s, v) => $$('#socDRow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === v));
    pd('data-socd', SD.e); pd('data-sddia', SD.dia); pd('data-sdig', SD.ig); pd('data-sdtab', SD.tab);
    if (typeof seSync === 'function') seSync();
    if (typeof sfSync === 'function') sfSync();
    if (typeof sgSync === 'function') sgSync();
    if (typeof shSync === 'function') shSync();
    if (typeof siSync === 'function') siSync();
    $$('#demoSheet [data-socnota]').forEach(n => n.hidden = n.dataset.socnota !== SOC_V);
    socNav();
  }
  const socSave = () => { dmMem.soc = { v:SOC_V, b:SOC_B, c:{ e:SC.e, mes:SC.mes, anf:SC.anf, tab:SC.tab }, d:{ e:SD.e, dia:SD.dia, ig:SD.ig, tab:SD.tab }, e:{ soc:SE.soc, mom:SE.mom, tam:SE.tam, neu:SE.neu, ig:SE.ig, vid:SE.vid }, f:{ puerta:SF.puerta, est:SF.est, mom:SF.mom, ult:SF.ult, ig:SF.ig, tab:SF.tab } }; dmSave(); };
  $('#demoSheet').addEventListener('click', e => { let b;
    if ((b = e.target.closest('[data-socv]'))) { SOC_V = b.dataset.socv; socSave(); socSync(); return dmFin('social', 'Social · versión ' + SOC_V + ': ' + SOC_VERS.find(v => v[0] === SOC_V)[1]); }
    if ((b = e.target.closest('[data-socb]'))) { SOC_V = 'B'; SOC_B = b.dataset.socb; socSave(); socSync(); return dmFin('social', 'Versión B · ' + SOC_BE[SOC_B][0]); }
    // T22 · la C: estado, mes del grupo, anfitrión, nombre de la pestaña y la pantalla de la sede
    const aC = msg => { SOC_V = 'C'; socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-socc]'))) { SC.e = b.dataset.socc; SC.anfR = null;
      // Solo es el socio que arranca: su dial se ve como el de la semana 1 (Primeras 8 semanas); al salir de Solo, vuelve como estaba
      if (SC.e === 'solo' && NUEVO == null) { SC.nv = true; $('#demoSheet [data-nv="1"]').click(); } else if (SC.e !== 'solo' && SC.nv) { SC.nv = false; $('#demoSheet [data-nv="-1"]').click(); }
      return aC('Versión C · ' + SOC_CE[SC.e][0]); }
    if ((b = e.target.closest('[data-sccmes]'))) { SC.mes = b.dataset.sccmes === '1'; if (SC.e === 'solo' || SC.e === 'dupla') SC.e = 'grupo';
      return aC(SC.mes ? 'Mes del grupo cumplido: el cartel encendido' : 'Mes del grupo: van 2 de 3 semanas'); }
    if ((b = e.target.closest('[data-sccanf]'))) { SC.anf = b.dataset.sccanf === '1'; SC.anfR = null; if (SC.anf && SC.e === 'solo') SC.e = 'grupo';
      return aC(SC.anf ? 'Anfitrión: la invitación de su profe, arriba' : 'Sin invitación de anfitrión'); }
    if ((b = e.target.closest('[data-scctab]'))) { SC.tab = b.dataset.scctab; return aC('La pestaña dice "' + SC.tab + '"'); }
    if (e.target.closest('#socCSede')) { aC(); scSedeAbrir(); return; }
    // T23 · la D: estado, día del cruce, Instagram, nombre de la pestaña y la pregunta al entrar a una banda
    const aD = msg => { SOC_V = 'D'; socSave(); socSync(); return dmFin('social', msg); };
    const DIA_N = { lun0:'Lunes: rival nuevo', jue:'Jueves: el cruce en juego', gano:'Lunes siguiente: ganaron', perdio:'Lunes siguiente: esta vez no' };
    if ((b = e.target.closest('[data-socd]'))) { const antes = SD.e; SD.e = b.dataset.socd; if (antes === 'sin' && SD.e === 'con') SD.preg = true; return aD('Versión D · ' + SOC_DE[SD.e][0]); }
    if ((b = e.target.closest('[data-sddia]'))) { SD.dia = b.dataset.sddia; SD.e = 'con'; return aD('El pulso · ' + DIA_N[SD.dia]); }
    if ((b = e.target.closest('[data-sdig]'))) { SD.ig = b.dataset.sdig; return aD(SD.ig === 'vivo' ? 'Instagram de Viva: en vivo' : 'Instagram de Viva: ejemplo'); }
    if ((b = e.target.closest('[data-sdtab]'))) { SD.tab = b.dataset.sdtab; return aD('La pestaña dice "' + SD.tab + '"'); }
    if (e.target.closest('#socDPreg')) { SD.e = 'con'; SD.preg = true; return aD('Al entrar a una banda: qué compartís'); }
  });
  socSync();

//#bloque 346
  // ===== T24 · la E en el panel: socio, momento de la semana, que entrene alguien, en vivo, tamaño, quién no comparte, lo de Viva y los escenarios =====
  const SE_MOMN = { lun:'Lunes: arranca la semana', mie:'Miércoles: en camino', jue:'Jueves 19:10: la fecha', sab:'Sábado: falta 1', sincro:'Sábado: en sincro', dom:'Domingo: no llegó', lun1:'Lunes siguiente', mar:'Martes, en la sala' };
  function seSync(){
    $('#socERow').hidden = SOC_V !== 'E'; $('#socETxt').textContent = SOC_EE[SE.soc][1];
    const pe = (s, v) => $$('#socERow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === String(v)));
    pe('data-sesoc', SE.soc); pe('data-semom', SE.mom); pe('data-sevivo', SE.vivo ? 1 : 0); pe('data-setam', SE.tam); pe('data-seneu', SE.neu ? 1 : 0); pe('data-seig', SE.ig); pe('data-sevid', SE.vid ? 1 : 0);
    $('#seEsc1b').hidden = !(SE.soc === 'sin'); $('#seEsc5b').hidden = SE.mom !== 'dom';
  }
  const SE_ESC = {
    1:() => { SE.soc = 'sin'; SE.primer = false; seMomento('mie'); return 'Escenario 1 · Mica, 19 años, semana 2, sin banda'; },
    2:() => { SE.soc = 'con'; SE.tam = 5; SE.neu = false; SE.yoComp = true; seMomento('mar'); SE.voy = null; seTim.push(setTimeout(seEntrena, 1600)); return 'Escenario 2 · Martes: entrás a la sala'; },
    3:() => { SE.soc = 'con'; SE.tam = 5; SE.neu = false; seMomento('jue'); SE.voy = 'voy'; SE.vivo = true; SE.prisa = true; seVivoProg(); seTim.push(setTimeout(() => seAviso('fecha'), 900)); return 'Escenario 3 · Jueves 19:10, la fecha, en vivo'; },
    4:() => { SE.soc = 'con'; SE.tam = 5; SE.neu = false; seMomento('sab'); seTim.push(setTimeout(() => seAviso('falta1'), 700), setTimeout(seEntrena, 3200)); return 'Escenario 4 · Sábado: entrena el que faltaba'; },
    5:() => { SE.soc = 'con'; SE.tam = 5; seMomento('dom'); return 'Escenario 5 · Semana floja: domingo'; }
  };
  $('#demoSheet').addEventListener('click', e => { let b;
    const aE = msg => { SOC_V = 'E'; socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-sesoc]'))) { const antes = SE.soc; SE.soc = b.dataset.sesoc; if (SE.soc === 'nueva' && antes !== 'nueva') { SE.preg = true; SE.yoComp = true; seMomento('jue'); } else if (SE.soc !== 'sin') seMomento(SE.mom); return aE('Versión E · ' + SOC_EE[SE.soc][0]); }
    if ((b = e.target.closest('[data-semom]'))) { if (SE.soc === 'sin') SE.soc = 'con'; seMomento(b.dataset.semom); const r = aE('El momento · ' + SE_MOMN[SE.mom]);
      if (SE.mom === 'jue') seTim.push(setTimeout(() => seAviso('fecha'), 900)); if (SE.mom === 'sab') seTim.push(setTimeout(() => seAviso('falta1'), 900)); return r; }
    if (e.target.closest('#seEntrena')) { SOC_V = 'E'; socSave(); socSync(); dmFin('social'); setTimeout(seEntrena, 500); return; }
    if ((b = e.target.closest('[data-sevivo]'))) { SE.vivo = b.dataset.sevivo === '1'; SE.prisa = false; seVivoProg(); return aE(SE.vivo ? 'En vivo: cada 20 a 40 segundos pasa algo' : 'En vivo: apagado'); }
    if ((b = e.target.closest('[data-setam]'))) { SE.tam = +b.dataset.setam; if (SE.soc === 'sin') SE.soc = 'con'; seMomento(SE.mom); return aE('La banda: ' + SE.tam + ' integrantes'); }
    if ((b = e.target.closest('[data-seneu]'))) { SE.neu = b.dataset.seneu === '1'; return aE(SE.neu ? 'Un integrante no comparte: su barra queda neutra' : 'Todos comparten su barra'); }
    if ((b = e.target.closest('[data-seig]'))) { SE.ig = b.dataset.seig; return aE(SE.ig === 'vivo' ? 'Lo de Viva: Instagram en vivo' : 'Lo de Viva: ejemplo ilustrado'); }
    if ((b = e.target.closest('[data-sevid]'))) { SE.vid = b.dataset.sevid === '1'; return aE(SE.vid ? 'Con el video del profe' : 'Sin el video del profe'); }
    if ((b = e.target.closest('[data-seesc]'))) { SE.vivo = false; seVivoProg(); return aE(SE_ESC[b.dataset.seesc]()); }
    if (e.target.closest('#seEsc1b')) { SE.soc = 'nueva'; SE.preg = true; SE.yoComp = true; seMomento('jue'); return aE('El jueves: el profe la suma a una banda'); }
    if (e.target.closest('#seEsc5b')) { seMomento('lun1'); return aE('El lunes siguiente'); }
  });
  socSync();

//#bloque 347
  // ===== T25 · la F en el panel: puerta, estado, momento, que entrene alguien, en vivo, lo último, lo de Viva, nombre de la pestaña y los seis escenarios =====
  // [puerta 1, puerta 2, nombre corto]
  var SOC_FE = {
    sin:['Puerta 1 · "Entrená con alguien.": Invitá a un amigo (día, hora y sede, por WhatsApp) o Ya entreno con alguien de Viva (un código en persona). "No tengo con quién" lleva al primer jueves.',
      'Puerta 2 · "Tu primer jueves": 19:00 en Sarmiento, te recibe Prof. Lucas, con Voy. "Prefiero traer a alguien" abre la invitación.', 'Sin banda'],
    espera:['Invitó a alguien para el jueves 19:00: Reenviar o Cambiar el día. Sin cuenta regresiva ni recordatorios.', 'Anotado al primer jueves, con No llego.', 'En espera'],
    nueva:['El amigo vino: banda de dos ("Vos y Cris"), con el jueves como fecha. Primera semana con la meta a la mitad; el lunes, su primer cruce. Una vez, la pregunta de qué ve la banda.',
      'El jueves, Prof. Lucas armó "Los del jueves" (cinco). Primera semana con la meta a la mitad; el lunes, su primer cruce. Una vez, la pregunta de qué ve la banda.', 'Banda recién formada'],
    con:['Idéntica en las dos puertas: la fecha, el cruce (la barra de la banda contra la de su rival, cada una en % de su meta), lo último y lo de Viva. Acá, la banda de dos.',
      'Idéntica en las dos puertas: la fecha, el cruce (la barra de la banda contra la de su rival, cada una en % de su meta), lo último y lo de Viva. Acá, la banda de cinco.', 'Con banda'] };
  const SF_MOMN = { lun:'Lunes: arranca el cruce', mie:'Miércoles: en camino', jue:'Jueves 19:10: la fecha', sab:'Sábado', dom:'Domingo: cierra la semana', lun1g:'Lunes siguiente: ganaron', lun1p:'Lunes siguiente: esta vez no' };
  if (dmMem.soc && dmMem.soc.f) { const x = dmMem.soc.f;
    if (x.puerta in SF_B) SF.puerta = x.puerta; if (x.est in SOC_FE) SF.est = x.est; if (x.mom in SF_MOM) SF.mom = x.mom; SF.ult = x.ult !== false;
    if (x.ig === 'ej' || x.ig === 'vivo') SF.ig = x.ig; if (SF_TABS.includes(x.tab)) SF.tab = x.tab; sfEstado(SF.est); SF.preg = false; }
  function sfSync(){
    const r = $('#socFRow'); if (!r || !SOC_FE) return;   // socSync (bloque 345) llama antes de que exista
    r.hidden = SOC_V !== 'F' && SOC_V !== 'G';
    $$('#socFRow [data-sftab], #socFRow [data-sfig2]').forEach(x => x.closest('.dmrow').hidden = SOC_V === 'G');   // T26: la G no tiene esas dos
    const pf = (s, v) => $$('#socFRow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === String(v)));
    pf('data-sfpu', SF.puerta); pf('data-sfest', SF.est); pf('data-sfmom', SF.est === 'con' ? SF.mom : ''); pf('data-sfvivo', SF.vivo ? 1 : 0); pf('data-sfult', SF.ult ? 1 : 0); pf('data-sfig2', SF.ig); pf('data-sftab', SF.tab);
    $('#socFTxt').textContent = SOC_FE[SF.est][SF.puerta === 'trae' ? 0 : 1];
    $('#sfEsc1b').hidden = !(SF.puerta === 'presenta' && (SF.est === 'sin' || (SF.est === 'espera' && SF.tipo === 'presenta')));
    $('#sfEsc2b').hidden = !(SF.est === 'espera' && SF.tipo === 'trae');
  }
  const SF_ESC = {
    1:() => { SF.puerta = 'presenta'; sfEstado('sin'); return 'Escenario 1 · Mica, 19 años, semana 2: llega sola (puerta 2)'; },
    2:() => { SF.puerta = 'trae'; sfEstado('sin'); return 'Escenario 2 · Tomi, semana 1: quiere traer a un amigo (puerta 1)'; },
    3:() => { SF.puerta = 'trae'; sfEstado('sin'); sfTim.push(setTimeout(() => { SF.alt = true; sfRender(); toast('«No tengo con quién» lleva al primer jueves'); }, 1800)); return 'Escenario 3 · Puerta 1: no tengo con quién'; },
    4:() => { SF.mom = 'mie'; sfEstado('con'); SF.voy = null; sfTim.push(setTimeout(() => sfEntrena('s1'), 1600)); return 'Escenario 4 · Miércoles: entrás a la sala'; },
    5:() => { SF.mom = 'lun1g'; sfEstado('con'); return 'Escenario 5 · Lunes siguiente: ganaron'; },
    6:() => { SF.mom = 'lun1p'; sfEstado('con'); return 'Escenario 6 · Lunes siguiente: esta vez no'; }
  };
  $('#demoSheet').addEventListener('click', e => { let b;
    const aF = msg => { SOC_V = SOC_V === 'G' ? 'G' : 'F'; socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-sfesc]'))) { SF.vivo = false; sfVivoProg(); return aF(SF_ESC[b.dataset.sfesc]()); }
    if (e.target.closest('#sfEsc1b')) { SF.puerta = 'presenta'; sfEstado('nueva'); return aF('El jueves: Prof. Lucas la suma a Los del jueves'); }
    if (e.target.closest('#sfEsc2b')) { const t = SF.tipo; sfEstado('nueva'); SF.tipo = t; return aF('El amigo vino: ya son banda de dos'); }
    if ((b = e.target.closest('[data-sfpu]'))) { SF.puerta = b.dataset.sfpu; sfEstado(SF.est); return aF('Puerta: ' + (SF.puerta === 'trae' ? 'Traé a tu gente' : 'Viva te presenta')); }
    if ((b = e.target.closest('[data-sfest]'))) { sfEstado(b.dataset.sfest); return aF('Versión F · ' + SOC_FE[SF.est][2]); }
    if ((b = e.target.closest('[data-sfmom]'))) { SF.mom = b.dataset.sfmom; sfEstado('con'); return aF('El momento · ' + SF_MOMN[SF.mom]); }
    if (e.target.closest('#sfEntrena')) { SOC_V = SOC_V === 'G' ? 'G' : 'F'; socSave(); socSync(); dmFin('social'); setTimeout(() => sfEntrena(), 500); return; }
    if ((b = e.target.closest('[data-sfvivo]'))) { SF.vivo = b.dataset.sfvivo === '1'; SF.prisa = false; sfVivoProg(); return aF(SF.vivo ? 'En vivo: cada 20 a 40 segundos entrena alguien' : 'En vivo: apagado'); }
    if ((b = e.target.closest('[data-sfult]'))) { SF.ult = b.dataset.sfult === '1'; return aF(SF.ult ? 'Lo último: una línea con lo más nuevo de la banda' : 'Sin Lo último'); }
    if ((b = e.target.closest('[data-sfig2]'))) { SF.ig = b.dataset.sfig2; return aF(SF.ig === 'vivo' ? 'Lo de Viva: Instagram en vivo' : 'Lo de Viva: ejemplo ilustrado'); }
    if ((b = e.target.closest('[data-sftab]'))) { SF.tab = b.dataset.sftab; return aF('La pestaña dice "' + SF.tab + '"'); }
  });
  socSync();

//#bloque 348
  // ===== T26 · la G en el panel: escenarios 7 a 10, palabra, visible, nombre, semanas en sincro, novedades, rival y momentos.
  // Debajo se muestra también la fila de la F (puerta, estado, momento, que entrene alguien, en vivo, lo último): la G comparte su estado.
  var SG_OPC = { voc:['Bandas', 'Tribus'], vis:['si', 'no', 'falta'], nombre:['ok', 'espera'], semK:['auto', '0', '1', '3', '4', '12', '24'], nov:['ninguna', 'tu', 'rival', 'varias', 'dos'], rivSede:['tu', 'otra'] };
  if (dmMem.socG) { const x = dmMem.socG; Object.keys(SG_OPC).forEach(k => { if (SG_OPC[k].includes(x[k])) SG[k] = x[k]; }); SG.esp = !!x.esp; if ('res' in x) SG.res = !!x.res; }
  function sgSync(){
    const r = $('#socGRow'); if (!r) return;
    r.hidden = SOC_V !== 'G';
    const pg = (s, v) => $$('#socGRow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === String(v)));
    pg('data-sgres', SG.res ? 1 : 0); pg('data-sgvoc', SG.voc); pg('data-sgvisp', SG.vis); pg('data-sgnom', SG.nombre); pg('data-sgsem', SG.semK); pg('data-sgnov', SG.nov); pg('data-sgriv', SG.rivSede); pg('data-sgesp', SG.esp ? 1 : 0);
  }
  const sgSave = () => { dmMem.socG = { voc:SG.voc, vis:SG.vis, nombre:SG.nombre, semK:SG.semK, nov:SG.nov, rivSede:SG.rivSede, esp:SG.esp, res:SG.res }; dmSave(); };
  const SG_ESC = {
    7:() => { SF.puerta = 'trae'; SF.mom = 'mar'; sfEstado('con'); Object.assign(SG, { vis:'si', nombre:'ok', semK:'auto', nov:'dos', rivSede:'tu', novAt:'' });
      return 'Escenario 7 · Martes: dos anillos encendidos'; },
    8:() => { SF.mom = 'lun1g'; sfEstado('con'); Object.assign(SG, { semK:'auto', nov:'varias', novAt:'' }); return 'Escenario 8 · Lunes: el resultado se revela'; },
    9:() => { SF.puerta = 'presenta'; sfEstado('sin'); Object.assign(SG, { nov:'varias', novAt:'' }); return 'Escenario 9 · Mica, 19 años, sin banda, ve la fila'; },
    10:() => { SG.vis = 'falta'; SG.novAt = ''; if (SF.est !== 'con') { SF.mom = 'jue'; sfEstado('con'); } setTimeout(() => { if (SOC_V === 'G') sgAbrir('yo'); }, 1500);
      return 'Escenario 10 · Tu banda todavía no aparece para las demás'; },
    11:() => { SF.mom = 'lun1g'; sfEstado('con'); Object.assign(SG, { res:true, semK:'auto', vis:'si', nov:'varias', novAt:'' }); setTimeout(() => { if (SOC_V === 'G') sgAbrir('yo'); }, 1500);
      return 'Escenario 11 · Lunes: el resumen (ganaron)'; },
    12:() => { SF.mom = 'lun1p'; sfEstado('con'); Object.assign(SG, { res:true, semK:'auto', vis:'si', nov:'varias', novAt:'' }); setTimeout(() => { if (SOC_V === 'G') sgAbrir('yo'); }, 1500);
      return 'Escenario 12 · Lunes: semana floja, el resumen dice lo hecho'; }
  };
  const SG_MSG = { vis:{ si:'Visible: todos dijeron que sí', no:'Visible: no (lo eligieron)', falta:'Falta el sí de uno: ustedes la ven, las demás no' },
    nombre:{ ok:'El nombre: aprobado por el profe', espera:'El nombre: esperando a tu profe' },
    nov:{ ninguna:'Novedades: ninguna (anillos apagados)', tu:'Novedades: en tu banda', rival:'Novedades: en la rival', varias:'Novedades: en varias' } };
  $('#demoSheet').addEventListener('click', e => { let b;
    const aG = msg => { SOC_V = 'G'; sgSave(); socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-sgesc]'))) { SF.vivo = false; sfVivoProg(); return aG(SG_ESC[b.dataset.sgesc]()); }
    if ((b = e.target.closest('[data-sgvoc]'))) { SG.voc = b.dataset.sgvoc; return aG('La palabra: ' + SG.voc); }
    if ((b = e.target.closest('[data-sgvisp]'))) { SG.vis = b.dataset.sgvisp; return aG(SG_MSG.vis[SG.vis]); }
    if ((b = e.target.closest('[data-sgnom]'))) { SG.nombre = b.dataset.sgnom; return aG(SG_MSG.nombre[SG.nombre]); }
    if ((b = e.target.closest('[data-sgsem]'))) { SG.semK = b.dataset.sgsem; if (SF.est === 'sin' || SF.est === 'espera') sfEstado('con');
      return aG(SG.semK === 'auto' ? 'Semanas en sincro: las de las entradas' : 'Semanas en sincro de tu banda: ' + SG.semK); }
    if ((b = e.target.closest('[data-sgnov]'))) { SG.nov = b.dataset.sgnov; SG.novAt = ''; return aG(SG_MSG.nov[SG.nov]); }
    if ((b = e.target.closest('[data-sgriv]'))) { SG.rivSede = b.dataset.sgriv; if (SF.est !== 'con') sfEstado('con'); return aG(SG.rivSede === 'otra' ? 'La rival es de López y Planes' : 'La rival es de tu sede'); }
    if (e.target.closest('[data-sgdom]')) { SF.mom = 'dom'; sfEstado('con'); return aG('Domingo a la noche: se define hoy'); }
    if ((b = e.target.closest('[data-sgres]'))) { SG.res = b.dataset.sgres === '1'; SG.novAt = ''; return aG(SG.res ? 'Resumen del lunes: sí (de lunes a miércoles)' : 'Resumen del lunes: no'); }
    if (e.target.closest('[data-sglunres]')) { SF.mom = 'lun1g'; sfEstado('con'); SG.res = true; SG.novAt = ''; return aG('Lunes, con resumen: el anillo de tu banda lo trae'); }
    if ((b = e.target.closest('[data-sgesp]'))) { SG.esp = b.dataset.sgesp === '1'; if (SG.esp && SF.est !== 'con') sfEstado('con'); return aG(SG.esp ? 'Semana del cruce especial: sede contra sede' : 'Sin cruce especial'); }
  });
  socSync();

//#bloque 349
  // ===== T28 · la H en el panel: perfil, momento de la semana, día de la socia nueva, su primera semana, comparación, People y muro =====
  var SH_OPC = { perfil:['banda', 'sola', 'duo'], mom:['lun', 'mie', 'dom'], dia:[1, 8, 22], vino:[3, 1] };
  var SH_PTXT = { banda:'Martina, Sarmiento, de Dúo dinamita (cinco). La fijada es el cruce de la semana con Las del mediodía; después, la foto de Lu, el momento de Cris, la sede y VIVA.',
    sola:'Sofi, alta el lunes 2/11 en Sarmiento, meta 3, no conoce a nadie. Día 1, 8 o 22 (abajo). La puerta, su camada como número y los rayos de su sede.',
    duo:'Sofi y Cami, que vinieron juntas el lunes 2/11. La fijada es el dúo: cada semana que cumplen las dos, se enciende un tubo; "Voy mañana".' };
  if (dmMem.socH) { const x = dmMem.socH; Object.keys(SH_OPC).forEach(k => { if (SH_OPC[k].includes(x[k])) SH[k] = x[k]; }); SH.comp = x.comp !== false; SH.people = !!x.people; SH.muro = x.muro === 'poco' ? 'poco' : 'lleno'; }
  else SOC_V = 'H';   // T28: la H abre por defecto, también para quien tenía guardada otra versión
  function shSave(){ dmMem.socH = { perfil:SH.perfil, mom:SH.mom, dia:SH.dia, vino:SH.vino, comp:SH.comp, people:SH.people, muro:SH.muro }; dmSave(); }
  function shSync(){
    const r = $('#socHRow'); if (!r || typeof SH_OPC === 'undefined') return;   // socSync (bloque 345) llama antes de que exista
    r.hidden = SOC_V !== 'H';
    const ph = (s, v) => $$('#socHRow [' + s + ']').forEach(x => x.setAttribute('aria-pressed', x.getAttribute(s) === String(v)));
    ph('data-shpf', SH.perfil); ph('data-shmo', SH.mom); ph('data-shdia', SH.dia); ph('data-shvino', SH.vino); ph('data-shcomp', SH.comp ? 1 : 0); ph('data-shpeo', SH.people ? 1 : 0); ph('data-shmuro', SH.muro);
    $('#shRowMom').hidden = SH.perfil !== 'banda'; $('#shRowDia').hidden = SH.perfil === 'banda'; $('#shRowVino').hidden = !(SH.perfil === 'sola' && SH.dia === 8);
    $('#socHTxt').textContent = SH_PTXT[SH.perfil];
    if (SOC_V === 'H') { if (SH.h) shCerrar(); $('#shHoja').hidden = true; shRender(); }
  }
  shSave(); socSync();
  var SH_PN = { banda:'Con banda (Martina)', sola:'Nueva, sola (Sofi)', duo:'Nueva, en dúo (Sofi y Cami)' }, SH_MN = { lun:'Lunes: el resultado y rival nuevo', mie:'Miércoles: cómo vamos', dom:'Domingo: se define hoy' };
  $('#demoSheet').addEventListener('click', e => { let b;
    const aH = msg => { SH.visto = {}; SH.puertaNo = false; SH.prop = []; SH.voy = false; SOC_V = 'H'; shSave(); socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-shpf]'))) { SH.perfil = b.dataset.shpf; return aH('Social H · ' + SH_PN[SH.perfil]); }
    if ((b = e.target.closest('[data-shmo]'))) { SH.perfil = 'banda'; SH.mom = b.dataset.shmo; return aH(SH_MN[SH.mom]); }
    if ((b = e.target.closest('[data-shdia]'))) { if (SH.perfil === 'banda') SH.perfil = 'sola'; SH.dia = +b.dataset.shdia; if (SH.dia === 1) SH.ins = null; return aH(SH_PN[SH.perfil] + ' · día ' + SH.dia); }
    if ((b = e.target.closest('[data-shvino]'))) { SH.perfil = 'sola'; SH.dia = 8; SH.vino = +b.dataset.shvino; return aH(SH.vino === 3 ? 'Su primera semana: vino 3 de 3' : 'Su primera semana: vino una vez'); }
    if ((b = e.target.closest('[data-shcomp]'))) { SH.comp = b.dataset.shcomp === '1'; return aH(SH.comp ? 'Comparación con la camada: sí' : 'Comparación con la camada: no'); }
    if ((b = e.target.closest('[data-shpeo]'))) { SH.people = b.dataset.shpeo === '1'; return aH(SH.people ? 'People activada: la entrada aparece en la barra' : 'People: no'); }
    if ((b = e.target.closest('[data-shmuro]'))) { SH.muro = b.dataset.shmuro; return aH(SH.muro === 'poco' ? 'Muro casi vacío' : 'Muro lleno'); }
  });

//#bloque 350
  // ===== T29 · la I en el panel: perfil (con banda, solo dúo, sin vínculos) y volver a preguntar quién ve el "voy" =====
  var SI_PTXT = { banda:'Martina, miércoles 18/11, de Dúo dinamita (cinco), vinculada además con Lu. Arriba, quién de los suyos dijo voy hoy; abajo, el cruce con Las del mediodía.',
    duo:'Sofi, día 8 (lunes 9/11), en dúo con Cami y vinculada con Ana. Abajo, el dúo: un tubo por cada semana que cumplen las dos.',
    sin:'Alguien que todavía no se vinculó con nadie: su código de cuatro cifras para mostrar en la sala. Sin "voy": no lo vería nadie.' };
  if (dmMem.socI) { const x = dmMem.socI; if (x.perfil in SI_PTXT) SI.perfil = x.perfil; if (x.mom === 'mie' || x.mom === 'dom') SI.mom = x.mom; }
  else SOC_V = 'I';   // T29: la I abre por defecto, también para quien tenía guardada otra versión
  function siSave(){ dmMem.socI = { perfil:SI.perfil, mom:SI.mom }; dmSave(); }
  function siSync(){
    const r = $('#socIRow'); if (!r || typeof SI_PTXT === 'undefined') return;   // socSync (bloque 345) llama antes de que exista
    r.hidden = SOC_V !== 'I';
    $$('#socIRow [data-sipf]').forEach(x => x.setAttribute('aria-pressed', x.dataset.sipf === SI.perfil));
    $$('#socIRow [data-simo]').forEach(x => x.setAttribute('aria-pressed', x.dataset.simo === SI.mom)); $('#siRowMom').hidden = SI.perfil !== 'banda';
    $('#socITxt').textContent = SI_PTXT[SI.perfil];
    if (SOC_V === 'I') { if (SI.h) siCerrar(); $('#siHoja').hidden = true; siRender(); }
  }
  siSave(); socSync();
  var SI_PN = { banda:'Con banda (Martina)', duo:'Solo dúo (Sofi y Cami)', sin:'Sin vínculos' };
  $('#demoSheet').addEventListener('click', e => { let b;
    const aI = msg => { SI.voy = false; SI.man = false; SI.franja = ''; SOC_V = 'I'; siSave(); socSave(); socSync(); return dmFin('social', msg); };
    if ((b = e.target.closest('[data-sipf]'))) { SI.perfil = b.dataset.sipf; SI.ok = null; return aI('Social I · ' + SI_PN[SI.perfil]); }
    if ((b = e.target.closest('[data-simo]'))) { SI.perfil = 'banda'; SI.mom = b.dataset.simo; return aI(SI.mom === 'dom' ? 'Domingo 22/11: se define hoy' : 'Miércoles 18/11: cómo vamos'); }
    if (e.target.closest('[data-sireset]')) { SI.ok = null; return aI('El próximo voy vuelve a preguntar quién lo ve'); }
  });

//#bloque 985
  // T16 · gancho de prueba para tools/barrido.py: abre pantallas que necesitan estado. Ninguna pantalla lo usa.
  window.VK_PRUEBA = { abrir: function (id) {
    if (id === 'sala') { if (!SALA) salaDemo(); renderSala(); cajaAbrir(); return; }
    if (id === 'cierre') { if (!SALA) salaDemo(); salaCerrar(); return; }
    if (id === 'onbE') { OB.step = 'inv'; OB.obj = []; OB.zonaAbierta = false; OB.zona = null; OB.meta = 3; OB.res = {}; obRender(); go('onbE'); return; }
    if (id === 'chat') { openChat(conv[0].id); return; }
    go(id);
  } };
//#bloque 990
  // ===== T-R v86 · WELCOME TO THE CLUB, para probar en cuatro lugares (decisiones.md 12/11) =====
  var WTTC = { entrada:true, inicio:false, comunidad:false, ingreso:false };
  (function () {
    const txt = c => '<text class="' + c + '" x="0" y="80"><tspan font-size="84">WELCOME</tspan><tspan font-size="84" dx="30">TO THE CLUB</tspan></text>';
    const SIGN = '<svg class="wtcs" role="img" aria-label="Welcome to the club" viewBox="0 0 1100 100" preserveAspectRatio="xMidYMid meet">' + txt('tb') + txt('tc') + '</svg>';
    const band = k => '<div class="wtcn" data-wttcb="' + k + '" hidden>' + SIGN + '</div>';
    $('#inicio .body').insertAdjacentHTML('afterbegin', band('inicio'));
    $('#social .body').insertAdjacentHTML('afterbegin', band('comunidad'));
    $('#login .top').insertAdjacentHTML('afterend', band('ingreso'));
    $('.app').insertAdjacentHTML('beforeend', '<div id="wttcFull" hidden role="dialog" aria-label="Welcome to the club"><div class="wtcn">' + SIGN + '</div></div>');
  })();
  // Se mide una copia invisible (una pantalla oculta mide cero) y el viewBox se aplica a todos los carteles
  function wtcFit(){ requestAnimationFrame(() => { const all = $$('svg.wtcs'); if (!all.length) return;
    const pr = all[0].cloneNode(true); pr.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:600px;visibility:hidden'); $('.app').append(pr);
    try { const b = pr.querySelector('text').getBBox(); if (b.width) { const vb = [b.x - 12, b.y - 12, b.width + 24, b.height + 24].map(Math.round).join(' '); all.forEach(s => s.setAttribute('viewBox', vb)); } } catch (e) {}
    pr.remove(); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(wtcFit);
  function wttcSync(){
    ['inicio', 'comunidad', 'ingreso'].forEach(k => { const b = $('[data-wttcb="' + k + '"]'); if (b) { b.hidden = !WTTC[k]; b.classList.toggle('wttcOn', WTTC[k]); } });
    const on = Object.keys(WTTC).filter(k => WTTC[k]);
    $$('#wttcPick [data-wttc]').forEach(x => x.setAttribute('aria-pressed', !!WTTC[x.dataset.wttc]));
    wtcFit();
  }
  let wttcT = null;
  function wttcCerrar(){ clearTimeout(wttcT); $('#wttcFull').hidden = true; }
  function wttcPrimera(){
    // Verídico: solo con una entrada registrada por el molinete
    if (NOENT) { toast('Sin entrada registrada no hay bienvenida'); return; }
    const f = $('#wttcFull'), t = f.querySelector('.wtcn'); f.hidden = false; wtcFit(); t.classList.remove('wttcOn'); void t.offsetWidth; t.classList.add('wttcOn');
    clearTimeout(wttcT); wttcT = setTimeout(wttcCerrar, 3000);
  }
  $('#wttcFull').addEventListener('click', wttcCerrar);
  $('#wtcfPick').addEventListener('click', e => { const b = e.target.closest('[data-wtcf]'); if (!b) return; e.stopPropagation(); $('.app').dataset.wtcf = b.dataset.wtcf;
    $$('#wtcfPick [data-wtcf]').forEach(x => x.setAttribute('aria-pressed', x === b)); toast(b.dataset.wtcf === '1' ? 'Welcome to the club: titila' : 'Welcome to the club: quieto'); });
  // Lugares no excluyentes: cada toque prende o apaga el suyo y el panel queda abierto
  const WTTC_N = { entrada:'Primera entrada', inicio:'Inicio', comunidad:'Mural', ingreso:'Ingreso' };
  $('#demoSheet').addEventListener('click', e => { const b = e.target.closest('[data-wttc]'); if (!b) return; e.stopPropagation();
    const k = b.dataset.wttc; if (k === 'off') Object.keys(WTTC).forEach(x => WTTC[x] = false); else WTTC[k] = !WTTC[k]; wttcSync();
    const on = Object.keys(WTTC).filter(x => WTTC[x]).map(x => WTTC_N[x]);
    toast(!on.length ? 'Cartel apagado' : on.length > 2 ? 'Cartel en ' + on.length + ' lugares' : 'Cartel en ' + on.join(' y ')); }, true);
  $('#wttcSim').addEventListener('click', () => { WTTC.entrada = true; wttcSync(); setAnt('nueva'); dmFin('inicio', null); wttcPrimera(); });
  wttcSync();
