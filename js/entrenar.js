/* Vivapp · Entrenar: rutinas, IA, sesión con carga, maniquí 3D, clases, asesor y la v41/v42 (Hoy, modo sala, cierre).
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 030
  // Tabs rutinas
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
    $('#tab-act').hidden = b.dataset.tab !== 'act';
    $('#tab-hist').hidden = b.dataset.tab !== 'hist';
  }));

  // IA
  $$('.opts').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    $$('.opt', g).forEach(x => x.setAttribute('aria-pressed', x === b));
  }));
  const val = g => $('.opts[data-group="'+g+'"] .opt[aria-pressed="true"]').textContent;
  const planes = {
    '2': [['Día A · Full body', 7], ['Día B · Full body', 7]],
    '3': [['Día A · Tren inferior', 6], ['Día B · Empuje', 6], ['Día C · Tracción', 6]],
    '4': [['Día A · Tren inferior', 6], ['Día B · Empuje', 6], ['Día C · Tracción', 6], ['Día D · Full body', 7]],
    '5': [['Día A · Piernas', 6], ['Día B · Pecho y hombros', 6], ['Día C · Espalda', 6], ['Día D · Brazos y core', 6], ['Día E · Full body', 7]],
    '6': [['Día A · Empuje', 6], ['Día B · Tracción', 6], ['Día C · Piernas', 6], ['Día D · Empuje', 6], ['Día E · Tracción', 6], ['Día F · Piernas', 6]]
  };
  $('#genBtn').addEventListener('click', () => {
    const obj = val('obj'), nivel = val('nivel'), dias = val('dias'), tiempo = val('tiempo');
    const lesion = { 'Rodilla':'molestia en la rodilla', 'Espalda baja':'molestia en la espalda baja', 'Hombro':'molestia en el hombro' }[val('lesion')] || '';
    $('#resTitle').textContent = obj + ' · ' + dias + ' días';
    $('#resSub').textContent = 'Nivel ' + nivel.toLowerCase() + ' · ' + tiempo + ' por sesión · 8 semanas';
    $('#resDays').innerHTML = planes[dias].map(([n, c]) => '<div><span style="flex:1;font-weight:700">' + n + '</span><span class="small muted">' + c + ' ejercicios</span></div>').join('');
    $('#resLesion').hidden = !lesion;
    $('#resLesionTxt').textContent = 'Adaptamos los ejercicios por: ' + lesion + '. Consultá a tu profe si sentís dolor.';
    $('#iaForm').hidden = true; $('#iaLoading').hidden = false;
    setTimeout(() => { $('#iaLoading').hidden = true; $('#iaResult').hidden = false; prepLead(); }, 1400);
  });
  $('#rehacerBtn').addEventListener('click', () => { $('#iaResult').hidden = true; $('#iaForm').hidden = false; });
//#bloque 060
  // Activar rutina generada con IA: queda activa y en curso
  function crearRutinaIA(){
    const dias = val('dias'), keys = Object.keys(lib);
    return { tipo:'ia', nombre:$('#resTitle').textContent, by:'Generada con IA', sub:'Creada hoy · ' + val('tiempo') + ' por sesión', next:0,
      dias: planes[dias].map(([n], i) => ({ k:String.fromCharCode(65 + i), n:n.split(' · ')[1], ex:[keys[i % 7], keys[(i + 2) % 7], keys[(i + 4) % 7]], lbl:['Lun','Mar','Mié','Jue','Vie','Sáb'][i] })) };
  }
  $('#activarBtn').addEventListener('click', () => {
    const nueva = crearRutinaIA();
    if (modo === 'ppu') { rutinas.ppu = nueva; $('#iaResult').hidden = true; $('#iaForm').hidden = false; renderPpuTrain(); go('ppuTrain'); toast('Rutina activada'); return; }
    rutinas.ia = nueva;
    actual = 'ia';
    $('#iaResult').hidden = true; $('#iaForm').hidden = false;
    renderRoutines(); renderToday();
    go('rutinas'); toast('Rutina activada y en curso · tu profe fue avisado');
  });

  // ===== Sesión de entrenamiento: carga de kg y repeticiones =====
  const num = t => { const v = parseFloat(String(t).replace(',', '.')); return isNaN(v) ? null : v; };
  const fmtN = v => v == null ? '—' : String(Math.round(v * 10) / 10).replace('.', ',');
  const hoyLbl = (() => { const d = ahora(); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); })();
  // Historial de ejemplo: mejor marca por sesión (kg; en plancha, segundos)
  // Días atrás de cada sesión, alineados con los ingresos simulados: B (espalda) miércoles, A (piernas) viernes, C (hombros) lunes
  const hs = (dias, vals) => dias.map((d, i) => [dmLbl(diaAtras(d)), vals[i]]), dB = [35, 28, 21, 14, 7], dA = [33, 26, 19, 12, 5], dC = [30, 23, 16, 9, 2];
  const hist = {
    remo:hs([63].concat(dB), [35, 37.5, 40, 40, 40, 40]),
    jalon:hs(dB, [40, 42.5, 45, 45, 45]),
    curl:hs(dB, [8, 8, 10, 10, 10]),
    sentadilla:hs(dA, [12, 14, 14, 14, 14]),
    press:hs(dC, [6, 8, 8, 8, 8]),
    puente:hs(dA, [0, 0, 5, 10, 10]),
    plancha:hs(dA, [25, 30, 30, 35, 35])
  };
  const esTiempo = k => k === 'plancha';
  const unidad = k => esTiempo(k) ? 's' : 'kg';
  const prevBest = k => Math.max.apply(null, hist[k].filter(h => h[0] !== hoyLbl).map(h => h[1]));
  const metric = (k, v) => esTiempo(k) ? v.reps : v.kg;

  let ses = { rid:'profe', di:1, idx:0, done:[[true,true,false,false]], vals:[], prs:{}, motivos:[] };
  let editSet = null, pendiente = null;
  function startDay(rid, di, pv){
    if (!pv && modo === 'socio' && typeof salaStart === 'function') { actual = rid; rutinas[rid].next = di; salaStart(); return; }
    preview = !!pv; $('#exPrev').hidden = !preview; $('#clock').textContent = '0:00';
    $('#finish').textContent = preview ? (leadSaved ? 'Listo' : 'Guardar mi rutina') : 'Terminar';
    ses = { rid:rid, di:di, idx:0, done:[], vals:[], prs:{}, motivos:[] };
    secs = 0; stopRest(); renderEx();
    if (!preview && modo === 'socio' && curScr !== 'ppuTrain') { if (MOM !== 'sala' && MOM !== 'sesion') setMom('sala', true); MOM = 'sesion'; renderAcc(); renderToday(); renderHoy(); }
    go('entrenando');
  }
  const curKey = () => rutinas[ses.rid].dias[ses.di].ex[ses.idx];
  function ensure(i){
    const k = rutinas[ses.rid].dias[ses.di].ex[i], ex = lib[k];
    if (!ses.done[i]) ses.done[i] = ex.sets.map(() => false);
    if (!ses.vals[i]) ses.vals[i] = ex.sets.map(s => { const kg = num(s[1]); return { kg: kg && ((lastFeel && lastFeel <= 2) || prepBaja()) ? Math.max(2.5, Math.round(kg * 0.9 / 2.5) * 2.5) : kg, reps: num(s[2]) }; });
  }
  function renderEx(){
    const r = rutinas[ses.rid], d = r.dias[ses.di], key = d.ex[ses.idx], ex = lib[key];
    ensure(ses.idx);
    const done = ses.done[ses.idx], vals = ses.vals[ses.idx], pb = prevBest(key);
    $('#exDay').textContent = 'Día ' + d.k + ' · ' + d.n;
    $('#exName').textContent = ex.n; $('#exTip').textContent = ex.grupo + ' · Tip: ' + ex.tip; $('#exSugTxt').textContent = !preview && lastFeel && lastFeel <= 2 ? 'Te bajamos un poco la carga porque la última sesión te costó. Si hoy te sentís bien, subila.' : !preview && prepBaja() ? 'Te bajamos un 10% la carga porque tu preparación de hoy está baja.' : ex.sug; $('#vidBtn').hidden = preview;
    $('#exCount').textContent = 'Ejercicio ' + (ses.idx + 1) + ' de ' + d.ex.length;
    $('#prog').style.gridTemplateColumns = 'repeat(' + d.ex.length + ',minmax(0,1fr))';
    $('#prog').innerHTML = d.ex.map((_, i) => '<i class="' + (i < ses.idx ? 'on' : i === ses.idx ? 'cur' : '') + '"></i>').join('');
    $('#sets').innerHTML = '<div class="setrow head"><span style="text-align:center">SERIE</span><span>ANTERIOR</span><span style="text-align:center">' + (esTiempo(key) ? 'EXTRA' : 'KG') + '</span><span style="text-align:center">' + (esTiempo(key) ? 'SEG' : 'REPS') + '</span><span></span></div>' +
      ex.sets.map((s, i) => {
        const v = vals[i], pr = done[i] && metric(key, v) > pb;
        return '<div class="setrow' + (done[i] ? ' isdone' : '') + (pr ? ' pr' : '') + '"><span style="font-weight:700;text-align:center">' + (pr ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Récord"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>' : (i + 1)) + '</span>' +
          '<span class="small muted">' + s[0] + '</span>' +
          '<button class="v vb" data-edit="' + i + '" aria-label="Editar peso de la serie ' + (i + 1) + '">' + (v.kg ? fmtN(v.kg) : '—') + '</button>' +
          '<button class="v vb" data-edit="' + i + '" aria-label="Editar repeticiones de la serie ' + (i + 1) + '">' + fmtN(v.reps) + '</button>' +
          '<button class="chk" data-set="' + i + '" aria-pressed="' + done[i] + '" aria-label="Serie ' + (i + 1) + (done[i] ? ' hecha' : ' pendiente') + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></button></div>';
      }).join('') +
      '<span class="small muted" style="text-align:center">Tocá el peso o las repeticiones para cargar lo que hiciste.</span>';
    const nxt = d.ex[ses.idx + 1];
    $('#nextEx').textContent = nxt ? 'Siguiente: ' + lib[nxt].n.split(' ')[0] : 'Último ejercicio';
    setAnim(ex);
  }
  function marcar(i, valor){
    const key = curKey(), done = ses.done[ses.idx], v = ses.vals[ses.idx][i];
    done[i] = valor; renderEx();
    if (!valor) return;
    startRest(90);
    const m = metric(key, v), pb = prevBest(key);
    if (m > pb && !(ses.prs[key] >= m)) {
      ses.prs[key] = m;
      setTimeout(() => toast('¡Nuevo récord en ' + lib[key].n + ': ' + fmtN(m) + ' ' + unidad(key) + '!'), 50);
    }
  }
  $('#sets').addEventListener('click', e => {
    const c = e.target.closest('.chk'); if (c) { const i = +c.dataset.set; marcar(i, !ses.done[ses.idx][i]); return; }
    const ed = e.target.closest('[data-edit]'); if (ed) abrirSerie(+ed.dataset.edit);
  });

  // Hoja para cargar una serie
  function abrirSerie(i){
    const key = curKey(), ex = lib[key], v = ses.vals[ses.idx][i];
    editSet = i;
    $('#ssEx').textContent = ex.n; $('#ssTitle').textContent = 'Serie ' + (i + 1);
    $('#ssKgLbl').textContent = esTiempo(key) ? 'Peso extra (kg)' : 'Peso (kg)';
    $('#ssRepsLbl').textContent = esTiempo(key) ? 'Segundos' : 'Repeticiones';
    $('#ssKg').value = fmtN(v.kg || 0); $('#ssReps').value = fmtN(v.reps || 0);
    $('#ssPrev').textContent = 'La vez anterior: ' + ex.sets[i][0] + ' · Tu mejor marca: ' + fmtN(prevBest(key)) + ' ' + unidad(key);
    $('#ssDone').hidden = ses.done[ses.idx][i];
    $('#setSheet').hidden = false;
  }
  $$('[data-step-kg]').forEach(b => b.addEventListener('click', () => { const v = Math.max(0, (num($('#ssKg').value) || 0) + num(b.dataset.stepKg)); $('#ssKg').value = fmtN(v); }));
  $$('[data-step-reps]').forEach(b => b.addEventListener('click', () => { const step = esTiempo(curKey()) ? 5 * Math.sign(num(b.dataset.stepReps)) : num(b.dataset.stepReps); const v = Math.max(0, (num($('#ssReps').value) || 0) + step); $('#ssReps').value = fmtN(v); }));
  function guardarSerie(){
    const v = ses.vals[ses.idx][editSet];
    v.kg = num($('#ssKg').value) || 0; v.reps = num($('#ssReps').value) || 0;
    $('#setSheet').hidden = true;
  }
  $('#ssSave').addEventListener('click', () => { guardarSerie(); renderEx(); });
  $('#ssDone').addEventListener('click', () => { guardarSerie(); marcar(editSet, true); });
  $('#setSheet').addEventListener('click', e => { if (e.target.id === 'setSheet') $('#setSheet').hidden = true; });

  // Series sin marcar: preguntar antes de avanzar
  function faltantes(){ ensure(ses.idx); return ses.done[ses.idx].filter(x => !x).length; }
  function avanzar(){
    const d = rutinas[ses.rid].dias[ses.di];
    if (pendiente === 'next') { if (ses.idx < d.ex.length - 1) { ses.idx++; renderEx(); $('#entrenando .body').scrollTop = 0; } }
    else cerrarSesion();
    pendiente = null;
  }
  function pedirMotivo(accion){
    const n = faltantes();
    if (!n) { pendiente = accion; avanzar(); return; }
    pendiente = accion;
    $('#msTitle').textContent = n === 1 ? 'Te quedó 1 serie sin marcar' : 'Te quedaron ' + n + ' series sin marcar';
    $('#missSheet').hidden = false;
  }
  $('#msOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-motivo]'); if (!b) return;
    const m = b.dataset.motivo; $('#missSheet').hidden = true;
    if (m === 'olvido') { ses.done[ses.idx] = ses.done[ses.idx].map(() => true); toast('Series marcadas como hechas'); }
    else {
      ses.motivos.push({ ej: curKey(), motivo: m, series: faltantes() });
      toast(m === 'dolor' ? 'Registrado. Si la molestia sigue, avisale a tu profe.' : m === 'maquina' ? 'Gracias. Avisamos a mantenimiento' : 'Registrado para ajustar tu próxima rutina');
    }
    avanzar();
  });
  $('#msBack').addEventListener('click', () => { $('#missSheet').hidden = true; pendiente = null; });
  $('#nextEx').addEventListener('click', () => {
    const d = rutinas[ses.rid].dias[ses.di];
    if (ses.idx < d.ex.length - 1) pedirMotivo('next');
  });
  $('#finish').addEventListener('click', () => { if (preview) { stopRest(); if (leadSaved) go('nuevo'); else $('#lpSave').click(); return; } pedirMotivo('finish'); });
  function terminar(){
    // Guardar la mejor marca de hoy de cada ejercicio hecho
    rutinas[ses.rid].dias[ses.di].ex.forEach((k, i) => {
      if (!ses.done[i] || !hist[k]) return;
      const ms = ses.vals[i].filter((_, j) => ses.done[i][j]).map(v => metric(k, v));
      if (!ms.length) return;
      const m = Math.max.apply(null, ms), h = hist[k], last = h[h.length - 1];
      if (last[0] === hoyLbl) last[1] = Math.max(last[1], m); else h.push([hoyLbl, m]);
      avKey = k;
    });
    const r = rutinas[ses.rid];
    if (ses.di === r.next) r.next = (r.next + 1) % r.dias.length;
    const sum = { min: Math.max(1, Math.round(secs / 60)), series: 0, total: 0, kg: 0 };
    rutinas[ses.rid].dias[ses.di].ex.forEach((k, i) => { if (!ses.vals[i]) { sum.total += lib[k].sets.length; return; } sum.total += lib[k].sets.length; ses.vals[i].forEach((v, j) => { if (ses.done[i] && ses.done[i][j]) { sum.series++; if (!esTiempo(k)) sum.kg += (v.kg || 0) * (v.reps || 0); } }); });
    if (modo !== 'ppu') { cargaHist[cargaHist.length - 1] += sum.kg; showSum(sum); if (!visHoy) { visHoy = true; } semSesion(); hoyEntreno = true; MOM = 'despues'; sesHecha = true; syncMomPick(); renderForma(); renderHoy(); renderAcc(); }
    stopRest(); renderRoutines(); renderToday(); renderAvance(); renderRecords(); renderProg();
    if (modo === 'ppu') renderPpuTrain(); else renderDesafios();
    go(modo === 'ppu' ? 'ppuTrain' : 'progreso'); toast(feelMsg || (modo !== 'ppu' && Object.keys(ses.prs).length ? '¡Récord! Compartilo en Logros' : 'Entrenamiento guardado')); feelMsg = null;
  }

//#bloque 080
  // ===== Animación del ejercicio: maniquí 3D =====
  const rad = a => a * Math.PI / 180;
  const mix = (a, b, p) => a + (b - a) * p;
  const L3 = 0.45;
  let curEx = null, playing = false, t0 = 0, frozenP = 0.35, rig = null, lastW = 0;

  function build3D(){
    const host = $('#fig3d');
    if (!window.THREE) { host.innerHTML = '<p class="small muted" style="padding:24px;text-align:center">No se pudo cargar el visor 3D en este dispositivo.</p>'; return; }
    const T = THREE, W = host.clientWidth || 320, H = host.clientHeight || 240;
    const renderer = new T.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H);
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = T.sRGBEncoding;
    host.appendChild(renderer.domElement); lastW = W;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(30, W / H, 0.1, 50);
    scene.add(new T.HemisphereLight(0xdfe7f5, 0x161b24, 0.85));
    const key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(2, 3, 2); scene.add(key);
    const rimL = new T.DirectionalLight(0x9fc2ff, 0.5); rimL.position.set(-2, 2, -2.5); scene.add(rimL);
    const floor = new T.Mesh(new T.CircleGeometry(1.25, 48), new T.MeshBasicMaterial({ color:0x1d2430 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const geo = new T.SphereGeometry(1, 28, 20);
    const skin = new T.MeshStandardMaterial({ color:0x8a93a3, roughness:0.55, metalness:0.05 });
    const musP = new T.MeshStandardMaterial({ color:0x7a1d57, emissive:0xff3fb4, emissiveIntensity:0.2, roughness:0.45 });
    const musS = new T.MeshStandardMaterial({ color:0x4d5f22, emissive:0x9cc43a, emissiveIntensity:0.1, roughness:0.5 });
    const steel = new T.MeshStandardMaterial({ color:0xd8dde6, metalness:0.7, roughness:0.3 });
    const dark = new T.MeshStandardMaterial({ color:0x262c36, roughness:0.7 });
    const muscles = [];
    const ell = (par, sx, sy, sz, x, y, z, m) => { const o = new T.Mesh(geo, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); par.add(o); return o; };
    const mus = (k, par, sx, sy, sz, x, y, z, rz) => { const o = ell(par, sx, sy, sz, x, y, z, skin); if (rz) o.rotation.z = rz; muscles.push({ k, o }); return o; };

    const root = new T.Group(); root.rotation.y = -0.75; scene.add(root);
    const pelvis = new T.Group(); root.add(pelvis);
    ell(pelvis, 0.17, 0.11, 0.12, 0, 0, 0, skin);
    [-1, 1].forEach(s => mus('gluteos', pelvis, 0.09, 0.09, 0.06, s * 0.08, -0.03, -0.085));
    const spine = new T.Group(); pelvis.add(spine);
    ell(spine, 0.15, 0.15, 0.10, 0, 0.15, 0, skin);
    ell(spine, 0.20, 0.22, 0.13, 0, 0.38, 0, skin);
    ell(spine, 0.05, 0.07, 0.05, 0, 0.61, 0, skin);
    ell(spine, 0.10, 0.12, 0.11, 0, 0.73, 0.02, skin);
    mus('abdomen', spine, 0.09, 0.14, 0.04, 0, 0.17, 0.075);
    [-1, 1].forEach(s => {
      mus('pecho', spine, 0.085, 0.07, 0.04, s * 0.09, 0.44, 0.105);
      mus('dorsales', spine, 0.075, 0.17, 0.04, s * 0.11, 0.33, -0.1, -s * 0.25);
    });
    mus('trapecio', spine, 0.13, 0.07, 0.04, 0, 0.53, -0.09);
    const arms = {}, legs = {}, hands = {};
    [-1, 1].forEach(s => {
      const sh = new T.Group(); sh.position.set(s * 0.25, 0.52, 0); spine.add(sh);
      mus('hombros', sh, 0.078, 0.078, 0.078, 0, 0, 0);
      ell(sh, 0.055, 0.16, 0.055, 0, -0.15, 0, skin);
      mus('biceps', sh, 0.04, 0.1, 0.035, 0, -0.16, 0.035);
      mus('triceps', sh, 0.04, 0.1, 0.035, 0, -0.15, -0.035);
      const el = new T.Group(); el.position.set(0, -0.31, 0); sh.add(el);
      mus('antebrazo', el, 0.047, 0.14, 0.047, 0, -0.14, 0);
      ell(el, 0.04, 0.05, 0.03, 0, -0.3, 0, skin);
      const hand = new T.Object3D(); hand.position.set(0, -0.3, 0); el.add(hand);
      arms[s] = { sh, el }; hands[s] = hand;
      const hip = new T.Group(); hip.position.set(s * 0.1, -0.05, 0); pelvis.add(hip);
      ell(hip, 0.085, 0.24, 0.09, 0, -0.22, 0, skin);
      mus('cuads', hip, 0.06, 0.18, 0.04, 0, -0.22, 0.06);
      mus('isquios', hip, 0.06, 0.18, 0.04, 0, -0.22, -0.06);
      const kn = new T.Group(); kn.position.set(0, -L3, 0); hip.add(kn);
      ell(kn, 0.062, 0.23, 0.066, 0, -0.22, 0, skin);
      ell(kn, 0.05, 0.035, 0.11, 0, -0.46, 0.06, skin);
      legs[s] = { hip, kn };
    });

    // Equipamiento
    const mkDb = () => { const g = new T.Group(); const h = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.18, 12), steel); g.add(h); [-0.075, 0.075].forEach(y => { const p = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.035, 20), dark); p.position.y = y; g.add(p); }); return g; };
    const dbs = { '-1': mkDb(), '1': mkDb() }; hands[-1].add(dbs['-1']); hands[1].add(dbs['1']);
    const goblet = mkDb(); goblet.scale.set(1.4, 1.4, 1.4); root.add(goblet);
    const barbell = new T.Group(); root.add(barbell);
    { const rod = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 1.5, 16), steel); rod.rotation.z = Math.PI / 2; barbell.add(rod);
      [-0.6, 0.6].forEach(x => { const pl = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.045, 36), dark); pl.rotation.z = Math.PI / 2; pl.position.x = x; barbell.add(pl); }); }
    const cable = new T.Group(); root.add(cable);
    const cbar = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 1.0, 16), steel); cbar.rotation.z = Math.PI / 2; cable.add(cbar);
    const cline = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 1, 8), steel); root.add(cline);
    const seat = new T.Mesh(new T.BoxGeometry(0.5, 0.08, 0.45), dark); seat.position.set(0, 0.46, -0.02); root.add(seat);
    const seatLeg = new T.Mesh(new T.BoxGeometry(0.08, 0.42, 0.08), dark); seatLeg.position.set(0, 0.21, -0.02); root.add(seatLeg);

    // Arrastrar para girar (vertical sigue haciendo scroll)
    let drag = null;
    host.addEventListener('pointerdown', e => { drag = e.clientX; });
    host.addEventListener('pointermove', e => { if (drag !== null) { root.rotation.y += (e.clientX - drag) * 0.012; drag = e.clientX; } });
    const end = () => { drag = null; };
    host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end); host.addEventListener('pointerleave', end);

    rig = { T, renderer, scene, cam, root, pelvis, spine, arms, legs, hands, muscles, skin, musP, musS, dbs, goblet, barbell, cable, cline, seat, seatLeg, host };
  }

  // Posturas (ángulos en grados). Ver convenciones: brazo y pierna cuelgan; x>0 lleva hacia atrás.
  function stand(a, k){ const A = rad(a), K = rad(a + k); return { y: 0.10 + L3 * (Math.cos(A) + Math.cos(K)), z: L3 * (Math.sin(A) + Math.sin(K)) }; }
  function setLegs(a, k){ [-1, 1].forEach(s => { rig.legs[s].hip.rotation.set(rad(a), 0, 0); rig.legs[s].kn.rotation.set(rad(k), 0, 0); }); }
  function setArmsX(x, e){ [-1, 1].forEach(s => { rig.arms[s].sh.rotation.set(rad(x), 0, 0); rig.arms[s].el.rotation.set(rad(e), 0, 0); }); }
  function setArmsZ(g, extraZ){ [-1, 1].forEach(s => { rig.arms[s].sh.rotation.set(0, 0, rad(s * g)); rig.arms[s].el.rotation.set(0, 0, rad(s * (extraZ != null ? extraZ : 180 - g))); }); }
  const poses = {
    squat(p){ const a = -95 * p, k = 130 * p, sp = 15 + 30 * p, f = stand(a, k);
      rig.pelvis.rotation.set(0, 0, 0); rig.pelvis.position.set(0, f.y, f.z); rig.spine.rotation.x = rad(sp);
      setLegs(a, k); setArmsX(-35 - sp, -120); return { eq:'goblet', target:0.7 }; },
    bridge(p){ rig.pelvis.rotation.set(rad(-90 - 28 * p), 0, 0); rig.pelvis.position.set(0, 0.12 + 0.26 * p, 0.15); rig.spine.rotation.x = 0;
      setLegs(mix(-45, 20, p), mix(108, 80, p)); [-1, 1].forEach(s => { rig.arms[s].sh.rotation.set(rad(28 * p), 0, rad(s * 8)); rig.arms[s].el.rotation.set(0, 0, 0); }); return { eq:null, target:0.3 }; },
    plank(p){ rig.pelvis.rotation.set(rad(78 + 1.5 * (p - 0.5)), 0, 0); rig.pelvis.position.set(0, 0.30, 0.12); rig.spine.rotation.x = 0;
      setLegs(0, 0); setArmsX(-78, -90); return { eq:null, target:0.3 }; },
    row(p){ const a = -20, k = 35, f = stand(a, k);
      rig.pelvis.rotation.set(0, 0, 0); rig.pelvis.position.set(0, f.y, f.z - 0.05); rig.spine.rotation.x = rad(55);
      setLegs(a, k); setArmsX(70 * p - 55, -60 * p); return { eq:'barbell', target:0.72 }; },
    pulldown(p){ rig.pelvis.rotation.set(0, 0, 0); rig.pelvis.position.set(0, 0.58, 0); rig.spine.rotation.x = rad(-8);
      setLegs(-90, 90); setArmsZ(mix(165, 45, p)); return { eq:'cable', target:0.95 }; },
    press(p){ const f = stand(0, 0); rig.pelvis.rotation.set(0, 0, 0); rig.pelvis.position.set(0, f.y, 0); rig.spine.rotation.x = 0;
      setLegs(0, 0); setArmsZ(mix(95, 165, p)); return { eq:'dbx', target:0.95 }; },
    curl(p){ const f = stand(0, 0); rig.pelvis.rotation.set(0, 0, 0); rig.pelvis.position.set(0, f.y, 0); rig.spine.rotation.x = rad(3);
      setLegs(0, 0); setArmsX(4, -140 * p); return { eq:'dbz', target:0.8 }; }
  };
  const tmpA = () => new rig.T.Vector3();
  function placeEquip(eq){
    const { root, hands, barbell, cable, cline, goblet, seat, seatLeg, dbs } = rig;
    barbell.visible = eq === 'barbell'; cable.visible = cline.visible = eq === 'cable'; goblet.visible = eq === 'goblet';
    seat.visible = seatLeg.visible = eq === 'cable';
    [-1, 1].forEach(s => { dbs[s].visible = eq === 'dbx' || eq === 'dbz'; dbs[s].rotation.set(eq === 'dbz' ? Math.PI / 2 : 0, 0, eq === 'dbx' ? Math.PI / 2 : 0); });
    if (eq === 'barbell' || eq === 'cable' || eq === 'goblet') {
      root.updateMatrixWorld(true);
      const a = hands[-1].getWorldPosition(tmpA()), b = hands[1].getWorldPosition(tmpA());
      const m = a.add(b).multiplyScalar(0.5); root.worldToLocal(m);
      const o = eq === 'barbell' ? barbell : eq === 'cable' ? cable : goblet;
      o.position.copy(m);
      if (eq === 'cable') { const top = 2.4, h = top - m.y; cline.position.set(m.x, m.y + h / 2, m.z); cline.scale.set(1, h, 1); }
    }
  }
  function paintMuscles(ex, p){
    rig.muscles.forEach(({ k, o }) => { o.material = ex.mus.includes(k) ? rig.musP : ex.sec.includes(k) ? rig.musS : rig.skin; });
    const plank = ex.anim === 'plank';
    rig.musP.emissiveIntensity = plank ? 0.45 + 0.7 * p : 0.18 + 1.1 * p;
    rig.musS.emissiveIntensity = plank ? 0.2 + 0.3 * p : 0.08 + 0.5 * p;
  }
  function draw3D(p){
    if (!rig || !curEx) return;
    const r = poses[curEx.anim](p);
    placeEquip(r.eq); paintMuscles(curEx, p);
    const tgt = r.target, lying = tgt < 0.5;
    rig.cam.position.set(lying ? 2.9 : 2.7, lying ? 1.5 : 1.45 + (tgt - 0.75), lying ? 2.6 : 2.5);
    rig.cam.lookAt(0, tgt, 0);
    rig.renderer.render(rig.scene, rig.cam);
  }
  function resize3D(){
    if (!rig) return; const W = rig.host.clientWidth, H = rig.host.clientHeight;
    if (W && H && W !== lastW) { rig.renderer.setSize(W, H); rig.cam.aspect = W / H; rig.cam.updateProjectionMatrix(); lastW = W; }
  }
  const PER = 2800;
  function setAnim(ex){
    curEx = ex;
    $$('#bodymap .m').forEach(m => { const k = m.dataset.m; m.setAttribute('class', 'm' + (ex.mus.includes(k) ? ' p' : ex.sec.includes(k) ? ' s' : '')); });
    $('#musTxt').textContent = ex.mus.map(k => musName[k]).join(' · ');
    $('#cue').textContent = playing ? ex.cues[0] : 'Arrastrá para girar · tocá Play';
    $('#repN').textContent = 'Rep ' + (playing ? 1 : 0);
    if (playing) t0 = performance.now();
    frozenP = 0.35; requestAnimationFrame(() => { resize3D(); draw3D(playing ? 0 : frozenP); });
  }
  function loop3D(now){
    if (rig && curEx && rig.host.offsetParent !== null) {
      resize3D();
      const t = (now - t0) / PER;
      const p = playing ? 0.5 - 0.5 * Math.cos(2 * Math.PI * (t % 1)) : frozenP;
      draw3D(p);
      if (playing) { $('#cue').textContent = curEx.cues[(t % 1) < 0.5 ? 0 : 1]; $('#repN').textContent = 'Rep ' + (Math.floor(t) + 1); }
    }
    requestAnimationFrame(loop3D);
  }
  $('#animPlay').addEventListener('click', () => {
    const now = performance.now();
    if (playing) { const t = (now - t0) / PER; frozenP = 0.5 - 0.5 * Math.cos(2 * Math.PI * (t % 1)); playing = false; $('#cue').textContent = 'Pausado · arrastrá para girar'; }
    else { t0 = now; playing = true; }
    $('#animPlay').querySelector('span').textContent = playing ? 'Pausa' : 'Play';
    $('#animPlay').querySelector('svg').innerHTML = playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M7 4.5v15l12-7.5z"/>';
  });
  // El 3D no se descarga al abrir la app: arranca como vista fija y se activa con un toque
  function enable3D(){
    if (rig) return;
    const off = $('#figOff');
    off.innerHTML = '<div class="spin" aria-hidden="true"></div><span class="small muted">Cargando 3D…</span>';
    const fail = () => { off.innerHTML = '<span class="small muted" style="line-height:1.45">No se pudo cargar el 3D. Revisá tu conexión y probá de nuevo.</span><button class="btn ghost sm" id="fig3dOn" style="width:auto;padding:0 20px">Reintentar</button>'; rig = null; };
    const build = () => { try { build3D(); if (!rig) return fail(); off.hidden = true; $('#cue').hidden = false; $('#repN').hidden = false; $('#animPlay').hidden = false; if (curEx) setAnim(curEx); } catch (e) { fail(); } };
    if (window.THREE) return build();
    const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; sc.onload = build; sc.onerror = fail; document.head.appendChild(sc);
  }
  $('#figOff').addEventListener('click', e => { if (e.target.closest('#fig3dOn')) enable3D(); });
  requestAnimationFrame(loop3D);


  renderRoutines(); renderToday();

  let restLeft = 0, restTimer;
  const fmt = s => Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
  function startRest(s){ restLeft = s; $('#rest').classList.add('live'); paintRest(); clearInterval(restTimer); restTimer = setInterval(() => { restLeft--; paintRest(); if (restLeft <= 0) { stopRest(); toast('Descanso terminado'); } }, 1000); }
  function stopRest(){ clearInterval(restTimer); $('#rest').classList.remove('live'); restLeft = 0; $('#restT').textContent = '1:30'; }
  function paintRest(){ $('#restT').textContent = fmt(Math.max(0, restLeft)); }
  $('#restMinus').addEventListener('click', () => { if (restLeft > 0) { restLeft = Math.max(0, restLeft - 15); paintRest(); } });
  $('#restPlus').addEventListener('click', () => { if (restLeft > 0) { restLeft += 15; paintRest(); } else startRest(15); });

  let secs = 32*60 + 14, clockTimer;
  function startClock(){ if (clockTimer) return; clockTimer = setInterval(() => { secs++; $('#clock').textContent = fmt(secs); }, 1000); }

//#bloque 150
  // ===== ¿Cómo te sentiste? =====
  const caras = ['M8 16.5q4-3 8 0','M8.5 16q3.5-1.5 7 0','M8.5 15.5h7','M8.5 14.5q3.5 1.8 7 0','M8 14q4 3.5 8 0'];
  const feelCol = ['#f6485d','#ff7a45','#f5a623','#8fd13a','#6fbf1f'], feelLbl = ['Muy mal','Mal','Normal','Bien','Genial'];
  $('#feelOpts').innerHTML = caras.map((m, i) => '<button type="button" data-feel="' + (i + 1) + '"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="' + feelCol[i] + '" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r=".9" fill="' + feelCol[i] + '"/><circle cx="15" cy="10" r=".9" fill="' + feelCol[i] + '"/><path d="' + m + '"/></svg>' + feelLbl[i] + '</button>').join('');
  let sesN = 0;
  function cerrarSesion(){
    const micro = sesN % 2 === 1; sesN++;
    $('#fsTitle').textContent = micro ? '¿Te sirvió la rutina de hoy?' : '¿Cómo te sentiste hoy?';
    $('#fsSub').textContent = micro ? 'Un toque. Nos ayuda a mejorar las rutinas.' : 'Un toque. Lo ve tu profe para acompañarte mejor.';
    $('#feelOpts').hidden = micro; $('#microOpts').hidden = !micro;
    $('#feelSheet').hidden = false;
  }
  $('#microOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-micro]'); if (!b) return;
    $('#feelSheet').hidden = true; ses.rutinaUtil = b.dataset.micro;
    feelMsg = b.dataset.micro === 'no' ? 'Gracias. Tu profe la va a revisar' : null;
    terminar();
  });
  $('#feelOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-feel]'); if (!b) return;
    const n = +b.dataset.feel; ses.feel = n; lastFeel = n; $('#feelSheet').hidden = true;
    feelMsg = n <= 2 ? 'Gracias. La próxima sesión va más liviana' : null;
    terminar();
  });
  $('#feelSkip').addEventListener('click', () => { $('#feelSheet').hidden = true; terminar(); });

//#bloque 170
  // ===== Clases (agenda de ejemplo; en producción sale de la agenda de EVO) =====
  const clasesBase = [ ['07:30','Funcional','Carla','Sarmiento',20,12], ['09:00','Yoga','Sofía','Sarmiento',16,9], ['12:30','Spinning','Diego','López y Planes',25,25], ['18:00','Funcional','Carla','Sarmiento',20,20], ['19:00','Spinning','Diego','Sarmiento',25,17], ['19:30','Localizada','Lucas','Corrientes',18,7], ['20:30','Boxeo recreativo','Martín','Santa Ana',14,10] ];
  let cDay = 1, cFil = 'mia';
  const reservas = new Set(['1-4']), espera = new Set();
  const clasesDe = n => clasesBase.map((c, i) => ({ id:n + '-' + i, h:c[0], n:c[1], prof:c[2], sede:c[3], cap:c[4], ocup:Math.max(0, Math.min(c[4], c[5] + ((n * 7 + i * 3) % 6) - 2)) }));
  const claseId = id => { const [n, i] = id.split('-').map(Number); return Object.assign({ dia:n }, clasesDe(n)[i]); };
  function renderClases(){
    $('#clsDays').innerHTML = [0,1,2,3,4].map(n => '<button class="opt" data-cday="' + n + '" aria-pressed="' + (n === cDay) + '" style="min-height:44px;font-size:13px">' + diaLbl(n) + '</button>').join('');
    const list = clasesDe(cDay).filter(c => cFil === 'todas' || c.sede === miSede);
    $('#clsList').innerHTML = list.length ? list.map(c => {
      const res = reservas.has(c.id), esp = espera.has(c.id), libres = c.cap - c.ocup, lleno = !res && libres <= 0;
      const est = res ? '<span class="small lvt low">Tenés tu lugar</span>' : lleno ? '<span class="small lvt full">' + (esp ? 'Estás en lista de espera' : 'Clase llena') + '</span>' : '<span class="small ' + (libres <= 3 ? 'lvt mid' : 'muted') + '">' + (libres === 1 ? 'Queda 1 lugar' : 'Quedan ' + libres + ' lugares') + '</span>';
      const acc = res ? ['cancel', 'Cancelar', ''] : lleno ? (esp ? ['salir', 'Salir', ''] : ['avisar', 'Avisarme', '']) : ['reservar', 'Reservar', 'go'];
      return '<div class="cls' + (res ? ' res' : '') + '"><span class="t">' + c.h + '</span><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + c.n + '</span><span class="small muted">' + c.prof + ' · ' + c.sede + '</span>' + est + '</span><button data-cls="' + c.id + '" data-acc="' + acc[0] + '" class="' + acc[2] + '">' + acc[1] + '</button></div>';
    }).join('') : '<p class="muted" style="text-align:center">No hay clases este día.</p>';
    const mis = [...reservas].map(claseId).sort((a, b) => a.dia - b.dia || a.h.localeCompare(b.h));
    $('#myRes').innerHTML = mis.length ? '<span class="lbl">Tus reservas</span>' + mis.map(c => '<div class="note lime"><span><strong>' + diaLbl(c.dia) + ' · ' + c.h + '</strong> · ' + c.n + ' en ' + c.sede + '</span></div>').join('') : '';
    const nx = mis[0], card = $('#nextCls'); card.hidden = true; // Viva no tiene clases
    if (false) card.innerHTML = '<div class="between"><span class="lbl">Tu próxima clase</span><button class="link lime" data-go="clases" style="padding:0;font-size:14px">Ver clases</button></div><span class="h2" style="font-size:26px">' + diaLbl(nx.dia) + ' · ' + nx.h + ' · ' + nx.n + '</span><span class="small muted">Prof. ' + nx.prof + ' · Sede ' + nx.sede + '</span>';
  }
  $('#clsDays').addEventListener('click', e => { const b = e.target.closest('[data-cday]'); if (b) { cDay = +b.dataset.cday; renderClases(); } });
  $('#clsFil').addEventListener('click', e => { const b = e.target.closest('[data-cfil]'); if (b) { cFil = b.dataset.cfil; renderClases(); } });
  $('#clsList').addEventListener('click', e => {
    const b = e.target.closest('[data-cls]'); if (!b) return;
    const id = b.dataset.cls, a = b.dataset.acc;
    if (a === 'cancel') { reservas.delete(id); toast('Cancelaste tu reserva'); }
    else if (a === 'avisar') { espera.add(id); toast('Te avisamos si se libera un lugar'); }
    else if (a === 'salir') { espera.delete(id); toast('Saliste de la lista de espera'); }
    else { reservas.add(id); toast('¡Reservado! Te recordamos 1 h antes'); }
    renderClases();
  });

//#bloque 200
  // ===== Asesor IA: mapa de recuperación, correcciones del profe y ajuste por sensación =====
  if ($('#recMap')) $('#recMap').innerHTML = $('#bodymap').innerHTML;
  const recState = { cuads:'mid', gluteos:'mid', isquios:'mid', abdomen:'ok', dorsales:'ok', trapecio:'ok', biceps:'ok', triceps:'ok', hombros:'ok', pecho:'ok', antebrazo:'ok' };
  $$('#recMap .m').forEach(m => m.setAttribute('class', 'm ' + (recState[m.dataset.m] || '')));
  const correcciones = [ { ex:'Sentadilla goblet', fecha:'Sáb', txt:'Bajá un poco más y mantené el pecho arriba. ¡La espalda está perfecta!', ok:true } ];
  function renderCorr(){
    $('#corrList').innerHTML = correcciones.map(c => '<div class="note' + (c.ok ? '' : ' lime') + '" style="align-items:flex-start"><span class="avatar" style="width:30px;height:30px;font-size:11px">LP</span><span class="stack" style="gap:2px"><span class="small" style="font-weight:700">' + c.ex + ' · ' + c.fecha + '</span><span class="small">' + (c.ok ? '"' + c.txt + '"' : 'Video enviado. Lucas te responde en 48 h.') + '</span></span></div>').join('');
  }
  $('#vidBtn').addEventListener('click', () => $('#vidFile').click());
  $('#vidFile').addEventListener('change', e => {
    if (!e.target.files || !e.target.files[0]) return;
    correcciones.unshift({ ex:lib[curKey()].n, fecha:'Hoy', ok:false }); e.target.value = ''; renderCorr();
    toast('Video enviado a Prof. Lucas');
  });

//#bloque 300
  // ===== v41 · Entrenar (claude/instruccion-prototipo-entrenar.md): Hoy, modo sala y cierre =====
  // Datos de la demo con la forma de EVO (ejercicios y cargas a validar por los profes de Viva)
  const ACT_B = [['Movilidad de hombros con banda', '10 por lado'], ['Escápulas en la pared', '12'], ['Bisagra de cadera', '10'], ['Plancha', '20 s']];
  const SALA_B = {
    act:{ min:8, items:ACT_B },
    fue:[
      { k:'remo', n:'Remo sentado', maq:'remo', zona:'Zona espalda · al fondo, a la izquierda', sr:3, rep:12, kg:42.5, prev:40, t:270, ctl:'Bajá en 2 o 3 segundos sin soltar el peso', tempo:[3,1,1,0], mirar:['Espalda derecha: no vayas para atrás', 'Llevá los codos pegados hasta el final'], alt:[{ n:'Remo con apoyo de pecho', zona:'Zona espalda · al fondo, a la derecha', kg:35, maq:'remo' }, { n:'Remo en polea baja', zona:'Zona poleas · junto a la columna', kg:40, maq:'polea' }] },
      { k:'jalon', n:'Jalón al pecho', maq:'jalon', zona:'Zona espalda · al fondo, al centro', sr:3, rep:12, kg:45, prev:45, t:270, ctl:'Llevá la barra al pecho sin balancearte', tempo:[3,0,1,0], mirar:['Pecho arriba: la barra va a la clavícula', 'Subí controlando, que no te tire'], alt:[{ n:'Jalón con agarre neutro', zona:'Zona espalda · al fondo, al centro', kg:42.5, maq:'jalon' }, { n:'Dominadas asistidas', zona:'Zona espalda · contra la pared', kg:null, maq:'jalon' }], hombro:{ n:'Remo con apoyo de pecho', zona:'Zona espalda · al fondo, a la derecha', kg:35, maq:'remo' } },
      { k:'curl', n:'Curl de bíceps en máquina', maq:'curl', zona:'Zona brazos · junto a los espejos', sr:3, rep:12, kg:20, prev:20, t:240, ctl:'Despacio, sin despegar los codos del apoyo', tempo:[3,0,1,1], mirar:['Los codos quietos en el apoyo', 'Bajá hasta estirar casi del todo'], alt:[{ n:'Curl con mancuernas', zona:'Zona peso libre', kg:10, maq:'curl' }, { n:'Curl en polea', zona:'Zona poleas · junto a la columna', kg:15, maq:'polea' }] }
    ],
    car:{ maq:'Cinta', min:12, txt:'caminata en subida', zona:'Zona cardio · frente a las ventanas' }
  };
  const ALT_G = { sentadilla:['Prensa de piernas', 'Sentadilla en máquina Smith'], puente:['Hip thrust en máquina', 'Puente a una pierna'], plancha:['Plancha con rodillas apoyadas', 'Dead bug en colchoneta'], press:['Press de hombros en máquina', 'Press con mancuernas sentado'] };
  var SALA = null, CORTO = false, CUIDA = null;
  // v42 · cuidar completo y estados de la demo (instrucción de Entrenar, secciones 7 y 11)
  // MOLESTIA: la molestia guardada con consentimiento (dato de salud). CUIDA: lo que se cuida HOY. CHK: la respuesta de hoy.
  var MOLESTIA = null, PEOR = false, CHK = null, RESOLVER = false, AVISO_PROFE = false;
  var ETAPA = 'normal', EXP = 'arranco', SALA_LLENA = false, SIN_SENAL = false, NOENT = false, LIM = {}, CIERRE_K = [];
  var esMenor = () => ETAPA === 'menor';
  var zonaTxt = z => z === 'Otra' ? 'lo que nos contaste' : 'tu ' + String(z).toLowerCase();
  // La carga sugerida no sube: primeras 4 semanas (Arranco), al volver de una pausa, con molestia y en menores (va la del profe)
  var noSube = () => EXP === 'arranco' || ETAPA === 'vuelvo' || ETAPA === 'menor' || !!CUIDA || !!MOLESTIA;
  function chkReset(){
    prep.done = false; prep.skip = false; prep.resp = {}; prep.score = null;
    CHK = null; PEOR = false; RESOLVER = false; AVISO_PROFE = false;
    CUIDA = MOLESTIA && !esMenor() ? MOLESTIA.zona : null; // con una molestia guardada, por defecto se cuida
  }
  function chkHtml(enSala){
    const zq = MOLESTIA && !esMenor();
    const q = zq ? '¿Cómo está ' + zonaTxt(MOLESTIA.zona) + ' hoy?' : '¿Cómo venís hoy?';
    const op = zq ? [['bien', 'Bien'], ['igual', 'Igual'], ['peor', 'Peor']] : [['todo', 'Con todo'], ['normal', 'Normal'], ['sinen', 'Sin energía'], ['cuidar', 'Con algo para cuidar']];
    const h = '<div class="between"><span class="schq">' + q + '</span><button class="link" data-ck="skip" style="min-height:36px;padding:0;font-size:13px">Saltear</button></div>' +
      '<div class="opts ' + (zq ? 'g3' : 'g2') + ' chkopts">' + op.map(o => '<button class="opt" data-ck="' + o[0] + '">' + o[1] + '</button>').join('') + '</div>';
    return enSala ? '<div class="schk">' + h + '</div>' : h;
  }
  function chkFuHtml(){
    if (RESOLVER) return '<div class="schk chkfu"><span class="schq">¿Lo damos por resuelto?</span><span class="small muted">Dos veces seguidas nos dijiste que está bien.</span><div class="grid2" style="gap:8px"><button class="btn sm" data-fu="res">Sí</button><button class="btn ghost sm" data-fu="nores">Todavía no</button></div></div>';
    if (AVISO_PROFE) return '<div class="schk chkfu"><span class="schq">¿Le avisamos a tu profe?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-fu="avisa">Avisale a Lucas</button><button class="btn ghost sm" data-fu="noavisa">No, gracias</button></div></div>';
    return '';
  }
  function salaRehacer(){ if (!SALA) return; const k = SALA, N = salaNew(); N.step = k.step; N.actDone = k.actDone; N.saludo = k.saludo; N.t0 = k.t0; N.chk = false; SALA = N; }
  function chkFin(v){
    const x = { todo:20, normal:13, sinen:5, bien:17, igual:13, peor:8, cuidar:13, profe:13, menor:13 }[v];
    if (v === 'skip') { prep.skip = true; CHK = 'skip'; }
    else { prep.resp = { pSueno:x, pDolor:x, pEnergia:x }; prep.skip = false; CHK = v; }
    if (SALA) { SALA.chk = false; salaRehacer(); }
    calcPrep(); renderEntHoy(); if (SALA && curScr === 'sala') renderSala();
  }
  function chkAnswer(v){
    if (v === 'cuidar') {
      if (esMenor()) { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Contale a tu profe</span><span class="muted" style="line-height:1.45">Lucas te arma la sesión para cuidarte. No guardamos nada de esto.</span><button class="btn" data-mz="avisa">Avisale a Lucas</button><button class="btn ghost" data-mz="no">Ahora no</button>'; $('#salaSheet').hidden = false; return; }
      $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">¿Qué querés cuidar hoy?</span><span class="muted" style="line-height:1.45">Hoy armamos la sesión sin cargar esa zona. Es solo por hoy, salvo que nos pidas recordarlo.</span><div class="opts g2" id="sZona">' + ['Hombro', 'Codo', 'Muñeca', 'Espalda', 'Cadera', 'Rodilla', 'Tobillo', 'Otra'].map(z => '<button class="opt" data-z="' + z + '">' + z + '</button>').join('') + '</div><button class="link lime" data-z="profe" style="min-height:44px">Prefiero hablarlo con mi profe</button>'; $('#salaSheet').hidden = false; return;
    }
    if (v === 'bien') { MOLESTIA.bien = (MOLESTIA.bien || 0) + 1; CUIDA = null; PEOR = false; RESOLVER = MOLESTIA.bien >= 2; }
    if (v === 'igual') { MOLESTIA.bien = 0; CUIDA = MOLESTIA.zona; PEOR = false; }
    if (v === 'peor') { MOLESTIA.bien = 0; CUIDA = MOLESTIA.zona; PEOR = true; AVISO_PROFE = true; }
    chkFin(v);
    if (v === 'sinen' && !CORTO) toast('¿Pocas pilas? En Hoy tenés la versión de 30 min');
    if (v === 'peor') toast('Hoy evitamos lo que carga ' + zonaTxt(CUIDA));
  }
  function chkClick(e){
    const ck = e.target.closest('[data-ck]'); if (ck) { chkAnswer(ck.dataset.ck); return true; }
    const fu = e.target.closest('[data-fu]'); if (!fu) return false;
    const v = fu.dataset.fu, zt = MOLESTIA ? zonaTxt(MOLESTIA.zona) : '';
    if (v === 'res') { MOLESTIA = null; CUIDA = null; RESOLVER = false; toast('Resuelto. Borramos el dato y no te preguntamos más'); }
    if (v === 'nores') { RESOLVER = false; toast('Dale, te seguimos preguntando'); }
    if (v === 'avisa') { AVISO_PROFE = false; toast('Listo. Lucas sabe que hoy ' + zt + ' está peor'); }
    if (v === 'noavisa') { AVISO_PROFE = false; }
    if (SALA) salaRehacer();
    renderHoy(); renderEntHoy(); if (SALA && curScr === 'sala') renderSala();
    return true;
  }
  const fmtKg = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  function salaPlan(){
    const r = rutinas[actual], d = r.dias[r.next];
    let P = actual === 'profe' && d.k === 'B' ? JSON.parse(JSON.stringify(SALA_B)) : {
      act:{ min:8, items:ACT_B },
      fue:d.ex.map(k => { const st = lib[k].sets[0], kg = parseFloat(String(st[1]).replace(',', '.')); return { k:k, n:lib[k].n, maq:'generic', zona:'Zona musculación', sr:lib[k].sets.length, rep:parseInt(String(st[2]), 10) || 12, kg:isNaN(kg) ? null : kg, prev:null, seg:esTiempo(k), alt:(ALT_G[k] || []).map(n => ({ n:n, zona:'Zona musculación', kg:null, maq:'generic' })) }; }),
      car:{ maq:'Cinta', min:12, txt:'caminata en subida', zona:'Zona cardio · frente a las ventanas' } };
    if (CORTO) { P.act = { min:5, items:P.act.items.slice(0, 2) }; P.fue = P.fue.slice(0, 2); P.car.min = 8; }
    if (CUIDA === 'Hombro' && PEOR) { P.fue = P.fue.filter(f => f.k !== 'remo' && f.k !== 'jalon'); P.car.min += 8; }
    else if (CUIDA === 'Hombro') P.fue = P.fue.map(f => f.hombro ? Object.assign({}, f.hombro, { k:f.k + 'H', sr:f.sr, rep:f.rep, prev:null, alt:[], cambiado:f.n }) : Object.assign(f, { kg:f.prev || f.kg }));
    // Regla de la carga sugerida (seguridad física): sube un escalón solo si la última vez completó todo y no fue "Al límite"
    const ns = noSube();
    P.fue.forEach(f => {
      if (!f.prev || f.kg === null) return;
      if (ETAPA === 'vuelvo') { f.kg = Math.max(2.5, Math.round(f.prev * 0.8 / 2.5) * 2.5); f.vuelvo = true; return; }
      if (f.kg > f.prev && (ns || (LIM[f.k] || 0) >= 2)) { if (!ns) f.lim = true; f.kg = f.prev; }
    });
    P.fue.forEach(f => { const a = RUT_AJ && RUT_AJ[f.k]; if (!a) return; if (a.kg != null && f.kg != null) { f.kg = a.kg; f.aj = true; f.lim = false; } if (a.desc) f.desc = a.desc; });
    return P;
  }
  const planMin = P => P.act.min + P.fue.length * 8 + P.car.min;
  function salaProg(){ if (!SALA) return [0, 0, 0]; const n = SALA.F.length; return [SALA.actDone ? 1 : 0, n ? SALA.F.filter(f => f.done).length / n : 0, SALA.carDone ? 1 : 0]; }
  // ---- Hoy ----
  let hOpen = -1;
  var HB = { ses:false, cue:null, para:true, rep:false }, HR = -1; // v57 · bloques plegables de Hoy (cue null = abierto si falta responder)
  function renderEntHoy(){
    const r = rutinas[actual], d = r.dias[r.next], P = salaPlan(), tot = planMin(P);
    $('#hLetter').textContent = d.k; $('#hName').textContent = d.n;
    $('#hMeta').textContent = (r.tipo === 'profe' ? 'Prof. Lucas' : 'Generada con IA') + ' · ' + tot + ' min' + (CORTO ? ' · versión corta' : '');
    $('#hTit').innerHTML = '<span class="sig">' + firma(MOM === 'sesion' ? 'Tu sesión' : 'Tu rutina') + '</span>';
    const prog = MOM === 'sesion' ? salaProg() : [0, 0, 0];
    const parts = [['Activación', P.act.min, P.act.min + "'", P.act.items.map(x => '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>').join('')],
      ['Fuerza', P.fue.length * 8, P.fue.length + ' ejercicios', P.fue.map(f => '<li><b>' + f.n + '</b><span>' + f.sr + ' × ' + f.rep + (f.kg ? ' · ' + fmtKg(f.kg) + ' kg' : '') + '</span><em>' + f.zona + '</em></li>').join('')],
      ['Cardio', P.car.min, P.car.min + "'", '<li><b>' + P.car.maq + ' · ' + P.car.min + ' min</b><span>' + P.car.txt + '</span><em>' + P.car.zona + '</em></li>']];
    $('#hParts').innerHTML = '<div class="tdplan">' + parts.map((x, i) => '<button class="tdp hpb' + (hOpen === i ? ' open' : '') + '" data-hp="' + i + '" style="flex:' + x[1] + '" aria-expanded="' + (hOpen === i) + '"><span class="bar tdb"><i style="width:' + Math.round(prog[i] * 100) + '%"></i></span><span class="tdl"><b>' + x[0] + '</b> ' + x[2] + '</span></button>').join('') + '</div>' +
      (hOpen >= 0 ? '<ul class="hlist">' + parts[hOpen][3] + '</ul>' : '');
    $('#hParts').style.setProperty('--pc', 'var(--lime)');
    $('#hProfe').innerHTML = d.k === 'B' && actual === 'profe' ? '<b>Lucas:</b> en el remo, bajá un punto el asiento.' : '';
    $('#hProfe').hidden = !$('#hProfe').innerHTML;
    $('#hCuida').hidden = !CUIDA; if (CUIDA) $('#hCuida').textContent = CUIDA === 'Hombro' && PEOR ? 'Hoy tu hombro descansa: sacamos el remo y el jalón y sumamos 8 minutos de cardio.' : CUIDA === 'Hombro' ? 'Hoy cuidamos tu hombro: cambiamos el jalón por remo con apoyo de pecho y la carga no sube.' : CUIDA === 'Otra' ? 'Hoy cuidamos lo que nos contaste: si algo molesta, pará y avisale a tu profe.' : 'Hoy cuidamos ' + zonaTxt(CUIDA) + ': evitamos los ejercicios que la cargan.';
    const nota = ETAPA === 'vuelvo' ? '<p class="sv">' + SV_BOLT + '<span>Volviste ⚡ Arrancamos al 80% de lo que hacías.</span></p>' : NOENT && MOM !== 'sesion' ? '<span class="small muted">Todavía no vimos tu entrada. Podés empezar igual: la visita se suma cuando llegue.</span>' : '';
    const fat = fatigaTxt(), nota2 = (fat ? '<p class="sv">' + SV_BOLT + '<span>' + fat + '</span></p>' : '') + nota; $('#hNota').innerHTML = nota2; $('#hNota').hidden = !nota2; descansoHrec();
    obHoy();
    $('#hCorto').innerHTML = CORTO ? 'Volver a la versión completa' : '¿Poco tiempo? <b>Hacé la versión de 30 min</b>'; $('#hCorto').hidden = MOM === 'sesion';
    const b = $('#hEmpezar'), ses = MOM === 'sesion';
    b.parentElement.hidden = !!pausa;
    b.className = 'accbtn' + (ses ? ' on' : ' go');
    b.innerHTML = (ses ? ICO_SES : ICO_PLAY).replace('<svg ', '<svg width="20" height="20" ') + '<span>' + (ses ? 'Volver a tu sesión' : 'Comenzar rutina · Día ' + d.k) + '</span>';
    hbRender(P, d, tot);
  }
  // v57 · Hoy = preparación (entrenar-propuesta § 11.7): sesión · tu cuerpo hoy · para hoy (solo si hay algo) · repasar
  function hbRender(P, d, tot){
    if (!HB) return;
    const ses = MOM === 'sesion', hr = $('#hoyRow'), falta = hr.hidden && !$('#prepAsk').hidden;
    $('#hbsesS').textContent = 'Día ' + d.k + ' · ~' + tot + ' min';
    const hd = hr.querySelector('.hdot'), cs = { todo:'Con todo', normal:'Normal', sinen:'Sin energía', cuidar:'Cuidando', bien:'Bien', igual:'Cuidando', peor:'Descansa', profe:'Con tu profe', menor:'Con tu profe', skip:'Normal' }[CHK] || '';
    $('#hbcueS').innerHTML = falta ? 'Sin responder' : hr.hidden || !cs ? '' : (hd ? hd.outerHTML : '') + cs;
    const vacio = $('#hCuida').hidden && $('#hNota').hidden; $('#hbPara').hidden = vacio;
    $('#hbrepS').textContent = P.fue.length + ' ejercicios';
    $('#hRep').innerHTML = P.fue.map((f, i) => { const L = lib[f.k] || lib[String(f.k).replace(/H$/, '')], op = HR === i;
      return '<div class="hrep"><button class="hrb" data-hr="' + i + '" aria-expanded="' + op + '"><span>' + f.n + '</span><small>' + f.sr + ' × ' + f.rep + (f.kg ? ' · ' + fmtKg(f.kg) + ' kg' : '') + '</small></button>' +
        (op ? '<div class="hrd">' + (L && L.tip ? L.tip : 'Tu profe te lo muestra en la sala.') + '</div>' : '') + '</div>'; }).join('');
    const op = { ses:HB.ses, cue:HB.cue === null ? falta : HB.cue, para:HB.para, rep:HB.rep };
    Object.keys(op).forEach(k => { const el = $('[data-hbk="' + k + '"]'); el.classList.toggle('open', !!op[k]); el.querySelector('.hbh').setAttribute('aria-expanded', !!op[k]); });
    $('#hEmpezar').classList.toggle('big', !ses && !falta && vacio);
  }
  $('#hParts').addEventListener('click', e => { const b = e.target.closest('[data-hp]'); if (!b) return; const i = +b.dataset.hp; hOpen = hOpen === i ? -1 : i; renderEntHoy(); });
  $('#hCorto').addEventListener('click', () => { CORTO = !CORTO; renderEntHoy(); renderToday(); toast(CORTO ? 'Versión de 30 minutos: las tres partes, más cortas' : 'Volviste a la versión completa'); });
  $('section#hoy').addEventListener('click', e => { const h = e.target.closest('[data-hb]'); if (h) { HB[h.dataset.hb] = !h.parentElement.classList.contains('open'); renderEntHoy(); return; } const r = e.target.closest('[data-hr]'); if (r) { HR = HR === +r.dataset.hr ? -1 : +r.dataset.hr; renderEntHoy(); } });
  $('#hEmpezar').addEventListener('click', () => { if (MOM === 'sesion') { if (!SALA) salaDemo(); renderSala(); go('sala'); } else salaStart(); });
  // ---- Modo sala ----
  function salaNew(){ const P = salaPlan(); return { P:P, step:0, actDone:false, F:P.fue.map(f => ({ sets:Array(f.sr).fill(false), done:false, salteado:false, kg:f.kg, reps:Array(f.sr).fill(f.rep), swap:null })), carDone:false, carMin:P.car.min, t0:+ahora(), saludo:true, chk:false, rest:0, crono:0, el:0, vence:false, repreg:false, pausa:false, mtStep:null, hito:'' }; }
  function salaStart(){
    if (MOM !== 'sala' && MOM !== 'sesion' && !NOENT) setMom('sala', true);
    SALA = salaNew(); SALA.chk = false; // v57 · la pregunta del día vive solo en Hoy (§ 11.7)
    MOM = 'sesion'; syncMomPick();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { if (SALA) SALA.lock = l; }).catch(() => {}); } catch (_) {}
    renderForma(); renderHoy(); renderToday(); renderAcc(); renderEntHoy();
    renderSala(); go('sala');
    hablar(mtSaludo(), 'inicio');
  }
  // Estado "sesión abierta" de la demo: activación y el primer ejercicio hechos
  function salaDemo(){ SALA = salaNew(); SALA.actDone = true; SALA.F[0].done = true; SALA.F[0].sets = SALA.F[0].sets.map(() => true); SALA.step = 2; SALA.saludo = false; }
  const steps = () => ['act'].concat(SALA.F.map((_, i) => 'f' + i), ['car']);
  const curF = () => { const st = steps()[SALA.step]; return st[0] === 'f' ? +st.slice(1) : -1; };
  const fx = i => { const f = SALA.P.fue[i], F = SALA.F[i]; return F.swap ? Object.assign({}, f, F.swap, { prev:null }) : f; };
  // Ilustración de línea de la máquina (en producción: la foto de la máquina Harmony de la sede)
  function maqSvg(kind){
    const st = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
    const M = {
      remo:'<path d="M30 120h150M50 120V70h40M90 70v50M120 120V40M120 40h40v80M40 60h50M150 55l-45 20"/><circle cx="105" cy="75" r="6"/>',
      jalon:'<path d="M40 125h140M110 125V20M110 20H70M70 20v10M50 32h50M60 100h50M60 100v25M70 85h30"/><circle cx="110" cy="60" r="7"/>',
      curl:'<path d="M40 125h140M70 125V80h50v45M60 70h70l15-25M120 80l20-15M140 40l15 10"/><circle cx="148" cy="44" r="6"/>',
      polea:'<path d="M50 125h120M150 125V20M150 30l-50 70M60 110h40M100 100l-15 10"/><circle cx="150" cy="30" r="7"/>',
      cinta:'<path d="M25 115l130-18M30 125l135-18M155 97V40l15-6M150 45h30M40 112l-5 12M150 98l5 12"/>',
      generic:'<path d="M40 125h140M60 125V60h100v65M60 80h100M110 60V30"/><circle cx="110" cy="30" r="6"/>'
    };
    return '<svg class="maqsvg" viewBox="0 0 210 140" aria-hidden="true"><g ' + st + '>' + (M[kind] || M.generic) + '</g></svg>';
  }
  function renderSala(){
    if (!SALA) return;
    const S = SALA, st = steps()[S.step], P = S.P, prog = salaProg();
    $('#salaProg').innerHTML = ['Activación', 'Fuerza', 'Cardio'].map((n, i) => '<span class="sp' + (prog[i] >= 1 ? ' full' : '') + '"><i style="width:' + Math.round(prog[i] * 100) + '%"></i></span>').join('');
    const fi = curF();
    $('#salaPos').textContent = st === 'act' ? 'Activación' : st === 'car' ? 'Cardio' : 'Fuerza · ' + (fi + 1) + ' de ' + S.F.length; mtPos(st);
    const voz = t => '<p class="sv"><span>' + t + '</span></p>';
    let h = '';
    if (SIN_SENAL) h += '<p class="snosig"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M3 3l18 18"/></svg>Sin señal: guardamos todo y lo subimos después.</p>';
    const dk = rutinas[actual].dias[rutinas[actual].next].k;
    if (S.saludo && st === 'act' && !S.vence) h += voz(mtSaludo());
    if (S.chk && st === 'act') h += chkHtml(true);
    else if (st === 'act') h += chkFuHtml();
    if (st === 'act') {
      h += '<h2 class="sname">Activación · ' + P.act.min + "'</h2><ul class=\"sact\">" + P.act.items.map(x => '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>').join('') + '</ul>';
    } else if (st === 'car') {
      const C = P.car, m = Math.floor(S.crono / 60), sg = S.crono % 60;
      h += '<div class="smaq">' + maqSvg('cinta') + '<span class="sfoto">Foto de la sede</span></div><span class="szona">' + C.zona + '</span>' +
        '<h2 class="sname">' + C.maq + ' · ' + C.txt + '</h2><div class="sload"><b>' + S.carMin + '</b> min</div>' +
        '<p class="shint">Intensidad: podés hablar, pero no cantar.</p>' +
        '<div class="srow"><button class="btn ghost sm" id="sCrono">' + (S.cronoOn ? 'Pausar' : 'Arrancar') + ' cronómetro · ' + m + ':' + String(sg).padStart(2, '0') + '</button><button class="link lime" id="sAjCar">Ajustar</button></div>';
    } else {
      const f = fx(fi), F = S.F[fi];
      const llena = SALA_LLENA && fi === 0 && !S.llenaOk && S.P.fue.length > 1 && S.P.fue.some(x => x.k === 'curl') && S.P.fue[0].k !== 'curl';
      if (llena) h += '<div class="schk sllena"><span class="schq">La zona de espalda está a full</span><span class="small muted">' + f.n + ' está ocupada. ¿Empezamos por bíceps?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-ll="dale">Dale</button><button class="btn ghost sm" data-ll="no">No, sigo así</button></div><button class="link lime" data-ll="otra" style="min-height:40px;padding:0;font-size:14px;align-self:flex-start">Ver otras de tu sede</button></div>';
      else h += '<div class="smaq">' + maqSvg(f.maq) + '<span class="sfoto">Foto de la sede</span></div>';
      h += '<span class="szona">' + f.zona + '</span>' +
        '<h2 class="sname">' + f.n + '</h2>' +
        (ETAPA === '60' ? '<div class="sload s60"><b>' + f.sr + ' × ' + F.reps[0] + (f.seg ? ' s' : '') + '</b>' + (F.kg ? '<span>' + fmtKg(F.kg) + ' kg</span>' : '') + '</div>'
          : '<div class="sload">' + f.sr + ' × ' + F.reps[0] + (f.seg ? ' s' : '') + (F.kg ? ' · <b>' + fmtKg(F.kg) + '</b> kg' : '') + '</div>');
      if (f.prev && f.kg > f.prev && F.kg === f.kg && !f.aj && !F.swap) h += voz('La vez pasada: ' + fmtKg(f.prev) + ' kg, todas las series completas. Regla de Lucas: hoy ' + fmtKg(F.kg) + ' kg.');
      else if (f.lim && !F.swap) h += voz('La vez pasada fue al límite. Regla de Lucas: hoy repetís ' + fmtKg(F.kg) + ' kg.');
      else if (f.vuelvo && !F.swap) h += '<p class="shint">Al 80% de la vez pasada (' + fmtKg(f.prev) + ' kg).</p>';
      if (f.cambiado) h += '<p class="shint">Hoy en lugar de ' + f.cambiado.toLowerCase() + ', para cuidar tu hombro.</p>';
      h += exCue(f, fi);
      if (S.rest > 0) {
        h += '<div class="srest" role="timer"><span class="srt">' + Math.floor(S.rest / 60) + ':' + String(S.rest % 60).padStart(2, '0') + '</span><span class="small muted">' + (F.sets.indexOf(false) >= 0 ? 'Siguiente: serie ' + (F.sets.indexOf(false) + 1) + ' de ' + f.sr : 'Siguiente: ' + (fi + 1 < S.F.length ? fx(fi + 1).n : 'el cardio')) + '</span><button class="link lime" id="sSkipRest">Saltear descanso</button></div>';
      } else {
        h += '<div class="sdots"><span class="small muted">Series</span>' + F.sets.map((x, j) => '<button class="sdot' + (x ? ' on' : '') + '" data-set="' + j + '" aria-label="Serie ' + (j + 1) + (x ? ', hecha' : '') + '">' + (j + 1) + '</button>').join('') + '<button class="link lime" id="sCambiar">Cambiar</button></div>';
      }
      h += exAcc(f, fi);
    }
    if (enPrep(st)) h = prepHtml(st);
    h = mtHtml(st) + h;
    $('#salaBody').innerHTML = h; exMount();
    $('#salaListo').textContent = enPrep(st) ? (st === 'car' ? 'Empezar cardio' : 'Empezar ejercicio') : st === 'car' ? 'Listo · terminar' : 'Listo';
    mtFoot();
  }
  function salaListo(){
    if (enPrep(steps()[SALA.step])) return prepEmpezar();
    const S = SALA, st = steps()[S.step]; S.saludo = false; S.chk = false; S.rest = 0;
    WK.reg = true;
    if (st === 'act') { S.actDone = true; WK.act++; }
    else if (st === 'car') { S.carDone = true; WK.car += S.carMin; S.cronoOn = false; renderForma(); return salaCerrar(); }
    else { const F = S.F[curF()]; F.sets = F.sets.map(() => true); F.done = true; if (S.F.every(x => x.done || x.salteado) && !S.fueSumada) { S.fueSumada = true; WK.fue++; } }
    S.step = Math.min(steps().length - 1, S.step + 1);
    renderForma(); renderToday(); renderSala(); $('#salaBody').scrollTop = 0;
  }
  $('#salaListo').addEventListener('click', salaListo);
  let restT = null, cronoT = null;
  $('#salaBody').addEventListener('click', e => {
    const S = SALA; if (!S) return;
    if (chkClick(e)) return;
    if (exClick(e)) return;
    const ll = e.target.closest('[data-ll]');
    if (ll) { const v = ll.dataset.ll; S.llenaOk = true;
      if (v === 'dale') { const i = S.P.fue.findIndex(x => x.k === 'curl'); const pf = S.P.fue.splice(i, 1)[0], pF = S.F.splice(i, 1)[0]; S.P.fue.unshift(pf); S.F.unshift(pF); toast('Arrancamos por bíceps. Espalda, cuando se libere'); }
      if (v === 'otra') { renderSala(); return salaCambiarOcupada(); }
      renderSala(); return; }
    const sd = e.target.closest('[data-set]');
    if (sd) { const F = S.F[curF()], j = +sd.dataset.set; F.sets[j] = !F.sets[j]; if (F.sets[j] && F.sets.indexOf(false) >= 0) { S.rest = fx(curF()).desc || 90; clearInterval(restT); restT = setInterval(() => { if (!SALA || SALA.rest <= 0) { clearInterval(restT); return; } if (SALA.pausa) return; SALA.rest = Math.max(0, SALA.rest - mtVel()); if (SALA.rest <= 0) vozFinDescanso(); if (curScr === 'sala') renderSala(); if (BLOQ) lockRen(); }, 1000); } renderSala(); return; }
    if (e.target.closest('#sSkipRest')) { S.rest = 0; clearInterval(restT); renderSala(); return; }
    if (e.target.closest('#sAjustar')) return salaAjustar();
    if (e.target.closest('#sAjCar')) { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Minutos de cardio</span><div class="sadj"><button class="opt" data-cm="-5">−5</button><b id="sCarMin">' + S.carMin + ' min</b><button class="opt" data-cm="5">+5</button></div><button class="btn" data-close>Listo</button>'; $('#salaSheet').hidden = false; return; }
    if (e.target.closest('#sCrono')) { S.cronoOn = !S.cronoOn; clearInterval(cronoT); if (S.cronoOn) cronoT = setInterval(() => { if (!SALA || !SALA.cronoOn) { clearInterval(cronoT); return; } if (SALA.pausa) return; SALA.crono += mtVel(); if (curScr === 'sala') renderSala(); if (BLOQ) lockRen(); }, 1000); renderSala(); return; }
    if (e.target.closest('#sCambiar')) return salaCambiar();
  });
  // Deslizar a la derecha vuelve al ejercicio anterior
  let tx = null;
  $('#salaBody').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive:true });
  $('#salaBody').addEventListener('touchend', e => { if (tx === null || !SALA) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (dx > 70 && SALA.step > 0) { SALA.step--; SALA.rest = 0; renderSala(); } else if (dx < -70 && SALA.step < steps().length - 1) { SALA.step++; SALA.rest = 0; renderSala(); } });
  function salaAjustar(){
    const F = SALA.F[curF()], f = fx(curF());
    $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">' + f.n + '</span><span class="small muted">Corregí solo lo que cambió. Sin teclado.</span>' +
      F.reps.map((r, j) => '<div class="sadjrow"><span class="small muted">Serie ' + (j + 1) + '</span>' + (F.kg ? '<span class="sadj"><button class="opt" data-ak="-2.5">−</button><b>' + fmtKg(F.kg) + ' kg</b><button class="opt" data-ak="2.5">+</button></span>' : '') + '<span class="sadj"><button class="opt" data-ar="' + j + ':-1">−</button><b>' + r + ' rep</b><button class="opt" data-ar="' + j + ':1">+</button></span></div>').join('') +
      '<button class="btn" data-close>Listo</button>';
    $('#salaSheet').hidden = false;
  }
  function salaCambiarOcupada(){
    const base = SALA.P.fue[curF()];
    $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Otras de tu sede</span><span class="small muted">' + (actual === 'profe' ? 'Las eligió Lucas para tu rutina. ' : 'Trabajan lo mismo. ') + 'Es solo por hoy y el registro sigue.</span>' + (actual === 'profe' && base.alt.length ? '<button class="link lime" data-siempre="1" style="min-height:44px;align-self:flex-start;padding:0">¿Siempre está ocupada? Pedile a Lucas que la cambie</button>' : '') + (base.alt.length ? base.alt.map((a, i) => '<button class="scmb" data-alt="' + i + '"><b>' + a.n + '</b><span>' + a.zona + (a.kg ? ' · ' + fmtKg(a.kg) + ' kg' : '') + '</span></button>').join('') : '<span class="muted">Hoy no tenemos otra igual en tu sede.</span>') + (curF() < SALA.F.length - 1 ? '<button class="scmb" data-despues="1"><b>Hacerlo después</b><span>Va al final de la fuerza</span></button>' : '');
    $('#salaSheet').hidden = false;
  }
  function salaCambiar(){
    const f = fx(curF());
    $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">¿Qué pasa con ' + f.n.toLowerCase() + '?</span>' +
      '<button class="scmb" data-cm2="ocupada"><b>Está ocupada</b><span>Te damos otra de tu sede que trabaja lo mismo</span></button>' +
      '<button class="scmb" data-cm2="molesta"><b>Me molesta</b><span>Una alternativa que no carga esa zona</span></button>' +
      '<button class="scmb" data-cm2="nose"><b>No sé cómo se hace</b><span>El video de tu profe, o que te ayude en la sala</span></button>' +
      '<button class="link" data-cm2="saltear" style="min-height:44px">Saltear este ejercicio</button>';
    $('#salaSheet').hidden = false;
  }
  $('#salaSheet').addEventListener('click', e => {
    const S = SALA, close = () => { $('#salaSheet').hidden = true; renderSala(); renderEntHoy(); };
    if (e.target.id === 'salaSheet' || e.target.closest('[data-close]')) return close();
    const z = e.target.closest('[data-z]');
    if (z) { $('#salaSheet').hidden = true;
      if (z.dataset.z === 'profe') { CUIDA = null; chkFin('profe'); toast('Listo. Lucas sabe que querés hablarlo'); }
      else { CUIDA = z.dataset.z; PEOR = false; chkFin('cuidar'); toast(CUIDA === 'Hombro' ? 'Cambiamos el jalón por remo con apoyo de pecho' : 'Hoy evitamos lo que carga ' + zonaTxt(CUIDA)); }
      return close(); }
    const mz = e.target.closest('[data-mz]');
    if (mz) { $('#salaSheet').hidden = true; CUIDA = null; chkFin('menor'); if (mz.dataset.mz === 'avisa') toast('Listo. Lucas te busca en la sala'); return close(); }
    if (e.target.closest('[data-guardar]')) { MOLESTIA = { zona:CUIDA, bien:0 }; toast('Guardado. La próxima te preguntamos cómo está ' + zonaTxt(CUIDA)); return close(); }
    if (e.target.closest('[data-noguardar]')) { CUIDA = null; toast('No lo guardamos. Era por hoy'); return close(); }
    const ak = e.target.closest('[data-ak]'); if (ak) { const F = S.F[curF()]; F.kg = Math.max(0, F.kg + +ak.dataset.ak); return salaAjustar(); }
    const ar = e.target.closest('[data-ar]'); if (ar) { const [j, d] = ar.dataset.ar.split(':').map(Number), F = S.F[curF()]; F.reps[j] = Math.max(1, F.reps[j] + d); return salaAjustar(); }
    const cm = e.target.closest('[data-cm]'); if (cm) { S.carMin = Math.max(5, S.carMin + +cm.dataset.cm); $('#sCarMin').textContent = S.carMin + ' min'; return; }
    const c2 = e.target.closest('[data-cm2]');
    if (c2) { const f = fx(curF()), base = S.P.fue[curF()], v = c2.dataset.cm2;
      if (v === 'ocupada') { return salaCambiarOcupada(); }
      if (v === 'ocupada-old') { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Otras de tu sede</span><span class="small muted">Trabajan lo mismo. Es solo por hoy y el registro sigue.</span>' + base.alt.map((a, i) => '<button class="scmb" data-alt="' + i + '"><b>' + a.n + '</b><span>' + a.zona + (a.kg ? ' · ' + fmtKg(a.kg) + ' kg' : '') + '</span></button>').join(''); return; }
      if (v === 'molesta') { const a = base.alt[base.alt.length - 1]; $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Probá con esta</span><button class="scmb" data-alt="' + (base.alt.length - 1) + '"><b>' + a.n + '</b><span>' + a.zona + (a.kg ? ' · ' + fmtKg(a.kg) + ' kg' : '') + '</span></button><p class="shint">Si duele, pará: no hace falta forzar.</p><span style="font-weight:700">¿Le avisamos a tu profe?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-avisa="1">Avisale a Lucas</button><button class="btn ghost sm" data-close>No, gracias</button></div>'; return; }
      if (v === 'nose') { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">' + f.n + '</span>' + (esMenor() ? '<span class="muted" style="line-height:1.45">Tu profe te lo muestra en la sala.</span>' : '<button class="btn ghost" data-como="1">Ver cómo se hace</button>') + '<button class="btn sm" data-avisa="1">Pedile ayuda a tu profe</button>'; return; }
      if (v === 'saltear') { const F = S.F[curF()]; F.salteado = true; if (S.F.every(x => x.done || x.salteado) && !S.fueSumada && S.F.some(x => x.done)) { S.fueSumada = true; WK.fue++; } S.step = Math.min(steps().length - 1, S.step + 1); toast('Salteado. Seguimos'); renderForma(); return close(); } }
    const al = e.target.closest('[data-alt]'); if (al) { const F = S.F[curF()], a = S.P.fue[curF()].alt[+al.dataset.alt]; F.swap = a; F.kg = a.kg; toast('Listo: hoy hacés ' + a.n.toLowerCase()); return close(); }
    if (e.target.closest('[data-avisa]')) { toast('Listo. Lucas sabe que estás en ' + fx(curF()).n.toLowerCase() + ''); return close(); }
    if (e.target.closest('[data-como]')) { S.pan = 'como'; S.panStep = S.step; return close(); }
    if (e.target.closest('[data-fin]')) { $('#salaSheet').hidden = true; return salaCerrar(); }
  });
  $('#salaMenu').addEventListener('click', () => { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Tu sesión</span><button class="btn ghost" data-close>Seguir entrenando</button><button class="btn ghost" data-fin="1">Terminar acá</button><span class="small muted" style="line-height:1.45">Guardamos lo que marcaste. Si la dejás abierta, se cierra sola a las 3 horas.</span>'; $('#salaSheet').hidden = false; });
  // ---- Cierre: una pantalla y una pregunta ----
  function salaCerrar(){
    const S = SALA; if (!S) return;
    clearInterval(restT); clearInterval(cronoT); try { if (S.lock) S.lock.release(); } catch (_) {} S.cerrada = true;
    const prog = salaProg(), completa = prog.every(x => x >= 1), r = rutinas[actual], d = r.dias[r.next];
    const tReal = (S.tEj || 0) + (S.tDesc || 0) + (S.tTrans || 0), min = tReal >= 300 ? Math.round(tReal / 60) : Math.round(planMin(S.P) * (completa ? 1.05 : 0.6));
    const remo = S.P.fue.findIndex(f => f.k === 'remo'), rec = remo >= 0 && S.F[remo].done && !S.F[remo].swap && S.F[remo].kg > (S.P.fue[remo].prev || 99) && EXP !== 'arranco' && !esMenor();
    if (rec) { const h = hist.remo; if (h) { const last = h[h.length - 1]; if (last[0] === hoyLbl) last[1] = S.F[remo].kg; else h.push([hoyLbl, S.F[remo].kg]); } }
    CIERRE_K = S.P.fue.filter((f, i) => S.F[i].done && !S.F[i].swap).map(f => f.k);
    r.next = (r.next + 1) % r.dias.length; const nx = r.dias[r.next];
    if (!NOENT) { hoyEntreno = true; visHoy = true; } MOM = 'despues'; sesHecha = true; syncMomPick();
    renderForma(); renderHoy(); renderToday(); renderAcc(); renderEntHoy(); renderRoutines(); PROG_MIN = min; renderAvance(); renderRecords(); renderProg();
    const lect = completa && (EXP === 'arranco' || esMenor()) ? 'Hiciste tu tercera sesión completa. Lo estás haciendo bien ⚡'
      : completa ? 'Sesión completa en ' + min + ' minutos.' + (rec ? ' En remo subiste a ' + fmtKg(S.F[remo].kg) + ' kg ⚡' : ' ⚡')
      : 'Guardamos lo que hiciste ⚡ ' + [S.actDone ? 'la activación' : '', S.F.filter(f => f.done).length ? S.F.filter(f => f.done).length + (S.F.filter(f => f.done).length === 1 ? ' ejercicio' : ' ejercicios') + ' de fuerza' : ''].filter(Boolean).join(' y ') + '.';
    renderSemana(); const sv = $('#wkBox .eqsvg'), comp = semCompleta(), cump = semCumplida();
    $('#cierreBody').innerHTML = '<span class="tagi m cbig"><span>' + (completa ? '¡Listo!' : 'Guardado') + '</span></span>' +
      '<p class="sv big">' + SV_BOLT + '<span>' + lect + '</span></p>' + tiemposHtml(S) +
      '<div class="card cisem"><div class="between"><span class="wktit"><span class="sig"><b>Tu</b> <i>semana</i></span>' + (comp ? '<span class="tagi sm"><span>Completa</span></span>' : cump ? '<span class="wkleg2">· Cumplida</span>' : '') + '</span></div>' + (sv ? sv.outerHTML : '') + '</div>' +
      (rec ? '<div class="card cilog"><span style="font-weight:700">Récord en remo sentado: ' + fmtKg(S.F[remo].kg) + ' kg ⚡</span><button class="flowshare" id="ciShare"><svg class="bolt-ico" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg> Contalo en tus historias</button></div>' : '') +
      (NOENT ? '<span class="small muted cinoent">Tu sesión encendió tu semana. La visita se suma cuando llegue tu entrada.</span>' : '') +
      (CHK === 'cuidar' && CUIDA && !MOLESTIA && !esMenor() ? '<div class="card ciq"><span style="font-weight:700">¿Querés que tengamos en cuenta tu ' + CUIDA.toLowerCase() + ' las próximas veces?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-cq="si">Sí, tenelo en cuenta</button><button class="btn ghost sm" data-cq="no">No, era por hoy</button></div></div>'
        : '<div class="card ciq"><span style="font-weight:700">¿Cómo estuvo?</span><div class="opts g3" id="ciFeel"><button class="opt" data-fl="liviana">Liviana</button><button class="opt" data-fl="justa">Justa</button><button class="opt" data-fl="limite">Al límite</button></div></div>') +
      '<div class="cinext"><span class="small muted">Tu próxima</span><span style="font-weight:700;font-size:17px">Día ' + nx.k + ' · ' + nx.n.toLowerCase() + '</span></div>' +
      '<button class="btn" data-go="inicio">Volver a tu inicio</button>';
    hablar(vozResumen(S, rec ? S.F[remo].kg : null), 'cierre');
    SALA = null;
    go('cierre');
  }
  $('#cierreBody').addEventListener('click', e => {
    const fl = e.target.closest('[data-fl]'); if (fl) { $$('#ciFeel .opt').forEach(x => x.setAttribute('aria-pressed', x === fl));
      const lim = fl.dataset.fl === 'limite'; CIERRE_K.forEach(k => { LIM[k] = lim ? (LIM[k] || 0) + 1 : 0; });
      const dos = lim && CIERRE_K.some(k => LIM[k] >= 2);
      toast(dos ? 'Anotado. Dos veces al límite: la próxima repetimos la carga' : lim ? 'Anotado. Si se repite, la próxima no sube la carga' : 'Anotado ⚡'); renderEntHoy(); return; }
    const cq = e.target.closest('[data-cq]'); if (cq) { if (cq.dataset.cq === 'si') { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Un dato de salud</span><span class="muted" style="line-height:1.5">Esto es un dato de salud. Lo guardamos solo para cuidarte en la rutina; lo ve tu profe solo si vos querés, y se borra cuando lo das por resuelto.</span><div class="grid2" style="gap:8px"><button class="btn sm" data-guardar="1">Guardar</button><button class="btn ghost sm" data-noguardar="1">No guardar</button></div>'; $('#salaSheet').hidden = false; } else { CUIDA = null; renderEntHoy(); toast('Listo, era por hoy'); } cq.closest('.ciq').innerHTML = '<span class="small muted">Gracias.</span>'; return; }
    if (e.target.closest('#ciShare')) openStory({ type:'ach', a:{ big:'42,5', unit:'KG EN REMO ⚡', cap:'mi récord en remo sentado', feedT:'Récord en remo' }, noSede:true });
  });
//#bloque 305
  // ===== v44 · Onboarding de Entrenar (instrucción, sección 9; propuesta 4 bis) =====
  // Se propone completo la primera vez y decide el socio. Cada pregunta se puede saltear. "Después vemos" lo reofrece una sola vez (en Hoy).
  // Sin peso ni altura: el cuerpo entra por el Índice FIT. Edad y género vienen de EVO. Nunca en medio de una sesión.
  var OB = { step:'inv', obj:[], zonaAbierta:false, zona:null, meta:3, later:0, reofrecer:false, hecho:false, res:{} };
  var OB_STEPS = ['obj', 'exp', 'cui', 'meta'];
  var OB_EXP = [['arranco', 'Recién arranco', 'Nunca entrené o hace mucho que no'], ['habitual', 'Entreno hace un tiempo', 'Ya conozco las máquinas'], ['avanzado', 'Entreno hace años', 'Sé armar mi rutina']];
  var OB_ZONAS = ['Hombro', 'Codo', 'Muñeca', 'Espalda', 'Cadera', 'Rodilla', 'Tobillo', 'Otra'];
  var OB_BOLT = '<svg class="vbolt" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>';
  function obAbrir(){
    if (MOM === 'sesion') { toast('Nunca en medio de una sesión: primero cerrala'); return; }
    OB.step = 'inv'; OB.obj = []; OB.zonaAbierta = false; OB.zona = null; OB.meta = 3; OB.res = {};
    obRender(); go('onbE');
  }
  function obTop(){
    const i = OB_STEPS.indexOf(OB.step);
    return '<div class="obtop"><button class="iconbtn" data-ob="back" aria-label="Volver"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<span class="obdots" aria-label="Pregunta ' + (i + 1) + ' de 4">' + OB_STEPS.map((s, k) => '<i class="' + (k <= i ? 'on' : '') + '"></i>').join('') + '</span>' +
      '<button class="link" data-ob="skip" style="padding:0 4px">Saltear</button></div>';
  }
  function obRender(){
    const b = $('#obBody'), f = $('#obFoot'); let h = '', ft = '';
    if (OB.step === 'inv') {
      h = '<div style="height:24px"></div><span class="wktit"><span class="sig">' + firma('Armemos tu entrenamiento') + '</span></span>' +
        '<p class="sv big">' + OB_BOLT + '<span>Cuatro preguntas, menos de un minuto. Con esto Lucas, tu profe, ajusta tu rutina.</span></p>' +
        '<p class="obsub" style="margin:0">Sin peso ni medidas. Podés saltear cualquier pregunta.</p>';
      ft = '<button class="accbtn on" data-ob="dale"><span>Dale</span></button><button class="link obsec" data-ob="later" style="width:100%">Después vemos</button>';
    } else if (OB.step === 'obj') {
      const L = OBJS.filter(o => !(esMenor() && o[0] === 'ver'));
      h = obTop() + '<span class="h2 obq">¿Qué buscás?</span><p class="obsub">Elegí hasta dos. La primera es la principal.</p>' +
        '<div class="oblist">' + L.map(o => { const i = OB.obj.indexOf(o[0]);
          return '<button class="objopt" data-obo="' + o[0] + '" aria-pressed="' + (i >= 0) + '"><span style="font-weight:700;font-size:16px">' + o[1] + '</span><small>' + o[2] + '</small>' + (i === 0 ? '<em>Principal</em>' : i === 1 ? '<em>Segundo</em>' : '') + '</button>'; }).join('') + '</div>';
      ft = '<button class="accbtn' + (OB.obj.length ? ' on' : '') + '" data-ob="next"' + (OB.obj.length ? '' : ' disabled') + '><span>Seguir</span></button>';
    } else if (OB.step === 'exp') {
      h = obTop() + '<span class="h2 obq">¿Cuánto venís entrenando?</span><p class="obsub">Así sabemos cuánto explicarte y cuándo subir la carga.</p>' +
        '<div class="oblist">' + OB_EXP.map(x => '<button class="objopt" data-obx="' + x[0] + '" aria-pressed="' + (OB.res.exp === x[0]) + '"><span style="font-weight:700;font-size:16px">' + x[1] + '</span><small>' + x[2] + '</small></button>').join('') + '</div>';
    } else if (OB.step === 'cui') {
      if (esMenor()) {
        h = obTop() + '<span class="h2 obq">¿Hay algo que tengamos que cuidar?</span><p class="obsub">Una lesión, un dolor o algo que te molesta. Si hay algo, contáselo a tu profe: Lucas te arma la sesión.</p>' +
          '<div class="oblist"><button class="objopt" data-obc="no"><span style="font-weight:700;font-size:16px">No, nada</span></button><button class="objopt" data-obc="profe"><span style="font-weight:700;font-size:16px">Sí, quiero contarle a mi profe</span><small>No guardamos nada en la app</small></button></div>';
      } else if (OB.zona) {
        h = obTop() + '<span class="h2 obq">' + (OB.zona === 'Otra' ? 'Lo cuidamos' : 'Cuidamos ' + zonaTxt(OB.zona)) + '</span><div class="obcons"><span class="h2" style="font-size:22px">Un dato de salud</span><span class="muted" style="line-height:1.5">Esto es un dato de salud. Lo guardamos solo para cuidarte en la rutina; lo ve tu profe solo si vos querés, y se borra cuando lo das por resuelto.</span>' +
          '<div class="grid2" style="gap:8px"><button class="btn sm" data-obg="1">Guardar</button><button class="btn ghost sm" data-obg="0">No guardar</button></div></div>';
      } else {
        h = obTop() + '<span class="h2 obq">¿Hay algo que tengamos que cuidar?</span><p class="obsub">Una lesión, un dolor o una zona que te molesta.</p>' +
          (OB.zonaAbierta
            ? '<div class="opts g2" id="obZ">' + OB_ZONAS.map(z => '<button class="opt" data-obz="' + z + '" style="min-height:52px">' + z + '</button>').join('') + '</div><button class="link lime" data-obc="profe" style="min-height:44px">Prefiero hablarlo con mi profe</button>'
            : '<div class="oblist"><button class="objopt" data-obc="no"><span style="font-weight:700;font-size:16px">No, nada</span></button><button class="objopt" data-obc="si"><span style="font-weight:700;font-size:16px">Sí, hay algo</span><small>Elegís la zona; la rutina la evita</small></button></div>');
      }
    } else if (OB.step === 'meta') {
      const n = OB.meta;
      h = obTop() + '<span class="h2 obq">¿Nos ponemos una meta?</span>' +
        '<div class="obmeta"><button data-obm="-1" aria-label="Una vez menos"' + (n <= 2 ? ' disabled' : '') + '>−</button><b>' + n + '</b><button data-obm="1" aria-label="Una vez más"' + (n >= 5 ? ' disabled' : '') + '>+</button></div>' +
        '<p class="sv big">' + OB_BOLT + '<span>Venir ' + n + ' veces por semana. Con 4 semanas así es tu Mes cumplido y encendés tu cartel ⚡</span></p>' +
        '<p class="obsub" style="margin:0">La cambiás cuando quieras.</p>';
      ft = '<button class="accbtn on" data-ob="next"><span>Dale</span></button>';
    } else if (OB.step === 'fin') {
      const r = OB.res, o = r.obj && r.obj.length ? r.obj.map(k => OBJS.find(x => x[0] === k)[1]).join(' · ') : 'Lo vemos con tu profe';
      const ex = r.exp ? OB_EXP.find(x => x[0] === r.exp)[1] : 'Lo vemos con tu profe';
      const cu = r.cui === 'no' ? 'Nada' : r.cui === 'profe' ? 'Lo hablás con Lucas' : r.cui === 'guardado' ? zonaTxt(r.zona).replace(/^tu /, '').replace(/^./, c => c.toUpperCase()) : r.cui === 'hoy' ? 'Solo hoy' : 'Sin responder';
      const d = rutinas[actual].dias[rutinas[actual].next];
      h = '<div style="height:24px"></div><span class="wktit"><span class="sig">' + firma('Tu rutina está lista') + '</span></span>' +
        '<p class="sv big">' + OB_BOLT + '<span>Hoy toca el Día ' + d.k + ', ' + d.n.toLowerCase() + '. Ya tiene en cuenta lo que nos contaste.</span></p>' +
        '<div class="obres"><div><span>Buscás</span><b>' + o + '</b></div><div><span>Experiencia</span><b>' + ex + '</b></div><div><span>Cuidamos</span><b>' + cu + '</b></div><div><span>Tu meta</span><b>' + (r.meta ? r.meta + ' por semana' : META_SEM + ' por semana') + '</b></div></div>' +
        '<p class="obsub" style="margin:0">Lucas la revisa con vos en la sala.</p>';
      ft = '<button class="accbtn on" data-ob="ver"><span>Ver tu rutina</span></button>';
    }
    b.innerHTML = h; f.innerHTML = ft; f.hidden = !ft; b.scrollTop = 0;
  }
  function obNext(){
    const i = OB_STEPS.indexOf(OB.step);
    if (OB.step === 'obj' && OB.obj.length) { OBJ = OB.obj.slice(); OB.res.obj = OBJ.slice(); }
    if (OB.step === 'meta') { const antes = META_SEM; META_SEM = OB.meta; OB.res.meta = OB.meta; if (antes !== META_SEM) renderForma(); }
    OB.step = i < OB_STEPS.length - 1 ? OB_STEPS[i + 1] : 'fin';
    if (OB.step === 'fin') obFin(); obRender();
  }
  function obFin(){
    OB.hecho = true; OB.reofrecer = false;
    try { renderForma(); renderSemanaDet(); renderAcc(); renderHoy(); renderToday(); } catch (e) {}
  }
  $('#obBody').addEventListener('click', e => {
    const a = e.target.closest('[data-ob]');
    if (a && a.dataset.ob === 'back') { const i = OB_STEPS.indexOf(OB.step); if (OB.step === 'cui' && (OB.zona || OB.zonaAbierta)) { OB.zona = null; OB.zonaAbierta = false; } else OB.step = i <= 0 ? 'inv' : OB_STEPS[i - 1]; obRender(); return; }
    if (a && a.dataset.ob === 'skip') { if (OB.step === 'obj') OB.obj = []; if (OB.step === 'cui') { OB.zona = null; OB.zonaAbierta = false; } if (OB.step === 'meta') OB.meta = META_SEM; OB_STEPS.indexOf(OB.step) === 3 ? (OB.step = 'fin', obFin()) : (OB.step = OB_STEPS[OB_STEPS.indexOf(OB.step) + 1]); obRender(); return; }
    const o = e.target.closest('[data-obo]'); if (o) { const k = o.dataset.obo, i = OB.obj.indexOf(k); if (i >= 0) OB.obj.splice(i, 1); else { if (OB.obj.length >= 2) OB.obj.pop(); OB.obj.push(k); } obRender(); return; }
    const x = e.target.closest('[data-obx]'); if (x) { EXP = x.dataset.obx; OB.res.exp = EXP; renderProg(); $$('#expPick [data-exp]').forEach(y => y.setAttribute('aria-pressed', y.dataset.exp === EXP)); x.setAttribute('aria-pressed', 'true'); setTimeout(obNext, 220); return; }
    const c = e.target.closest('[data-obc]'); if (c) { const k = c.dataset.obc;
      if (k === 'si') { OB.zonaAbierta = true; obRender(); return; }
      OB.res.cui = k; if (k === 'profe') toast('Listo. Lucas lo charla con vos en la sala ⚡'); obNext(); return; }
    const z = e.target.closest('[data-obz]'); if (z) { OB.zona = z.dataset.obz; obRender(); return; }
    const g = e.target.closest('[data-obg]'); if (g) {
      if (g.dataset.obg === '1') { MOLESTIA = { zona:OB.zona, bien:0 }; OB.res.cui = 'guardado'; OB.res.zona = OB.zona; ETAPA = 'molestia'; $('.app').dataset.etapa = ETAPA; $$('#etPick [data-et]').forEach(y => y.setAttribute('aria-pressed', y.dataset.et === 'molestia')); try { chkReset(); } catch (e2) {} toast('Guardado. Te vamos a preguntar cómo está ' + zonaTxt(OB.zona)); }
      else { OB.res.cui = 'hoy'; CUIDA = OB.zona; toast('No lo guardamos. Hoy lo cuidamos igual'); }
      OB.zona = null; OB.zonaAbierta = false; obNext(); return; }
    const m = e.target.closest('[data-obm]'); if (m) { OB.meta = Math.max(2, Math.min(5, OB.meta + +m.dataset.obm)); obRender(); return; }
  });
  $('#obFoot').addEventListener('click', e => {
    const a = e.target.closest('[data-ob]'); if (!a || a.disabled) return; const k = a.dataset.ob;
    if (k === 'dale') { OB.step = 'obj'; obRender(); }
    else if (k === 'next') obNext();
    else if (k === 'later') { OB.later++; OB.reofrecer = OB.later === 1; toast(OB.reofrecer ? 'Dale. Te lo volvemos a ofrecer una sola vez' : 'Listo, no te lo preguntamos más'); go('hoy'); }
    else if (k === 'ver') go('hoy');
  });
  function obHoy(){ const el = $('#hOnb'); if (el) el.hidden = !(OB.reofrecer && !OB.hecho && MOM !== 'sesion'); }
  $('#hOnbSi').addEventListener('click', () => { OB.reofrecer = false; obAbrir(); OB.step = 'obj'; obRender(); });
  $('#hOnbNo').addEventListener('click', () => { OB.reofrecer = false; OB.later = 2; obHoy(); toast('Listo. Tu objetivo lo podés elegir en Tu semana'); });
  $('#verPrim').addEventListener('click', () => { $('#demoSheet').hidden = true; OB.hecho = false; OB.later = 0; OB.reofrecer = false; obAbrir(); });
//#bloque 306
  // ===== v46 · T7 El acompañante (docs/tickets/T7-el-acompanante.md) =====
  // Quien lleva la sesión es este motor determinista: rutina, tiempos, registro "como estaba indicado" y plantillas.
  // El modelo de lenguaje sería solo intérprete de lo que el socio dice (en la demo, frases pretranscriptas), siempre con confirmación.
  // Al vencer el tiempo de un paso, propone el siguiente; a los 5 minutos repregunta una sola vez; NUNCA avanza solo (decisión de Juanjo, 1/11).
  var VOZ = false, AURIC = true, MANUAL = false, RAPIDO = true, DECI = 'reps', DSEG = 2;
  var MT_REPREG = 300;
  var mtVel = () => RAPIDO ? 10 : 1;  // reloj de la demo: real o rápido ×10
  // Tiempo esperado (s): el que define el profe por ejercicio (t) o el valor por defecto series × reps × 3 s + descansos de 60 s + 30 s
  var tEx = f => f.t || (f.sr * (f.seg ? f.rep : f.rep * 3) + (f.sr - 1) * 60 + 30);
  function mtDur(st){ const P = SALA.P; if (st === 'act') return P.act.min * 60; if (st === 'car') return SALA.carMin * 60; return tEx(fx(+st.slice(1))); }
  const ART = { dominadas:'las', sentadilla:'la', prensa:'la', plancha:'la', cinta:'la', bici:'la', elíptica:'la' };
  function pasoCorto(st){ if (st === 'act') return 'la activación'; const w = (st === 'car' ? SALA.P.car.maq : fx(+st.slice(1)).n).split(' ')[0].toLowerCase(); return (ART[w] || 'el') + ' ' + w; }
  const exTxt = i => { const f = fx(i), F = SALA.F[i]; return f.n.toLowerCase() + ', ' + f.sr + ' × ' + F.reps[0] + (f.seg ? ' segundos' : '') + (F.kg ? ' con ' + fmtKg(F.kg) + ' kg' : ''); };
  function mtProx(){ const S = SALA, nx = steps()[S.step + 1]; if (!nx) return ''; if (nx === 'car') return 'Sigue ' + S.P.car.maq.toLowerCase() + ' · ' + S.carMin + ' min'; const i = +nx.slice(1), F = S.F[i]; return 'Sigue ' + fx(i).n.toLowerCase() + (F.kg ? ' · ' + fmtKg(F.kg) + ' kg' : ''); }
  function mtPropTxt(st){ return st === 'car' ? '¿Terminaste ' + pasoCorto(st) + '? Tocá Listo y cerramos' : '¿Listo con ' + pasoCorto(st) + '? ' + mtProx(); }
  function mtRepTxt(st){ return '¿Seguís con ' + pasoCorto(st) + '? Cuando termines, tocá Listo.'; }
  // ---- Descanso y fatiga (regla de Juanjo, 1/11): Arranco y Habitual. Parámetros de demo; E3 verifica la evidencia ----
  // v52 · T9: la frase sale del mismo cálculo que "Tu cuerpo hoy" (bloque 307), no de una tabla fija
  function descansoTxt(){ if (EXP === 'avanzado') return ''; const c = cuerpoHoy(); return c.rec.length ? recFrase(c.rec) : ''; }
  // Nunca "no vengas" a quien viene menos que su meta: el descanso total se propone solo con la semana ya cumplida
  function fatigaTxt(){ return EXP !== 'avanzado' && DSEG >= 5 && semCumplida() && MOM !== 'sesion' ? 'Venís ' + DSEG + ' días seguidos y ya cumpliste tu semana ⚡ Mañana y pasado, descanso: tu cuerpo también entrena descansando.' : ''; }
  function mtSaludo(){
    const P = SALA.P, d = rutinas[actual].dias[rutinas[actual].next], ds = descansoTxt();
    return (NOENT ? 'Arrancamos.' : 'Llegaste a Sarmiento.') + (ETAPA === 'vuelvo' ? ' Volviste: hoy vamos al 80% de lo que hacías.' : ' Hoy toca el Día ' + d.k + (ds ? ' y ' + ds.charAt(0).toLowerCase() + ds.slice(1) : '') + ': arrancamos con ' + P.act.min + ' minutos de activación.');
  }
  // ---- La voz (escalón 1): plantillas, síntesis del teléfono, solo con auriculares. Sin síntesis, solo texto ----
  const vozTxt = t => String(t).replace(/<[^>]+>/g, '').replace(/\s*⚡\s*(?=\S)/g, '. ').replace(/⚡/g, '').replace(/([.?!])\. /g, '$1 ').replace(/(\d+),5/g, '$1 y medio').replace(/(\d+) × (\d+)/g, '$1 series de $2').replace(/\bkg\b/g, 'kilos').replace(/\bmin\b/g, 'minutos').replace(/·/g, ',').replace(/\s+/g, ' ').trim();
  var vozES = null;
  // v47: entre las voces en español del teléfono, primero la calidad (premium, mejorada) y después la región; las voces locales antes que las de red
  function vozElegir(){ try { const q = v => { const n = v.name + ' ' + (v.voiceURI || ''); return (/premium|enhanced|mejorad|neural|natural/i.test(n) ? 0 : 10) + (/compact/i.test(n) ? 3 : 0) + (v.localService === false ? 5 : 0) + (/^es[-_](AR|UY)/i.test(v.lang) ? 0 : /^es[-_](419|US|MX)/i.test(v.lang) ? 1 : 2); }; vozES = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => q(a) - q(b))[0] || null; } catch (_) {} }
  try { if (window.speechSynthesis) { vozElegir(); speechSynthesis.onvoiceschanged = vozElegir; } } catch (_) {}
  const vozHay = () => { try { return !!window.speechSynthesis; } catch (_) { return false; } };
  // Reglas duras en el motor, no en el prompt: solo los momentos fijos y nunca lo de la lista "nunca por voz" (una más, dolor, cambiar cargas, datos sensibles). Nunca por parlante: solo con auriculares
  var VOZ_MOMENTOS = { inicio:1, ejercicio:1, descanso:1, cierre:1, respuesta:1, sistema:1 };
  var NUNCA_VOZ = /\buna m[aá]s\b|duel|dolor|molest|lesi[oó]n|\b(sub[ií]|prob[aá]|subimos|bajamos|sum[aá]|sac[aá])\b|\bbaj[aá] (a|la carga|el peso)\b|salud|consentimiento|menor de|calor[ií]/i;
  function hablar(t, k){ if (!(VOZ && AURIC && vozHay()) || !t || !VOZ_MOMENTOS[k] || NUNCA_VOZ.test(vozTxt(t))) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(vozTxt(t)); u.lang = vozES ? vozES.lang : 'es-AR'; if (vozES) u.voice = vozES; u.rate = 1; speechSynthesis.speak(u); } catch (_) {} }
  const callar = () => { try { speechSynthesis.cancel(); } catch (_) {} };
  // ---- Cambio de paso (cualquiera sea el modo: toque, Decímelo, pantalla bloqueada o deslizar) ----
  // ---- v51 · Voz en momentos fijos (docs/entrenar-propuesta.md § 3): al arrancar, antes de cada ejercicio, fin del descanso y resumen al cerrar. Entre medio, silencio ----
  function vozEj(st){
    const S = SALA; if (st === 'car') return S.P.car.maq + ', ' + S.carMin + ' min, ' + S.P.car.txt + '. Podés hablar, pero no cantar.';
    const i = +st.slice(1), f = fx(i), F = S.F[i];
    return f.n + ': ' + f.sr + ' × ' + F.reps[0] + (f.seg ? ' segundos' : '') + '.' + (f.prev && !F.swap ? ' La vez pasada, ' + fmtKg(f.prev) + ' kg.' : F.kg ? ' Con ' + fmtKg(F.kg) + ' kg.' : '') + (f.ctl && !F.swap ? ' ' + f.ctl + '.' : '');
  }
  function vozFinDescanso(){ const S = SALA, i = curF(); if (!S || i < 0) return; const F = S.F[i], j = F.sets.indexOf(false); hablar('Descanso terminado' + (j >= 0 ? ': serie ' + (j + 1) + ' de ' + F.sets.length + '.' : '.'), 'descanso'); }
  function vozResumen(S, recKg){
    const nF = S.F.filter(f => f.done).length, p = [];
    if (S.actDone) p.push('la activación'); if (nF) p.push(nF + (nF === 1 ? ' ejercicio' : ' ejercicios') + ' de fuerza'); if (S.carDone) p.push(S.carMin + ' min de ' + S.P.car.maq.toLowerCase());
    return (p.length ? 'Hiciste ' + (p.length > 1 ? p.slice(0, -1).join(', ') + ' y ' + p[p.length - 1] : p[0]) + '.' : 'Cerramos la sesión.') + (recKg ? ' En remo subiste a ' + fmtKg(recKg) + ' kg.' : '');
  }
  // ---- Cambio de paso (cualquiera sea el modo: toque, Decímelo, pantalla bloqueada o deslizar) ----
  function mtCambio(S){
    const sts = steps(), a = S.mtStep, b = S.step;
    S.mtStep = b; S.el = 0; S.vence = false; S.repreg = false; S.hito = '';
    if (a === null || a === undefined || b <= a) return;
    const sa = sts[a], sb = sts[b];
    if (sb === 'car' && !MANUAL) cronoArrancar();
    if (sa[0] === 'f') { const i = +sa.slice(1), F = S.F[i], f = fx(i); if (F.done && !F.swap && f.prev && F.kg > f.prev && EXP !== 'arranco' && !esMenor()) S.hito = 'Récord en ' + f.n.toLowerCase() + ''; } // solo en pantalla
    hablar(vozEj(sb), 'ejercicio');
  }
  function mtHtml(st){
    const S = SALA; if (S.mtStep !== S.step) mtCambio(S);
    const b = t => '<p class="sv smt"><span>' + t + '</span></p>';
    if (S.pausa) return b('En pausa: el reloj de la sesión te espera.');
    if (!MANUAL && S.vence) return b(S.repreg ? mtRepTxt(st) : mtPropTxt(st));
    return S.hito ? b(S.hito) : '';
  }
  function mtPos(st){ const S = SALA; $('#salaPos').textContent += S.pausa ? ' · en pausa' : !MANUAL && st !== 'car' ? ' · ≈ ' + Math.max(1, Math.round(mtDur(st) / 60)) + "'" : ''; }
  const ICO_PAU = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>', ICO_SEG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function mtFoot(){
    const S = SALA; $('#salaMic').hidden = SIN_SENAL || esMenor();
    const p = $('#salaPausa'); p.hidden = MANUAL; p.innerHTML = S && S.pausa ? ICO_SEG : ICO_PAU; p.setAttribute('aria-label', S && S.pausa ? 'Seguir la sesión' : 'Pausar la sesión'); p.setAttribute('aria-pressed', !!(S && S.pausa));
    acSync();
  }
  function cronoArrancar(){ const S = SALA; if (!S || S.cronoOn) return; S.cronoOn = true; clearInterval(cronoT); cronoT = setInterval(() => { if (!SALA || !SALA.cronoOn) { clearInterval(cronoT); return; } if (SALA.pausa) return; SALA.crono += mtVel(); if (curScr === 'sala') renderSala(); if (BLOQ) lockRen(); }, 1000); }
  function mtTic(){
    const S = SALA; if (!S || S.pausa || MANUAL) { if (BLOQ && S) lockRen(); return; }
    const st = steps()[S.step]; if (S.mtStep !== S.step) return;
    if (enPrep(st)) { if (BLOQ) lockRen(); return; }  // v54: el motor no corre mientras se prepara
    S.el += mtVel(); const d = mtDur(st);
    if (!S.vence && S.el >= d) { S.vence = true; if (curScr === 'sala') renderSala(); } // la propuesta va en pantalla y en la pantalla bloqueada, en silencio
    else if (S.vence && !S.repreg && S.el >= d + MT_REPREG) { S.repreg = true; if (curScr === 'sala') renderSala(); }
    if (BLOQ) lockRen();
  }
  setInterval(mtTic, 1000);
  function acSync(){
    const set = (k, on) => { const b = document.querySelector('[data-ac="' + k + '"]'); if (b) b.setAttribute('aria-pressed', on); };
    set('voz1', VOZ); set('voz0', !VOZ); set('au1', AURIC); set('au0', !AURIC); set('rap1', RAPIDO); set('rap0', !RAPIDO); set('man1', MANUAL); set('man0', !MANUAL);
    $$('#dcPick [data-dc2]').forEach(x => x.setAttribute('aria-pressed', x.dataset.dc2 === DECI));
    $$('#dsPick [data-ds]').forEach(x => x.setAttribute('aria-pressed', +x.dataset.ds === DSEG));
    const a = $('#anotarYo'); if (a) a.checked = MANUAL;
    const v = $('#salaVoz'); if (v) { v.setAttribute('aria-pressed', VOZ); v.setAttribute('aria-label', VOZ ? 'Voz: con auriculares' : 'Voz: solo en pantalla'); }
  }
  function vozCambiar(on){
    VOZ = on; acSync();
    if (VOZ && !AURIC) toast('Conectá tus auriculares: mientras, te escribimos acá');
    else if (VOZ && !vozHay()) toast('Este teléfono no tiene voz: te escribimos acá');
    else { vozElegir(); toast(VOZ ? 'Voz: ' + (vozES ? vozES.name : 'la del teléfono') : 'Voz: solo en pantalla'); if (VOZ) hablar('Dale, te hablo al empezar cada ejercicio.', 'sistema'); else callar(); }
  }
  $('#salaVoz').addEventListener('click', () => { vozCambiar(!VOZ); if (SALA) renderSala(); });
  $('#salaPausa').addEventListener('click', () => { if (!SALA) return; SALA.pausa = !SALA.pausa; callar(); toast(SALA.pausa ? 'En pausa: el reloj te espera' : 'Seguimos'); renderSala(); });
  $('#anotarYo').addEventListener('change', e => { MANUAL = e.target.checked; if (SALA) { SALA.vence = false; SALA.repreg = false; } acSync(); toast(MANUAL ? 'Anotás vos: sin reloj, pasás con Listo' : 'La app te lleva: marca los tiempos'); });
  // ---- "Decímelo" (escalón 2, simulado): mantener apretado; lo dicho pasa a una tarjeta para confirmar ----
  var DECI_F = { reps:'hice 10, 10 y 8 con 42 y medio', ocupada:'está ocupada', falta:'¿cuánto me falta?', duele:'me duele el hombro' };
  var DC = null, micOn = false;
  const mic = $('#salaMic');
  mic.addEventListener('pointerdown', e => { if (!SALA) return; micOn = true; mic.classList.add('on'); try { mic.setPointerCapture(e.pointerId); } catch (_) {} callar(); $('#salaListo').textContent = 'Te escucho…'; });
  mic.addEventListener('pointerup', () => { if (!micOn) return; micOn = false; mic.classList.remove('on'); renderSala(); deciMostrar(); });
  mic.addEventListener('pointercancel', () => { micOn = false; mic.classList.remove('on'); if (SALA) renderSala(); });
  mic.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (SALA) deciMostrar(); } });
  mic.addEventListener('contextmenu', e => e.preventDefault());
  function deciFalta(){
    const S = SALA, st = steps()[S.step], fi = curF(), car = S.P.car.maq.toLowerCase();
    if (st === 'car') return 'Te quedan ' + Math.max(1, Math.ceil((S.carMin * 60 - S.crono) / 60)) + ' minutos de ' + car + ' y terminás';
    const fz = S.F.map((F, i) => ({ F:F, i:i })).filter(o => !o.F.done && !o.F.salteado && o.i !== fi).map(o => fx(o.i).n.split(' ')[0].toLowerCase());
    const lista = fz.length > 1 ? fz.slice(0, -1).join(', ') + ' y ' + fz[fz.length - 1] : fz[0] || '';
    return (st === 'act' ? 'Después de la activación, te ' : 'Te ') + (lista ? 'quedan ' + lista + ', y ' + S.carMin + ' minutos de ' + car : 'queda el cardio: ' + S.carMin + ' minutos de ' + car + ' y terminás') + '.';
  }
  function deciMostrar(){
    const S = SALA; if (!S) return; const st = steps()[S.step], fi = curF();
    const iR = fi >= 0 ? fi : S.F.findIndex(F => !F.done && !F.salteado), kR = iR >= 0 ? S.F[iR].kg : null;
    const frase = DECI === 'reps' ? 'hice 10, 10 y 8' + (kR ? ' con ' + vozTxt(fmtKg(kR)).replace(' kilos', '') : '') : DECI_F[DECI];
    const oido = '<div class="deoido"><span class="small muted">Escuché</span><span class="deq">«' + frase + '»</span></div>';
    const pie = '<span class="small muted">El audio se procesa en tu teléfono y no se guarda.</span>';
    const pre = () => $('#salaSheetIn').insertAdjacentHTML('afterbegin', oido);
    if (DECI === 'duele') { // "me duele" siempre va al protocolo fijo de Cambiar · Me molesta; el modelo nunca responde sobre dolor
      if (fi >= 0) { salaCambiar(); const b = $('#salaSheetIn [data-cm2="molesta"]'); if (b) b.click(); pre(); return; }
      $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Si duele, pará</span><span class="muted" style="line-height:1.45">No hace falta forzar. Seguí solo con lo que no moleste, o terminá acá.</span><span style="font-weight:700">¿Le avisamos a tu profe?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-avisa2="1">Avisale a Lucas</button><button class="btn ghost sm" data-close>No, gracias</button></div>';
      pre(); $('#salaSheet').hidden = false; return;
    }
    if (DECI === 'ocupada') { if (fi >= 0) { salaCambiarOcupada(); pre(); } else toast('Eso va en la fuerza: ahora estás en ' + pasoCorto(st)); return; }
    if (DECI === 'falta') { const t = deciFalta(); $('#salaSheetIn').innerHTML = oido + '<p class="sv big"><span>' + t + '</span></p><button class="btn" data-close>Dale</button>'; $('#salaSheet').hidden = false; hablar(t, 'respuesta'); return; }
    // Cantidades dictadas: van al ejercicio actual (o al próximo de fuerza) y se confirman
    const i = fi >= 0 ? fi : S.F.findIndex(F => !F.done && !F.salteado); if (i < 0) { toast('Ya anotamos toda la fuerza'); return; }
    const f = fx(i), F = S.F[i], reps = [10, 10, 8].slice(0, f.sr); while (reps.length < f.sr) reps.push(8);
    DC = { i:i, reps:reps, kg:F.kg };
    $('#salaSheetIn').innerHTML = oido + '<div class="card deca"><b>' + f.n + '</b><span class="dekg">' + reps.join(' · ') + (DC.kg !== null ? ' <small>con</small> <b>' + fmtKg(DC.kg) + '</b> kg' : ' rep') + '</span></div><div class="grid2" style="gap:8px"><button class="btn sm" data-dc="ok">Confirmar</button><button class="btn ghost sm" data-dc="fix">Corregir</button></div>' + pie;
    $('#salaSheet').hidden = false;
  }
  $('#salaSheet').addEventListener('click', e => {
    if (e.target.closest('[data-avisa2]')) { $('#salaSheet').hidden = true; toast('Listo. Lucas te busca en la sala'); return; }
    const d = e.target.closest('[data-dc]'); if (!d || !DC || !SALA) return;
    const S = SALA, F = S.F[DC.i], cur = DC.i === curF(); F.reps = DC.reps.slice(); if (DC.kg !== null) F.kg = DC.kg;
    $('#salaSheet').hidden = true;
    if (d.dataset.dc === 'fix') { DC = null; if (cur) salaAjustar(); else { renderSala(); toast('Corregilo en ese ejercicio con Planilla'); } return; }
    const n = fx(DC.i).n; DC = null;
    if (cur) { salaListo(); toast('Anotado: ' + n.toLowerCase() + ''); return; }
    F.sets = F.sets.map(() => true); F.done = true; WK.reg = true; if (S.F.every(x => x.done || x.salteado) && !S.fueSumada) { S.fueSumada = true; WK.fue++; }
    renderForma(); renderToday(); renderSala(); toast('Anotado: ' + n.toLowerCase() + '');
  });
  acSync();
//#bloque 307
  // ===== v52 · T9 Modo estándar (docs/tickets/T9-modo-estandar.md) =====
  // Pantalla del ejercicio: indicación del profe con su tempo y Ritmo (metrónomo visual, apagado por defecto),
  // y tres accesos del mismo peso, plegados: Cómo se hace (video y 3D: cajas hasta decidir con el dueño) · Músculos · Planilla.
  var TEMPO_DEF = [2, 0, 1, 0];  // por defecto, si el profe no fijó uno (demo)
  var ANIMFIG = document.querySelector('#entrenando .animfig'), ANIMPAR = ANIMFIG ? ANIMFIG.parentNode : null, ANIMNEXT = ANIMFIG ? ANIMFIG.nextSibling : null;
  var BMAP = $('#bodymap') ? $('#bodymap').innerHTML : '';
  const baseK = i => { const k = SALA.P.fue[i].k; return lib[k] ? k : lib[k.replace(/H$/, '')] ? k.replace(/H$/, '') : null; };
  const exLib = i => { const k = baseK(i); return k ? lib[k] : null; };
  const exArr = () => EXP === 'arranco' || esMenor();
  const tempoTxt = t => 'Bajá en ' + t[0] + ' s' + (t[1] ? ' · pausa ' + t[1] : '') + ' · subí en ' + t[2] + (t[3] ? ' · pausa ' + t[3] : '');
  function bmapSvg(p, s, r){
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); g.innerHTML = BMAP;
    g.querySelectorAll('.m').forEach(m => { const k = m.getAttribute('data-m'); m.setAttribute('class', 'm' + (p.includes(k) ? ' p' : s.includes(k) ? ' s' : r.includes(k) ? ' r' : '')); });
    return g.innerHTML;
  }
  function mtrHtml(t){
    const T = t[0] + t[1] + t[2] + t[3], p = x => Math.round(x / T * 1000) / 10, a = p(t[0]), b = p(t[0] + t[1]), c = p(t[0] + t[1] + t[2]), id = 'mtr' + t.join('');
    return '<style>@keyframes ' + id + '{0%{transform:scaleY(1)}' + a + '%{transform:scaleY(.1)}' + b + '%{transform:scaleY(.1)}' + c + '%{transform:scaleY(1)}100%{transform:scaleY(1)}}</style>' +
      '<div class="smtr"><span class="tubo" aria-hidden="true"><i style="animation:' + id + ' ' + T + 's linear infinite"></i></span><span class="small muted">Seguí la barra: baja y sube con el peso. No hace falta contar.</span></div>';
  }
  function exCue(f, i){
    const L = exLib(i), F = SALA.F[i], ctl = f.ctl || (L ? L.tip : ''), t = f.tempo || TEMPO_DEF;
    return '<div class="scue' + (exArr() ? ' big' : '') + '"><p><b>' + (actual === 'profe' ? 'Lucas' : 'Tu profe') + ':</b> ' + ctl + '</p>' +
      '<div class="sctl"><span class="stmp">' + tempoTxt(t) + '</span><button class="stbtn" data-mtr="1" aria-pressed="' + !!F.ritmo + '">' + (F.ritmo ? 'Apagar ritmo' : 'Ritmo') + '</button></div>' +
      (F.ritmo ? mtrHtml(t) : '') + '</div>';
  }
  function exAcc(f, i){
    const S = SALA; if (S.panStep !== S.step) { S.pan = null; S.panStep = S.step; }
    const B = [['como', 'Cómo se hace'], ['mus', 'Músculos'], ['plan', 'Planilla']];
    return '<div class="sacc">' + B.map(b => '<button class="sacb' + (b[0] === 'como' && exArr() && !S.pan ? ' pri' : '') + '" data-pan="' + b[0] + '" aria-expanded="' + (S.pan === b[0]) + '">' + b[1] + '</button>').join('') + '</div>' +
      (S.pan ? '<div class="span">' + exPan(S.pan, f, i) + '</div>' : '');
  }
  function exPan(v, f, i){
    const L = exLib(i), F = SALA.F[i];
    if (v === 'como') {
      const mi = f.mirar || (L ? [L.tip] : []);
      return '<span class="spt">Qué mirar</span><ul class="smira">' + mi.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
        (esMenor() ? '<p class="shint">Tu profe te lo muestra en la sala.</p>' : '') +
        '<div class="svid"><span class="sfoto">Video de tu profe · muestra</span><svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 8v8l6-4z" fill="currentColor"/></svg><span class="small">' + f.n + ' · 20 s, guardado en el teléfono</span></div>' +
        (L && ANIMFIG ? '<div class="s3d" id="s3dHost"></div>' : '');
    }
    if (v === 'mus') {
      if (!L) return '<p class="shint">Tu profe te muestra qué trabaja.</p>';
      return '<div class="smus"><svg class="bmap" viewBox="0 0 160 150" role="img" aria-label="Músculos que trabaja">' + bmapSvg(L.mus, L.sec, []) + '</svg><div class="stack" style="gap:6px"><span><b>Principal:</b> ' + L.mus.map(k => musName[k]).join(' · ') + '</span>' +
        (L.sec.length ? '<span class="muted">También: ' + L.sec.map(k => musName[k]).join(' · ') + '</span>' : '') + '<span class="legend" style="justify-content:flex-start"><i class="lp"></i>Principal <i class="ls"></i>Secundario</span></div></div>';
    }
    let h = f.prev && !F.swap ? '<span class="small muted">La vez pasada: ' + fmtKg(f.prev) + ' kg · ' + f.sr + ' × ' + f.rep + '</span>' : '';
    if (F.kg) h += '<div class="sprow"><span>Carga</span><span class="sadj"><button class="opt" data-pk="-2.5" aria-label="Bajar 2,5 kg">−</button><b>' + fmtKg(F.kg) + ' kg</b><button class="opt" data-pk="2.5" aria-label="Subir 2,5 kg">+</button></span><span class="spgap"></span></div>';
    h += F.reps.map((r, j) => '<div class="sprow"><span>Serie ' + (j + 1) + '</span><span class="sadj"><button class="opt" data-pr="' + j + ':-1" aria-label="Menos">−</button><b>' + r + (f.seg ? ' s' : ' rep') + '</b><button class="opt" data-pr="' + j + ':1" aria-label="Más">+</button></span><button class="spchk' + (F.sets[j] ? ' on' : '') + '" data-set="' + j + '" aria-pressed="' + F.sets[j] + '" aria-label="Serie ' + (j + 1) + (F.sets[j] ? ', hecha' : '') + '">✓</button></div>').join('');
    return h + '<span class="small muted">Listo anota lo que está acá.</span>';
  }
  function exClick(e){
    const S = SALA, pn = e.target.closest('[data-pan]');
    if (pn) { S.pan = S.pan === pn.dataset.pan ? null : pn.dataset.pan; S.panStep = S.step; renderSala(); return true; }
    const i = curF(); if (i < 0) return false;
    const F = S.F[i], f = fx(i);
    if (e.target.closest('[data-mtr]')) { F.ritmo = !F.ritmo; renderSala(); return true; }
    const pk = e.target.closest('[data-pk]'); if (pk) { F.kg = Math.max(0, F.kg + +pk.dataset.pk); renderSala(); return true; }
    const pr = e.target.closest('[data-pr]'); if (pr) { const [j, d] = pr.dataset.pr.split(':').map(Number); F.reps[j] = Math.max(1, F.reps[j] + d * (f.seg ? 5 : 1)); renderSala(); return true; }
    return false;
  }
  // El 3D es un solo nodo: se muda a la caja de "Cómo se hace" y vuelve a la pantalla vieja cuando se cierra
  function exMount(){
    if (!ANIMFIG) return;
    const host = document.getElementById('s3dHost');
    if (host) { host.appendChild(ANIMFIG); const i = curF(), L = i >= 0 ? exLib(i) : null; if (L && curEx !== L) setAnim(L); }
    else if (ANIMFIG.parentNode !== ANIMPAR) ANIMPAR.insertBefore(ANIMFIG, ANIMNEXT);
  }
  $('#salaSheet').addEventListener('click', e => { if (!e.target.closest('[data-siempre]')) return; $('#salaSheet').hidden = true; renderSala(); toast('Le avisamos a Lucas: él decide si la cambia en tu rutina'); });
  // ---- Tu cuerpo hoy (Hoy): rutina de hoy encendida, lo trabajado como principal hace menos de 72 h atenuado. Estimación con el registro ----
  var DIAS_ULT = { A:dA[dA.length - 1], B:dB[dB.length - 1], C:dC[dC.length - 1] };  // días desde la última sesión registrada de cada día (demo)
  function cuerpoHoy(){
    const r = rutinas[actual], d = r.dias[r.next], hoy = [], rec = [], DU = DIAS_ULT || {};
    salaPlan().fue.forEach(f => { const k = lib[f.k] ? f.k : f.k.replace(/H$/, ''); if (lib[k]) lib[k].mus.forEach(m => { if (!hoy.includes(m)) hoy.push(m); }); });
    if (actual === 'profe') r.dias.forEach(x => { const da = DU[x.k]; if (x.k === d.k || da == null || da >= 3) return; x.ex.forEach(k => { if (lib[k]) lib[k].mus.forEach(m => { if (!hoy.includes(m) && !rec.includes(m)) rec.push(m); }); }); });
    return { hoy:hoy, rec:rec, d:d };
  }
  function recFrase(rec){
    const n = rec.map(k => musName[k].toLowerCase()), sing = rec.length === 1 && ['pecho', 'abdomen', 'antebrazo', 'trapecio'].includes(rec[0]);
    return (sing ? 'Tu ' : 'Tus ') + (n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0]) + (sing ? ' se recupera' : ' se recuperan');
  }
  function descansoHrec(){
    const el = $('#hCuerpo'); if (!el || !DIAS_ULT) return;  // antes de que corra el bloque 307, nada
    const c = cuerpoHoy(), fr = (c.rec.length ? recFrase(c.rec) + ': hoy ' : 'Hoy ') + c.d.n.toLowerCase();
    el.innerHTML = '<svg class="bmap" viewBox="0 0 160 150" role="img" aria-label="' + fr + '">' + bmapSvg(c.hoy, [], c.rec) + '</svg><div class="hcb"><span class="hct">Tu cuerpo hoy</span><span class="hcf">' + fr + '</span>' +
      '<span class="legend"><i class="lp"></i>Hoy' + (c.rec.length ? ' <i class="lr"></i>Se recupera' : '') + '</span><span class="small muted">Estimado con lo que registraste</span></div>';
  }
  descansoHrec();
  // ---- v53 · Rutinas como subsección (entrenar-propuesta.md § 11.1): ver el día antes de entrenar, ajustar carga y descanso, pedir cambios ----
  var RUT_VER = null, RUT_AJ = {};
  function rutEx(rid, i){
    const r = rutinas[rid], d = r.dias[i];
    if (rid === 'profe' && d.k === 'B') return SALA_B.fue.map(f => ({ k:f.k, n:f.n, sr:f.sr, rep:f.rep, kg:f.kg, seg:false }));
    return d.ex.map(k => { const st = lib[k].sets[0], kg = parseFloat(String(st[1]).replace(',', '.')); return { k:k, n:lib[k].n, sr:lib[k].sets.length, rep:parseInt(String(st[2]), 10) || 12, kg:isNaN(kg) ? null : kg, seg:esTiempo(k) }; });
  }
  function rutDetalle(rid, i){
    const r = rutinas[rid], d = r.dias[i];
    return '<div class="rdet"><span class="rdt">Día ' + d.k + ' · ' + d.n + '</span>' + rutEx(rid, i).map(x => {
      const a = RUT_AJ[x.k] || {}, kg = a.kg != null ? a.kg : x.kg, ds = a.desc || 90;
      return '<div class="rdex"><span class="rdn"><b>' + x.n + '</b><span class="small muted">' + x.sr + ' × ' + x.rep + (x.seg ? ' s' : '') + '</span></span>' +
        (kg != null ? '<span class="sadj"><button class="opt" data-rk="' + x.k + ':-2.5:' + kg + '" aria-label="Bajar 2,5 kg">−</button><b>' + fmtKg(kg) + ' kg</b><button class="opt" data-rk="' + x.k + ':2.5:' + kg + '" aria-label="Subir 2,5 kg">+</button></span>' : '<span class="small muted">Peso corporal</span>') +
        '<span class="sadj"><button class="opt" data-rd="' + x.k + ':-15:' + ds + '" aria-label="Menos descanso">−</button><b>' + ds + ' s</b><button class="opt" data-rd="' + x.k + ':15:' + ds + '" aria-label="Más descanso">+</button></span></div>';
    }).join('') + '<span class="small muted">Carga y descanso quedan para las próximas veces. Series y ejercicios: tu profe.</span>' +
      '<button class="btn sm" data-start="' + rid + ':' + i + '">Empezar el Día ' + d.k + '</button>' +
      (r.tipo === 'profe' ? '<button class="btn ghost sm" data-rpide="1">Pedile un cambio a Lucas</button>' : '') + '</div>';
  }
  function rutClick(e){
    const v = e.target.closest('[data-ver]'); if (v) { RUT_VER = RUT_VER === v.dataset.ver ? null : v.dataset.ver; renderRoutines(); return true; }
    const k = e.target.closest('[data-rk]'); if (k) { const [x, d, b] = k.dataset.rk.split(':'); RUT_AJ[x] = Object.assign(RUT_AJ[x] || {}, { kg:Math.max(0, +b + +d) }); renderRoutines(); renderEntHoy(); return true; }
    const r = e.target.closest('[data-rd]'); if (r) { const [x, d, b] = r.dataset.rd.split(':'); RUT_AJ[x] = Object.assign(RUT_AJ[x] || {}, { desc:Math.min(300, Math.max(30, +b + +d)) }); renderRoutines(); return true; }
    if (e.target.closest('[data-rpide]')) { toast('Le avisamos a Lucas. Lo ven juntos en la sala.'); return true; }
    return false;
  }
  // ---- v54 · Empezar ejercicio y transición cronometrada (entrenar-propuesta.md § 11.5) ----
  // Cada ejercicio de fuerza y el cardio arrancan en "Preparando": máquina, dónde está y tres acciones.
  // La transición se cronometra sumando, sin alarma; a los TRANS_MAX s la app ofrece otra máquina o hacerlo después, sin culpa.
  var TRANS_MAX = 180;
  function enPrep(st){ const S = SALA; if (!S || !st) return false; if (st === 'car') return !S.carGo; if (st[0] !== 'f') return false; const F = S.F[+st.slice(1)]; return !!F && !F.go && !F.done; }
  const trMmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function transTxt(){ return 'Entre ejercicios: ' + trMmss(SALA.trans || 0); }
  function prepHtml(st){
    const S = SALA, car = st === 'car', i = car ? -1 : +st.slice(1), f = car ? null : fx(i), F = car ? null : S.F[i];
    const ult = !car && i === S.F.length - 1;
    const llena = !car && SALA_LLENA && i === 0 && !S.llenaOk && S.P.fue.length > 1 && S.P.fue.some(x => x.k === 'curl') && S.P.fue[0].k !== 'curl';
    let h = '<span class="sprep">Preparando · ' + (car ? 'cardio' : 'ejercicio ' + (i + 1) + ' de ' + S.F.length) + '</span>';
    if (llena) h += '<div class="schk sllena"><span class="schq">La zona de espalda está llena</span><span class="small muted">' + f.n + ' está ocupada. ¿Empezamos por bíceps?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-ll="dale">Sí</button><button class="btn ghost sm" data-ll="no">No, sigo así</button></div></div>';
    h += '<div class="smaq">' + maqSvg(car ? 'cinta' : f.maq) + '<span class="sfoto">Foto de la sede</span></div><span class="szona">' + (car ? S.P.car.zona : f.zona) + '</span>' +
      '<h2 class="sname">' + (car ? S.P.car.maq + ' · ' + S.P.car.txt : f.n) + '</h2>' +
      (car ? '<div class="sload"><b>' + S.carMin + '</b> min</div>' : '<div class="sload">' + f.sr + ' × ' + F.reps[0] + (f.seg ? ' s' : '') + (F.kg ? ' · <b>' + fmtKg(F.kg) + '</b> kg' : '') + '</div>') +
      '<p class="strans" id="sTrans">' + transTxt() + '</p>';
    if ((S.esp || 0) >= TRANS_MAX && !car) h += '<div class="schk"><span class="schq">¿Probamos otra máquina o pasamos al siguiente?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-pr2="ocup">Otra máquina</button>' + (ult ? '' : '<button class="btn ghost sm" data-pr2="desp">Hacerlo después</button>') + '</div></div>';
    if (!car) h += '<div class="grid2 sprepb"><button class="btn ghost sm" data-pr2="ocup">Está ocupada</button>' + (ult ? '' : '<button class="btn ghost sm" data-pr2="desp">Hacer después</button>') + '</div>';
    return h;
  }
  function prepEmpezar(){
    const S = SALA, st = steps()[S.step];
    if (st === 'car') S.carGo = true; else S.F[+st.slice(1)].go = true;
    S.trLog = S.trLog || []; S.trLog.push({ paso:st === 'car' ? 'car' : fx(+st.slice(1)).k, seg:S.trans || 0 });
    S.trans = 0; S.el = 0; S.vence = false; S.repreg = false; S.llenaOk = true;
    renderSala();
  }
  function hacerDespues(){
    const S = SALA, i = curF(); if (i < 0 || i >= S.F.length - 1) return;
    const pf = S.P.fue.splice(i, 1)[0], pF = S.F.splice(i, 1)[0]; S.P.fue.push(pf); S.F.push(pF);
    S.el = 0; S.vence = false; S.repreg = false; S.pan = null; S.esp = 0;
    $('#salaSheet').hidden = true; renderSala(); toast('Lo dejamos para el final de la fuerza');
  }
  $('#salaBody').addEventListener('click', e => {
    const b = e.target.closest('[data-pr2]'); if (!b || !SALA) return;
    if (b.dataset.pr2 === 'ocup') salaCambiarOcupada(); else hacerDespues();
  });
  $('#salaSheet').addEventListener('click', e => { if (e.target.closest('[data-despues]')) hacerDespues(); else if (e.target.closest('[data-alt]') && SALA) SALA.esp = 0; });  // otra máquina: la espera vuelve a cero
  // Reloj de la sesión: entrenando · descansando · entre ejercicios (no cuenta la pausa). Con la demo rápida, ×10
  setInterval(() => {
    const S = SALA; if (!S || S.pausa || MOM !== 'sesion' || S.cerrada) return;
    const st = steps()[S.step], v = mtVel();
    if (S.trStep !== S.step) { S.trStep = S.step; S.esp = 0; if (enPrep(st)) S.trans = 0; }
    S.tEj = S.tEj || 0; S.tDesc = S.tDesc || 0; S.tTrans = S.tTrans || 0;
    if (enPrep(st)) {
      const antes = S.esp || 0; S.trans = (S.trans || 0) + v; S.esp = antes + v; S.tTrans += v;
      if (curScr === 'sala') { if (antes < TRANS_MAX && S.trans >= TRANS_MAX) renderSala(); else { const el = $('#sTrans'); if (el) el.textContent = transTxt(); } }
    } else if (st[0] === 'f' && S.rest > 0) S.tDesc += v;
    else S.tEj += v;
  }, 1000);
  function tiemposHtml(S){
    const tot = (S.tEj || 0) + (S.tDesc || 0) + (S.tTrans || 0); if (tot < 60) return '';
    const m = x => Math.round(x / 60);
    return '<p class="ctiempos">' + m(tot) + ' min: ' + m(S.tEj) + ' entrenando, ' + m(S.tDesc) + ' descansando, ' + m(S.tTrans) + ' entre ejercicios.</p>';
  }
