/* Vivapp · Mural VIVA (T20): el mural, People (antes Gente), mensajes y chat.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 120
  // ===== Comunidad: compañeros de entrenamiento (perfiles de ejemplo, todos mayores de 18) =====
  const perfiles = {
    entrenar: [
      { id:'q1', n:'Joaquín', e:34, sede:'Sarmiento', c:['#4f7d3a','#152410'], likesMe:true },
      { id:'q2', n:'Carla', e:26, sede:'Alberdi', c:['#9a4f8a','#2c1028'] },
      { id:'q3', n:'Diego', e:41, sede:'Sarmiento', c:['#7a7a3a','#262610'], likesMe:true },
      { id:'q4', n:'Florencia', e:23, sede:'Santa Ana', c:['#3a6a9a','#0f2034'] }
    ]
  };
  const asistentes = [
    { id:'a1', n:'Agustina', e:29, sede:'López y Planes', c:['#a0603a','#301a0c'], likesMe:true, ev:true },
    { id:'a2', n:'Martín', e:33, sede:'Sarmiento', c:['#3a8a7a','#0e2a24'], ev:true }
  ];
  const conv = [
    { id:'c1', n:'Valentina', modo:'entrenar', sede:'Corrientes', c:['#a85a5a','#2e1212'], gym:false, msgs:[['ella','¡Hola! Vi que también buscás con quién entrenar'],['yo','¡Sí! Casi siempre a las 19. ¿Hacemos espalda el martes?']] , unread:true },
    { id:'c2', n:'Ramiro', modo:'entrenar', sede:'Sarmiento', c:['#5a7aa8','#141e2e'], gym:false, msgs:[['ella','¿Hacemos piernas juntos el jueves?']], unread:true }
  ];
  let fil = 'todas', deckList = [], cur = null, chatId = null, asistMode = false;
  const miSede = 'Sarmiento';
  const inicial = n => n.charAt(0);
  const grad = c => 'linear-gradient(160deg,' + c[0] + ',' + c[1] + ')';


  // Match
  let lastMatch = null;
  function showMatch(p, kind){
    lastMatch = p;
    const ent = kind !== 'conocer';
    $('#mvTitle').textContent = ent ? '¡A entrenar!' : '¡Les interesa conocerse!';
    $('#mvTxt').textContent = ent ? 'A ' + p.n + ' y a vos les interesa entrenar juntos.' : 'A ' + p.n + ' y a vos les interesa conocerse. Arranquen con algo simple: entrenar juntos o ir a un evento.';
    $('#mvAv').textContent = inicial(p.n); $('#mvAv').style.background = grad(p.c);
    $('#mvMsg').textContent = 'Proponer un plan';
    $('#matchOv').hidden = false;
    if (!conv.find(c => c.id === 'm' + p.id)) conv.unshift({ id:'m' + p.id, n:p.n, modo: ent ? 'entrenar' : 'conocer', sede:p.sede, c:p.c, gym:false, msgs:[], nuevo:true });
    renderMatches();
  }
  $('#mvKeep').addEventListener('click', () => $('#matchOv').hidden = true);
  $('#mvMsg').addEventListener('click', () => { $('#matchOv').hidden = true; openChat('m' + lastMatch.id); $('#invSheet').hidden = false; });

  function renderMatches(){
    const nuevos = conv.filter(c => !c.msgs.length);
    $('#newMatches').innerHTML = nuevos.length ? nuevos.map(c => '<button class="mnew" data-chat="' + c.id + '"><span class="av md" style="background:' + grad(c.c) + '">' + inicial(c.n) + (c.gym ? '<i class="gdot"></i>' : '') + '</span><span class="small">' + c.n + '</span></button>').join('') : '<span class="small muted">Sin compañeros nuevos.</span>';
    $('#convList').innerHTML = conv.filter(c => c.msgs.length).map(c => {
      const last = c.msgs[c.msgs.length - 1];
      return '<button class="convrow" data-chat="' + c.id + '"><span class="av md" style="background:' + grad(c.c) + '">' + inicial(c.n) + (c.gym ? '<i class="gdot"></i>' : '') + '</span>' +
        '<span class="stack" style="gap:2px;flex:1;min-width:0;text-align:left"><span style="font-weight:700">' + c.n + ' <span class="mtag">' + c.sede + '</span></span><span class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (last[0] === 'yo' ? 'Vos: ' : '') + (last[2] ? last[2] : last[1]) + '</span>' +
        (c.gym ? '<span class="small" style="color:var(--ok);font-weight:700">En el gimnasio ahora</span>' : '') + '</span>' + (c.unread ? '<i class="udot" aria-label="Sin leer"></i>' : '') + '</button>';
    }).join('') || '<div><span class="small muted">Todavía no tenés conversaciones.</span></div>';
    const n = conv.filter(c => c.unread || !c.msgs.length).length;
    $('#mBadge').textContent = n; $('#mBadge').hidden = !n;
  }
  $('#matches').addEventListener('click', e => { const b = e.target.closest('[data-chat]'); if (b) openChat(b.dataset.chat); });

  // Chat
  function openChat(id){
    chatId = id; const c = conv.find(x => x.id === id); c.unread = false;
    $('#chAv').textContent = inicial(c.n); $('#chAv').style.background = grad(c.c);
    $('#chName').textContent = c.n; $('#chSub').textContent = (c.modo === 'conocer' ? 'Conexión' : 'Para entrenar') + ' · ' + c.sede;
    $('#chMenu').hidden = true; $('#invSheet').hidden = true;
    renderMsgs(); renderMatches(); go('chat');
  }
  function renderMsgs(){
    const c = conv.find(x => x.id === chatId);
    const locked = c.nuevo && !c.msgs.some(m => m[0] === 'card');
    $('#msgIn').disabled = locked; $('#msgIn').placeholder = locked ? 'Primero proponé un plan' : 'Escribí un mensaje';
    $('#msgs').innerHTML = (c.msgs.length ? '' : '<p class="small muted" style="text-align:center;margin:20px 0;line-height:1.45">Arranquen con un plan: proponé entrenar juntos o ir a un evento. Después se habilita el chat.</p>') +
      c.msgs.map(m => m[0] === 'card' ? '<div class="mcard">' + m[1] + '</div>' : '<div class="msg ' + (m[0] === 'yo' ? 'me' : 'them') + '">' + m[1] + '</div>').join('');
    $('#msgs').scrollTop = $('#msgs').scrollHeight;
  }
  const esc = t => t.replace(/[&<>]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[ch]));
  $('#composer').addEventListener('submit', e => {
    e.preventDefault(); const t = $('#msgIn').value.trim(); if (!t) return;
    conv.find(x => x.id === chatId).msgs.push(['yo', esc(t)]); $('#msgIn').value = ''; renderMsgs(); renderMatches();
  });
  const pushCard = (html, resumen) => { const c = conv.find(x => x.id === chatId); c.msgs.push(['card', html, resumen]); renderMsgs(); renderMatches(); };
  $('#qInv').addEventListener('click', () => $('#invSheet').hidden = false);
  $('#invCancel').addEventListener('click', () => $('#invSheet').hidden = true);
  $('#invSend').addEventListener('click', () => {
    $('#invSheet').hidden = true;
    pushCard('<span class="lbl">Invitación a entrenar</span><span class="h2">' + $('#invDia').value + ' · ' + $('#invHora').value + '</span><span class="small muted">' + $('#invSede').value + '</span><span class="small" style="color:var(--dat);font-weight:700">Esperando respuesta</span>', 'Invitación a entrenar');
    toast('Invitación enviada');
  });
  $('#qDuo').addEventListener('click', () => pushCard('<span class="lbl">Entrenamiento en dúo</span><span style="font-weight:700">Vos + una amiga con ' + conv.find(x => x.id === chatId).n + ' + un amigo</span><span class="small muted">Cuando acepten, cada uno suma a su compañero.</span>', 'Propuesta de entrenamiento en dúo'));
  $('#qRut').addEventListener('click', () => pushCard('<span class="lbl">Rutina compartida · IA</span><span style="font-weight:700">Full body en pareja · 45 min</span><span class="small muted">6 ejercicios alternados, armada con las máquinas de ' + conv.find(x => x.id === chatId).sede + '.</span>', 'Rutina compartida'));
  $('#chMenuBtn').addEventListener('click', () => $('#chMenu').hidden = !$('#chMenu').hidden);
  const quitar = msg => { const i = conv.findIndex(x => x.id === chatId); conv.splice(i, 1); renderMatches(); go('matches'); toast(msg); };
  $('#chUnmatch').addEventListener('click', () => quitar('Lo quitaste de tus compañeros'));
  $('#chBlock').addEventListener('click', () => quitar('Bloqueado. No van a volver a verse.'));
  $('#chReport').addEventListener('click', () => quitar('Denuncia enviada. La revisa el equipo de Viva.'));
//#bloque 220
  // ===== Gente: perfiles para seguir, interés privado y mutuo =====
  const gente = [
    { id:'g1', n:'Joaquín', e:34, sede:'Sarmiento', int:['entrenar','amigos'], tags:['Fuerza','Running'], c:['#4f7d3a','#152410'], likesMe:true, ev:true },
    { id:'g2', n:'Carla', e:26, sede:'Alberdi', int:['amigos','conocer'], tags:['Cardio','Yoga'], c:['#9a4f8a','#2c1028'], ev:true },
    { id:'g3', n:'Diego', e:41, sede:'Sarmiento', int:['entrenar'], tags:['Fuerza'], c:['#7a7a3a','#262610'], likesMe:true },
    { id:'g4', n:'Florencia', e:31, sede:'Sarmiento', int:['conocer','amigos'], tags:['Bici','Trekking'], c:['#3a6a9a','#0f2034'], likesMe:true },
    { id:'g5', n:'Martín', e:29, sede:'López y Planes', int:['entrenar','conocer'], tags:['Fútbol','Fuerza'], c:['#3a8a7a','#0e2a24'] }
  ];
  const intLbl = { entrenar:'Entrenar juntos', amigos:'Hacer amigos', conocer:'Abierto a conocer a alguien' };
  const miGente = { on:false, int:['entrenar'] };
  const siguiendo = new Set(), intereses = new Set(), ocultos = new Set();
  const intsDe = box => $$(box + ' .opt').filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.int);
  function syncInt(){ ['#intOpts', '#perfInt'].forEach(sel => $$(sel + ' .opt').forEach(b => b.setAttribute('aria-pressed', miGente.int.includes(b.dataset.int)))); }
  ['#intOpts', '#perfInt'].forEach(sel => $(sel).addEventListener('click', e => {
    const b = e.target.closest('[data-int]'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
    let ints = intsDe(sel); if (!ints.length) { b.setAttribute('aria-pressed', 'true'); ints = [b.dataset.int]; }
    miGente.int = ints; syncInt(); renderGente();
  }));
  $('#gOn').addEventListener('click', () => {
    if (!$('#gDes').checked) { toast('Aceptá las normas para activar'); return; }
    miGente.on = true; $('#swGente').checked = true; renderGente(); toast('Tu perfil de People está activo');
  });
  $('#swGente').addEventListener('change', e => { miGente.on = e.target.checked; renderGente(); toast(miGente.on ? 'Aparecés en People' : 'Ya no aparecés en People'); });
  function visibles(p){ return p.int.filter(i => miGente.int.includes(i)); }
  function renderGente(){
    $('#genteOff').hidden = miGente.on; $('#genteOnBox').hidden = !miGente.on;
    $('#myInt').textContent = 'Buscás: ' + miGente.int.map(i => intLbl[i].toLowerCase()).join(' · ');
    const list = (asistMode ? gente.filter(p => p.ev) : gente).filter(p => !ocultos.has(p.id) && visibles(p).length && (fil === 'todas' || p.sede === miSede));
    $('#deckNote').hidden = !asistMode; $('#deckNote').textContent = 'Asistentes de After Train · 11/10';
    $('#gente').innerHTML = list.length ? list.map(p => {
      const v = visibles(p), conoce = v.includes('conocer') || v.includes('amigos'), sig = siguiendo.has(p.n), it = intereses.has(p.id);
      return '<div class="pcard"><div style="display:flex;gap:12px;align-items:center"><span class="av md" style="background:' + grad(p.c) + '">' + inicial(p.n) + '</span>' +
        '<span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + p.n + ', ' + p.e + ' <span class="mtag">Verificada</span></span><span class="small muted">' + p.sede + '</span></span>' +
        '<button class="pmore" data-hide="' + p.id + '" aria-label="Bloquear o denunciar a ' + p.n + '">···</button></div>' +
        '<div class="pchips">' + v.map(i => '<span class="int">' + intLbl[i] + '</span>').join('') + p.tags.map(t => '<span>' + t + '</span>').join('') + '</div>' +
        '<div class="grid2" style="gap:8px"><button class="btn ghost sm" data-follow="' + p.n + '">' + (sig ? '✓ Siguiendo' : 'Seguir') + '</button>' +
        '<button class="btn sm" data-like="' + p.id + '"' + (it ? ' style="opacity:.55"' : '') + '>' + (it ? 'Enviado, es privado' : conoce ? 'Me interesa conocerte' : 'Entrenemos') + '</button></div></div>';
    }).join('') : '<div class="card" style="align-items:center;text-align:center"><span class="h2">Nadie por ahora</span><span class="small muted">Probá con todas las sedes o sumá otra intención.</span></div>';
  }
  $('#gente').addEventListener('click', e => {
    const f = e.target.closest('[data-follow]'), l = e.target.closest('[data-like]'), h = e.target.closest('[data-hide]');
    if (f) { const n = f.dataset.follow; if (siguiendo.has(n)) siguiendo.delete(n); else { siguiendo.add(n); toast('Ahora ves lo que comparte en el mural'); } renderGente(); return; }
    if (h) { const p = gente.find(x => x.id === h.dataset.hide); ocultos.add(p.id); renderGente(); toast('Bloqueaste a ' + p.n + '. No van a volver a verse.'); return; }
    if (l) {
      const p = gente.find(x => x.id === l.dataset.like); if (intereses.has(p.id)) return;
      intereses.add(p.id); renderGente();
      if (p.likesMe) { const v = visibles(p); showMatch(p, v.includes('conocer') || v.includes('amigos') ? 'conocer' : 'entrenar'); }
      else toast('Enviado. Solo se entera si también le interesa');
    }
  });
  $('#sedeFil').addEventListener('click', e => { const b = e.target.closest('[data-fil]'); if (!b) return; fil = b.dataset.fil; $$('#sedeFil .opt').forEach(x => x.setAttribute('aria-pressed', x === b)); renderGente(); });
  $('#qEvt').addEventListener('click', () => pushCard('<span class="lbl">Invitación a un evento</span><span class="h2">Spinning Night · Jue 20:30</span><span class="small muted">López y Planes</span><span class="small" style="color:var(--dat);font-weight:700">Esperando respuesta</span>', 'Invitación a un evento'));

//#bloque 225
  // ===== T20 · Mural VIVA: la sección social en una pantalla (v95, primera publicación) =====
  // Seis piezas: Tu mural (avatar) · People · Mensajes · Lo que viene · filtro · Publicar. Todo simulado.
  // En real: publicaciones, amigos y Fits, base propia de Vivapp · entrenos de grupo, el tablero del profe · eventos, lo que cargue
  // marketing · el dato del marco, entradas verificadas (semCumplida, mesMarcas) · mayoría de edad, Viva Gestión.
  // Piso: ninguna tarjeta muestra presencia, horario ni kilos de otro socio; los Fits no se cuentan en público; nada se publica solo.
  var MV = { fil:'eq', fit:{}, anot:{}, duo:{}, des:{}, vis:'amigos', mios:[] };
  const MV_YO = ['#5b6ea8','#1c2238'];
  const MV_BRAZO = '<svg width="18" height="18" aria-hidden="true"><use href="#pi-brazo" width="18" height="18"/></svg>';
  const MV_CAM = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const MV_EJ = '<span class="pill gris">EJEMPLO</span>';
  // Lo que viene: entrenos de grupo (los publica el profe) y eventos (los publica Viva). Se muestran totales, nunca quién se anotó.
  const MV_VIENE = [
    { id:'e1', dia:'SÁB', hora:'10:00', t:'Entreno de grupo', d:'Piernas, todos juntos. Lo arma tu profe para su grupo.', donde:'Sarmiento', quien:'Prof. Lucas, para su grupo', n:5, cupo:8 },
    { id:'e2', dia:'JUE', hora:'20:30', t:'Spinning Night', d:'Spinning con luces y DJ.', donde:'López y Planes', quien:'Viva', n:18, cupo:25 },
    { id:'e3', dia:'SÁB', hora:'11:30', t:'Funcional en dúo', d:'Clase en parejas: venís con alguien de tu equipo o se arma la dupla ahí.', donde:'Sarmiento', quien:'Viva', n:12, cupo:20 },
    { id:'e4', dia:'VIE', hora:'21:00', t:'After Train', d:'Un rato para conocerse después de entrenar.', donde:'Sarmiento', quien:'Viva', n:9, cupo:30 }
  ];
  // en: en qué filtros se ve. k: aviso (profe o Viva, con "Me anoto") · foto (con el marco) · logro (compartido) · bien (la bienvenida) ·
  // dupla · y las cuatro tarjetas de ejemplo: grupo, sede, flow, cartel.
  const MV_POSTS = [
    { id:'p1', en:['eq'], k:'aviso', n:'Prof. Lucas', sub:'Tu profe · para su grupo', c:['#2a6f7f','#0c2229'], ev:'e1' },
    { id:'p2', en:['eq'], k:'foto', n:'Valentina', sub:'Corrientes · ayer · la ven sus amigos', c:['#a85a5a','#2e1212'], f:['#7d5a86','#1c1622'], dato:'Semana cumplida', det:'3 de 3 · Corrientes', txt:'Semana adentro. ¡Vamos!', amiga:true },
    { id:'p3', en:['eq'], k:'bien', n:'Sofi', sub:'Nueva en el grupo de Prof. Lucas', c:['#c08a3a','#33230c'], t:'Primera semana cumplida', s:'Arrancó hace una semana y la cumplió. Lo compartió con su grupo.' },
    { id:'p4', en:['eq'], k:'dupla', n:'Ramiro', c:['#5a7aa8','#141e2e'] },
    { id:'p5', en:['eq'], k:'grupo' },
    { id:'p6', en:['sede'], k:'aviso', n:'Viva', sub:'Lo publica Viva · Sarmiento', c:['#3c4658','#12161d'], ev:'e3' },
    { id:'p7', en:['sede','viva'], k:'logro', n:'Joaquín', sub:'Sarmiento · hoy', c:['#4f7d3a','#152410'], t:'12 semanas cumplidas', s:'Sumó la ficha de las 12 semanas a su mural.' },
    { id:'p8', en:['sede'], k:'sede' },
    { id:'p9', en:['viva'], k:'aviso', n:'Viva', sub:'Lo publica Viva · López y Planes', c:['#3c4658','#12161d'], ev:'e2' },
    { id:'p10', en:['viva'], k:'foto', n:'Agustina', sub:'López y Planes · hoy · pública', c:['#a0603a','#301a0c'], f:['#3f6f86','#101c24'], dato:'Mes cumplido', det:'', txt:'Otro mes adentro.' },
    { id:'p11', en:['viva'], k:'flow', n:'Florencia', sub:'Santa Ana · ayer', c:['#3a6a9a','#0f2034'] },
    { id:'p12', en:['viva'], k:'cartel', n:'Carla', sub:'Alberdi · ayer', c:['#9a4f8a','#2c1028'] }
  ];
  const mvCab = (n, c, sub, tag) => '<div class="mvcab"><span class="av sm" style="background:' + grad(c) + '">' + inicial(n) + '</span>' +
    '<span class="stack" style="gap:0;flex:1;min-width:0"><span style="font-weight:700">' + n + '</span><span class="small muted">' + sub + '</span></span>' + (tag || '') + '</div>';
  const mvFit = (id, n, txt) => { const on = !!MV.fit[id];
    return '<button class="clap" data-mvfit="' + id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Sacarle el Fit a ' : 'Darle un Fit a ') + n + '">' + MV_BRAZO + (on ? 'Le diste un Fit' : (txt || 'Dale un Fit')) + '</button>'; };
  const mvFoto = (f, dato, det, prev) => '<div class="mvfoto' + (prev ? ' prev' : '') + '" style="background:' + grad(f) + '" role="img" aria-label="Foto de ejemplo con el marco de VIVA: ' + dato + '">' +
    '<svg class="mvlogo" width="66" height="32" aria-hidden="true"><use href="#vLogo" width="66" height="32"/></svg><span class="mvph">Foto de ejemplo</span>' +
    '<span class="mvmarco"><b>' + dato + '</b><span>' + det + '</span></span></div>';
  const mvVisTxt = { solo:'solo la ves vos', amigos:'la ven tus amigos', publico:'pública, dentro de Viva' };
  const mvVisOk = { solo:'Publicada: solo la ves vos', amigos:'Publicada: la ven tus amigos', publico:'Publicada: la ve todo Viva' };
  const mvMesAnt = () => mesTxt(ahora().getMonth() - 1);
  // El dato del marco sale de lo que Viva verifica: la semana cumplida o las semanas cumplidas que ya tiene el mural del socio.
  function mvMiDato(){
    const m = semMetas().vis, n = typeof semAcum === 'function' ? semAcum() : 0;
    if (semCumplida()) return { dato:'Semana cumplida', det:m + ' de ' + m + ' · ' + miSede };
    if (n > 0) return { dato:n + (n === 1 ? ' semana cumplida' : ' semanas cumplidas'), det:'en Viva · ' + miSede };
    return { dato:'Entreno en Viva', det:miSede };
  }
  function mvAviso(p){
    const e = MV_VIENE.find(x => x.id === p.ev), on = !!MV.anot[e.id];
    return '<div class="post">' + mvCab(p.n, p.c, p.sub) +
      '<div class="between" style="align-items:flex-start"><span class="big">' + e.t + '</span><span class="pill">' + e.dia + ' ' + e.hora + '</span></div>' +
      '<span class="small muted" style="margin-top:-4px;line-height:1.45">' + e.d + ' En ' + e.donde + '.</span>' +
      '<button class="btn sm' + (on ? ' ghost' : '') + '" data-mvanot="' + e.id + '">' + (on ? '✓ Te anotaste · Bajarme' : 'Me anoto') + '</button>' +
      '<span class="small muted">' + (e.n + (on ? 1 : 0)) + ' anotados · ' + e.cupo + ' lugares</span></div>';
  }
  function mvDupla(p){
    const ok = semCumplida(), f = Math.max(1, semMetas().vis - WK.vis);
    return '<div class="post' + (ok ? ' dest' : '') + '"><div class="mvcab"><span class="mvduo"><span class="av sm" style="background:' + grad(MV_YO) + '">M</span><span class="av sm" style="background:' + grad(p.c) + '">' + inicial(p.n) + '</span></span>' +
      '<span class="stack" style="gap:0;flex:1;min-width:0"><span style="font-weight:700">' + p.n + ' y vos</span><span class="small muted">Dupla de la semana · la ven ustedes dos</span></span></div>' +
      '<span class="big">' + (ok ? 'Dupla cumplida' : 'Dupla en marcha') + '</span>' +
      '<span class="small muted" style="margin-top:-6px;line-height:1.45">' + (ok ? 'Los dos cumplieron la semana, cada uno con su meta.' : p.n + ' ya cumplió su semana. Con ' + f + (f === 1 ? ' entrenamiento más' : ' entrenamientos más') + ' de los tuyos, cumplen los dos.') + ' Arranca de nuevo cada lunes.</span>' +
      '<div class="mvacts">' + mvFit(p.id, p.n) + '</div></div>';
  }
  function mvSede(p){
    const s = sedesMes.slice().sort((a, b) => b[1] - a[1]), pos = s.findIndex(x => x[0] === miSede), n = Math.min(3, mesMarcas()), on = !!MV.des.sede;
    return '<div class="post">' + '<div class="between"><span class="lbl">Tu sede · ' + miSede + '</span>' + MV_EJ + '</div>' +
      '<span class="big">' + s[pos][1] + '% va camino a su Mes cumplido</span>' +
      '<span class="small muted" style="margin-top:-6px;line-height:1.45">Es el total de la sede: nadie ve quién cumplió. ' + (pos === 0 ? 'Va primera' : 'Va ' + (pos + 1) + 'ª') + ' entre las ' + s.length + ' sedes. Vos llevás ' + n + ' de 3 semanas de ' + mesTxt(ahora().getMonth()) + '.</span>' +
      '<button class="btn ghost sm" data-mvdes="sede">' + (on ? '✓ Estás en el desafío de la sede' : 'Unirme al desafío de la sede') + '</button></div>';
  }
  function mvPost(p){
    if (p.k === 'aviso') return mvAviso(p);
    if (p.k === 'dupla') return mvDupla(p);
    if (p.k === 'sede') return mvSede(p);
    if (p.k === 'grupo') { const on = !!MV.des.grupo;
      return '<div class="post">' + '<div class="between"><span class="lbl">El grupo de Prof. Lucas</span>' + MV_EJ + '</div><span class="big">6 de 8 cumplieron su semana</span>' +
        '<span class="small muted" style="margin-top:-6px;line-height:1.45">Es el total del grupo, sin nombres. Próximo entreno juntos: sábado 10:00.</span>' +
        '<button class="btn ghost sm" data-mvdes="grupo">' + (on ? '✓ Estás en el desafío del grupo' : 'Unirme al desafío del grupo') + '</button></div>'; }
    if (p.k === 'foto') return '<div class="post">' + mvCab(p.n, p.c, p.sub) + mvFoto(p.f, p.dato, p.det || (mvMesAnt() + ' · ' + p.sub.split(' · ')[0])) +
      '<span>' + p.txt + '</span><div class="mvacts">' + mvFit(p.id, p.n) +
      (p.amiga ? '<button class="clap" data-mvduo="' + p.n + '" aria-pressed="' + !!MV.duo[p.n] + '">' + (MV.duo[p.n] ? 'Dupla propuesta' : 'Desafiar') + '</button>' : '') + '</div></div>';
    if (p.k === 'mio') return '<div class="post">' + mvCab('Martina', MV_YO, 'Vos · ahora · ' + mvVisTxt[p.vis]) + mvFoto(['#5b6ea8','#151a2c'], p.dato, p.det) +
      '<span class="small muted">Todavía sin Fits. Cuántos recibís lo ves solo vos.</span></div>';
    const t = p.k === 'flow' ? 'Entró en VIVA Flow' : p.k === 'cartel' ? 'Cartel de ' + mvMesAnt() : p.t;
    const s = p.k === 'flow' ? 'Cuatro semanas seguidas con su ritmo bien arriba.' : p.k === 'cartel' ? 'Cerró ' + mvMesAnt() + ' con Mes cumplido y sumó el cartel a su mural.' : p.s;
    return '<div class="post">' + mvCab(p.n, p.c, p.sub, p.k === 'flow' || p.k === 'cartel' ? MV_EJ : '') +
      (p.k === 'flow' ? '<span class="pill ia" style="align-self:flex-start">VIVA FLOW</span>' : '') +
      '<span class="big">' + t + '</span><span class="small muted" style="margin-top:-6px;line-height:1.45">' + s + '</span>' +
      '<div class="mvacts">' + mvFit(p.id, p.n, p.k === 'bien' ? 'Dale la bienvenida con un Fit' : '') + '</div></div>';
  }
  function muralRender(){
    if (!$('#mvFeed')) return;
    const menor = typeof esMenor === 'function' && esMenor(), ok = semCumplida();
    $$('#mvFil [data-mvf]').forEach(b => b.setAttribute('aria-selected', b.dataset.mvf === MV.fil));
    $('#mvFilTxt').textContent = { eq:'Tus amigos y el grupo de tu profe.', sede:'Lo público de ' + miSede + '.', viva:'Lo público de todas las sedes y lo que publica Viva.' }[MV.fil];
    $('#mvMenor').hidden = !menor; $('#peMenor').hidden = !menor; $('#deckBox').hidden = menor;
    $('#mvViene').innerHTML = MV_VIENE.map(e => '<button class="mvev' + (MV.anot[e.id] ? ' on' : '') + '" data-mvev="' + e.id + '" aria-label="' + e.t + ', ' + e.dia + ' ' + e.hora + (MV.anot[e.id] ? ', te anotaste' : '') + '">' +
      '<span class="mvring"><b>' + e.dia + '</b><i>' + e.hora + '</i></span><span class="mvevt">' + (MV.anot[e.id] ? '✓ ' : '') + e.t + '</span></button>').join('');
    const pub = $('#mvPub'); pub.classList.toggle('dest', ok);
    pub.innerHTML = '<span class="mvcam">' + MV_CAM + '</span><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + (ok ? 'Cumpliste tu semana' : 'Publicar') + '</span>' +
      '<span class="small muted">' + (ok ? 'Tu foto con el marco de VIVA está lista' : 'Tu foto con el marco de VIVA y un dato tuyo') + '</span></span>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    const mios = MV.mios.filter(p => p.vis !== 'amigos' || MV.fil === 'eq');
    $('#mvFeed').innerHTML = mios.concat(MV_POSTS.filter(p => p.en.includes(MV.fil))).map(mvPost).join('');
  }
  // Hojas: una sola, con el contenido de cada pieza.
  function mvHoja(html){ $('#mvHojaIn').innerHTML = html; $('#mvHoja').hidden = false; }
  const mvPie = (attr, txt) => '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-mvx type="button">Cerrar</button><button class="btn sm" ' + attr + ' type="button">' + txt + '</button></div>';
  function mvEvento(id){
    const e = MV_VIENE.find(x => x.id === id), on = !!MV.anot[id];
    mvHoja('<span class="lbl">Lo que viene</span><span class="h2">' + e.t + '</span><span class="muted" style="line-height:1.45">' + e.d + '</span>' +
      '<div class="list"><div><span class="small muted" style="flex:1">Cuándo</span><span>' + e.dia + ' ' + e.hora + '</span></div><div><span class="small muted" style="flex:1">Dónde</span><span>' + e.donde + '</span></div>' +
      '<div><span class="small muted" style="flex:1">Lo publica</span><span>' + e.quien + '</span></div><div><span class="small muted" style="flex:1">Anotados</span><span>' + (e.n + (on ? 1 : 0)) + ' · ' + e.cupo + ' lugares</span></div></div>' +
      mvPie('data-mvanot="' + id + '"', on ? 'Bajarme' : 'Me anoto'));
  }
  function mvPublicar(){
    const d = mvMiDato(), menor = typeof esMenor === 'function' && esMenor(); if (menor && MV.vis === 'publico') MV.vis = 'amigos';
    const op = (k, t) => '<button class="opt" data-mvvis="' + k + '" aria-pressed="' + (MV.vis === k) + '">' + t + '</button>';
    mvHoja('<div class="between"><span class="h2">Publicar</span><span class="pill gris">FOTO DE EJEMPLO</span></div>' + mvFoto(['#5b6ea8','#151a2c'], d.dato, d.det, true) +
      '<span class="small muted" style="line-height:1.45">El marco lleva la marca de Viva y un dato tuyo que Viva verifica. La cámara y los marcos para elegir llegan en la próxima versión.</span>' +
      '<span class="lbl">Quién la ve</span><div class="opts ' + (menor ? 'g2' : 'g3') + '">' + op('solo', 'Solo vos') + op('amigos', 'Tus amigos') + (menor ? '' : op('publico', 'Público')) + '</div>' +
      '<span class="mvdef">"Público" es dentro de Viva, nunca afuera. Cuál viene elegida: a definir con marketing. Otras personas en la foto: reglas a definir con el dueño.</span>' +
      '<label class="swrow" for="mvIg" style="border-bottom:none"><span class="stack" style="gap:2px;flex:1"><span>También a tu historia de Instagram</span><span class="small muted">Con el marco de Viva y @vivafithouse</span></span><input type="checkbox" class="sw" id="mvIg" checked></label>' +
      mvPie('data-mvpubok', 'Publicar'));
  }
  function mvTuMural(){
    const fila = (go, t, s) => '<div><button class="mvhrow" data-go="' + go + '"><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700">' + t + '</span><span class="small muted">' + s + '</span></span>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>';
    mvHoja('<div class="between"><span class="h2">Tu mural</span><span class="pill gris">EN CONSTRUCCIÓN</span></div>' +
      '<span class="small muted" style="line-height:1.45">Tu espacio: carteles, fichas y fotos, y quién ve cada cosa. Por ahora te lleva a lo que ya existe.</span>' +
      '<div class="list">' + fila('muralScr', 'Tus carteles y fichas', 'Lo que juntaste viniendo') + fila('evolucion', 'Tus fotos', 'Tu progreso en fotos · privadas') + fila('socialPerfil', 'Tu perfil', 'Qué mostrás y quién te ve') + '</div>' +
      '<button class="btn ghost sm" data-mvx type="button">Cerrar</button>');
  }
  function mvDuoHoja(n){
    mvHoja('<span class="lbl">Desafiar a un amigo</span><span class="h2">Dupla con ' + n + '</span>' +
      '<span class="muted" style="line-height:1.45">Cada uno con su propia meta de la semana. La dupla se cumple si cumplen los dos, y arranca de nuevo cada lunes. Se arma si ' + n + ' acepta.</span>' +
      mvPie('data-mvduook="' + n + '"', MV.duo[n] ? 'Retirar la propuesta' : 'Proponer la dupla'));
  }
  function mvDesHoja(k){
    const sede = k === 'sede', on = !!MV.des[k];
    mvHoja('<span class="lbl">Unirme a un desafío</span><span class="h2">' + (sede ? 'El desafío de ' + miSede : 'El desafío del grupo') + '</span>' +
      '<span class="muted" style="line-height:1.45">' + (sede ? 'Que más socios de ' + miSede + ' cierren el mes con Mes cumplido. Sumás con el tuyo: nadie ve quién cumplió, solo el total.' : 'Que todo el grupo cumpla su semana, cada uno con su meta. Se ve el total del grupo, sin nombres, y arranca de nuevo cada lunes.') + '</span>' +
      '<span class="mvdef">Los desafíos los arman tu profe, tu sede o Viva. Usan lo que ya medimos: tu semana cumplida, Tu ritmo y VIVA Flow.</span>' +
      mvPie('data-mvdesok="' + k + '"', on ? 'Salir del desafío' : 'Unirme'));
  }
  $('#social').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#mvHoja').hidden = true; };
    let b;
    if ((b = q('[data-mvf]'))) { MV.fil = b.dataset.mvf; muralRender(); return; }
    if ((b = q('[data-mvfit]'))) { const id = b.dataset.mvfit; MV.fit[id] = !MV.fit[id]; muralRender(); return; }
    if ((b = q('[data-mvanot]'))) { const id = b.dataset.mvanot, ev = MV_VIENE.find(x => x.id === id); MV.anot[id] = !MV.anot[id]; cerrar(); muralRender();
      toast(MV.anot[id] ? 'Te anotaste a ' + ev.t + ' · ' + ev.dia + ' ' + ev.hora : 'Te bajaste de ' + ev.t); return; }
    if ((b = q('[data-mvev]'))) { mvEvento(b.dataset.mvev); return; }
    if (q('#mvPub')) { mvPublicar(); return; }
    if (q('#mvYo')) { mvTuMural(); return; }
    if ((b = q('[data-mvduo]'))) { mvDuoHoja(b.dataset.mvduo); return; }
    if ((b = q('[data-mvduook]'))) { const n = b.dataset.mvduook; MV.duo[n] = !MV.duo[n]; cerrar(); muralRender(); toast(MV.duo[n] ? 'Le propusiste una dupla a ' + n : 'Retiraste la propuesta'); return; }
    if ((b = q('[data-mvdes]'))) { mvDesHoja(b.dataset.mvdes); return; }
    if ((b = q('[data-mvdesok]'))) { const k = b.dataset.mvdesok; MV.des[k] = !MV.des[k]; cerrar(); muralRender(); toast(MV.des[k] ? 'Estás en el desafío' : 'Saliste del desafío'); return; }
    if ((b = q('[data-mvvis]'))) { MV.vis = b.dataset.mvvis; $$('#mvHoja [data-mvvis]').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
    if (q('[data-mvpubok]')) { const d = mvMiDato(), ig = $('#mvIg').checked; MV.mios.unshift({ id:'m' + MV.mios.length, k:'mio', vis:MV.vis, dato:d.dato, det:d.det }); cerrar(); muralRender();
      $('#social .body').scrollTop = 0; toast(mvVisOk[MV.vis] + (ig ? '. Lista para tu historia' : '')); return; }
    if (e.target.id === 'mvHoja' || q('[data-mvx]') || q('#mvHoja [data-go]')) cerrar();
  });
