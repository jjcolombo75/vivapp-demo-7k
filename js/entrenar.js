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
  const hoyLbl = (() => { const d = new Date(); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); })();
  // Historial de ejemplo: mejor marca por sesión (kg; en plancha, segundos)
  const hist = {
    remo:[['15/09',37.5],['22/09',40],['29/09',40],['06/10',40],['13/10',40]],
    jalon:[['15/09',40],['22/09',42.5],['29/09',45],['06/10',45],['13/10',45]],
    curl:[['15/09',8],['22/09',8],['29/09',10],['06/10',10],['13/10',10]],
    sentadilla:[['16/09',12],['23/09',14],['30/09',14],['07/10',14],['14/10',14]],
    press:[['17/09',6],['24/09',8],['01/10',8],['08/10',8],['15/10',8]],
    puente:[['16/09',0],['23/09',0],['30/09',5],['07/10',10],['14/10',10]],
    plancha:[['16/09',25],['23/09',30],['30/09',30],['07/10',35],['14/10',35]]
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
    stopRest(); renderRoutines(); renderToday(); renderAvance(); renderRecords(); renderCarga();
    $('#mesCount').textContent = String(+$('#mesCount').textContent + 1);
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
    if (rig && curEx && !$('#entrenando').hidden) {
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
  $('#recMap').innerHTML = $('#bodymap').innerHTML;
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
      { k:'remo', n:'Remo sentado', maq:'remo', zona:'Zona espalda · al fondo, a la izquierda', sr:3, rep:12, kg:42.5, prev:40, alt:[{ n:'Remo con apoyo de pecho', zona:'Zona espalda · al fondo, a la derecha', kg:35, maq:'remo' }, { n:'Remo en polea baja', zona:'Zona poleas · junto a la columna', kg:40, maq:'polea' }] },
      { k:'jalon', n:'Jalón al pecho', maq:'jalon', zona:'Zona espalda · al fondo, al centro', sr:3, rep:12, kg:45, prev:45, alt:[{ n:'Jalón con agarre neutro', zona:'Zona espalda · al fondo, al centro', kg:42.5, maq:'jalon' }, { n:'Dominadas asistidas', zona:'Zona espalda · contra la pared', kg:null, maq:'jalon' }], hombro:{ n:'Remo con apoyo de pecho', zona:'Zona espalda · al fondo, a la derecha', kg:35, maq:'remo' } },
      { k:'curl', n:'Curl de bíceps en máquina', maq:'curl', zona:'Zona brazos · junto a los espejos', sr:3, rep:12, kg:20, prev:20, alt:[{ n:'Curl con mancuernas', zona:'Zona peso libre', kg:10, maq:'curl' }, { n:'Curl en polea', zona:'Zona poleas · junto a la columna', kg:15, maq:'polea' }] }
    ],
    car:{ maq:'Cinta', min:12, txt:'caminata en subida', zona:'Zona cardio · frente a las ventanas' }
  };
  const ALT_G = { sentadilla:['Prensa de piernas', 'Sentadilla en máquina Smith'], puente:['Hip thrust en máquina', 'Puente a una pierna'], plancha:['Plancha con rodillas apoyadas', 'Dead bug en colchoneta'], press:['Press de hombros en máquina', 'Press con mancuernas sentado'] };
  var SALA = null, CORTO = false, CUIDA = null;
  // v42 · cuidar completo y estados de la demo (instrucción de Entrenar, secciones 7 y 11)
  // MOLESTIA: la molestia guardada con consentimiento (dato de salud). CUIDA: lo que se cuida HOY. CHK: la respuesta de hoy.
  var MOLESTIA = null, PEOR = false, CHK = null, RESOLVER = false, AVISO_PROFE = false;
  var ETAPA = 'normal', EXP = 'habitual', SALA_LLENA = false, SIN_SENAL = false, NOENT = false, LIM = {}, CIERRE_K = [];
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
    if (RESOLVER) return '<div class="schk chkfu"><span class="schq">¿Lo damos por resuelto? ⚡</span><span class="small muted">Dos veces seguidas nos dijiste que está bien.</span><div class="grid2" style="gap:8px"><button class="btn sm" data-fu="res">Sí</button><button class="btn ghost sm" data-fu="nores">Todavía no</button></div></div>';
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
    if (v === 'res') { MOLESTIA = null; CUIDA = null; RESOLVER = false; toast('Resuelto ⚡ Borramos el dato y no te preguntamos más'); }
    if (v === 'nores') { RESOLVER = false; toast('Dale, te seguimos preguntando'); }
    if (v === 'avisa') { AVISO_PROFE = false; toast('Listo. Lucas sabe que hoy ' + zt + ' está peor ⚡'); }
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
    return P;
  }
  const planMin = P => P.act.min + P.fue.length * 8 + P.car.min;
  function salaProg(){ if (!SALA) return [0, 0, 0]; const n = SALA.F.length; return [SALA.actDone ? 1 : 0, n ? SALA.F.filter(f => f.done).length / n : 0, SALA.carDone ? 1 : 0]; }
  // ---- Hoy ----
  let hOpen = -1;
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
    $('#hNota').innerHTML = nota; $('#hNota').hidden = !nota;
    $('#hCorto').innerHTML = CORTO ? 'Volver a la versión completa' : '¿Poco tiempo? <b>Hacé la versión de 30 min</b>'; $('#hCorto').hidden = MOM === 'sesion';
    const b = $('#hEmpezar'), ses = MOM === 'sesion';
    b.parentElement.hidden = !!pausa;
    b.className = 'accbtn' + (MOM === 'sala' ? ' on go' : ses ? ' on' : '');
    b.innerHTML = (ses ? ICO_SES : ICO_PLAY).replace('<svg ', '<svg width="20" height="20" ') + '<span>' + (ses ? 'Volver a tu sesión' : 'Empezar · Día ' + d.k) + '</span>';
  }
  $('#hParts').addEventListener('click', e => { const b = e.target.closest('[data-hp]'); if (!b) return; const i = +b.dataset.hp; hOpen = hOpen === i ? -1 : i; renderEntHoy(); });
  $('#hCorto').addEventListener('click', () => { CORTO = !CORTO; renderEntHoy(); renderToday(); toast(CORTO ? 'Versión de 30 minutos: las tres partes, más cortas' : 'Volviste a la versión completa'); });
  $('#hEmpezar').addEventListener('click', () => { if (MOM === 'sesion') { if (!SALA) salaDemo(); renderSala(); go('sala'); } else salaStart(); });
  // ---- Modo sala ----
  function salaNew(){ const P = salaPlan(); return { P:P, step:0, actDone:false, F:P.fue.map(f => ({ sets:Array(f.sr).fill(false), done:false, salteado:false, kg:f.kg, reps:Array(f.sr).fill(f.rep), swap:null })), carDone:false, carMin:P.car.min, t0:Date.now(), saludo:true, chk:false, rest:0, crono:0 }; }
  function salaStart(){
    if (MOM !== 'sala' && MOM !== 'sesion' && !NOENT) setMom('sala', true);
    SALA = salaNew(); SALA.chk = !prep.done;
    MOM = 'sesion'; syncMomPick();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { if (SALA) SALA.lock = l; }).catch(() => {}); } catch (_) {}
    renderForma(); renderHoy(); renderToday(); renderAcc(); renderEntHoy();
    renderSala(); go('sala');
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
    $('#salaPos').textContent = st === 'act' ? 'Activación' : st === 'car' ? 'Cardio' : 'Fuerza · ' + (fi + 1) + ' de ' + S.F.length;
    const voz = t => '<p class="sv">' + SV_BOLT + '<span>' + t + '</span></p>';
    let h = '';
    if (SIN_SENAL) h += '<p class="snosig"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M3 3l18 18"/></svg>Sin señal: guardamos todo y lo subimos después.</p>';
    const dk = rutinas[actual].dias[rutinas[actual].next].k;
    if (S.saludo && st === 'act') h += voz((NOENT ? 'Arrancamos ⚡' : 'Llegaste a Sarmiento ⚡') + (ETAPA === 'vuelvo' ? ' Volviste: hoy vamos al 80% de lo que hacías.' : ' Hoy toca el Día ' + dk + ': arrancamos con ' + P.act.min + ' minutos de activación.'));
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
      if (f.prev && F.kg > f.prev && !F.swap) h += voz('La vez pasada hiciste ' + fmtKg(f.prev) + ' kg completo: hoy probá ' + fmtKg(F.kg) + ' ⚡');
      else if (f.lim && !F.swap) h += voz('La vez pasada fue al límite: hoy repetimos ' + fmtKg(F.kg) + ' kg');
      else if (f.vuelvo && !F.swap) h += '<p class="shint">Al 80% de la vez pasada (' + fmtKg(f.prev) + ' kg).</p>';
      if (f.cambiado) h += '<p class="shint">Hoy en lugar de ' + f.cambiado.toLowerCase() + ', para cuidar tu hombro.</p>';
      if (S.rest > 0) {
        h += '<div class="srest" role="timer"><span class="srt">' + Math.floor(S.rest / 60) + ':' + String(S.rest % 60).padStart(2, '0') + '</span><span class="small muted">' + (F.sets.indexOf(false) >= 0 ? 'Siguiente: serie ' + (F.sets.indexOf(false) + 1) + ' de ' + f.sr : 'Siguiente: ' + (fi + 1 < S.F.length ? fx(fi + 1).n : 'el cardio')) + '</span><button class="link lime" id="sSkipRest">Saltear descanso</button></div>';
      } else {
        h += '<div class="sdots"><span class="small muted">Series</span>' + F.sets.map((x, j) => '<button class="sdot' + (x ? ' on' : '') + '" data-set="' + j + '" aria-label="Serie ' + (j + 1) + (x ? ', hecha' : '') + '">' + (j + 1) + '</button>').join('') + '<button class="link lime" id="sAjustar">Ajustar</button></div>';
      }
      h += '<div class="srow"><button class="btn ghost sm" id="sCambiar">Cambiar</button><button class="link" id="sComo">Ver cómo se hace</button></div>';
    }
    $('#salaBody').innerHTML = h;
    $('#salaListo').textContent = st === 'car' ? 'Listo · terminar' : 'Listo';
  }
  function salaListo(){
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
    const ll = e.target.closest('[data-ll]');
    if (ll) { const v = ll.dataset.ll; S.llenaOk = true;
      if (v === 'dale') { const i = S.P.fue.findIndex(x => x.k === 'curl'); const pf = S.P.fue.splice(i, 1)[0], pF = S.F.splice(i, 1)[0]; S.P.fue.unshift(pf); S.F.unshift(pF); toast('Arrancamos por bíceps. Espalda, cuando se libere'); }
      if (v === 'otra') { renderSala(); return salaCambiarOcupada(); }
      renderSala(); return; }
    const sd = e.target.closest('[data-set]');
    if (sd) { const F = S.F[curF()], j = +sd.dataset.set; F.sets[j] = !F.sets[j]; if (F.sets[j] && F.sets.indexOf(false) >= 0) { S.rest = 90; clearInterval(restT); restT = setInterval(() => { if (!SALA || SALA.rest <= 0) { clearInterval(restT); return; } SALA.rest--; if (curScr === 'sala') renderSala(); }, 1000); } renderSala(); return; }
    if (e.target.closest('#sSkipRest')) { S.rest = 0; clearInterval(restT); renderSala(); return; }
    if (e.target.closest('#sAjustar')) return salaAjustar();
    if (e.target.closest('#sAjCar')) { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Minutos de cardio</span><div class="sadj"><button class="opt" data-cm="-5">−5</button><b id="sCarMin">' + S.carMin + ' min</b><button class="opt" data-cm="5">+5</button></div><button class="btn" data-close>Listo</button>'; $('#salaSheet').hidden = false; return; }
    if (e.target.closest('#sCrono')) { S.cronoOn = !S.cronoOn; clearInterval(cronoT); if (S.cronoOn) cronoT = setInterval(() => { if (!SALA || !SALA.cronoOn) { clearInterval(cronoT); return; } SALA.crono++; if (curScr === 'sala') renderSala(); }, 1000); renderSala(); return; }
    if (e.target.closest('#sCambiar')) return salaCambiar();
    if (e.target.closest('#sComo')) { toast('Abre el video de tu profe o el maniquí 3D de este ejercicio'); return; }
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
    $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Otras de tu sede</span><span class="small muted">Trabajan lo mismo. Es solo por hoy y el registro sigue.</span>' + (base.alt.length ? base.alt.map((a, i) => '<button class="scmb" data-alt="' + i + '"><b>' + a.n + '</b><span>' + a.zona + (a.kg ? ' · ' + fmtKg(a.kg) + ' kg' : '') + '</span></button>').join('') : '<span class="muted">Hoy no tenemos otra igual en tu sede. Probá esperar un minuto o saltealo.</span>');
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
      if (z.dataset.z === 'profe') { CUIDA = null; chkFin('profe'); toast('Listo. Lucas sabe que querés hablarlo ⚡'); }
      else { CUIDA = z.dataset.z; PEOR = false; chkFin('cuidar'); toast(CUIDA === 'Hombro' ? 'Cambiamos el jalón por remo con apoyo de pecho' : 'Hoy evitamos lo que carga ' + zonaTxt(CUIDA)); }
      return close(); }
    const mz = e.target.closest('[data-mz]');
    if (mz) { $('#salaSheet').hidden = true; CUIDA = null; chkFin('menor'); if (mz.dataset.mz === 'avisa') toast('Listo. Lucas te busca en la sala ⚡'); return close(); }
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
    if (e.target.closest('[data-avisa]')) { toast('Listo. Lucas sabe que estás en ' + fx(curF()).n.toLowerCase() + ' ⚡'); return close(); }
    if (e.target.closest('[data-como]')) { toast('Abre el video de tu profe o el maniquí 3D'); return close(); }
    if (e.target.closest('[data-fin]')) { $('#salaSheet').hidden = true; return salaCerrar(); }
  });
  $('#salaMenu').addEventListener('click', () => { $('#salaSheetIn').innerHTML = '<span class="h2" style="font-size:24px">Tu sesión</span><button class="btn ghost" data-close>Seguir entrenando</button><button class="btn ghost" data-fin="1">Terminar acá</button><span class="small muted" style="line-height:1.45">Guardamos lo que marcaste. Si la dejás abierta, se cierra sola a las 3 horas.</span>'; $('#salaSheet').hidden = false; });
  // ---- Cierre: una pantalla y una pregunta ----
  function salaCerrar(){
    const S = SALA; if (!S) return;
    clearInterval(restT); clearInterval(cronoT); try { if (S.lock) S.lock.release(); } catch (_) {}
    const prog = salaProg(), completa = prog.every(x => x >= 1), r = rutinas[actual], d = r.dias[r.next];
    const min = Math.round(planMin(S.P) * (completa ? 1.05 : 0.6));
    const remo = S.P.fue.findIndex(f => f.k === 'remo'), rec = remo >= 0 && S.F[remo].done && !S.F[remo].swap && S.F[remo].kg > (S.P.fue[remo].prev || 99) && EXP !== 'arranco' && !esMenor();
    if (rec) { const h = hist.remo; if (h) { const last = h[h.length - 1]; if (last[0] === hoyLbl) last[1] = S.F[remo].kg; else h.push([hoyLbl, S.F[remo].kg]); } }
    CIERRE_K = S.P.fue.filter((f, i) => S.F[i].done && !S.F[i].swap).map(f => f.k);
    r.next = (r.next + 1) % r.dias.length; const nx = r.dias[r.next];
    if (!NOENT) { hoyEntreno = true; visHoy = true; } MOM = 'despues'; sesHecha = true; syncMomPick();
    renderForma(); renderHoy(); renderToday(); renderAcc(); renderEntHoy(); renderRoutines();
    const lect = completa && (EXP === 'arranco' || esMenor()) ? 'Hiciste tu tercera sesión completa. Lo estás haciendo bien ⚡'
      : completa ? 'Sesión completa en ' + min + ' minutos.' + (rec ? ' En remo subiste a ' + fmtKg(S.F[remo].kg) + ' kg ⚡' : ' ⚡')
      : 'Guardamos lo que hiciste ⚡ ' + [S.actDone ? 'la activación' : '', S.F.filter(f => f.done).length ? S.F.filter(f => f.done).length + (S.F.filter(f => f.done).length === 1 ? ' ejercicio' : ' ejercicios') + ' de fuerza' : ''].filter(Boolean).join(' y ') + '.';
    renderSemana(); const sv = $('#wkBox .eqsvg'), comp = semCompleta(), cump = semCumplida();
    $('#cierreBody').innerHTML = '<span class="tagi m cbig"><span>' + (completa ? '¡Listo!' : 'Guardado') + '</span></span>' +
      '<p class="sv big">' + SV_BOLT + '<span>' + lect + '</span></p>' +
      '<div class="card cisem"><div class="between"><span class="wktit"><span class="sig"><b>Tu</b> <i>semana</i></span>' + (comp ? '<span class="tagi sm"><span>Completa</span></span>' : cump ? '<span class="wkleg2">· Cumplida</span>' : '') + '</span></div>' + (sv ? sv.outerHTML : '') + '</div>' +
      (rec ? '<div class="card cilog"><span style="font-weight:700">Récord en remo sentado: ' + fmtKg(S.F[remo].kg) + ' kg ⚡</span><button class="flowshare" id="ciShare"><svg class="bolt-ico" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg> Contalo en tus historias</button></div>' : '') +
      (NOENT ? '<span class="small muted cinoent">Tu sesión encendió tu semana. La visita se suma cuando llegue tu entrada.</span>' : '') +
      (CHK === 'cuidar' && CUIDA && !MOLESTIA && !esMenor() ? '<div class="card ciq"><span style="font-weight:700">¿Querés que tengamos en cuenta tu ' + CUIDA.toLowerCase() + ' las próximas veces?</span><div class="grid2" style="gap:8px"><button class="btn sm" data-cq="si">Sí, tenelo en cuenta</button><button class="btn ghost sm" data-cq="no">No, era por hoy</button></div></div>'
        : '<div class="card ciq"><span style="font-weight:700">¿Cómo estuvo?</span><div class="opts g3" id="ciFeel"><button class="opt" data-fl="liviana">Liviana</button><button class="opt" data-fl="justa">Justa</button><button class="opt" data-fl="limite">Al límite</button></div></div>') +
      '<div class="cinext"><span class="small muted">Tu próxima</span><span style="font-weight:700;font-size:17px">Día ' + nx.k + ' · ' + nx.n.toLowerCase() + '</span></div>' +
      '<button class="btn" data-go="inicio">Volver a tu inicio</button>';
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

