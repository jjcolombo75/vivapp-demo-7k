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
    { id:'g2', n:'Carla', e:26, sede:'Alberdi', int:['amigos','conocer'], tags:['Cardio','Running'], c:['#9a4f8a','#2c1028'], ev:true },
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
    $('#deckNote').hidden = !asistMode; $('#deckNote').textContent = 'Asistentes de Social VIVA · 11/10';
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
  $('#qEvt').addEventListener('click', () => pushCard('<span class="lbl">Invitación a un evento</span><span class="h2">Social VIVA · Sáb 08:30</span><span class="small muted">López y Planes · running y desayuno</span><span class="small" style="color:var(--dat);font-weight:700">Esperando respuesta</span>', 'Invitación a un evento'));

//#bloque 225
  // ===== T20 · Mural VIVA (v97): un mural para scrollear, como Instagram =====
  // La pantalla es el mural. Arriba, las secciones en íconos (Tu mural · People · Desafíos · Tus grupos · Mensajes) y qué mural ves
  // (Tu equipo · Tu sede · VIVA); abajo y al centro, la cámara flotante para publicar. Todo simulado.
  // En real: publicaciones, amigos y Fits, base propia de Vivapp · entrenos de grupo, el tablero del profe · eventos, lo que cargue
  // marketing · el dato del marco, entradas verificadas (semCumplida, mesMarcas) · mayoría de edad, Viva Gestión.
  // Piso: nada muestra presencia, horario ni kilos de otro socio; los Fits no se cuentan en público; nada se publica solo.
  var MV = { fil:'eq', fit:{}, anot:{}, duo:{}, des:{}, vis:'amigos', mios:[], extra:{ eq:[], sede:[], viva:[] }, hoja:null };
  const MV_YO = ['#5b6ea8','#1c2238'];
  const MV_BRAZO = '<svg width="18" height="18" aria-hidden="true"><use href="#pi-brazo" width="18" height="18"/></svg>';
  const MV_RAYO = '<svg class="bolt-ico" viewBox="0 0 16 24" aria-hidden="true"><path d="M6.93 1.64 L13.48 0.00 L9.62 8.71 L12.82 8.18 L2.52 24.00 L6.24 13.20 L3.05 13.83 Z" fill="currentColor"/></svg>';
  const MV_TRAMA = '<svg class="mvtr" aria-hidden="true" focusable="false"><rect width="100%" height="100%" fill="url(#patTileW)"/></svg>';
  const MV_FIL = { eq:['Tu equipo', 'Tus amigos y el grupo de tu profe'], sede:['Tu sede', 'Lo público de ' + miSede], viva:['VIVA', 'Lo público de todas las sedes y lo que publica Viva'] };
  // Lo que viene: entrenos de grupo (los publica el profe) y eventos (los publica Viva). Se muestran totales, nunca quién se anotó.
  const MV_VIENE = [
    { id:'e1', dia:'SÁB', hora:'10:00', k:'Entreno de grupo', t:'Piernas, todos juntos', donde:'Sarmiento', n:5, cupo:8 },
    { id:'e2', dia:'SÁB', hora:'08:30', k:'Evento', t:'Social VIVA · running y desayuno', donde:'López y Planes', n:18, cupo:25 },
    { id:'e3', dia:'SÁB', hora:'11:00', k:'Evento', t:'Aniversario de Sarmiento', donde:'Sarmiento', n:12, cupo:20 },
    { id:'e4', dia:'VIE', hora:'21:30', k:'Evento', t:'La fiesta de Viva', donde:'Alberdi', n:9, cupo:30 }
  ];
  // k: foto (con el marco) · aviso (del profe o de Viva, con "Me anoto") · logro (compartido: ficha, bienvenida, cartel, VIVA Flow) · dupla.
  const MV_JOAQUIN = { id:'p7', k:'logro', n:'Joaquín', sub:'Sarmiento · hoy', c:['#4f7d3a','#152410'], lbl:'Ficha', num:'12', firma:['semanas', 'cumplidas'], txt:'Sumó la ficha de las 12 semanas a su mural.' };
  const MV_POSTS = {
    eq: [
      // El primero queda fijo arriba del mural hasta que pase (decisión 13/11): es lo que trae al socio al gimnasio.
      { id:'p1', k:'aviso', n:'Prof. Lucas', sub:'Tu profe · para su grupo · fijado', c:['#2a6f7f','#0c2229'], ev:'e1' },
      { id:'p2', k:'foto', n:'Valentina', sub:'Corrientes · ayer · la ven sus amigos', c:['#a85a5a','#2e1212'], f:['#f400a0','#07b0f2'], dato:['Semana', 'cumplida'], det:'3 de 3 · Corrientes', txt:'Semana adentro. ¡Vamos!', amiga:true },
      { id:'p3', k:'logro', n:'Sofi', sub:'Nueva en el grupo de Prof. Lucas', c:['#c08a3a','#33230c'], lbl:'Bienvenida', firma:['Primera semana', 'cumplida'], txt:'Arrancó hace una semana y la cumplió.', fit:'Dale la bienvenida con un Fit' },
      { id:'p4', k:'dupla', n:'Ramiro', c:['#5a7aa8','#141e2e'] },
      { id:'p5', k:'foto', n:'Diego', sub:'Sarmiento · hace 2 días · la ven sus amigos', c:['#7a7a3a','#262610'], f:['#07b0f2','#ffe94a'], dato:['12 semanas', 'cumplidas'], det:'en Viva · Sarmiento', txt:'Tres meses viniendo.', amiga:true }
    ],
    sede: [
      { id:'p6', k:'foto', n:'Cami', sub:'Sarmiento · hoy · pública', c:['#8a4f9a','#22102c'], f:['#07b0f2','#f400a0'], dato:['Semana', 'cumplida'], det:'4 de 4 · Sarmiento', txt:'Cuatro de cuatro.' },
      MV_JOAQUIN,
      { id:'p8', k:'aviso', n:'Viva', sub:'Lo publica Viva · Sarmiento', c:['#3c4658','#12161d'], ev:'e3' }
    ],
    viva: [
      { id:'p10', k:'foto', n:'Agustina', sub:'López y Planes · hoy · pública', c:['#a0603a','#301a0c'], f:['#ffe94a','#f400a0'], dato:['Mes', 'cumplido'], det:'@mes · López y Planes', txt:'Otro mes adentro.' },
      { id:'p9', k:'aviso', n:'Viva', sub:'Lo publica Viva · López y Planes', c:['#3c4658','#12161d'], ev:'e2' },
      { id:'p11', k:'logro', n:'Florencia', sub:'Santa Ana · ayer', c:['#3a6a9a','#0f2034'], flow:true, lbl:'Tu ritmo VIVA', firma:['VIVA', 'Flow'], txt:'Cuatro semanas seguidas con su ritmo bien arriba.' },
      MV_JOAQUIN,
      { id:'p12', k:'logro', n:'Carla', sub:'Alberdi · ayer', c:['#9a4f8a','#2c1028'], lbl:'Cartel del mes', firma:['@mes', 'cumplido'], txt:'Cerró el mes con Mes cumplido y sumó el cartel a su mural.' }
    ]
  };
  const mvVisTxt = { solo:'solo la ves vos', amigos:'la ven tus amigos', publico:'pública, dentro de Viva' };
  const mvVisOk = { solo:'Publicada: solo la ves vos', amigos:'Publicada: la ven tus amigos', publico:'Publicada: la ve todo Viva' };
  const mvMes = s => s.replace('@mes', mesTxt(ahora().getMonth() - 1));
  const mvCab = (n, c, sub) => '<div class="mvcab"><span class="av sm" style="background:' + grad(c) + '">' + inicial(n) + '</span>' +
    '<span class="stack" style="gap:0;flex:1;min-width:0"><span style="font-weight:700">' + n + '</span><span class="small muted">' + sub + '</span></span></div>';
  const mvFit = (id, n, txt) => { const on = !!MV.fit[id];
    return '<button class="clap" data-mvfit="' + id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Sacarle el Fit a ' : 'Darle un Fit a ') + n + '">' + MV_BRAZO + (on ? 'Le diste un Fit' : (txt || 'Dale un Fit')) + '</button>'; };
  // La foto es una escena de ejemplo (tubos de neón y alguien frente al espejo); encima, el marco de Viva con el dato verificado.
  const mvFoto = (f, dato, det, prev) => '<div class="mvmedia mvfoto' + (prev ? ' prev' : '') + '" style="--a:' + f[0] + ';--b:' + f[1] + '" role="img" aria-label="Foto de ejemplo con el marco de VIVA: ' + dato.join(' ') + '">' +
    '<svg class="mvesc" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-width="5"><path d="M-10 96 170 64" stroke="' + f[0] + '"/><path d="M230 56 410 90" stroke="' + f[1] + '"/><path d="M52 150V520" stroke="' + f[0] + '" opacity=".28"/><path d="M348 150V520" stroke="' + f[1] + '" opacity=".28"/></g>' +
    '<g fill="#161c28" stroke="rgba(255,255,255,.1)" stroke-width="2"><circle cx="200" cy="212" r="46"/><path d="M96 520C96 372 142 292 200 292s104 80 104 228z"/><rect x="250" y="246" width="36" height="66" rx="8" fill="#232c3c"/></g></svg>' +
    '<svg class="mvlogo" width="66" height="32" aria-hidden="true"><use href="#vLogo" width="66" height="32"/></svg><span class="mvph">Foto de ejemplo</span>' +
    '<span class="mvmarco"><span class="mvdato sig"><b>' + dato[0] + '</b> <i>' + dato[1] + '</i>' + MV_RAYO + '</span><small>' + det + '</small></span></div>';
  const mvPos = (cls, html) => '<div class="mvmedia mvpos ' + cls + '">' + MV_TRAMA + html + '</div>';
  // El dato del marco sale de lo que Viva verifica: la semana cumplida o las semanas cumplidas que ya tiene el mural del socio.
  function mvMiDato(){
    const m = semMetas().vis, n = typeof semAcum === 'function' ? semAcum() : 0;
    if (semCumplida()) return { dato:['Semana', 'cumplida'], det:m + ' de ' + m + ' · ' + miSede };
    if (n > 0) return { dato:n === 1 ? ['1 semana', 'cumplida'] : [n + ' semanas', 'cumplidas'], det:'en Viva · ' + miSede };
    return { dato:['Entreno', 'en Viva'], det:miSede };
  }
  const mvAnotBtn = e => { const on = !!MV.anot[e.id]; return '<button class="btn sm' + (on ? ' ghost' : '') + '" data-mvanot="' + e.id + '">' + (on ? '✓ Te anotaste' : 'Me anoto') + '</button>'; };
  function mvPost(p){
    if (p.k === 'foto') return '<article class="mvp">' + mvCab(p.n, p.c, p.sub) + mvFoto(p.f, p.dato, mvMes(p.det)) +
      '<div class="mvacts">' + mvFit(p.id, p.n) + (p.amiga ? '<button class="clap" data-mvduo="' + p.n + '" aria-pressed="' + !!MV.duo[p.n] + '">' + (MV.duo[p.n] ? 'Dupla propuesta' : 'Desafiar') + '</button>' : '') + '</div>' +
      '<span class="mvtxt"><b>' + p.n + '</b> ' + p.txt + '</span></article>';
    if (p.k === 'mio') return '<article class="mvp">' + mvCab('Martina', MV_YO, 'Vos · ahora · ' + mvVisTxt[p.vis]) + mvFoto(['#07b0f2','#f400a0'], p.dato, p.det) +
      '<span class="mvtxt muted">Todavía sin Fits. Cuántos recibís lo ves solo vos.</span></article>';
    if (p.k === 'aviso') { const e = MV_VIENE.find(x => x.id === p.ev), on = !!MV.anot[e.id];
      return '<article class="mvp">' + mvCab(p.n, p.c, p.sub) + mvPos('c', '<span class="mvk">' + e.k + ' · ' + e.donde + '</span>' +
        '<span class="stack" style="gap:8px"><span class="mvbig"><span class="mvfirma sig"><i>' + e.dia + '</i></span><span class="mvnum">' + e.hora + '</span></span><span class="mvfirma sig" style="font-size:22px"><b>' + e.t + '</b></span></span>' +
        '<span class="stack" style="gap:8px">' + mvAnotBtn(e) + '<span class="mvsub">' + (e.n + (on ? 1 : 0)) + ' anotados · ' + e.cupo + ' lugares</span></span>') + '</article>'; }
    if (p.k === 'dupla') { const ok = semCumplida(), f = Math.max(1, semMetas().vis - WK.vis);
      return '<article class="mvp"><div class="mvcab"><span class="mvduo"><span class="av sm" style="background:' + grad(MV_YO) + '">M</span><span class="av sm" style="background:' + grad(p.c) + '">' + inicial(p.n) + '</span></span>' +
        '<span class="stack" style="gap:0;flex:1;min-width:0"><span style="font-weight:700">' + p.n + ' y vos</span><span class="small muted">La ven ustedes dos</span></span></div>' +
        mvPos(ok ? 'm' : 'c', '<span class="mvk">Dupla de la semana</span><span class="mvfirma sig"><b>Dupla</b> <i>' + (ok ? 'cumplida' : 'en marcha') + '</i>' + (ok ? ' ' + MV_RAYO : '') + '</span>' +
        '<span class="mvsub">' + (ok ? 'Los dos cumplieron la semana, cada uno con su meta.' : p.n + ' ya cumplió su semana. Con ' + f + (f === 1 ? ' entrenamiento más' : ' entrenamientos más') + ' de los tuyos, cumplen los dos.') + '</span>') +
        '<div class="mvacts">' + mvFit(p.id, p.n) + '</div></article>'; }
    if (p.k === 'invita') return '<article class="mvp">' + mvPos('m', '<span class="mvk">Tu semana</span><span class="mvfirma sig"><b>Cumpliste</b> <i>tu semana</i> ' + MV_RAYO + '</span>' +
      '<span class="stack" style="gap:10px"><span class="mvsub">Tu foto con el marco de VIVA está lista.</span><button class="btn sm" data-mvpub>Sacar la foto</button></span>') + '</article>';
    return '<article class="mvp">' + mvCab(p.n, p.c, p.sub) + mvPos(p.flow ? 'f' : 'm', '<span class="mvk">' + p.lbl + '</span>' +
      '<span class="mvbig">' + (p.num ? '<span class="mvnum">' + p.num + '</span>' : '') + '<span class="mvfirma sig' + (p.flow ? ' flow' : '') + '"><b>' + mvMes(p.firma[0]) + '</b> <i>' + p.firma[1] + '</i></span></span>' +
      '<span class="mvsub">' + p.txt + '</span>') + '<div class="mvacts">' + mvFit(p.id, p.n, p.fit) + '</div></article>';
  }
  // Mural sin fin: al acercarse al final se suma otra tanda (simulada: las mismas formas, otra gente).
  const MV_GENTE = { eq:[['Ramiro','Sarmiento',['#5a7aa8','#141e2e']], ['Sofi','Sarmiento',['#c08a3a','#33230c']], ['Valentina','Corrientes',['#a85a5a','#2e1212']], ['Diego','Sarmiento',['#7a7a3a','#262610']]],
    sede:[['Nico','Sarmiento',['#3a8a7a','#0e2a24']], ['Flor','Sarmiento',['#3a6a9a','#0f2034']], ['Tomás','Sarmiento',['#8a5a3a','#2a180c']], ['Cami','Sarmiento',['#8a4f9a','#22102c']]],
    viva:[['Martín','López y Planes',['#3a8a7a','#0e2a24']], ['Lu','Alberdi',['#9a4f8a','#2c1028']], ['Santi','Posadas',['#5a7aa8','#141e2e']], ['Juli','Santa Ana',['#a0603a','#301a0c']]] };
  const MV_LUZ = [['#f400a0','#07b0f2'], ['#07b0f2','#ffe94a'], ['#ffe94a','#f400a0'], ['#07b0f2','#f400a0']];
  function mvTanda(){
    const fil = MV.fil, ya = MV.extra[fil]; if (ya.length >= 40) return null;
    const g = MV_GENTE[fil], vis = fil === 'eq' ? 'la ven sus amigos' : 'pública', n0 = ya.length, out = [];
    for (let i = 0; i < 5; i++) { const j = n0 + i, q = g[j % g.length], sub = q[1] + ' · hace ' + (3 + Math.floor(j / 2)) + ' días', id = 'x' + fil + j, sem = [4, 12, 24][j % 3];
      out.push(j % 5 === 1 ? { id:id, k:'logro', n:q[0], sub:sub, c:q[2], lbl:'Ficha', num:String(sem), firma:['semanas', 'cumplidas'], txt:'Sumó la ficha de las ' + sem + ' semanas a su mural.' }
        : j % 5 === 3 ? { id:id, k:'logro', n:q[0], sub:sub, c:q[2], lbl:'Cartel del mes', firma:['@mes', 'cumplido'], txt:'Cerró el mes con Mes cumplido.' }
        : { id:id, k:'foto', n:q[0], sub:sub + ' · ' + vis, c:q[2], f:MV_LUZ[j % 4], dato:j % 2 ? ['Mes', 'cumplido'] : ['Semana', 'cumplida'], det:(j % 2 ? '@mes' : '3 de 3') + ' · ' + q[1], txt:j % 2 ? 'Mes adentro.' : 'Semana adentro.', amiga:fil === 'eq' }); }
    out.forEach(p => ya.push(p)); return out;
  }
  function muralRender(){
    if (!$('#mvFeed')) return;
    const menor = typeof esMenor === 'function' && esMenor(), ok = semCumplida(), cuerpo = $('#social .body'), y = cuerpo.scrollTop;
    $('#mvFilLbl').textContent = MV_FIL[MV.fil][0];
    $('#peMenor').hidden = !menor; $('#deckBox').hidden = menor; $('#mvFabDot').hidden = !ok;
    const mios = MV.mios.filter(p => p.vis !== 'amigos' || MV.fil === 'eq');
    const base = MV_POSTS[MV.fil], fijo = MV.fil === 'eq' ? 1 : 0;
    $('#mvFeed').innerHTML = base.slice(0, fijo).concat(ok && !MV.mios.length ? [{ k:'invita' }] : [], mios, base.slice(fijo), MV.extra[MV.fil]).map(mvPost).join('');
    cuerpo.scrollTop = y;
    if (MV.hoja === 'grupos') mvGrupos(); if (MV.hoja === 'desafios') mvDesafios();
  }
  $('#social .body').addEventListener('scroll', e => { const b = e.currentTarget;
    if (b.scrollTop + b.clientHeight > b.scrollHeight - 700) { const t = mvTanda(); if (t) $('#mvFeed').insertAdjacentHTML('beforeend', t.map(mvPost).join('')); } });
  // Hojas: una sola, con el contenido de cada sección.
  function mvHoja(html, cual){ MV.hoja = cual || null; $('#mvHojaIn').innerHTML = html; $('#mvHoja').hidden = false; }
  const mvCerrar = '<button class="btn ghost sm" data-mvx type="button">Cerrar</button>';
  const mvPie = (attr, txt) => '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-mvx type="button">Cerrar</button><button class="btn sm" ' + attr + ' type="button">' + txt + '</button></div>';
  function mvFiltro(){
    mvHoja('<span class="mtitle sig"><b>Qué</b> <i>mural ves</i></span>' + Object.keys(MV_FIL).map(k => '<button class="mvopt k-elige" data-mvf="' + k + '" aria-pressed="' + (MV.fil === k) + '"><span style="font-weight:700">' + MV_FIL[k][0] + '</span><span class="small muted">' + MV_FIL[k][1] + '</span></button>').join('') + mvCerrar);
  }
  function mvPublicar(){
    const d = mvMiDato(), menor = typeof esMenor === 'function' && esMenor(); if (menor && MV.vis === 'publico') MV.vis = 'amigos';
    const op = (k, t) => '<button class="opt" data-mvvis="' + k + '" aria-pressed="' + (MV.vis === k) + '">' + t + '</button>';
    mvHoja('<span class="mtitle sig"><b>Tu</b> <i>foto</i></span>' + mvFoto(['#07b0f2','#f400a0'], d.dato, d.det, true) +
      '<span class="lbl">Quién la ve</span><div class="opts ' + (menor ? 'g2' : 'g3') + '">' + op('solo', 'Solo vos') + op('amigos', 'Tus amigos') + (menor ? '' : op('publico', 'Público')) + '</div>' +
      '<label class="swrow" for="mvIg" style="border-bottom:none;padding:0"><span class="stack" style="gap:2px;flex:1"><span>También a tu historia de Instagram</span><span class="small muted">Con el marco de Viva y @vivafithouse</span></span><input type="checkbox" class="sw" id="mvIg" checked></label>' +
      mvPie('data-mvpubok', 'Publicar'));
  }
  function mvTuMural(){
    const fila = (go, t, s) => '<div><button class="mvhrow" data-go="' + go + '"><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700">' + t + '</span><span class="small muted">' + s + '</span></span>' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>';
    mvHoja('<span class="mtitle sig"><b>Tu</b> <i>mural</i></span>' +
      '<div class="list">' + fila('muralScr', 'Tus carteles y fichas', 'Lo que juntaste viniendo') + fila('evolucion', 'Tus fotos', 'Tu progreso en fotos · privadas') + fila('socialPerfil', 'Tu perfil', 'Qué mostrás y quién te ve') + '</div>' + mvCerrar);
  }
  function mvGrupos(){
    mvHoja('<span class="mtitle sig"><b>Tus</b> <i>grupos</i></span>' +
      '<div class="stack" style="gap:2px"><span style="font-weight:700">El grupo de Prof. Lucas</span><span class="small muted">Esta semana el grupo sumó 6 semanas cumplidas.</span></div>' +
      '<span class="lbl">Lo que viene</span><div class="list">' + MV_VIENE.map(e => '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + e.dia + ' ' + e.hora + ' · ' + e.t + '</span>' +
        '<span class="small muted">' + e.k + ' · ' + e.donde + ' · ' + (e.n + (MV.anot[e.id] ? 1 : 0)) + ' anotados</span></span>' + mvAnotBtn(e) + '</div>').join('') + '</div>' + mvCerrar, 'grupos');
  }
  function mvDesafios(){
    const ok = semCumplida(), s = sedesMes.slice().sort((a, b) => b[1] - a[1]), pos = s.findIndex(x => x[0] === miSede), n = Math.min(3, mesMarcas());
    const fila = (k, t, d) => '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + t + '</span><span class="small muted" style="line-height:1.4">' + d + '</span></span>' +
      (k ? '<button class="btn sm' + (MV.des[k] ? ' ghost' : '') + '" data-mvdesok="' + k + '">' + (MV.des[k] ? '✓ Adentro' : 'Unirme') + '</button>' : '') + '</div>';
    mvHoja('<span class="mtitle sig"><b>Tus</b> <i>desafíos</i></span><div class="list">' +
      fila('', 'Dupla con Ramiro · ' + (ok ? 'cumplida' : 'en marcha'), 'Cada uno con su meta. Arranca de nuevo cada lunes.') +
      fila('sede', 'El desafío de ' + miSede, s[pos][1] + '% de la sede va camino a su Mes cumplido. Vos llevás ' + n + ' de 3 semanas.') +
      fila('grupo', 'El desafío del grupo', 'Que todo el grupo de Prof. Lucas cumpla su semana.') + '</div>' +
      '<span class="mvdef">Para desafiar a un amigo, tocá "Desafiar" en su foto. Los desafíos los arman tu profe, tu sede o Viva.</span>' + mvCerrar, 'desafios');
  }
  function mvDuoHoja(n){
    mvHoja('<span class="lbl">Desafiar a un amigo</span><span class="mtitle sig"><b>Dupla</b> <i>con ' + n + '</i></span>' +
      '<span class="muted" style="line-height:1.45">Cada uno con su propia meta de la semana. La dupla se cumple si cumplen los dos, y arranca de nuevo cada lunes. Se arma si ' + n + ' acepta.</span>' +
      mvPie('data-mvduook="' + n + '"', MV.duo[n] ? 'Retirar la propuesta' : 'Proponer la dupla'));
  }
  $('#social').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#mvHoja').hidden = true; MV.hoja = null; };
    let b;
    if ((b = q('[data-mvf]'))) { MV.fil = b.dataset.mvf; cerrar(); $('#social .body').scrollTop = 0; muralRender(); return; }
    if ((b = q('[data-mvfit]'))) { const id = b.dataset.mvfit; MV.fit[id] = !MV.fit[id]; muralRender(); return; }
    if ((b = q('[data-mvanot]'))) { const id = b.dataset.mvanot, ev = MV_VIENE.find(x => x.id === id); MV.anot[id] = !MV.anot[id]; muralRender();
      toast(MV.anot[id] ? 'Te anotaste a ' + ev.t + ' · ' + ev.dia + ' ' + ev.hora : 'Te bajaste de ' + ev.t); return; }
    if (q('#mvFilBtn')) { mvFiltro(); return; }
    if (q('#mvPub') || q('[data-mvpub]')) { mvPublicar(); return; }
    if (q('#mvYo')) { mvTuMural(); return; }
    if ((b = q('[data-mvsec]'))) { if (b.dataset.mvsec === 'grupos') mvGrupos(); else mvDesafios(); return; }
    if ((b = q('[data-mvduo]'))) { mvDuoHoja(b.dataset.mvduo); return; }
    if ((b = q('[data-mvduook]'))) { const n = b.dataset.mvduook; MV.duo[n] = !MV.duo[n]; cerrar(); muralRender(); toast(MV.duo[n] ? 'Le propusiste una dupla a ' + n : 'Retiraste la propuesta'); return; }
    if ((b = q('[data-mvdesok]'))) { const k = b.dataset.mvdesok; MV.des[k] = !MV.des[k]; mvDesafios(); toast(MV.des[k] ? 'Estás en el desafío' : 'Saliste del desafío'); return; }
    if ((b = q('[data-mvvis]'))) { MV.vis = b.dataset.mvvis; $$('#mvHoja [data-mvvis]').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
    if (q('[data-mvpubok]')) { const d = mvMiDato(), ig = $('#mvIg').checked; MV.mios.unshift({ id:'m' + MV.mios.length, k:'mio', vis:MV.vis, dato:d.dato, det:d.det }); cerrar(); $('#social .body').scrollTop = 0; muralRender();
      toast(mvVisOk[MV.vis] + (ig ? '. Lista para tu historia' : '')); return; }
    if (e.target.id === 'mvHoja' || q('[data-mvx]') || q('#mvHoja [data-go]')) cerrar();
  });

//#bloque 226
  // ===== T21 · Social VIVA, versión B: los grupos (v99) =====
  // Versiones Social (panel de demo, bloque 345 de demo.js) elige la versión: A = Mural VIVA (T20 v98, #social, sin cambios) · B = esta (#socialB).
  // Estados del socio: sin grupo · primer encuentro (se sumó esta semana) · con grupo (12 encuentros). Todo simulado.
  // En real: grupos, integrantes y encuentros, el tablero del profe (base de Vivapp) · Voy / No llego, declarado por el socio ·
  // encuentros cumplidos y desafío del mes, entradas de EVO de noche (solo totales del grupo) · eventos, los que carga marketing · referidos, lo que Viva ya registra.
  // Piso: ninguna pantalla muestra presencia, horario ni kilos de otro socio; "van N" es un número, sin quién; la app no cuenta ausencias;
  // nada de lo que un socio escribe o fotografía queda guardado para que otro lo vea (la charla vive en su WhatsApp; la foto sale y no se guarda).
  var SOC_V = 'H', SOC_B = 'con';   // la H abre por defecto (T28, 18/11); antes la F (15/11) y la B
  var SB = { voy:{ primer:null, con:'voy' }, quiero:false, anot:{} };
  const SB_G = { nom:['Los del', 'jueves'], dia:'JUE', diaL:'jueves', hora:'19:00', sede:'Sarmiento', que:'Cada uno su rutina, a la misma hora', van:{ primer:4, con:3 }, enc:12, des:[38, 60],
    gente:[['Vos', MV_YO], ['Sofi', ['#c08a3a','#33230c']], ['Ramiro', ['#5a7aa8','#141e2e']], ['Cami', ['#8a4f9a','#22102c']], ['Nico', ['#3a8a7a','#0e2a24']], ['Juli', ['#a0603a','#301a0c']]] };
  const SB_PROFE = ['#2a6f7f','#0c2229'];
  const SB_CAM = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  const SB_WA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.4-4.2A8 8 0 1 1 8.6 19z"/></svg>';
  const sbMenor = () => typeof esMenor === 'function' && esMenor();
  const sbProfe = sub => '<div class="mvcab"><span class="av sm sbstaff" style="background:' + grad(SB_PROFE) + '">LP</span>' +
    '<span class="stack" style="gap:0;flex:1;min-width:0"><span style="font-weight:700">Prof. Lucas</span><span class="small muted">' + sub + '</span></span></div>';
  function sbEncuentro(est){
    const v = SB.voy[est], n = SB_G.van[est] + (v === 'voy' ? 1 : 0), prim = est === 'primer';
    const op = (k, t) => '<button class="opt" data-sbvoy="' + k + '" aria-pressed="' + (v === k) + '">' + t + '</button>';
    return mvPos(prim ? 'm' : 'c', '<span class="mvk">' + (prim ? 'Tu primer encuentro' : 'Próximo encuentro') + ' · ' + SB_G.sede + '</span>' +
      (prim ? '<span class="stack" style="gap:8px"><span class="mvfirma sig"><b>El ' + SB_G.diaL + '</b> <i>te esperan</i> ' + MV_RAYO + '</span><span class="mvsub">' + SB_G.hora + ' h · ' + SB_G.que + ', con Prof. Lucas</span></span>'
        : '<span class="stack" style="gap:8px"><span class="mvbig"><span class="mvfirma sig"><i>' + SB_G.dia + '</i></span><span class="mvnum">' + SB_G.hora + '</span></span><span class="mvsub">' + SB_G.que + ', con Prof. Lucas</span></span>') +
      '<span class="stack" style="gap:10px"><div class="opts g2">' + op('voy', 'Voy') + op('no', 'No llego') + '</div>' +
      '<span class="mvsub">' + (v === 'voy' ? 'Vamos ' + n : 'Van ' + n) + (v === 'no' ? ' · esta vez no llegás' : '') + '</span></span>');
  }
  const sbPresenta = () => '<div class="card" style="gap:12px">' + sbProfe('Tu profe · armó el grupo') +
    '<span style="line-height:1.45">Hola, soy Lucas. Armé este grupo con gente que arrancó hace poco, como vos. El ' + SB_G.diaL + ' a las 19 te espero en la entrada de la sala y entrenamos juntos.</span></div>';
  const sbCab = est => '<div class="stack" style="gap:12px"><span class="mvk">Tu grupo</span><span class="mvfirma sig"><b>' + SB_G.nom[0] + '</b> <i>' + SB_G.nom[1] + '</i></span>' +
    (est === 'primer' ? '' : sbProfe('Lo convoca · ' + SB_G.sede)) + '</div>';   // en el primer encuentro, el profe ya se presentó arriba
  const sbGente = est => '<div class="stack" style="gap:12px"><span class="lbl">' + (est === 'primer' ? 'Son 6, todos arrancando' : 'Son 6') + '</span><div class="sbint">' +
    SB_G.gente.map(q => '<span class="sbper"><span class="av sm" style="background:' + grad(q[1]) + '">' + (q[0] === 'Vos' ? 'M' : inicial(q[0])) + '</span><span class="small">' + q[0] + '</span></span>').join('') + '</div></div>';
  function sbLogros(est){
    const n = est === 'con' ? SB_G.enc : 0, d = SB_G.des;
    const hit = [4, 12, 24].map(h => '<span class="sbhito' + (n >= h ? ' on' : '') + '">' + h + '</span>').join('<i class="sbhl"></i>');
    if (!n) return mvPos('c', '<span class="mvk">Lo que logran juntos</span><span class="mvfirma sig"><b>Arranca</b> <i>el ' + SB_G.diaL + '</i></span>' +
      '<span class="stack" style="gap:10px"><div class="sbhitos">' + hit + '</div><span class="mvsub">Cada encuentro que cumplen juntos suma.</span></span>');
    return mvPos('m', '<span class="mvk">Lo que logran juntos</span><span class="mvbig"><span class="mvnum">' + n + '</span><span class="mvfirma sig"><b>encuentros</b> <i>juntos</i> ' + MV_RAYO + '</span></span>' +
      '<div class="sbhitos">' + hit + '</div>' +
      '<span class="stack" style="gap:8px"><span class="between"><span style="font-weight:700">Desafío del mes</span><span class="small muted">' + d[0] + ' de ' + d[1] + '</span></span>' +
      '<span class="bar"><i style="width:' + Math.round(d[0] / d[1] * 100) + '%"></i></span><span class="mvsub">Entrenamientos de todo el grupo, cada uno a su ritmo.</span></span>');
  }
  function sbAcciones(est){
    if (sbMenor()) return '<span class="mvdef">Los cambios del encuentro te los avisa tu profe.</span>';   // matriz de riesgos, filas 2 y 3
    return '<div class="stack" style="gap:10px"><button class="btn ghost" data-sbwa>' + SB_WA + 'Abrir el WhatsApp del grupo</button>' +
      (est === 'con' ? '<button class="btn" data-sbfoto>' + SB_CAM + 'La foto del encuentro</button>' : '') + '</div>';
  }
  const sbTrae = sin => sin
    ? mvPos('m', '<span class="mvk">Vení con un amigo</span><span class="mvfirma sig"><b>Traé</b> <i>a alguien</i></span>' +
        '<span class="stack" style="gap:10px"><span class="mvsub">Arrancar con alguien que conocés hace todo más fácil.</span><button class="btn" data-sbtrae>Invitar a alguien</button></span>')
    : '<div class="list"><div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">Traé a alguien</span>' +
        '<span class="small muted">Invitalo a entrenar con vos</span></span><button class="btn sm" data-sbtrae>Invitar</button></div></div>';
  const sbEventos = () => '<div class="stack" style="gap:12px"><span class="lbl">Lo que viene en Viva</span><div class="list">' +
    MV_VIENE.filter(e => e.k === 'Evento').map(e => { const on = !!SB.anot[e.id];
      return '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + e.dia + ' ' + e.hora + ' · ' + e.t + '</span>' +
        '<span class="small muted">' + e.donde + ' · ' + (e.n + (on ? 1 : 0)) + ' anotados</span></span><button class="btn sm' + (on ? ' ghost' : '') + '" data-sbanot="' + e.id + '">' + (on ? '✓ Anotado' : 'Me anoto') + '</button></div>'; }).join('') + '</div></div>';
  function sbSin(){
    const q = SB.quiero;
    return mvPos('c', '<span class="mvk">Grupos de gente nueva</span><span class="mvfirma sig"><b>¿Entrenás</b> <i>solo?</i></span>' +
      '<span class="mvsub">Tu profe arma grupos chicos con gente que recién arranca: un encuentro por semana, con día y hora.</span>' +
      '<span class="stack" style="gap:10px"><button class="btn' + (q ? ' ghost' : '') + '" data-sbquiero>' + (q ? '✓ Prof. Lucas ya sabe' : 'Quiero sumarme') + '</button>' +
      '<span class="mvsub">' + (q ? 'Te va a proponer un grupo en tu horario. Queda entre vos y tu profe.' : 'Se lo decimos a tu profe. No lo ve ningún otro socio.') + '</span></span>');
  }
  function sbRender(){
    const c = $('#sbCuerpo'); if (!c) return;
    const e = SOC_B;
    c.innerHTML = e === 'sin' ? sbSin() + sbTrae(true) + sbEventos()
      : e === 'primer' ? sbEncuentro('primer') + sbPresenta() + sbCab('primer') + sbGente('primer') + sbLogros('primer') + sbAcciones('primer') + sbTrae(false) + sbEventos()
      : sbCab('con') + sbEncuentro('con') + sbGente('con') + sbLogros('con') + sbAcciones('con') + sbTrae(false) + sbEventos();
  }
  function sbHoja(html){ $('#sbHojaIn').innerHTML = html; $('#sbHoja').hidden = false; }
  const sbPie = (attr, txt) => '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sbx type="button">Cerrar</button><button class="btn sm" ' + attr + ' type="button">' + txt + '</button></div>';
  function sbFoto(){
    sbHoja('<span class="mtitle sig"><b>La foto</b> <i>del grupo</i></span>' + mvFoto(['#07b0f2','#f400a0'], ['Encuentro ' + SB_G.enc, SB_G.nom.join(' ')], SB_G.sede + ' · ' + SB_G.diaL, true) +
      '<span class="small muted" style="line-height:1.45">Sale con el marco de VIVA y no se guarda en Vivapp. Antes de compartirla, que estén de acuerdo todos los que salen.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sbcomp="wa" type="button">Al WhatsApp</button><button class="btn sm" data-sbcomp="ig" type="button">A tu Instagram</button></div>' +
      '<button class="btn ghost sm" data-sbx type="button">Cerrar</button>');
  }
  function sbTraeHoja(){
    sbHoja('<span class="mtitle sig"><b>Traé</b> <i>a alguien</i></span><span class="muted" style="line-height:1.45">Le mandás por WhatsApp una invitación de Viva para venir a entrenar con vos.</span>' +
      sbPie('data-sbinv', 'Invitar'));
  }
  $('#socialB').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#sbHoja').hidden = true; };
    let b;
    if ((b = q('[data-sbvoy]'))) { const k = b.dataset.sbvoy; SB.voy[SOC_B] = k; sbRender();
      toast(k === 'voy' ? '¡Vamos! Te esperan el ' + SB_G.diaL + ' a las 19' : 'Listo, tu profe ya sabe. Te esperan en el próximo'); return; }
    if (q('[data-sbquiero]')) { SB.quiero = !SB.quiero; sbRender(); toast(SB.quiero ? 'Le avisamos a Prof. Lucas que querés sumarte' : 'Listo, no le avisamos nada'); return; }
    if ((b = q('[data-sbanot]'))) { const id = b.dataset.sbanot, ev = MV_VIENE.find(x => x.id === id); SB.anot[id] = !SB.anot[id]; sbRender();
      toast(SB.anot[id] ? 'Te anotaste a ' + ev.t + ' · ' + ev.dia + ' ' + ev.hora : 'Te bajaste de ' + ev.t); return; }
    if (q('[data-sbwa]')) { toast('Se abre el WhatsApp de ' + SB_G.nom.join(' ')); return; }
    if (q('[data-sbfoto]')) { sbFoto(); return; }
    if (q('[data-sbtrae]')) { sbTraeHoja(); return; }
    if (q('[data-sbinv]')) { cerrar(); toast('Elegí a quién mandarle la invitación'); return; }
    if ((b = q('[data-sbcomp]'))) { cerrar(); toast(b.dataset.sbcomp === 'ig' ? 'Lista para tu historia de Instagram' : 'Lista para mandar al WhatsApp del grupo'); return; }
    if (e.target.id === 'sbHoja' || q('[data-sbx]')) cerrar();
  });
  function socNav(){ const t = $('#nav [data-go="social"]').lastChild; if (t && t.nodeType === 3) t.nodeValue = SOC_V === 'A' ? 'Mural' : SOC_V === 'C' ? SC.tab : SOC_V === 'D' ? SD.tab : SOC_V === 'E' ? 'Sincro' : SOC_V === 'F' ? SF.tab : SOC_V === 'G' ? SG.voc : 'Social'; }
//#bloque 227
  // ===== T22 · Social VIVA, versión C: En sincro (v101) =====
  // Hilo conductor (Juanjo, 15/11): tu ritmo, cuando se acopla con el de otros. Versiones Social (panel, bloque 345 de demo.js) elige A, B o C.
  // Estados: solo (socio nuevo) · dupla (con Cris) · grupo (Los del jueves, 12 fechas) · flow (16 fechas, 5 seguidas). Todo simulado.
  // El pulso: una celda por semana (las últimas 8) con la celda de fila de Inicio (eqCeldaFila). Encendida = esa semana hubo sincro
  // (la fecha del grupo se hizo, o los dos de la dupla cumplieron su semana); la semana en curso, borde cian; sin contador de faltas.
  // Es del grupo o de la dupla: nunca de una persona, nunca dice quién. Con 4 seguidas, el espectro (único uso en la sección: espectro = Flow).
  // En real: grupos, duplas y fechas, base de Vivapp y el tablero del profe · Voy / No llego, declarado · fechas cumplidas, semanas en sincro y
  // meta del desafío, entradas de EVO confirmadas de noche, guardadas solo como total del grupo o de la dupla · Anfitrión: antigüedad y VIVA Flow
  // (lo que ya calcula Tu ritmo), lo ve solo el profe y la invitación sale de él · eventos, los que carga marketing.
  // Piso: ninguna pantalla muestra presencia, horario ni el ritmo de otro socio; la app no cuenta ausencias; nada que un socio escriba o
  // fotografíe queda guardado para que otro lo vea; menores sin WhatsApp ni foto hacia afuera.
  var SC = { e:'grupo', mes:false, anf:false, tab:'Sincro', voy:'voy', quiero:false, primer:false, anot:{}, anfR:null, contar:'cartel' };
  const SC_TABS = ['Sincro', 'En VIVO', 'Juntos', 'Social'];
  const SC_DUO = { n:'Cris', c:['#3a8a7a','#0e2a24'], sem:7, pulso:[1, 1, 0, 1, 1, 1, 1] };   // 7 semanas anteriores; la octava es la en curso
  const SC_G = { grupo:{ fechas:12, pulso:[1, 1, 1, 0, 1, 1, 1], des:[14, 20] }, flow:{ fechas:16, pulso:[1, 0, 1, 1, 1, 1, 1], des:[17, 20] } };
  const SC_OTRO = { nom:'Las de las 7', des:[13, 18] };   // el cruce del mes: el otro grupo, en % de su propia meta
  const SC_SEDE = [['Las de', 'las 7'], ['Los', 'madrugadores'], ['Team', 'sábado'], ['Los del', 'mediodía'], ['Las', 'imparables']];
  const scMenor = () => typeof esMenor === 'function' && esMenor();
  const scSeguidas = p => { let n = 0; for (let i = p.length - 1; i >= 0 && p[i]; i--) n++; return n; };
  const scFirma = (b, i) => '<span class="mvfirma sig"><b>' + b + '</b> <i>' + i + '</i></span>';
  var scUid = 0;
  // El pulso: la fila de celdas de Tu mes (Inicio). prev = semanas anteriores (1 encendida, 0 vacía); cur = la semana en curso.
  function scPulso(prev, cur, flow, lbl){
    const N = prev.length + 1, W = 300, H = 24, GP = 7, sw = (W - GP * (N - 1)) / N, id = 'scp' + (++scUid), L = eqLuz(1), F = flow ? 'url(#' + id + 'f)' : 'var(--dat)';
    let g = '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-20" y="-20" width="' + (W + 40) + '" height="' + (H + 40) + '"><feGaussianBlur stdDeviation="2.6"/></filter>' +
      (flow ? '<linearGradient id="' + id + 'f" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + W + '" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient>' : '') + '</defs>' +
      '<rect class="rl-slot" x="-4" y="-4" width="' + (W + 8) + '" height="' + (H + 8) + '" rx="6"/>';
    prev.concat([cur]).forEach((on, i) => { const x = i * (sw + GP);
      g += eqCeldaFila(x, 0, sw, H, !!on, on ? F : 'var(--muted)', L, id);
      if (i === N - 1) g += '<rect x="' + (x - 2.5).toFixed(1) + '" y="-2.5" width="' + (sw + 5).toFixed(1) + '" height="' + (H + 5) + '" rx="4" fill="none" stroke="var(--lime)" stroke-width="2"/>'; });
    return '<div class="scpulso"><svg class="scpsvg" viewBox="-8 -8 ' + (W + 16) + ' ' + (H + 16) + '" preserveAspectRatio="none" role="img" aria-label="' + lbl + '">' + g + '</svg>' +
      '<span class="scpie"><span>hace 8 semanas</span><span>esta semana</span></span></div>';
  }
  // Tu ritmo en chico: el mismo dial de Inicio (copia de #formaViz con sus id renombrados para no chocar con los de Inicio).
  function scDial(){ const f = $('#formaViz'); if (!f || !f.innerHTML) return '';
    return f.innerHTML.replace(/id="(n[fv]\w*)"/g, 'id="sc$1"').replace(/#(n[fv]\w*)/g, '#sc$1'); }
  // El cartel del grupo: el neón del mural (tapiz + neonTxt de Progreso), con filtros propios para no depender de otra pantalla.
  const scMgDefs = u => '<defs><filter id="' + u + 'B1" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="' + u + 'B2" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feGaussianBlur stdDeviation="5"/></filter>' +
    '<filter id="' + u + 'B3" filterUnits="userSpaceOnUse" x="-400" y="-240" width="800" height="480"><feGaussianBlur stdDeviation="11"/></filter><filter id="' + u + 'H" filterUnits="userSpaceOnUse" x="-300" y="-160" width="600" height="320"><feMorphology operator="dilate" radius="1.6"/><feGaussianBlur stdDeviation="3.5"/></filter></defs>';
  const scNeon = (u, txt, col, fs, ls) => neonTxt(txt.toUpperCase(), col, fs, { white:true, ls:ls }).replace(/url\(#mg(B\d|H)\)/g, 'url(#' + u + '$1)');
  function scCartelSvg(nom, W, H){
    const u = 'scmg' + (++scUid), k = W / 300;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + scMgDefs(u) + tapiz(W, H, 17) +
      '<g transform="translate(' + W / 2 + ' ' + (H / 2 - 22 * k).toFixed(1) + ')">' + scNeon(u, nom[0], NEON.cian, 26 * k, 3) + '</g>' +
      '<g transform="translate(' + W / 2 + ' ' + (H / 2 + 20 * k).toFixed(1) + ')">' + scNeon(u, nom[1], NEON.mag, 40 * k, 2) + '</g></svg>';
  }
  function scSedeSvg(){
    const W = 640, H = 360, u = 'scmg' + (++scUid), L = (SC.mes ? [SB_G.nom] : []).concat(SC_SEDE).slice(0, 6);
    let g = scMgDefs(u) + tapiz(W, H, 23) + '<g transform="translate(' + W / 2 + ' 42)">' + scNeon(u, 'En sincro', NEON.cian, 26, 6) + '</g>' +
      '<text x="' + W / 2 + '" y="82" text-anchor="middle" font-family="Archivo, Arial Narrow, sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#fff" opacity=".7">LOS GRUPOS DE SARMIENTO</text>';
    L.forEach((n, i) => { const fila = Math.floor(i / 3), enFila = Math.min(3, L.length - fila * 3), cx = W / (2 * enFila) * (1 + 2 * (i % 3)), cy = 160 + fila * 118;
      g += '<g transform="translate(' + cx.toFixed(1) + ' ' + (cy - 17) + ')">' + scNeon(u, n[0], NEON.cian, 17, 2) + '</g><g transform="translate(' + cx.toFixed(1) + ' ' + (cy + 15) + ')">' + scNeon(u, n[1], NEON.mag, 23, 1) + '</g>'; });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="La pantalla de la sede: ' + L.map(n => n.join(' ')).join(', ') + '">' + g + '</svg>';
  }
  function scSedeAbrir(){ $('#scTv').innerHTML = scSedeSvg(); $('#scSede').hidden = false; }
  function scCartelAbrir(){
    $('#cartelWall').innerHTML = scCartelSvg(SB_G.nom, 340, 190);
    $('#cartelTag').innerHTML = '<span>¡Mes del grupo!</span>';
    $('#cartelTxt').textContent = SB_G.nom.join(' ') + ' hicieron su fecha tres semanas este mes. El cartel va a Tu mural de cada uno de los seis.';
    $('#cartelBen').hidden = true; $('#cartelMural').hidden = true;
    $('#cartelOv').dataset.ev = 'grupo'; $('#cartelOv').hidden = false;
  }
  $('#cartelX').addEventListener('click', () => { $('#cartelMural').hidden = false; });
  $('#cartelShare').addEventListener('click', () => { if ($('#cartelOv').dataset.ev !== 'grupo') return; $('#cartelOv').hidden = true; $('#cartelMural').hidden = false; go('socialC'); scContar('grupo'); });
  // La invitación de anfitrión: sale del profe (que la ve en su tablero por antigüedad y VIVA Flow sostenido), no de la app.
  function scAnf(){
    if (!SC.anf || SC.e === 'solo' || SC.anfR === 'no') return '';
    if (SC.anfR === 'si') return '<div class="card" style="gap:10px">' + sbProfe('Tu profe') + '<span style="line-height:1.45">✓ Le dijiste que sí. Prof. Lucas te escribe antes del próximo primer jueves.</span></div>';
    return '<div class="card" style="gap:12px">' + sbProfe('Tu profe te invita') + '<span style="line-height:1.45">Martina, hace meses que venís firme. ¿Me ayudás a recibir a los nuevos en el primer jueves? Es entrenar con ellos esa hora.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-scanf="no">Ahora no</button><button class="btn sm" data-scanf="si">Acepto</button></div></div>';
  }
  const scQuiero = () => '<div class="list"><div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">Quiero sumarme a un grupo</span>' +
    '<span class="small muted">' + (SC.quiero ? 'Prof. Lucas ya sabe. Queda entre vos y tu profe.' : 'Se lo decimos a tu profe. No lo ve otro socio.') + '</span></span>' +
    '<button class="btn sm' + (SC.quiero ? ' ghost' : '') + '" data-scquiero>' + (SC.quiero ? '✓ Avisado' : 'Quiero') + '</button></div></div>';
  const scEventos = () => '<div class="stack" style="gap:12px"><span class="lbl">Lo que viene en Viva</span><div class="list">' +
    MV_VIENE.filter(e => e.k === 'Evento').map(e => { const on = !!SC.anot[e.id];
      return '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + e.dia + ' ' + e.hora + ' · ' + e.t + '</span>' +
        '<span class="small muted">' + e.donde + ' · ' + (e.n + (on ? 1 : 0)) + ' anotados</span></span><button class="btn sm' + (on ? ' ghost' : '') + '" data-scanot="' + e.id + '">' + (on ? '✓ Anotado' : 'Me anoto') + '</button></div>'; }).join('') + '</div></div>';
  function scSolo(){
    const p = SC.primer;
    return '<div class="card" style="gap:14px"><span class="mvk">Tu ritmo</span><div class="fwrap scdial">' + scDial() + '</div>' +
        '<span class="stack" style="gap:6px">' + scFirma('Tu ritmo', 'va solo') + '<span class="small muted" style="font-size:14px">¿Lo sumás a otro?</span></span></div>' +
      mvPos('c', '<span class="mvk">Tu primer jueves · ' + SB_G.sede + '</span>' +
        '<span class="stack" style="gap:8px"><span class="mvbig"><span class="mvfirma sig"><i>' + SB_G.dia + '</i></span><span class="mvnum">' + SB_G.hora + '</span></span>' +
        '<span class="mvsub">Prof. Lucas recibe a los que arrancaron esta semana: cada uno su rutina, a la misma hora, con él en la sala.</span></span>' +
        '<span class="stack" style="gap:10px"><button class="btn' + (p ? ' ghost' : '') + '" data-scprimer>' + (p ? '✓ Anotado' : 'Me anoto') + '</button>' +
        '<span class="mvsub">' + (p ? 'Te espera en la entrada de la sala.' : 'Esta semana arrancan 5.') + '</span></span>') +
      (scMenor() ? '' : mvPos('m', '<span class="mvk">Vení con alguien</span>' + scFirma('Traé', 'a alguien') +
        '<span class="stack" style="gap:10px"><span class="mvsub">Si viene, arrancan en dupla: cada uno con su meta, y la semana se enciende cuando cumplen los dos.</span><button class="btn ghost" data-sctrae>Invitar por WhatsApp</button></span>')) +
      scQuiero() + scEventos();
  }
  function scDupla(){
    const d = SC_DUO, cur = semCumplida(), n = d.sem + (cur ? 1 : 0), f = Math.max(1, semMetas().vis - WK.vis);
    return scAnf() + mvPos('m', '<div class="mvcab"><span class="mvduo"><span class="av sm" style="background:' + grad(MV_YO) + '">M</span><span class="av sm" style="background:' + grad(d.c) + '">' + inicial(d.n) + '</span></span>' +
        '<span class="stack" style="gap:0;flex:1;min-width:0"><span class="mvk">Tu dupla</span><span class="small muted">La ven ustedes dos</span></span></div>' +
        scFirma('En sincro', 'con ' + d.n) +
        scPulso(d.pulso, cur, false, 'El pulso de la dupla: una marca por cada semana en que cumplieron los dos') +
        '<span class="mvbig"><span class="mvnum">' + n + '</span>' + scFirma('semanas', 'en sincro') + '</span>' +
        '<span class="mvsub">' + (cur ? 'Esta semana ya están en sincro ⚡' : 'Esta semana, en marcha: se enciende cuando cumplan los dos, cada uno con su meta. Con ' + f + (f === 1 ? ' entrenamiento más tuyo' : ' entrenamientos más tuyos') + ', estás.') + '</span>' +
        (scMenor() ? '' : '<button class="btn" data-sccontar="dupla">Contalo</button>')) +
      scQuiero() + scEventos();
  }
  const scDesafio = g => '<div class="card" style="gap:10px"><span class="between"><span style="font-weight:700">Desafío del mes</span><span class="small muted">' + g.des[0] + ' de ' + g.des[1] + '</span></span>' +
    '<span class="bar" data-n="10"><i style="width:' + Math.round(g.des[0] / g.des[1] * 100) + '%"></i></span><span class="small muted" style="line-height:1.4">Semanas cumplidas de todo el grupo, sumadas: cada uno con su meta. La meta es del grupo y se llena entre todos.</span></div>';
  function scCruce(g){
    const row = (nom, d, yo) => { const p = Math.round(d[0] / d[1] * 100);
      return '<span class="stack" style="gap:6px"><span class="between"><span style="font-weight:700">' + nom + '</span><span class="small muted">' + p + ' % de su meta</span></span>' +
        '<span class="bar' + (yo ? '' : ' scotro') + '" data-n="10"><i style="width:' + p + '%"></i></span></span>'; };
    return '<div class="card" style="gap:14px"><span class="mvk">El cruce del mes</span>' + row(SB_G.nom.join(' '), g.des, true) + row(SC_OTRO.nom, SC_OTRO.des, false) +
      '<span class="small muted" style="line-height:1.4">Dos grupos, cada uno contra su propia meta del mes. Llega más lejos el que más llena la suya.</span></div>';
  }
  function scGrupo(){
    const g = SC_G[SC.e], flow = scSeguidas(g.pulso) >= 4, v = SC.voy, van = 3 + (v === 'voy' ? 1 : 0);
    const op = (k, t) => '<button class="opt" data-scvoy="' + k + '" aria-pressed="' + (v === k) + '">' + t + '</button>';
    const hit = [4, 12, 24].map(h => '<span class="sbhito' + (g.fechas >= h ? ' on' : '') + '">' + h + '</span>').join('<i class="sbhl"></i>');
    return scAnf() +
      '<div class="stack" style="gap:12px"><span class="mvk">Tu grupo' + (flow ? ' · En Flow' : '') + '</span>' + scFirma(SB_G.nom[0], SB_G.nom[1]) + sbProfe('Lo convoca · ' + SB_G.sede) + '</div>' +
      mvPos('c', '<span class="mvk">Próxima fecha · ' + SB_G.sede + '</span>' +
        '<span class="stack" style="gap:8px"><span class="mvbig"><span class="mvfirma sig"><i>' + SB_G.dia + '</i></span><span class="mvnum">' + SB_G.hora + '</span></span><span class="mvsub">' + SB_G.que + ', con Prof. Lucas</span></span>' +
        '<span class="stack" style="gap:10px"><div class="opts g2">' + op('voy', 'Voy') + op('no', 'No llego') + '</div>' +
        '<span class="mvsub">' + (v === 'voy' ? 'Vamos ' + van : 'Van ' + van) + (v === 'no' ? ' · esta vez no llegás: lo sabe tu profe' : '') + '</span></span>') +
      mvPos(flow ? 'f' : 'm', '<span class="mvk">El pulso del grupo' + (flow ? ' · En Flow' : '') + '</span>' +
        scPulso(g.pulso, 0, flow, 'El pulso del grupo: una marca por cada semana con fecha') +
        '<span class="mvbig"><span class="mvnum">' + g.fechas + '</span>' + scFirma('fechas', 'juntos') + '</span>' +
        '<div class="sbhitos">' + hit + '</div>' +
        '<span class="mvsub">' + (flow ? scSeguidas(g.pulso) + ' semanas seguidas con fecha: el grupo está en Flow. ' : '') + 'Se enciende cada semana que el grupo hace su fecha.</span>') +
      (SC.mes ? mvPos('m', '<span class="mvk">El mes del grupo</span><button class="sccartel" data-sccartel aria-label="Ver el cartel de ' + SB_G.nom.join(' ') + '">' + scCartelSvg(SB_G.nom, 300, 150) + '</button>' +
          '<span class="stack" style="gap:6px">' + scFirma('Mes del grupo', 'cumplido') + '<span class="mvsub">Tres semanas con fecha este mes. El cartel va a Tu mural de cada uno de los seis.</span></span>')
        : '<div class="card" style="gap:8px"><span class="mvk">El mes del grupo</span><span style="font-weight:700">Van 2 de 3 semanas con fecha</span><span class="small muted" style="line-height:1.4">Con la tercera, el grupo enciende su cartel y va a Tu mural de cada uno.</span></div>') +
      (SC.e === 'flow' ? scCruce(g) : scDesafio(g)) +
      (scMenor() ? '<span class="mvdef">Los cambios de la fecha te los avisa tu profe.</span>'
        : '<div class="stack" style="gap:10px"><button class="btn" data-scfoto>' + SB_CAM + 'La foto de la fecha</button>' +
          '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-scwa>' + SB_WA + 'Su WhatsApp</button><button class="btn ghost sm" data-sccontar="grupo">Contalo a tu grupo</button></div></div>') +
      '<div class="stack" style="gap:12px"><span class="lbl">Son 6</span><div class="sbint">' +
        SB_G.gente.map(q => '<span class="sbper"><span class="av sm" style="background:' + grad(q[1]) + '">' + (q[0] === 'Vos' ? 'M' : inicial(q[0])) + '</span><span class="small">' + q[0] + '</span></span>').join('') + '</div></div>' +
      scEventos();
  }
  function scRender(){
    const c = $('#scCuerpo'); if (!c) return;
    c.innerHTML = SC.e === 'solo' ? scSolo() : SC.e === 'dupla' ? scDupla() : scGrupo();
  }
  function scHoja(html){ $('#scHojaIn').innerHTML = html; $('#scHoja').hidden = false; }
  const scSale = (a, b) => '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sccomp="wa" type="button">' + a + '</button><button class="btn sm" data-sccomp="ig" type="button">' + b + '</button></div><button class="btn ghost sm" data-scx type="button">Cerrar</button>';
  function scContar(k){
    if (k === 'dupla') { const n = SC_DUO.sem + (semCumplida() ? 1 : 0);
      return scHoja('<span class="mtitle sig"><b>Contalo</b> <i>a tu dupla</i></span>' +
        mvPos('m', '<span class="mvk">' + SC_DUO.n + ' y vos · ' + miSede + '</span><span class="mvbig"><span class="mvnum">' + n + '</span>' + scFirma('semanas', 'en sincro') + '</span><span class="mvsub">Cada uno con su meta, los dos cumplieron.</span>') +
        '<span class="small muted" style="line-height:1.45">Sale con el marco de VIVA y no se guarda en Vivapp.</span>' + scSale('Al WhatsApp de los dos', 'A tu historia')); }
    if (!SC.mes) SC.contar = 'ficha';
    const fa = typeof semAcum === 'function' ? semAcum() : 0;
    const op = (v, t, s) => '<button class="opt" data-sccq="' + v + '" aria-pressed="' + (SC.contar === v) + '">' + t + '<small>' + s + '</small></button>';
    scHoja('<span class="mtitle sig"><b>Contalo</b> <i>a tu grupo</i></span><span class="muted" style="line-height:1.45">Sale al WhatsApp de ' + SB_G.nom.join(' ') + ', si querés. En Vivapp no queda nada.</span>' +
      '<div class="opts g2">' + (SC.mes ? op('cartel', 'El cartel del grupo', 'Mes del grupo cumplido') : '') + op('ficha', 'Tu ficha', fa === 1 ? '1 semana cumplida' : fa + ' semanas cumplidas') + '</div>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-scx type="button">Cerrar</button><button class="btn sm" data-sccomp="wa" type="button">Al WhatsApp del grupo</button></div>');
  }
  function scFoto(){ const g = SC_G[SC.e] || SC_G.grupo;
    scHoja('<span class="mtitle sig"><b>La foto</b> <i>de la fecha</i></span>' + mvFoto(['#07b0f2','#f400a0'], ['Fecha ' + g.fechas, SB_G.nom.join(' ')], SB_G.sede + ' · ' + SB_G.diaL, true) +
      '<span class="small muted" style="line-height:1.45">Tu foto de fondo y el dato como sticker. Sale y no se guarda en Vivapp. Si sale alguien más, que esté de acuerdo.</span>' + scSale('Al WhatsApp del grupo', 'A tus historias'));
  }
  $('#socialC').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#scHoja').hidden = true; };
    let b;
    if ((b = q('[data-scvoy]'))) { SC.voy = b.dataset.scvoy; scRender(); toast(SC.voy === 'voy' ? '¡Vamos! Te esperan el ' + SB_G.diaL + ' a las 19' : 'Listo, tu profe ya sabe. Te esperan en la próxima'); return; }
    if (q('[data-scprimer]')) { SC.primer = !SC.primer; scRender(); toast(SC.primer ? 'Te anotaste al primer jueves · 19 h' : 'Te bajaste del primer jueves'); return; }
    if (q('[data-scquiero]')) { SC.quiero = !SC.quiero; scRender(); toast(SC.quiero ? 'Le avisamos a Prof. Lucas que querés sumarte a un grupo' : 'Listo, no le avisamos nada'); return; }
    if ((b = q('[data-scanot]'))) { const id = b.dataset.scanot, ev = MV_VIENE.find(x => x.id === id); SC.anot[id] = !SC.anot[id]; scRender();
      toast(SC.anot[id] ? 'Te anotaste a ' + ev.t + ' · ' + ev.dia + ' ' + ev.hora : 'Te bajaste de ' + ev.t); return; }
    if ((b = q('[data-scanf]'))) { SC.anfR = b.dataset.scanf; scRender(); toast(SC.anfR === 'si' ? 'Le avisamos a Prof. Lucas que aceptás' : 'Listo, se lo decimos a tu profe'); return; }
    if (q('[data-scwa]')) { toast('Se abre el WhatsApp de ' + SB_G.nom.join(' ')); return; }
    if (q('[data-scfoto]')) { scFoto(); return; }
    if (q('[data-sctrae]')) { scHoja('<span class="mtitle sig"><b>Traé</b> <i>a alguien</i></span><span class="muted" style="line-height:1.45">Le mandás por WhatsApp una invitación de Viva para venir a entrenar con vos. Si viene, arrancan en dupla.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-scx type="button">Cerrar</button><button class="btn sm" data-scinv type="button">Invitar</button></div>'); return; }
    if (q('[data-scinv]')) { cerrar(); toast('Elegí a quién mandarle la invitación'); return; }
    if ((b = q('[data-sccontar]'))) { scContar(b.dataset.sccontar); return; }
    if ((b = q('[data-sccq]'))) { SC.contar = b.dataset.sccq; scContar('grupo'); return; }
    if ((b = q('[data-sccomp]'))) { cerrar(); toast(b.dataset.sccomp === 'ig' ? 'Lista para tu historia de Instagram' : 'Lista para mandar al WhatsApp'); return; }
    if (q('[data-sccartel]')) { scCartelAbrir(); return; }
    if (q('[data-scsedex]')) { $('#scSede').hidden = true; return; }
    if (e.target.id === 'scHoja' || q('[data-scx]')) cerrar();
  });
//#bloque 228
  // ===== T23 · Social VIVA, versión D: La vibra (v102) =====
  // Tres bloques y nada más: La fecha (cuándo se ve la banda) · El pulso (el cruce de la semana con otra banda) · La vibra (lo último que
  // logró la banda, mezclado con la cuenta oficial de Viva en Instagram y Social VIVA). Estados: sin banda · con banda (Los del jueves).
  // Día del cruce (panel): lunes (rival nuevo) · jueves (en juego) · lunes siguiente (ganaron / esta vez no). Todo simulado.
  // En real: bandas, fechas y cruces, base de Vivapp y el tablero del profe (el profe arma las bandas) · Voy / No llego, declarado ·
  // el pulso, entradas de EVO del mismo día (hoy dependen de Viva Gestión; con las de la noche, La vibra muestra lo de ayer), guardado solo
  // como % de la banda · eventos, lo que la app ya calcula (semana cumplida, tramo, VIVA Flow, Mes cumplido, fichas, entrada del día),
  // filtrado por el permiso de cada socio por tipo · publicaciones, la cuenta profesional de Viva en Instagram · Social VIVA, lo que carga marketing.
  // Piso: solo cosas logradas, nunca faltas (sin "volvió": contaría que alguien dejó de venir); los eventos dicen el día, nunca la hora;
  // nunca cuánto aportó cada uno al pulso; el ⚡ no se cuenta en público; nada que un socio escriba o fotografíe queda guardado;
  // menores: sin eventos propios, sin WhatsApp y sin salida a Instagram.
  var SD = { e:'con', dia:'jue', ig:/github\.io$/.test(location.hostname) ? 'vivo' : 'ej', tab:'Sincro', voy:'voy', quiero:false,
    rayo:{}, anot:{}, comp:{ sem:true, tramo:true, mes:true, hoy:false }, preg:false };
  const SD_TABS = ['Sincro', 'En VIVO', 'Banda', 'Vibra'];
  const SD_IG = 'https://www.instagram.com/vivafithouse/';
  const SD_GENTE = { Cris:['#3a8a7a','#0e2a24'], Lu:['#9a4f8a','#2c1028'], Nico:['#5a7aa8','#141e2e'], Sofi:['#c08a3a','#33230c'], Tomi:['#8a5a3a','#2a180c'], Vale:['#a85a5a','#2e1212'], Mica:['#3a6a9a','#0f2034'] };
  // El cruce: cada banda en % de su propia meta de la semana (la de la banda = 80 % de la suma de las metas de sus integrantes).
  const SD_RIVAL = ['Las de', 'las 7'], SD_RIVAL2 = ['Los', 'madrugadores'];
  const SD_CRUCE = { lun0:[6, 4], jue:[62, 58], gano:[104, 88], perdio:[85, 92] };
  const SD_HIST = [0, 1, 0, 1, 0, 1, 1, 1];   // los 8 cruces anteriores a esta semana (1 = ganado); el último se ganó el lunes
  const sdLun1 = () => SD.dia === 'gano' || SD.dia === 'perdio';
  const sdUltimos = () => SD.dia === 'gano' ? SD_HIST.slice(1).concat([1]) : SD.dia === 'perdio' ? SD_HIST.slice(1).concat([0]) : SD_HIST;
  // La vibra: eventos que salen solos de los datos. a = días antes del jueves del cruce (negativo: después). "Entrenó hoy" vive solo ese día.
  const SD_EV = [
    { k:'hoy', n:'Tomi', a:3 }, { k:'hoy', n:'Mica', a:0 }, { k:'hoy', n:'Nico', a:-4 },
    { k:'sem', n:'Lu', a:-1 }, { k:'ficha', n:'Mica', num:4, a:-2 }, { k:'tramo', n:'Cris', t:'Firme', a:-3 },
    { k:'sem', n:'Cris', a:0 }, { k:'tramo', n:'Lu', t:'Firme', a:1 }, { k:'flow', n:'Nico', a:1 }, { k:'mes', n:'Sofi', a:2 }, { k:'ficha', n:'Tomi', num:12, a:2 },
    { k:'gano', a:3 }, { k:'nuevo', n:'Vale', a:3 }, { k:'sem', n:'Sofi', a:5 }, { k:'ficha', n:'Lu', num:24, a:6 }
  ];
  const SD_DOW = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
  const sdBanda = x => x.k === 'gano' || x.k === 'cartel';
  function sdEventos(){
    const off = SD.dia === 'lun0' ? -3 : SD.dia === 'jue' ? 0 : 4, dow = SD.dia === 'jue' ? 4 : 1;
    const ev = SD_EV.concat(SD.dia === 'gano' ? [{ k:'gano', a:-4 }, { k:'cartel', a:-4 }] : []);
    return ev.map(x => Object.assign({ age:x.a + off, id:x.k + (x.n || '') + x.a }, x))
      .filter(x => x.age >= 0 && x.age <= 6 && (x.k !== 'hoy' || x.age === 0))
      .sort((p, q) => p.age - q.age || sdBanda(q) - sdBanda(p))
      .map(x => Object.assign(x, { cuando:x.age === 0 ? 'hoy' : x.age === 1 ? 'ayer' : SD_DOW[(dow - x.age + 7) % 7] }));
  }
  const SD_TXT = { hoy:['Entrenó', 'hoy'], sem:['Cumplió', 'su semana'], nuevo:['Se sumó', 'a la banda'], gano:['Ganó', 'el cruce'], cartel:['Encendió', 'su cartel'] };
  function sdEv(x){
    const banda = sdBanda(x), yo = !!x.yo, on = !!SD.rayo[x.id];
    const f = yo ? ['Cumpliste', 'tu semana'] : x.k === 'tramo' ? ['Subió a', x.t] : x.k === 'flow' ? ['Entró en', 'VIVA Flow'] : x.k === 'mes' ? ['Encendió', mesTxt(ahora().getMonth())]
      : x.k === 'ficha' ? ['Llegó a', x.num + ' semanas'] : SD_TXT[x.k];
    const cls = x.k === 'flow' ? 'f' : x.k === 'hoy' || x.k === 'nuevo' ? 'c' : 'm', quien = banda ? SB_G.nom.join(' ') : yo ? 'Vos' : x.n;
    const av = banda ? '<span class="av sm sdbav" aria-hidden="true">' + MV_RAYO + '</span>'
      : '<span class="av sm" style="background:' + grad(yo ? MV_YO : SD_GENTE[x.n]) + '">' + (yo ? 'M' : inicial(x.n)) + '</span>';
    const acc = yo ? '<span class="small muted sdtuyo">3 ' + MV_RAYO + '<br>lo ves vos</span>'
      : '<button class="clap sdrayo" data-sdrayo="' + x.id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + quien + '">' + MV_RAYO + '</button>';
    return '<article class="mvpos sdev ' + cls + '"><div class="sdevrow">' + av +
      '<span class="stack" style="gap:3px;flex:1;min-width:0"><span class="small muted"><b class="sdq">' + quien + '</b>' + (x.k === 'hoy' ? '' : ' · ' + x.cuando) + '</span>' +
      '<span class="mvfirma sig' + (cls === 'f' ? ' flow' : '') + '"><b>' + f[0] + '</b> <i>' + f[1] + '</i>' + (x.k === 'sem' || banda ? ' ' + MV_RAYO : '') + '</span></span>' + acc + '</div>' +
      (x.k === 'cartel' ? '<div class="sccartel sdcartel" role="img" aria-label="El cartel de ' + quien + '">' + scCartelSvg(SB_G.nom, 300, 150) + '</div>' +
        '<span class="mvsub">Tres semanas del mes al 100 % de su meta. Va a Tu mural de cada uno.</span>' : '') + '</article>';
  }
  // La cuenta oficial de Viva en Instagram. Ejemplo: escenas dibujadas (como las de la A), sin copiar nada de Instagram. En vivo: el perfil incrustado.
  const SD_IGEJ = [[['#f400a0','#07b0f2'], 'A veces con ganas. A veces no tanto. Pero en VIVA, siempre terminás mejor ⚡'], [['#07b0f2','#ffe94a'], 'Social VIVA: running y desayuno ⚡ ¿Te sumás?']];
  function sdIgEj(i){
    const P = SD_IGEJ[i % 2];
    const esc = mvFoto(P[0], ['', ''], '').replace(/<span class="mvmarco">[\s\S]*<\/div>$/, '</div>')
      .replace(/aria-label="[^"]*"/, 'aria-label="Publicación de ejemplo de Viva en Instagram"').replace('>Foto de ejemplo<', '>Ejemplo<');
    return '<article class="mvp sdig">' + mvCab('VIVA en Instagram', ['#3c4658','#12161d'], '@vivafithouse · ejemplo') + esc +
      '<span class="mvtxt">' + P[1] + '</span><a class="btn ghost sm" href="' + SD_IG + '" target="_blank" rel="noopener">Ver en Instagram</a></article>';
  }
  const sdIgVivo = () => '<article class="card sdigv"><span class="between"><span class="mvk">VIVA en Instagram</span><a class="link lime" href="' + SD_IG + '" target="_blank" rel="noopener">Abrir</a></span>' +
    '<iframe class="sdigf" src="' + SD_IG + 'embed/" title="La cuenta de Viva en Instagram" loading="lazy"></iframe>' +
    '<span class="small muted" style="line-height:1.4">' + (/github\.io$/.test(location.hostname) ? 'Si no carga, tocá Abrir.' : 'Acá Instagram no carga: probalo en la copia del iPhone.') + '</span></article>';
  function sdSocial(){
    const e = MV_VIENE.find(x => x.id === 'e2'), on = !!SD.anot.e2;
    return '<article class="mvp">' + mvCab('Viva', ['#3c4658','#12161d'], 'Lo publica Viva · ' + e.donde) + mvPos('c', '<span class="mvk">Social VIVA · ' + e.donde + '</span>' +
      '<span class="stack" style="gap:8px"><span class="mvbig"><span class="mvfirma sig"><i>' + e.dia + '</i></span><span class="mvnum">' + e.hora + '</span></span>' + scFirma('Running', 'y desayuno') + '</span>' +
      '<span class="stack" style="gap:8px"><button class="btn sm' + (on ? ' ghost' : '') + '" data-sdanot>' + (on ? '✓ Te anotaste' : 'Me anoto') + '</button><span class="mvsub">' + (e.n + (on ? 1 : 0)) + ' anotados</span></span>') + '</article>';
  }
  function sdCab(con){
    return '<div class="sdhead"><div class="stack" style="gap:6px;flex:1;min-width:0"><h1 class="mtitle sig"><b>En</b> <i>sincro</i></h1>' +
      (con ? '<span class="sdbanda">' + SB_G.nom.join(' ') + '</span><span class="small muted">Tu banda · la convoca Prof. Lucas</span>' : '<span class="small muted">Tu ritmo, con el de otros.</span>') + '</div>' +
      (scMenor() ? '' : '<button class="btn ghost sdmsg" data-sdmsg aria-label="Mensajes: abre WhatsApp">' + SB_WA + '<span>WhatsApp</span></button>') + '</div>';
  }
  // 1 · La fecha: una franja. En una sala sin clases, la banda se encuentra a la misma hora y cada uno hace su rutina.
  function sdFecha(){
    const v = SD.voy, van = 3 + (v === 'voy' ? 1 : 0), r = rutinas.profe, d = r && r.dias && r.dias[r.next];
    const op = (k, t) => '<button class="opt" data-sdvoy="' + k + '" aria-pressed="' + (v === k) + '">' + t + '</button>';
    return '<div class="card sdfecha"><div class="sdfrow"><span class="sdcuando"><i>' + (SD.dia === 'jue' ? 'Hoy' : 'Jue') + '</i><b>' + SB_G.hora + '</b></span>' +
      '<span class="stack" style="gap:3px;flex:1;min-width:0"><span class="mvk">La fecha · ' + SB_G.sede + '</span><span class="small" style="line-height:1.35">Cada uno su rutina, a la misma hora.' + (d ? ' A vos te toca el Día ' + d.k + '.' : '') + '</span></span></div>' +
      '<div class="sdfrow"><div class="opts g2" style="flex:1">' + op('voy', 'Voy') + op('no', 'No llego') + '</div><span class="sdvan">' + (v === 'voy' ? 'Vamos ' : 'Van ') + van + '</span></div></div>';
  }
  // 2 · El pulso: dos barras (ecualizador de Inicio), cada banda en % de su propia meta; debajo, los últimos 8 cruces (encendida = ganado).
  function sdCeldas(arr){
    const N = arr.length, W = 300, H = 18, GP = 7, sw = (W - GP * (N - 1)) / N, id = 'sdc' + (++scUid), L = eqLuz(1);
    let g = '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-20" y="-20" width="' + (W + 40) + '" height="' + (H + 40) + '"><feGaussianBlur stdDeviation="2.6"/></filter></defs>' +
      '<rect class="rl-slot" x="-4" y="-4" width="' + (W + 8) + '" height="' + (H + 8) + '" rx="6"/>';
    arr.forEach((on, i) => { g += eqCeldaFila(i * (sw + GP), 0, sw, H, !!on, on ? 'var(--dat)' : 'var(--muted)', L, id); });
    return '<svg class="scpsvg sdcsvg" viewBox="-8 -8 ' + (W + 16) + ' ' + (H + 16) + '" preserveAspectRatio="none" role="img" aria-label="Los últimos 8 cruces: ' + arr.filter(Boolean).length + ' ganados">' + g + '</svg>';
  }
  function sdPulso(){
    const c = SD_CRUCE[SD.dia], gano = SD.dia === 'gano', ult = sdUltimos();
    const fila = (nom, p, yo) => '<span class="sdbarra"><span style="font-weight:700' + (yo ? '' : ';color:var(--muted)') + '">' + nom + '</span>' +
      '<span class="bar ' + (yo ? 'sdyo' : 'scotro') + '" data-n="10"><i style="width:' + Math.min(100, p) + '%"></i></span></span>';
    const tit = SD.dia === 'lun0' ? scFirma('Rival', 'nuevo') : SD.dia === 'jue' ? scFirma('Vamos ' + c[0] + ' %', '· ellos ' + c[1] + ' %')
      : gano ? '<span class="mvfirma sig"><b>Ganaron</b> <i>' + c[0] + ' a ' + c[1] + '</i> ' + MV_RAYO + '</span>' : scFirma('Esta vez no:', c[1] + ' a ' + c[0]);
    const sub = SD.dia === 'lun0' ? 'Arranca hoy. Cada entrenamiento de la banda suma.' : SD.dia === 'jue' ? 'Quedan 4 días. Cada entrenamiento suma.'
      : gano ? 'Hoy arranca otro cruce, contra ' + SD_RIVAL2.join(' ') + '.' : 'Hoy arranca la revancha.';
    return mvPos(gano ? 'm sdpulso' : 'c sdpulso', '<span class="mvk">El pulso · ' + (sdLun1() ? 'la semana pasada' : 'esta semana') + '</span>' +
      '<span class="stack" style="gap:6px">' + tit + '<span class="mvsub">' + sub + '</span></span>' +
      '<span class="stack" style="gap:12px">' + fila(SB_G.nom.join(' '), c[0], true) + fila(SD_RIVAL.join(' '), c[1], false) + '</span>' +
      '<span class="stack" style="gap:6px">' + sdCeldas(ult) + '<span class="scpie"><span>Últimos 8 cruces</span><span>Cruces ganados: ' + ult.filter(Boolean).length + '</span></span></span>');
  }
  // 3 · La vibra: lo de la banda (7 días, del más nuevo al más viejo), con Instagram y Social VIVA mezclados. Termina: "Estás al día".
  function sdVibra(con){
    const L = con ? sdEventos() : [];
    if (con && SD.dia === 'jue' && !scMenor() && SD.comp.sem && semCumplida()) L.unshift({ k:'sem', yo:true, id:'yo', cuando:'esta semana' });
    const it = L.map(sdEv), ins = (pos, h) => it.splice(Math.min(pos, it.length), 0, h);
    if (SD.ig === 'vivo') ins(2, sdIgVivo()); else ins(2, sdIgEj(0));
    ins(5, sdSocial()); if (SD.ig !== 'vivo') ins(9, sdIgEj(1));
    return '<div class="stack" style="gap:14px"><div class="between"><span class="stack" style="gap:2px"><span class="lbl">' + (con ? 'La vibra' : 'La vibra de Viva') + '</span>' +
      '<span class="small muted">' + (con ? 'Lo último de tu banda y de Viva' : 'Lo último de Viva') + '</span></span>' + (con ? '<button class="link lime sdcomp" data-sdcomp>Qué compartís</button>' : '') + '</div>' +
      '<div class="mvfeed" style="gap:14px">' + it.join('') + '</div><span class="mvfin">Estás al día ⚡</span></div>';
  }
  function sdSin(){
    const q = SD.quiero;
    return mvPos('c', '<span class="mvk">Tu banda</span><span class="stack" style="gap:8px">' + scFirma('Tu ritmo', 'va solo') + '<span style="font-size:17px;font-weight:700">¿Armás tu banda?</span></span>' +
      '<span class="stack" style="gap:10px">' + (scMenor() ? '' : '<button class="btn" data-sdtrae>Traé a alguien</button><span class="mvsub">Con uno ya son banda.</span>') +
      '<button class="btn ghost" data-sdquiero>' + (q ? '✓ Prof. Lucas ya sabe' : 'Sumame a una banda') + '</button>' +
      '<span class="mvsub">' + (q ? 'Te va a proponer una banda en tu horario.' : 'Se lo decimos a tu profe. No lo ve otro socio.') + '</span></span>');
  }
  function sdRender(){
    const c = $('#sdCuerpo'); if (!c) return;
    const con = SD.e === 'con';
    c.innerHTML = sdCab(con) + (con ? sdFecha() + sdPulso() : sdSin()) + sdVibra(con);
    if (SD.preg && con) { SD.preg = false; sdCompartir(true); }
  }
  function sdHoja(html){ $('#sdHojaIn').innerHTML = html; $('#sdHoja').hidden = false; }
  const SD_COMP = [['sem', 'Tu semana cumplida'], ['tramo', 'Tu tramo y VIVA Flow'], ['mes', 'Tu mes y tus fichas'], ['hoy', 'Que entrenaste hoy']];
  function sdCompartir(primera){
    sdHoja('<span class="mtitle sig"><b>' + (primera ? 'Entraste a' : 'Qué compartís') + '</b> <i>' + (primera ? SB_G.nom.join(' ') : 'con tu banda') + '</i></span>' +
      (scMenor() ? '<span class="muted" style="line-height:1.45">Por ahora lo tuyo no sale a la banda: vos ves La vibra, la banda no ve lo tuyo.</span>'
        : '<span class="muted" style="line-height:1.45">' + (primera ? '¿Qué querés que vea tu banda? ' : '') + 'Solo cosas logradas, nunca la hora. Lo que no compartís, no aparece.</span>' +
          '<div>' + SD_COMP.map(x => '<label class="swrow" for="sdc_' + x[0] + '"><span style="flex:1">' + x[1] + '</span><input type="checkbox" class="sw" id="sdc_' + x[0] + '" data-sdsw="' + x[0] + '"' + (SD.comp[x[0]] ? ' checked' : '') + '></label>').join('') + '</div>' +
          '<span class="small muted">Lo cambiás cuando quieras, desde La vibra.</span>') +
      '<button class="btn" data-sdx type="button">Listo</button>');
  }
  function sdMsg(){
    const fila = (k, t, s) => '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + t + '</span><span class="small muted">' + s + '</span></span><button class="btn sm" data-sdwa="' + k + '">Abrir</button></div>';
    sdHoja('<span class="mtitle sig"><b>Mensajes</b> <i>por WhatsApp</i></span><div class="list">' + (SD.e === 'con' ? fila('banda', SB_G.nom.join(' '), 'El grupo de WhatsApp de tu banda') : '') +
      fila('profe', 'Prof. Lucas', 'Tu profe, a su número de trabajo') + '</div>' +
      '<span class="small muted" style="line-height:1.4">En Vivapp no hay chat: la charla vive en WhatsApp. Nunca ves el número de otro socio. En la demo, los enlaces son de ejemplo.</span>' +
      '<button class="btn ghost sm" data-sdx type="button">Cerrar</button>');
  }
  $('#socialD').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#sdHoja').hidden = true; };
    let b;
    if ((b = q('[data-sdvoy]'))) { SD.voy = b.dataset.sdvoy; sdRender(); toast(SD.voy === 'voy' ? '¡Vamos! Te esperan el jueves a las 19' : 'Listo, tu profe ya sabe. Te esperan en la próxima'); return; }
    if ((b = q('[data-sdrayo]'))) { const id = b.dataset.sdrayo, nom = b.getAttribute('aria-label').replace(/^(Sacarle|Mandarle) (el|un) rayo a /, '');
      SD.rayo[id] = !SD.rayo[id]; b.setAttribute('aria-pressed', !!SD.rayo[id]); b.setAttribute('aria-label', (SD.rayo[id] ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + nom); return; }
    if (q('[data-sdanot]')) { SD.anot.e2 = !SD.anot.e2; sdRender(); toast(SD.anot.e2 ? 'Te anotaste a Social VIVA · sábado 08:30' : 'Te bajaste de Social VIVA'); return; }
    if (q('[data-sdmsg]')) { sdMsg(); return; }
    if ((b = q('[data-sdwa]'))) { cerrar(); toast('Se abre WhatsApp: ' + (b.dataset.sdwa === 'banda' ? 'el grupo de ' + SB_G.nom.join(' ') : 'Prof. Lucas') + ' (enlace de ejemplo)'); return; }
    if (q('[data-sdcomp]')) { sdCompartir(false); return; }
    if (q('[data-sdquiero]')) { SD.quiero = !SD.quiero; sdRender(); toast(SD.quiero ? 'Le avisamos a Prof. Lucas que querés sumarte a una banda' : 'Listo, no le avisamos nada'); return; }
    if (q('[data-sdtrae]')) { sdHoja('<span class="mtitle sig"><b>Traé</b> <i>a alguien</i></span><span class="muted" style="line-height:1.45">Le mandás por WhatsApp una invitación de Viva para venir a entrenar con vos. Si viene, ya son banda.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sdx type="button">Cerrar</button><button class="btn sm" data-sdinv type="button">Invitar</button></div>'); return; }
    if (q('[data-sdinv]')) { cerrar(); toast('Elegí a quién mandarle la invitación'); return; }
    if (e.target.id === 'sdHoja' || q('[data-sdx]')) cerrar();
  });
  $('#socialD').addEventListener('change', e => { const s = e.target.closest('[data-sdsw]'); if (!s) return;
    SD.comp[s.dataset.sdsw] = s.checked; sdRender(); toast(s.checked ? 'Tu banda lo va a ver' : 'Tu banda ya no lo ve'); });
//#bloque 229
  // ===== T24 · Social VIVA, versión E: El ecualizador (v104) =====
  // Una pantalla, una pregunta: "¿cómo viene mi banda?". Unidad: el entrenamiento (la entrada a la sala); gesto: el ⚡; frase: tu banda entra
  // en sincro cuando llega a su semana. Protagonista: el ecualizador (una barra por integrante hacia su propia meta); de ahí cuelgan tres franjas
  // de una línea (Lo último · La fecha · El cruce) y, debajo del pliegue, Lo de Viva (contenido oficial, ilustrado por código: app/img/social).
  // Simulación: un conjunto fijo de entradas {socio, fecha} (forma de EVO: v1/entries), seis semanas de historia, una semana en curso (buena o
  // floja) y una banda rival. Todo lo que se ve (titular, barras, eventos, cruce) sale de las entradas; ningún número escrito a mano en el HTML.
  // En real: entradas de EVO del mismo día (sin verificar: viva-datos) · metas de Tu Ritmo · banda, fecha, ⚡ y consentimientos, tablas de
  // Vivapp · Lo de Viva, la cuenta oficial de Instagram · las bandas las arma el profe en su tablero.
  // Piso: la barra de cada uno es presencia (consentimiento aparte al entrar; se apaga y queda neutra, sus entrenamientos suman igual); solo lo
  // logrado (nunca quién falta ni días sin venir); sin horarios (hoy, ayer, el martes); el titular habla de la banda, nunca de una persona;
  // la semana que no se llega se cuenta sin rojo ni reproche; menores: barra neutra, sin WhatsApp y sin salida a Instagram.
  var SE = { soc:'con', mom:'jue', tam:5, neu:false, ig:/github\.io$/.test(location.hostname) ? 'vivo' : 'ej', vid:true, vivo:false, prisa:false,
    voy:'voy', primer:false, yoComp:true, preg:false, now:0, extra:[], rayo:{}, rec:{}, flash:null, nuevoSincro:false, avW:{}, rot:0 };
  const SE_GENTE = { Vos:MV_YO, Nico:['#3a8a7a','#0e2a24'], Sofi:['#c08a3a','#33230c'], Fede:['#5a7aa8','#141e2e'], Vale:['#a85a5a','#2e1212'],
    Lu:['#9a4f8a','#2c1028'], Tomi:['#8a5a3a','#2a180c'], Cami:['#8a4f9a','#22102c'] };
  // Integrantes de la demo (nombres inventados): meta semanal de cada uno (Tu Ritmo). La banda de 3, 5 u 8 sale de esta lista, en orden.
  const SE_INT = [{ id:'s1', n:'Vos', meta:3 }, { id:'s2', n:'Nico', meta:3 }, { id:'s3', n:'Sofi', meta:4 }, { id:'s4', n:'Fede', meta:2 }, { id:'s5', n:'Vale', meta:3 },
    { id:'s6', n:'Lu', meta:3 }, { id:'s7', n:'Tomi', meta:2 }, { id:'s8', n:'Cami', meta:3 }];
  const SE_TAM = { 3:['s1','s2','s4'], 5:['s1','s2','s3','s4','s5'], 8:['s1','s2','s3','s4','s5','s6','s7','s8'] };
  // Días y horas habituales de cada uno (L M X J V S D). La semana buena llega al sincro el sábado; la floja termina 7 de 12.
  const SE_HAB = { s1:'M18:30 J19:12', s2:'L06:30 X06:40 J19:15', s3:'L19:40 X20:10 J19:20', s4:'M07:10 S10:00', s5:'L18:10 X18:05 S11:20',
    s6:'M08:00 J13:00 S09:30', s7:'X21:00 V07:00', s8:'L12:30 J18:00 D10:00' };
  const SE_FLOJA = { s1:'M18:30 J19:12', s2:'L06:30 X06:40', s3:'L19:40 J19:20', s4:'S10:00', s5:'', s6:'M08:00', s7:'V07:00', s8:'J18:00' };
  // Historia: las seis semanas anteriores repiten los hábitos menos estas entradas (socio:orden). Con la banda de 5: 12 · 9 · 13 · 11 · 12 · 13.
  const SE_SALTA = { '-6':['s5:2'], '-5':['s2:2','s3:1','s5:0','s4:1'], '-4':[], '-3':['s1:1','s3:2'], '-2':['s4:0'], '-1':[] };
  // El cruce: la banda rival de esta semana (sus entradas, sin nombres) y el % de las rivales de las seis semanas anteriores.
  const SE_RIV = { nom:['Las de', 'las 7'], metas:{ r1:3, r2:2, r3:3, r4:2, r5:2 }, hab:{ r1:'L07:00 X07:05 S08:30', r2:'M07:05 V07:00', r3:'L07:10 J07:00', r4:'M07:00', r5:'J07:15' } };
  const SE_PAS = [['Los madrugadores', 92], ['Team sábado', 81], ['Las imparables', 95], ['Los del mediodía', 86], ['Las de las 7', 104], ['Los madrugadores', 88]];
  const SE_PROX = 'Los madrugadores';
  const SE_BASE = Date.UTC(2026, 10, 16);   // lunes de la semana de la demo
  const SE_SEM = 10080, SE_DIA = 1440, SE_JUE = 3 * SE_DIA, SE_NUEVA = SE_JUE + 20 * 60 + 15;   // la banda nueva se arma el jueves, después de la bienvenida
  const SE_MOM = { lun:360, mar:SE_DIA + 18 * 60 + 20, mie:2 * SE_DIA + 19 * 60, jue:SE_JUE + 19 * 60 + 10, sab:5 * SE_DIA + 9 * 60, sincro:5 * SE_DIA + 10 * 60 + 5,
    dom:6 * SE_DIA + 20 * 60, lun1:SE_SEM + 360 };
  const SE_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const SE_ABRE = [[5, 23], [5, 23], [5, 23], [5, 23], [5, 23], [8, 18], [9, 15]];   // horario de Viva (cultura-viva.md § 1)
  const seFm = m => new Date(SE_BASE + m * 60000).toISOString().slice(0, 16);
  const seMin = f => (Date.parse(f + ':00Z') - SE_BASE) / 60000;
  const seSlot = (w, t) => w * SE_SEM + 'LMXJVSD'.indexOf(t[0]) * SE_DIA + (+t.slice(1, 3)) * 60 + (+t.slice(4, 6));
  const seFloja = () => SE.soc === 'con' && (SE.mom === 'dom' || SE.mom === 'lun1');
  const seBanda = () => SE_INT.filter(m => SE_TAM[SE.tam].includes(m.id));
  const seNeuId = () => { const b = SE_TAM[SE.tam]; return b.includes('s3') ? 's3' : b[1]; };
  const seNeutra = id => id === 's1' ? (!SE.yoComp || scMenor()) : SE.neu && id === seNeuId();
  // Las entradas, con la forma de EVO ({socio, fecha}). La semana 0 es la de la demo; las extra son las que pasan mientras se mira.
  function seEntradas(){
    const L = [], add = (id, w, spec) => (spec || '').split(' ').filter(Boolean).forEach(t => L.push({ socio:id, fecha:seFm(seSlot(w, t)) }));
    for (let w = -6; w <= -1; w++) Object.keys(SE_HAB).forEach(id => { const salta = SE_SALTA[w].filter(x => x.split(':')[0] === id).map(x => +x.split(':')[1]);
      add(id, w, SE_HAB[id].split(' ').filter((_, i) => !salta.includes(i)).join(' ')); });
    const cur = seFloja() ? SE_FLOJA : SE_HAB; Object.keys(cur).forEach(id => add(id, 0, cur[id]));
    return L.concat(SE.extra).map(e => Object.assign({ m:seMin(e.fecha) }, e)).sort((a, b) => a.m - b.m);
  }
  const seRivEnt = () => { const L = []; Object.keys(SE_RIV.hab).forEach(id => SE_RIV.hab[id].split(' ').forEach(t => L.push({ socio:id, m:seSlot(0, t) }))); return L; };
  // La banda nueva cuenta desde el jueves en que se armó; su primera semana tiene la meta a la mitad (propuesta del ticket).
  const seDesde = w => SE.soc === 'nueva' && w === 0 ? SE_JUE : w * SE_SEM;
  function seMeta(w){ const s = seBanda().reduce((a, m) => a + m.meta, 0), m = Math.round(0.8 * s); return SE.soc === 'nueva' && w === 0 ? Math.round(m / 2) : m; }
  const seHechos = (E, id, w, hasta) => E.filter(e => e.socio === id && e.m >= seDesde(w) && e.m < (w + 1) * SE_SEM && e.m <= hasta).length;
  const seTotal = (E, w, hasta) => seBanda().reduce((a, m) => a + Math.min(m.meta, seHechos(E, m.id, w, hasta)), 0);
  function seRivPct(w, hasta){
    if (w < 0) return SE_PAS[w + 6][1];
    const t = Object.keys(SE_RIV.metas).reduce((a, id) => a + Math.min(SE_RIV.metas[id], seRivEnt().filter(e => e.socio === id && e.m <= hasta).length), 0);
    return Math.round(100 * t / Math.round(0.8 * Object.values(SE_RIV.metas).reduce((a, b) => a + b, 0)));
  }
  const sePct = (E, w, hasta) => Math.round(100 * seTotal(E, w, hasta) / seMeta(w));
  const seCruceRes = (E, w) => { const fin = (w + 1) * SE_SEM - 1, a = sePct(E, w, fin), b = seRivPct(w, fin); return { a:a, b:b, gano:a > b, riv:w < 0 ? SE_PAS[w + 6][0] : SE_RIV.nom.join(' ') }; };
  const seCuando = m => { const d = Math.floor(SE.now / SE_DIA) - Math.floor(m / SE_DIA); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'el ' + SE_DIAS[Math.floor(m / SE_DIA) % 7]; };
  const seNom = id => SE_INT.find(m => m.id === id).n;
  // Lo que pasó en la banda (7 días, del más nuevo al más viejo): entrenó · cumplió su semana · la banda entró en sincro · se sumó · ganó el cruce.
  function seEventos(E){
    const B = seBanda(), ids = B.map(m => m.id), desde = SE.now - 7 * SE_DIA, ev = [], cuenta = {}, tot = {};
    E.filter(e => ids.includes(e.socio) && e.m <= SE.now && e.m >= seDesde(Math.floor(e.m / SE_SEM))).forEach(e => {
      const w = Math.floor(e.m / SE_SEM), k = e.socio + w, meta = SE_INT.find(m => m.id === e.socio).meta;
      cuenta[k] = (cuenta[k] || 0) + 1; const antes = tot[w] || 0; if (cuenta[k] <= meta) tot[w] = antes + 1;
      if (e.m > desde && !(seNeutra(e.socio) && e.socio !== 's1')) ev.push({ k:cuenta[k] === meta ? 'sem' : 'ent', id:e.socio, m:e.m, key:e.socio + '@' + e.m });
      if (e.m > desde && antes < seMeta(w) && tot[w] >= seMeta(w)) ev.push({ k:'sincro', m:e.m + .5, key:'sincro@' + w });
    });
    if (SE.soc === 'nueva') B.forEach((b, i) => { if (SE_NUEVA <= SE.now && SE_NUEVA > desde) ev.push({ k:'nuevo', id:b.id, m:SE_NUEVA + i * .01, key:'nuevo' + b.id }); });
    else for (let w = Math.floor(desde / SE_SEM) + 1; w <= Math.floor(SE.now / SE_SEM); w++) { const r = seCruceRes(E, w - 1);
      if (r.gano && w * SE_SEM > desde && w * SE_SEM <= SE.now) ev.push({ k:'gano', m:w * SE_SEM + 1, key:'gano@' + w, r:r }); }
    return ev.sort((a, b) => b.m - a.m);
  }
  const SE_BANDA = () => SB_G.nom.join(' ');
  function seFirma(x){   // [verbo, resto, con rayo]
    const yo = x.id === 's1';
    if (x.k === 'sincro') return ['Entraron', 'en sincro', 1];
    if (x.k === 'gano') return ['Ganaron', 'el cruce', 1];
    if (x.k === 'nuevo') return yo ? ['Te sumaste', 'a la banda'] : ['Se sumó', 'a la banda'];
    if (x.k === 'sem') return yo ? ['Cumpliste', 'tu semana', 1] : ['Cumplió', 'su semana', 1];
    return [yo ? 'Entrenaste' : 'Entrenó', seCuando(x.m)];
  }
  const seQuien = x => x.id ? (x.id === 's1' ? 'Vos' : seNom(x.id)) : SE_BANDA();
  function seFrase(x){ const f = seFirma(x), r = f[2] ? ' ' + MV_RAYO : ''; return x.id === 's1' ? [f[0], f[1] + r] : [seQuien(x), f[0].toLowerCase() + ' ' + f[1] + r]; }
  const seAv = x => !x.id ? '<span class="av sm sdbav" aria-hidden="true">' + MV_RAYO + '</span>'
    : '<span class="av sm" style="background:' + grad(SE_GENTE[seNom(x.id)]) + '">' + (x.id === 's1' ? 'M' : inicial(seNom(x.id))) + '</span>';
  const seRec = x => x.key in SE.rec ? SE.rec[x.key].length : 2 + Math.round(x.m) % 2;
  function seRayoBtn(x){
    if (x.id === 's1') { const n = seRec(x); return n ? '<span class="small muted sdtuyo">' + n + ' ' + MV_RAYO + '<br>lo ves vos</span>' : ''; }
    const on = !!SE.rayo[x.key], q = x.id ? seNom(x.id) : SE_BANDA();
    return '<button class="clap sdrayo" data-serayo="' + x.key + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + q + '">' + MV_RAYO + '</button>';
  }
  // La vibra (la de la D, con los eventos de las entradas): una tarjeta por evento, con el día y nunca la hora.
  function seEv(x){
    const f = seFirma(x), cls = x.k === 'ent' || x.k === 'nuevo' ? 'c' : 'm', firma = '<b>' + f[0] + '</b> <i>' + f[1] + '</i>' + (f[2] ? ' ' + MV_RAYO : '');
    return '<article class="mvpos sdev ' + cls + '"><div class="sdevrow">' + seAv(x) + '<span class="stack" style="gap:3px;flex:1;min-width:0"><span class="small muted"><b class="sdq">' + seQuien(x) + '</b>' +
      (x.k === 'ent' ? '' : ' · ' + seCuando(x.m)) + '</span><span class="mvfirma sig">' + firma + '</span></span>' + seRayoBtn(x) + '</div></article>';
  }
  // ---- el ecualizador: una barra por integrante, con tantos segmentos como su meta. Misma altura llena para todos: se ve avance, no cantidad.
  const SE_RIT = [1.7, 2.15, 1.9, 2.4, 1.6, 2.25, 1.8, 2.05];
  function seBarra(m, i, E, w, sincro){
    const neu = seNeutra(m.id), yo = m.id === 's1', nom = yo ? 'Vos' : m.n;
    const head = '<button class="sebar' + (yo ? ' yo' : '') + (neu ? ' neu' : '') + '" data-sebar="' + m.id + '"';
    if (neu) return head + ' aria-label="' + nom + ': barra sin mostrar"><svg viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true"><rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>' +
      '<rect x="2" y="2" width="36" height="196" rx="4" fill="none" stroke="var(--muted)" stroke-opacity=".45" stroke-dasharray="4 5"/></svg><span class="senom">' + nom + '</span></button>';
    const k = m.meta, hechos = seHechos(E, m.id, w, SE.now), lit = Math.min(k, hechos), ok = hechos >= k, id = 'seb' + (++scUid), GP = 6, sh = (200 - GP * (k - 1)) / k;
    const F = sincro && lit ? 'url(#' + id + 'z)' : ok ? 'var(--dat)' : 'var(--lime)', L = eqLuz(Math.max(.4, lit / k));
    let g = '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-30" y="-30" width="100" height="270"><feGaussianBlur stdDeviation="' + (L.hb * .5).toFixed(1) + '"/></filter>' +
      '<linearGradient id="' + id + 'z" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient></defs>' +
      '<rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>';
    for (let j = 0; j < k; j++) { const c = eqCeldaCol(0, 200 - (j + 1) * sh - j * GP, 40, sh, j < lit, j < lit ? F : 'var(--lime)', L, id, ok);
      g += SE.flash === m.id && j === lit - 1 ? '<g class="senuevo">' + c + '</g>' : c; }
    return head + ' style="--d:' + SE_RIT[i % 8] + 's;--ph:-' + (i * .37).toFixed(2) + 's" aria-label="' + nom + ': ' + lit + ' de ' + k + '">' +
      '<svg class="' + (lit ? 'late' : '') + '" viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true">' + g + '</svg><span class="senom">' + nom + '</span></button>';
  }
  function seEq(E, w){
    const B = seBanda(), tot = seTotal(E, w, SE.now), meta = seMeta(w), sum = B.reduce((a, m) => a + m.meta, 0), sincro = tot >= meta;
    return '<div class="seeq' + (sincro ? ' sincro' : '') + '">' + B.map((m, i) => seBarra(m, i, E, w, sincro)).join('') + '</div>' +
      '<div class="setot" role="img" aria-label="La banda: ' + tot + ', meta ' + meta + '"><i style="width:' + Math.min(100, 100 * tot / sum).toFixed(1) + '%"></i><b style="left:' + (100 * meta / sum).toFixed(1) + '%"></b></div>' +
      '<span class="setotl"><span>La banda: ' + tot + '</span><span>meta ' + meta + '</span></span>';
  }
  // ---- el titular: siempre de la banda, nunca de una persona
  function seTitular(E, w){
    const tot = seTotal(E, w, SE.now), meta = seMeta(w), f = meta - tot, hora = SE.now % SE_DIA, dia = Math.floor(SE.now / SE_DIA) % 7;
    if (f <= 0) return ['<b>En</b> <i>sincro</i> ' + MV_RAYO, SE.soc === 'nueva' && w === 0 ? 'La primera semana de la banda, adentro.' : 'La banda llegó a su semana.'];
    if (dia === 6 && hora >= SE_ABRE[6][1] * 60) return ['<b>' + tot + '</b> <i>de ' + meta + '</i>', 'Esta semana. El lunes arranca otra.'];
    if (tot === 0) return ['<b>Arranca</b> <i>la semana</i>', 'Meta de la banda: ' + meta];
    return [f === 1 ? '<b>Falta 1</b> <i>para el sincro</i>' : '<b>Faltan ' + f + '</b> <i>para el sincro</i>', SE.soc === 'nueva' && w === 0 ? 'Primera semana: meta de ' + meta + '.' : 'Cada entrenamiento suma.'];
  }
  // La semana pasada, en una línea (solo los lunes)
  function seAntes(E, w){
    if (Math.floor(SE.now / SE_DIA) % 7 !== 0) return '';
    const p = w - 1, t = seTotal(E, p, w * SE_SEM - 1), m = seMeta(p);
    return '<span class="seres">' + (t >= m ? 'La semana pasada: en sincro ' + MV_RAYO : t + ' de ' + m + '. Arranca otra.') + '</span>';
  }
  function seCab(){
    const con = SE.soc !== 'sin';
    return '<div class="sdhead"><div class="stack" style="gap:6px;flex:1;min-width:0"><h1 class="mtitle sig"><b>En</b> <i>sincro</i></h1>' +
      (con ? '<span class="sdbanda">' + SE_BANDA() + '</span><span class="small muted">Tu banda · la convoca Prof. Lucas</span>' : '<span class="small muted">Tu ritmo, con el de otros.</span>') + '</div>' +
      (con && !scMenor() ? '<button class="btn ghost sdmsg" data-semsg aria-label="Mensajes: abre WhatsApp">' + SB_WA + '<span>WhatsApp</span></button>' : '') + '</div>';
  }
  // ---- las tres franjas
  function seUltimo(ev){
    const x = ev[0];
    if (!x) return '<div class="sefr"><span class="sefk">Lo último</span><span class="sefx muted">Todavía nada esta semana.</span></div>';
    const f = seFrase(x);
    return '<div class="sefr"><button class="sefrb" data-sevibra aria-label="Lo último de tu banda: ver los últimos 7 días">' + seAv(x) +
      '<span class="sefx"><b>' + f[0] + '</b> ' + f[1] + '</span></button>' + seRayoBtn(x) + '</div>';
  }
  function seFechaFr(){
    const w = Math.floor(SE.now / SE_SEM), esta = SE.now < w * SE_SEM + SE_JUE + 20 * 60, hoy = esta && Math.floor(SE.now / SE_DIA) % 7 === 3;
    const otros = esta ? Math.max(0, seBanda().length - 2) : 1, van = otros + (SE.voy === 'voy' ? 1 : 0);
    const op = (k, t) => '<button class="opt" data-sevoy="' + k + '" aria-pressed="' + (SE.voy === k) + '">' + t + '</button>';
    return '<div class="sefr"><span class="sefk">' + (hoy ? 'Hoy' : 'Jue') + ' ' + SB_G.hora + '</span><span class="sefx small"><span class="sefl">' + SB_G.sede + '</span><span class="sefl muted">van ' + van + '</span></span>' +
      '<span class="opts sevoy">' + op('voy', 'Voy') + op('no', 'No llego') + '</span></div>';
  }
  function seCruceFr(E, w){
    if (SE.soc === 'nueva' && w === 0) return '<div class="sefr"><span class="sefk">Cruce</span><span class="sefx small muted">Arranca el lunes, contra otra banda de la sede.</span></div>';
    const lunes = Math.floor(SE.now / SE_DIA) % 7 === 0 && SE.now % SE_DIA < 12 * 60, r = lunes ? seCruceRes(E, w - 1) : null;
    const txt = r ? (r.gano ? 'Ganaron <b>' + r.a + ' %</b> a ' + r.b + ' % ' + MV_RAYO : 'Esta vez no · <b>' + r.a + ' %</b> a ' + r.b + ' %')
      : 'Contra ' + (w > 0 ? SE_PROX : SE_RIV.nom.join(' ')) + ' · <b>' + sePct(E, w, SE.now) + ' %</b> a ' + (w > 0 ? 0 : seRivPct(w, SE.now)) + ' %';
    return '<button class="sefr" data-secruce><span class="sefk">Cruce</span><span class="sefx small">' + txt + '</span><span class="sechev" aria-hidden="true">›</span></button>';
  }
  // ---- sin banda: el ecualizador apagado, con un lugar que late
  function seSin(){
    let b = '';
    for (let i = 0; i < 5; i++) b += '<span class="sebar' + (i === 2 ? ' aca' : '') + '"><svg viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true"><rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>' +
      (i === 2 ? '<rect class="seaca" x="1" y="1" width="38" height="198" rx="5" fill="none" stroke="var(--dat)" stroke-width="2.5"/>' : '') + '</svg><span class="senom">' + (i === 2 ? 'Vos' : '·') + '</span></span>';
    const p = SE.primer;
    return mvPos('c seeqbox', '<span class="stack" style="gap:4px"><span class="setit sig"><b>Acá va</b> <i>tu banda</i></span><span class="mvsub">La arma tu profe, en la sala.</span></span>' +
      '<div class="seeq off">' + b + '</div>') +
      mvPos('m', '<span class="mvk">Tu primer jueves · ' + SB_G.sede + '</span><span class="mvbig"><span class="mvfirma sig"><i>' + SB_G.dia + '</i></span><span class="mvnum">' + SB_G.hora + '</span></span>' +
        '<span class="stack" style="gap:10px"><button class="btn' + (p ? ' ghost' : '') + '" data-seprimer>' + (p ? '✓ Te esperan' : 'Voy') + '</button>' +
        '<span class="mvsub">' + (p ? 'Prof. Lucas te recibe en la entrada de la sala.' : 'Prof. Lucas recibe a los que arrancan: cada uno su rutina, a la misma hora.') + '</span></span>');
  }
  // ---- Lo de Viva: contenido oficial, ilustrado por código (app/img/social). Los socios no publican.
  const SE_PUB = [
    ['vid-01', 'v', 'hoy', 'Así arranca la semana en la sala. A veces con ganas, a veces no tanto ⚡'],
    ['pub-05', 'p', 'ayer', 'Social VIVA: running y desayuno ⚡ ¿Te sumás el sábado?'],
    ['pub-01', 'p', 'hace 2 días', 'La sala te espera con la energía de siempre ⚡ ¿Nos vemos?'],
    ['vid-03', 'profe', 'hace 2 días', 'El ejercicio de la semana: remo con mancuerna. Espalda firme, el codo va hacia atrás. Si es tu primera vez, pedime que te mire en la sala.'],
    ['pub-03', 'p', 'hace 3 días', 'A veces con ganas. A veces no tanto. Pero en VIVA, siempre terminás mejor ⚡'],
    ['pub-07', 'p', 'hace 4 días', 'Tu InBody te dice cómo estás hoy, no cómo tenés que ser. Pedilo en recepción y miralo con tu nutricionista.'],
    ['vid-02', 'v', 'hace 5 días', 'Así fue el último Social VIVA. Mucha energía compartida 🫶'],
    ['pub-04', 'p', 'hace 6 días', 'Encontrá tu Fit House ⚡ Welcome to the club.'],
    ['pub-06', 'p', 'hace 1 semana', 'Después de correr, el desayuno. Gracias a ustedes por venir ⚡'],
    ['pub-02', 'p', 'hace 1 semana', 'Técnica primero, carga después. Tu profe está en la sala para eso ⚡'],
    ['pub-08', 'p', 'hace 2 semanas', '¡Feliz aniversario, Sarmiento! Gracias a ustedes por tanta energía ⚡']
  ];
  const SE_ALT = { 'pub-01':'la sala, con una persona frente al espejo', 'pub-02':'una máquina de la sala con luz de neón', 'pub-03':'el rack de mancuernas',
    'pub-04':'el frente de una sede de VIVA', 'pub-05':'Social VIVA, gente corriendo al amanecer', 'pub-06':'el desayuno de Social VIVA', 'pub-07':'el equipo de InBody', 'pub-08':'el aniversario de una sede',
    'vid-01':'sentadillas con barra en la sala', 'vid-02':'Social VIVA, gente corriendo', 'vid-03':'remo con mancuerna apoyado en un banco' };
  const SE_VDUR = 10, seV = () => '?v=' + (window.VK_V || '');
  function seCar(P){
    const profe = P[1] === 'profe', vid = P[0].charAt(0) === 'v';
    const cab = profe ? sbProfe('Tu profe · ' + P[2]) : mvCab('VIVA', ['#3c4658','#12161d'], '@vivafithouse · ' + P[2]);
    const media = vid ? '<div class="semedia sevid" data-sevid="' + P[0] + '" role="img" aria-label="Video de ejemplo: ' + SE_ALT[P[0]] + '"><span class="setag">' + (profe ? 'El ejercicio de la semana' : 'Video') + '</span>' +
        '<button class="sevplay" data-sevplay aria-label="Reproducir"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path class="sevpi" d="M8 5v14l11-7z" fill="currentColor"/></svg></button>' +
        '<span class="sevmute" aria-label="Sin sonido"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg></span>' +
        '<span class="sevdur">0:' + SE_VDUR + '</span><span class="sevbar"><i></i></span></div>'
      : '<div class="semedia"><img src="img/social/' + P[0] + '.svg' + seV() + '" alt="Ilustración de ejemplo: ' + SE_ALT[P[0]] + '" loading="lazy" decoding="async"></div>';
    return '<article class="secar">' + cab + media + '<span class="mvtxt">' + P[3] + '</span></article>';
  }
  function seViva(){
    const L = SE_PUB.filter(P => P[1] !== 'profe' || SE.vid);
    const car = SE.ig === 'vivo' ? sdIgVivo() + (SE.vid ? '<div class="secarr">' + seCar(SE_PUB[3]) + '</div>' : '') : '<div class="secarr" aria-label="Publicaciones de Viva">' + L.map(seCar).join('') + '</div>';
    return '<div class="stack" style="gap:14px"><span class="stack" style="gap:2px"><span class="lbl">Lo de Viva</span><span class="small muted">' + (SE.ig === 'vivo' ? 'La cuenta de Viva en Instagram' : 'Lo que publica Viva') + '</span></span>' +
      car + sdSocial() + '</div>';
  }
  // Los videos se insertan en la página (SMIL) para poder pausarlos; el bucle dura SE_VDUR segundos.
  const SE_VSVG = {};
  var seVActivo = null, seVRaf = 0;
  function seVidCargar(sel){   // T25: también lo usa la F
    $$((sel || '#seViva') + ' .sevid').forEach(el => { if (el.querySelector('svg.sevs')) return;
      const k = el.dataset.sevid, poner = t => { if (el.querySelector('svg.sevs')) return; el.insertAdjacentHTML('afterbegin', t.replace('<svg ', '<svg class="sevs" '));
        const s = el.querySelector('svg.sevs'); if (s && s.pauseAnimations) { s.pauseAnimations(); try { s.setCurrentTime(1.2); } catch (e) {} } };
      if (SE_VSVG[k]) return poner(SE_VSVG[k]);
      fetch('img/social/' + k + '.svg' + seV()).then(r => r.ok ? r.text() : '').then(t => { if (t) { SE_VSVG[k] = t; poner(t); } }).catch(() => {}); });
  }
  function seVidPausa(el){ const s = el && el.querySelector('svg.sevs'); if (s) s.pauseAnimations(); if (el) { el.classList.remove('on'); el.querySelector('[data-sevplay]').setAttribute('aria-label', 'Reproducir'); }
    if (seVActivo === el) { seVActivo = null; cancelAnimationFrame(seVRaf); } }
  function seVidToggle(el){
    const s = el.querySelector('svg.sevs'); if (!s || !s.unpauseAnimations) { toast('El video todavía está cargando'); return; }
    if (el.classList.contains('on')) return seVidPausa(el);
    if (seVActivo) seVidPausa(seVActivo);
    s.unpauseAnimations(); el.classList.add('on'); el.querySelector('[data-sevplay]').setAttribute('aria-label', 'Pausar'); seVActivo = el;
    const bar = el.querySelector('.sevbar i'), dur = el.querySelector('.sevdur');
    const paso = () => { if (seVActivo !== el || !el.isConnected) return; const t = s.getCurrentTime() % SE_VDUR;
      bar.style.width = (100 * t / SE_VDUR).toFixed(1) + '%'; dur.textContent = '0:' + String(Math.floor(t)).padStart(2, '0'); seVRaf = requestAnimationFrame(paso); };
    paso();
  }
  // ---- la pantalla
  function seRender(){
    const c = $('#seArriba'); if (!c) return;
    if (SE.soc === 'nueva' && SE.now < SE_NUEVA + 15) SE.now = SE_NUEVA + 15;   // la banda nueva existe desde el jueves
    let h = seCab();
    if (SE.soc === 'sin') h += seSin();
    else {
      const E = seEntradas(), w = Math.floor(SE.now / SE_SEM), t = seTitular(E, w), sincro = seTotal(E, w, SE.now) >= seMeta(w), ev = seEventos(E);
      h += mvPos((sincro ? 'f' : 'c') + ' seeqbox' + (SE.nuevoSincro ? ' seboom' : ''), seAntes(E, w) +
          '<span class="stack" style="gap:4px"><span class="setit sig' + (SE.flash ? ' secambio' : '') + '">' + t[0] + '</span><span class="mvsub">' + t[1] + '</span></span>' + seEq(E, w) +
          (sincro && !scMenor() ? '<div class="grid2" style="gap:10px"><button class="btn sm" data-secartel>A historias</button><button class="btn ghost sm" data-sewa="banda">Al WhatsApp</button></div>' : '')) +
        '<div class="card sefrs">' + seUltimo(ev) + seFechaFr() + seCruceFr(E, w) + '</div>';
    }
    c.innerHTML = h; SE.flash = null; SE.nuevoSincro = false;
    const v = $('#seViva'), k = SE.ig + SE.vid + !!SD.anot.e2 + scMenor();
    if (v.dataset.k !== k) { if (seVActivo) seVidPausa(seVActivo); v.dataset.k = k; v.innerHTML = seViva(); seVidCargar(); }
    if (SE.preg) { SE.preg = false; seConsent(); }
    if (SE.vivo && !seVivoT) seVivoProg();
  }
  function seHoja(html){ $('#seHojaIn').innerHTML = html; $('#seHoja').hidden = false; }
  function seConsent(){
    if (scMenor()) { SE.yoComp = false; return seHoja('<span class="mtitle sig"><b>Entraste a</b> <i>' + SE_BANDA() + '</i></span><span class="muted" style="line-height:1.45">Por ahora tu barra no se muestra a la banda. Lo que entrenás suma igual.</span><button class="btn" data-sex type="button">Listo</button>'); }
    seHoja('<span class="mtitle sig"><b>Entraste a</b> <i>' + SE_BANDA() + '</i></span><span class="muted" style="line-height:1.45">¿Tu banda ve tu barra? Muestra cuántas veces entrenaste esta semana, hacia tu meta. Nunca la hora.</span>' +
      '<span class="small muted" style="line-height:1.4">Si no la mostrás, queda neutra y lo que entrenás suma igual. Lo cambiás cuando quieras tocando tu barra.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-secomp="0" type="button">Ahora no</button><button class="btn sm" data-secomp="1" type="button">Que la vea</button></div>');
  }
  function seBarraHoja(id){
    const E = seEntradas(), w = Math.floor(SE.now / SE_SEM), m = SE_INT.find(x => x.id === id), h = seHechos(E, id, w, SE.now), yo = id === 's1';
    const hoy = E.some(e => e.socio === id && Math.floor(e.m / SE_DIA) === Math.floor(SE.now / SE_DIA) && e.m <= SE.now), ult = E.filter(e => e.socio === id && e.m <= SE.now).pop();
    if (yo) return seHoja('<span class="mtitle sig"><b>Vos</b> <i>' + Math.min(h, m.meta) + ' de ' + m.meta + '</i></span>' +
      (scMenor() ? '<span class="muted" style="line-height:1.45">Por ahora tu barra no se muestra a la banda. Lo que entrenás suma igual.</span>'
        : '<span class="muted" style="line-height:1.45">' + (SE.yoComp ? 'Tu banda ve tu barra: cuántas veces entrenaste esta semana, nunca la hora.' : 'Tu banda no ve tu barra. Lo que entrenás suma igual.') + '</span>' +
          '<button class="btn ghost sm" data-secomp="' + (SE.yoComp ? '0' : '1') + '" type="button">' + (SE.yoComp ? 'Que no la vea' : 'Mostrarla') + '</button>') +
      '<button class="btn sm" data-sex type="button">Listo</button>');
    if (seNeutra(id)) return seHoja('<span class="mtitle sig"><b>' + m.n + '</b> <i>en la banda</i></span><span class="muted" style="line-height:1.45">' + m.n + ' no muestra su barra. Lo que entrena suma igual a la banda.</span><button class="btn sm" data-sex type="button">Listo</button>');
    const x = ult ? { k:'ent', id:id, m:ult.m, key:id + '@' + ult.m } : null;
    seHoja('<span class="mtitle sig"><b>' + m.n + '</b> <i>' + Math.min(h, m.meta) + ' de ' + m.meta + '</i></span>' +
      (hoy ? '<span class="muted">Entrenó hoy.</span>' : h >= m.meta ? '<span class="muted">Cumplió su semana.</span>' : '') +
      (x && hoy ? '<div class="between"><span class="small muted">Mandale un rayo</span>' + seRayoBtn(x) + '</div>' : '') + '<button class="btn sm" data-sex type="button">Listo</button>');
  }
  function seVibraHoja(){
    const ev = seEventos(seEntradas());
    seHoja('<span class="mtitle sig"><b>Lo último</b> <i>de tu banda</i></span><span class="small muted">Los últimos 7 días. Solo lo logrado, nunca la hora.</span>' +
      '<div class="mvfeed sevibra" style="gap:12px">' + ev.map(seEv).join('') + '</div><span class="mvfin">Estás al día ⚡</span><button class="btn ghost sm" data-sex type="button">Cerrar</button>');
  }
  // El cruce: el detalle de El pulso de la D, con los números de las entradas
  function seCruceHoja(){
    const E = seEntradas(), w = Math.floor(SE.now / SE_SEM), lunes = Math.floor(SE.now / SE_DIA) % 7 === 0, pasadas = [];
    for (let p = SE.soc === 'nueva' ? 0 : -6; p < w; p++) pasadas.push(seCruceRes(E, p).gano ? 1 : 0);
    const fila = (nom, p, yo) => '<span class="sdbarra"><span style="font-weight:700' + (yo ? '' : ';color:var(--muted)') + '">' + nom + ' · ' + p + ' %</span><span class="bar ' + (yo ? 'sdyo' : 'scotro') + '" data-n="10"><i style="width:' + Math.min(100, p) + '%"></i></span></span>';
    let cuerpo;
    if (lunes) { const r = seCruceRes(E, w - 1);
      cuerpo = (r.gano ? '<span class="mvfirma sig"><b>Ganaron</b> <i>' + r.a + ' a ' + r.b + '</i> ' + MV_RAYO + '</span>' : scFirma('Esta vez no:', r.a + ' a ' + r.b)) +
        '<span class="mvsub">La semana pasada, contra ' + r.riv + '. Hoy arranca otro cruce, contra ' + (w > 0 ? SE_PROX : SE_RIV.nom.join(' ')) + '.</span>' +
        '<span class="stack" style="gap:12px">' + fila(SE_BANDA(), r.a, true) + fila(r.riv, r.b, false) + '</span>'; }
    else { const a = sePct(E, w, SE.now), b = seRivPct(w, SE.now);
      cuerpo = scFirma('Vamos ' + a + ' %', '· ellos ' + b + ' %') + '<span class="mvsub">Cada banda contra su propia meta. El resultado, el lunes.</span>' +
        '<span class="stack" style="gap:12px">' + fila(SE_BANDA(), a, true) + fila(SE_RIV.nom.join(' '), b, false) + '</span>'; }
    seHoja('<span class="mvk">El cruce</span>' + cuerpo + '<span class="stack" style="gap:6px">' + sdCeldas(pasadas) + '<span class="scpie"><span>Últimos ' + pasadas.length + ' cruces</span><span>Ganados: ' +
      pasadas.filter(Boolean).length + '</span></span></span><button class="btn ghost sm" data-sex type="button">Cerrar</button>');
  }
  function seMsg(){
    const fila = (k, t, s) => '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + t + '</span><span class="small muted">' + s + '</span></span><button class="btn sm" data-sewa="' + k + '">Abrir</button></div>';
    seHoja('<span class="mtitle sig"><b>Mensajes</b> <i>por WhatsApp</i></span><div class="list">' + fila('banda', SE_BANDA(), 'El grupo de WhatsApp de tu banda') + fila('profe', 'Prof. Lucas', 'Tu profe, a su número de trabajo') + '</div>' +
      '<span class="small muted" style="line-height:1.4">En Vivapp no hay chat: la charla vive en WhatsApp. Nunca ves el número de otro socio. En la demo, los enlaces son de ejemplo.</span><button class="btn ghost sm" data-sex type="button">Cerrar</button>');
  }
  function seCartel(){
    seHoja('<span class="mtitle sig"><b>En sincro</b> <i>' + SE_BANDA() + '</i></span><div class="sccartel sdcartel" role="img" aria-label="El cartel de ' + SE_BANDA() + '">' + scCartelSvg(SB_G.nom, 300, 170) + '</div>' +
      '<span class="small muted" style="line-height:1.4">Sale a tus historias de Instagram. Solo el nombre de la banda: sin fotos ni números de nadie.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sex type="button">Cerrar</button><button class="btn sm" data-seig1 type="button">A historias</button></div>');
  }
  // ---- los avisos (dos por semana como máximo: la fecha del día y "falta 1"). En la demo, una tarjeta arriba; no es una notificación real.
  var seAvT = 0;
  function seAviso(tipo){
    const w = Math.floor(SE.now / SE_SEM), ya = SE.avW[w] || [];
    if (ya.includes(tipo) || ya.length >= 2 || SE.soc === 'sin') return;
    SE.avW[w] = ya.concat([tipo]);
    const txt = tipo === 'fecha' ? 'Hoy a las 19 es la fecha de ' + SE_BANDA() + ' ⚡' : 'Falta 1 para el sincro de ' + SE_BANDA() + ' ⚡';
    const a = $('#seAviso'); a.innerHTML = '<span class="av sm sdbav" aria-hidden="true">' + MV_RAYO + '</span><span class="stack" style="gap:1px;flex:1;min-width:0"><span class="small muted">Vivapp · aviso de ejemplo</span><span style="font-weight:700;line-height:1.3">' + txt + '</span></span>';
    a.hidden = false; clearTimeout(seAvT); seAvT = setTimeout(() => { a.hidden = true; }, 4500);
  }
  // ---- que pase algo: el próximo entrenamiento de hoy, si hay; si no, uno nuevo de alguien que no vino hoy
  var seTim = [], seVivoT = 0;
  const seLimpiar = () => { seTim.forEach(clearTimeout); seTim = []; };
  function seRayos(key){   // los ⚡ que recibe el socio de la demo: dos o tres, de integrantes distintos
    const otros = seBanda().filter(m => m.id !== 's1'), n = Math.min(otros.length, 2 + (SE.rot % 2)); SE.rec[key] = [];
    for (let i = 0; i < n; i++) { const q = otros[(SE.rot + i * 2) % otros.length].n;
      seTim.push(setTimeout(() => { (SE.rec[key] = SE.rec[key] || []).push(q); toast(q + ' te mandó un ⚡'); seRender(); }, 2200 + i * 2300)); }
    SE.rot++;
  }
  function seEntrena(){
    if (SE.soc === 'sin') { toast('Sin banda no hay barras: probalo con Banda nueva o Con banda'); return false; }
    const E = seEntradas(), w = Math.floor(SE.now / SE_SEM), dia = Math.floor(SE.now / SE_DIA), ids = SE_TAM[SE.tam], ab = SE_ABRE[dia % 7], hora = SE.now % SE_DIA;
    const antes = seTotal(E, w, SE.now), prox = E.find(e => ids.includes(e.socio) && e.m > SE.now && Math.floor(e.m / SE_DIA) === dia);
    let id;
    if (prox) { SE.now = prox.m; id = prox.socio; }
    else {
      if (hora < ab[0] * 60 || hora >= ab[1] * 60 - 10) { toast('A esta hora la sala está cerrada'); return false; }
      const hoy = new Set(E.filter(e => Math.floor(e.m / SE_DIA) === dia && e.m <= SE.now).map(e => e.socio));
      const libres = seBanda().filter(m => !hoy.has(m.id)), bajo = libres.filter(m => seHechos(E, m.id, w, SE.now) < m.meta), L = bajo.length ? bajo : libres;
      if (!L.length) { toast('Hoy ya entrenó toda la banda'); return false; }
      const m = L[SE.rot % L.length]; SE.now += 4; id = m.id; SE.extra.push({ socio:id, fecha:seFm(SE.now), extra:true });
    }
    const E2 = seEntradas(), desp = seTotal(E2, w, SE.now), meta = seMeta(w);
    SE.flash = id; if (antes < meta && desp >= meta) { SE.nuevoSincro = true; toast(SE_BANDA() + ': en sincro ⚡'); }
    if (id === 's1') { seRayos(id + '@' + SE.now); if (!SE.nuevoSincro) toast('Entraste a la sala: tu barra sumó uno'); }
    seRender(); if (desp === meta - 1 && antes < desp) seAviso('falta1');
    return true;
  }
  function seVivoProg(){
    clearTimeout(seVivoT); seVivoT = 0; if (!SE.vivo) return;
    seVivoT = setTimeout(() => { seVivoT = 0;
      const visible = SOC_V === 'E' && !$('#socialE').hidden && $('#demoSheet').hidden;
      if (visible) { const E = seEntradas(), dia = Math.floor(SE.now / SE_DIA);
        if (SE.prisa && !E.some(e => SE_TAM[SE.tam].includes(e.socio) && e.m > SE.now && Math.floor(e.m / SE_DIA) === dia)) { SE.prisa = false; seVivoProg(); }
        else if (!seEntrena()) seVivoProg(); }
      else seVivoProg();
    }, (SE.prisa ? 5000 + Math.random() * 3000 : 20000 + Math.random() * 20000));
  }
  // El momento de la semana (panel de demo): limpia lo que pasó mientras se miraba
  function seMomento(k){
    seLimpiar(); const av = $('#seAviso'); if (av) av.hidden = true; SE.mom = k; SE.now = SE_MOM[k]; SE.extra = []; SE.rec = {}; SE.flash = null; SE.avW = {}; SE.prisa = false;
    if (SE.voy === null) SE.voy = 'voy';
  }
  seMomento(SE.mom);
  $('#socialE').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { $('#seHoja').hidden = true; };
    let b;
    if (q('#seAviso')) { $('#seAviso').hidden = true; return; }
    if ((b = q('[data-sevplay]')) || ((b = q('.sevid')) && !q('a'))) { seVidToggle(b.closest('.sevid')); return; }
    if ((b = q('[data-serayo]'))) { const k = b.dataset.serayo, nom = b.getAttribute('aria-label').replace(/^(Sacarle|Mandarle) (el|un) rayo a /, '');
      SE.rayo[k] = !SE.rayo[k]; $$('#socialE [data-serayo="' + k + '"]').forEach(x => { x.setAttribute('aria-pressed', !!SE.rayo[k]); x.setAttribute('aria-label', (SE.rayo[k] ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + nom); });
      if (SE.rayo[k]) toast('Le mandaste un ⚡ a ' + nom); return; }
    if ((b = q('[data-sebar]'))) { seBarraHoja(b.dataset.sebar); return; }
    if (q('[data-sevibra]')) { seVibraHoja(); return; }
    if (q('[data-secruce]')) { seCruceHoja(); return; }
    if ((b = q('[data-sevoy]'))) { SE.voy = b.dataset.sevoy; seRender(); toast(SE.voy === 'voy' ? '¡Vamos! Jueves a las 19, cada uno su rutina' : 'Listo. La banda ve un número, nunca quién'); return; }
    if (q('[data-seprimer]')) { SE.primer = !SE.primer; seRender(); toast(SE.primer ? 'Te esperan el jueves a las 19 en Sarmiento' : 'Te bajaste del primer jueves'); return; }
    if ((b = q('[data-secomp]'))) { SE.yoComp = b.dataset.secomp === '1'; cerrar(); seRender(); toast(SE.yoComp ? 'Tu banda ve tu barra' : 'Tu barra queda neutra; lo que entrenás suma igual'); return; }
    if (q('[data-semsg]')) { seMsg(); return; }
    if ((b = q('[data-sewa]'))) { cerrar(); toast('Se abre WhatsApp: ' + (b.dataset.sewa === 'banda' ? 'el grupo de ' + SE_BANDA() : 'Prof. Lucas') + ' (enlace de ejemplo)'); return; }
    if (q('[data-secartel]')) { seCartel(); return; }
    if (q('[data-seig1]')) { cerrar(); toast('Se abre Instagram con el cartel (en la demo, de ejemplo)'); return; }
    if (q('[data-sdanot]')) { SD.anot.e2 = !SD.anot.e2; seRender(); toast(SD.anot.e2 ? 'Te anotaste a Social VIVA · sábado 08:30' : 'Te bajaste de Social VIVA'); return; }
    if (e.target.id === 'seHoja' || q('[data-sex]')) cerrar();
  });
//#bloque 235
  // ===== T25 · Social VIVA, versión F: Las puertas (v105) =====
  // Una pantalla y un interruptor "Puerta" en el panel (Traé a tu gente · Viva te presenta). Cambia una sola cosa: qué ve el socio sin banda
  // y cómo nace la banda (de dos con el amigo que trajo, o de cinco con su profe). Con banda, la pantalla es la misma: la fecha, el cruce
  // (protagonista: la barra de la banda contra la de su rival, cada una en % de su propia meta), lo último, lo de Viva y la foto con marco.
  // Sin barra por integrante (Juanjo, 15/11 a la noche): del avance solo se ve el total de la banda.
  // Reutiliza: el motor de la E (entradas {socio, fecha}, meta = 80 % de la suma, cada uno suma hasta su meta, momentos, que entrene alguien,
  // en vivo) · El pulso y los permisos de la D · la foto con marco de la A (mvFoto) · la invitación de la B · Lo de Viva de la E (seCar, SE_PUB).
  // En real: entradas de EVO del mismo día (sin verificar) · el invitado que vino: cómo lo registra recepción en EVO (no documentado) · metas
  // de Tu ritmo · banda, fecha, código, permisos y cruces, tablas de Vivapp · Lo de Viva, la cuenta oficial de Instagram.
  // Piso: la app no pide ni guarda el nombre ni el teléfono del invitado; sumarse entre socios es con un código en persona, sin buscador;
  // "van N" es un número y no aparece con menos de tres (con dos diría quién falta); nunca quién falta ni la hora; menores: solo la puerta 2,
  // sin WhatsApp, sin invitación y sin foto hacia afuera.
  var SF = { puerta:'trae', tipo:'trae', est:'con', mom:'jue', ult:true, ig:/github\.io$/.test(location.hostname) ? 'vivo' : 'ej', tab:'Sincro',
    alt:false, vivo:false, prisa:false, now:0, extra:[], rec:{}, rayo:{}, flash:false, voy:'voy', inv:null, preg:false, rot:0,
    comp:{ sem:true, tramo:true, mes:true, hoy:false } };
  const SF_TABS = ['Sincro', 'Banda', 'Tu tribu', 'Social'];
  const SF_TIT = { Sincro:['En', 'sincro'], Banda:['Tu', 'banda'], 'Tu tribu':['Tu', 'tribu'], Social:['Social', 'VIVA'] };
  // Las dos bandas de la demo (nombres inventados). Hábitos: L M X J V S D + hora. salta = entradas que no ocurrieron esa semana (socio:orden).
  // hoy = quiénes compartieron "entrené hoy" (arranca apagado para todos). La rival de la semana y la de la revancha comparten hábitos.
  const SF_B = {
    presenta:{ nom:SB_G.nom, conv:'Prof. Lucas', int:SE_INT.slice(0, 5), hoy:['s2', 's3', 's5'],
      hab:{ s1:'M18:30 J19:12 S10:30', s2:SE_HAB.s2, s3:SE_HAB.s3, s4:SE_HAB.s4, s5:SE_HAB.s5 },
      floja:{ s1:'M18:30 J19:12', s2:'L06:30 X06:40', s3:'L19:40 J19:20', s4:'M07:10 S10:00', s5:'L18:10 X18:05' },
      salta:{ '-8':['s3:2', 's5:1', 's1:2'], '-7':['s2:2', 's4:1'], '-6':['s5:2', 's1:2', 's3:1'], '-5':['s2:2', 's3:1', 's5:0', 's4:1'], '-4':['s1:2'], '-3':['s1:1', 's3:2', 's5:1'], '-2':['s4:0', 's1:2'], '-1':['s1:2'] },
      riv:{ nom:SE_RIV.nom, metas:SE_RIV.metas, hab:{ r1:'L07:00 X07:05 S08:30', r2:'M07:05 V07:00', r3:'L07:10 J07:00 S08:40', r4:'M07:00 J07:20', r5:'J07:15 S09:00' },
        salta:{ '-8':['r2:1'], '-7':['r1:2', 'r3:2', 'r4:1', 'r5:1'], '-6':['r1:2', 'r3:1', 'r5:0'], '-5':['r4:0', 'r2:1'], '-4':['r1:0', 'r3:2', 'r5:1'], '-3':['r4:1'],
          '-2':['r1:1', 'r2:0', 'r3:0', 'r5:1'], '-1':['r1:2', 'r3:2', 'r4:1'], '0':['r1:2', 'r3:2', 'r5:1'] } },
      pas:['Team sábado', 'Los madrugadores', 'Las imparables', 'Los del mediodía', 'Team sábado', 'Las imparables', 'Los madrugadores', 'Los del mediodía'], prox:'Los madrugadores' },
    trae:{ nom:['Vos y', 'Cris'], conv:null, int:[SE_INT[0], { id:'c1', n:'Cris', meta:3 }], hoy:['c1'],
      hab:{ s1:'M18:30 J19:12 S10:30', c1:'L19:00 J19:05 S10:15' }, floja:{ s1:'M18:30 J19:12', c1:'L19:00 J19:05' },
      salta:{ '-8':['s1:2'], '-7':['c1:0', 's1:0'], '-6':[], '-5':['s1:2', 'c1:2'], '-4':[], '-3':['c1:1'], '-2':[], '-1':['s1:0'] },
      riv:{ nom:['Las del', 'mediodía'], metas:{ r1:3, r2:2 }, hab:{ r1:'L13:00 X13:10 V13:00', r2:'M13:05 J13:05' },
        salta:{ '-8':['r2:1'], '-7':['r1:2'], '-6':['r1:1', 'r2:0'], '-5':[], '-4':['r1:0'], '-3':[], '-2':['r2:1', 'r1:2'], '-1':['r1:1', 'r2:1'], '0':['r2:1'] } },
      pas:['Dúo de la mañana', 'Team sábado', 'Las del mediodía', 'Los de las 21', 'Dúo de la mañana', 'Team sábado', 'Los de las 21', 'Las del mediodía'], prox:'Los de las 21' }
  };
  const SF_GENTE = Object.assign({ Cris:SD_GENTE.Cris }, SE_GENTE);
  const SF_MOM = { lun:360, mie:2 * SE_DIA + 19 * 60, jue:SE_JUE + 19 * 60 + 10, sab:5 * SE_DIA + 11 * 60, dom:6 * SE_DIA + 20 * 60, lun1g:SE_SEM + 360, lun1p:SE_SEM + 360 };
  const SF_SIN = SE_DIA + 12 * 60, SF_NUEVA = SE_JUE + 20 * 60 + 15;   // sin banda: martes al mediodía · la banda nace el jueves, después de la fecha
  const SF_SEDES = ['López y Planes', 'Sarmiento', 'Alberdi'];   // las de Resistencia (cultura-viva.md § 1)
  const sfDia = m => ((Math.floor(m / SE_DIA) % 7) + 7) % 7;
  const sfP = () => scMenor() ? 'presenta' : SF.puerta;          // menores: solo la puerta 2
  const sfT = () => scMenor() ? 'presenta' : SF.tipo;            // la banda que nació (de la puerta o del camino que tomó el socio)
  const sfB = () => SOC_V === 'G' ? sgB(sfT()) : SF_B[sfT()];   // T26: en la G, la banda puede tener el nombre aprobado
  const sfNom = () => sfB().nom.join(' ');
  const sfNueva = () => SF.est === 'nueva';
  const sfLun1 = () => (SF.mom === 'lun1g' || SF.mom === 'lun1p') && SF.est === 'con' && Math.floor(SF.now / SE_SEM) === 1 && sfDia(SF.now) === 0;
  // Las entradas, con la forma de EVO ({socio, fecha}): ocho semanas de historia, la semana de la demo (buena; floja solo en "esta vez no") y la siguiente.
  function sfGen(hab, salta, floja){
    const L = [];
    for (let w = -8; w <= 1; w++) { const cur = w === 0 && floja ? floja : hab, sal = salta[w] || [];
      Object.keys(cur).forEach(id => { const s = sal.filter(x => x.split(':')[0] === id).map(x => +x.split(':')[1]);
        cur[id].split(' ').filter((t, i) => t && !s.includes(i)).forEach(t => L.push({ socio:id, fecha:seFm(seSlot(w, t)) })); }); }
    return L;
  }
  function sfEntradas(){
    const B = sfB();
    return sfGen(B.hab, B.salta, SF.est === 'con' && SF.mom === 'lun1p' ? B.floja : null).concat(SF.extra)
      .map(e => Object.assign({ m:seMin(e.fecha) }, e)).sort((a, b) => a.m - b.m);
  }
  const sfRivEnt = () => { const R = sfB().riv; return sfGen(R.hab, R.salta).map(e => ({ socio:e.socio, m:seMin(e.fecha) })); };
  const sfDesde = w => sfNueva() && w === 0 ? SE_JUE : w * SE_SEM;
  const sfMetaDe = metas => Math.round(0.8 * metas.reduce((a, b) => a + b, 0));
  const sfMeta = w => { const m = sfMetaDe(sfB().int.map(x => x.meta)); return sfNueva() && w === 0 ? Math.round(m / 2) : m; };
  const sfHechos = (E, id, w, h) => E.filter(e => e.socio === id && e.m >= sfDesde(w) && e.m < (w + 1) * SE_SEM && e.m <= h).length;
  const sfTotal = (E, w, h) => sfB().int.reduce((a, m) => a + Math.min(m.meta, sfHechos(E, m.id, w, h)), 0);
  const sfPct = (E, w, h) => Math.round(100 * sfTotal(E, w, h) / sfMeta(w));
  function sfRivPct(w, h){
    const R = sfB().riv, E = sfRivEnt();
    const t = Object.keys(R.metas).reduce((a, id) => a + Math.min(R.metas[id], E.filter(e => e.socio === id && e.m >= w * SE_SEM && e.m < (w + 1) * SE_SEM && e.m <= h).length), 0);
    return Math.round(100 * t / sfMetaDe(Object.values(R.metas)));
  }
  const sfFin = w => (w + 1) * SE_SEM - 1;
  // Cada banda contra su propia meta; gana la que llega más arriba. Si perdieron, la semana siguiente es la revancha contra la misma.
  function sfRes(E, w){ const a = sfPct(E, w, sfFin(w)), b = sfRivPct(w, sfFin(w)); return { a:a, b:b, gano:a > b, riv:sfRivNom(E, w) }; }
  function sfRivNom(E, w){ const B = sfB();
    if (w <= 0) return w === 0 ? B.riv.nom.join(' ') : B.pas[w + 8];
    return sfRes(E, w - 1).gano ? B.prox : sfRivNom(E, w - 1); }
  const sfCuando = m => { const d = Math.floor(SF.now / SE_DIA) - Math.floor(m / SE_DIA); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'el ' + SE_DIAS[sfDia(m)]; };
  const sfNomDe = id => sfB().int.find(m => m.id === id).n;
  // Lo último de la banda (7 días, del más nuevo al más viejo). Lo de los otros, solo si lo comparten; "entrené hoy" arranca apagado.
  function sfEventos(E){
    const B = sfB(), ids = B.int.map(m => m.id), desde = SF.now - 7 * SE_DIA, ev = [], cuenta = {}, tot = {};
    const ve = (id, k) => id === 's1' ? (k === 'sem' ? SF.comp.sem : SF.comp.hoy) && !scMenor() : k === 'sem' || B.hoy.includes(id);
    E.filter(e => ids.includes(e.socio) && e.m <= SF.now && e.m >= sfDesde(Math.floor(e.m / SE_SEM))).forEach(e => {
      const w = Math.floor(e.m / SE_SEM), k = e.socio + w, meta = B.int.find(m => m.id === e.socio).meta, antes = tot[w] || 0;
      cuenta[k] = (cuenta[k] || 0) + 1; if (cuenta[k] <= meta) tot[w] = antes + 1;
      const tipo = cuenta[k] === meta ? 'sem' : 'ent';
      if (e.m > desde && ve(e.socio, tipo)) ev.push({ k:tipo, id:e.socio, m:e.m, key:e.socio + '@' + e.m });
      if (e.m > desde && antes < sfMeta(w) && tot[w] >= sfMeta(w)) ev.push({ k:'sincro', m:e.m + .5, key:'sincro@' + w });
    });
    if (sfNueva()) B.int.forEach((b, i) => { if (SF_NUEVA <= SF.now && SF_NUEVA > desde) ev.push({ k:'nuevo', id:b.id, m:SF_NUEVA + i * .01, key:'nuevo' + b.id }); });
    else for (let w = Math.floor(desde / SE_SEM) + 1; w <= Math.floor(SF.now / SE_SEM); w++) { const r = sfRes(E, w - 1);
      if (r.gano && w * SE_SEM > desde) ev.push({ k:'gano', m:w * SE_SEM + 1, key:'gano@' + w }); }
    return ev.sort((a, b) => b.m - a.m);
  }
  function sfFirma(x){   // [verbo, resto, con rayo]
    const yo = x.id === 's1';
    if (x.k === 'sincro') return ['Entraron', 'en sincro', 1];
    if (x.k === 'gano') return ['Ganaron', 'el cruce', 1];
    if (x.k === 'nuevo') return yo ? ['Te sumaste', 'a la banda'] : ['Se sumó', 'a la banda'];
    if (x.k === 'sem') return yo ? ['Cumpliste', 'tu semana', 1] : ['Cumplió', 'su semana', 1];
    return [yo ? 'Entrenaste' : 'Entrenó', sfCuando(x.m)];
  }
  const sfQuien = x => x.id ? (x.id === 's1' ? 'Vos' : sfNomDe(x.id)) : sfNom();
  const sfAv = x => !x.id ? '<span class="av sm sdbav" aria-hidden="true">' + MV_RAYO + '</span>'
    : '<span class="av sm" style="background:' + grad(SF_GENTE[sfNomDe(x.id)]) + '">' + (x.id === 's1' ? 'M' : inicial(sfNomDe(x.id))) + '</span>';
  function sfRayoBtn(x){
    if (x.id === 's1') { const n = x.key in SF.rec ? SF.rec[x.key].length : 1 + Math.round(x.m) % 2; return n ? '<span class="small muted sdtuyo">' + n + ' ' + MV_RAYO + '<br>lo ves vos</span>' : ''; }
    const on = !!SF.rayo[x.key], q = sfQuien(x);
    return '<button class="clap sdrayo" data-sfrayo="' + x.key + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + q + '">' + MV_RAYO + '</button>';
  }
  function sfEv(x){
    const f = sfFirma(x), cls = x.k === 'ent' || x.k === 'nuevo' ? 'c' : 'm';
    return '<article class="mvpos sdev ' + cls + '"><div class="sdevrow">' + sfAv(x) + '<span class="stack" style="gap:3px;flex:1;min-width:0"><span class="small muted"><b class="sdq">' + sfQuien(x) + '</b>' +
      (x.k === 'ent' ? '' : ' · ' + sfCuando(x.m)) + '</span><span class="mvfirma sig"><b>' + f[0] + '</b> <i>' + f[1] + '</i>' + (f[2] ? ' ' + MV_RAYO : '') + '</span></span>' + sfRayoBtn(x) + '</div></article>';
  }
  // ---- la cabecera: el nombre de la sección (el de la pestaña), la banda y quién la convoca; cámara y WhatsApp
  function sfCab(con){
    const t = SF_TIT[SF.tab], B = sfB(), m = scMenor();
    return '<div class="sdhead"><div class="stack" style="gap:6px;flex:1;min-width:0"><h1 class="mtitle sig"><b>' + t[0] + '</b> <i>' + t[1] + '</i></h1>' +
      (con ? '<button class="sfbanda" data-sfbanda aria-label="Tu banda: ' + sfNom() + '"><span class="sdbanda">' + sfNom() + '</span>' + (B.conv ? '<span class="small muted">la convoca ' + B.conv + '</span>' : '') + '</button>' : '') + '</div>' +
      (con && !m ? '<span class="sfcabb"><button class="btn ghost sdmsg" data-sffoto aria-label="La foto con el marco de Viva">' + SB_CAM + '<span>Foto</span></button>' +
        '<button class="btn ghost sdmsg" data-sfmsg aria-label="Mensajes: abre WhatsApp">' + SB_WA + '<span>WhatsApp</span></button></span>' : '') + '</div>';
  }
  // ---- la fecha: una franja (día, hora y sede · Voy · No llego · "van N", solo con tres o más)
  function sfFecha(){
    const w = Math.floor(SF.now / SE_SEM), esta = SF.now < w * SE_SEM + SE_JUE + 20 * 60, hoy = esta && sfDia(SF.now) === 3, n = sfB().int.length;
    const van = Math.max(1, Math.round((n - 1) * (esta ? .75 : .25))) + (SF.voy === 'voy' ? 1 : 0);
    const op = (k, t) => '<button class="opt" data-sfvoy="' + k + '" aria-pressed="' + (SF.voy === k) + '">' + t + '</button>';
    return '<div class="card sefrs"><div class="sefr"><span class="sefk">' + (hoy ? 'Hoy' : 'Jue') + ' ' + SB_G.hora + '</span><span class="sefx small"><span class="sefl">' + SB_G.sede + '</span>' +
      (n >= 3 ? '<span class="sefl muted">van ' + van + '</span>' : '') + '</span><span class="opts sevoy">' + op('voy', 'Voy') + op('no', 'No llego') + '</span></div></div>';
  }
  // ---- el cruce: dos columnas de diez celdas (las de Tu semana de Inicio), cada banda en % de su propia meta. Nunca el aporte de cada uno.
  function sfCol(p, nom, yo, flash){
    const N = 10, lit = p == null ? 0 : Math.min(N, Math.floor(Math.min(100, p) / 10)), sin = yo && p >= 100, id = 'sfc' + (++scUid), GP = 5, sh = (200 - GP * (N - 1)) / N;
    const C = yo ? 'var(--lime)' : 'var(--muted)', F = sin ? 'url(#' + id + 'z)' : C, L = eqLuz(Math.max(.4, lit / N));
    let g = '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-30" y="-30" width="100" height="270"><feGaussianBlur stdDeviation="' + (L.hb * .5).toFixed(1) + '"/></filter>' +
      '<linearGradient id="' + id + 'z" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient></defs>' +
      '<rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>';
    if (p == null) g += '<rect x="2" y="2" width="36" height="196" rx="4" fill="none" stroke="var(--muted)" stroke-opacity=".45" stroke-dasharray="4 5"/>';
    else for (let j = 0; j < N; j++) { const c = eqCeldaCol(0, 200 - (j + 1) * sh - j * GP, 40, sh, j < lit, j < lit ? F : C, L, id, sin);
      g += flash && j === lit - 1 ? '<g class="senuevo">' + c + '</g>' : c; }
    return '<div class="sfcol' + (yo ? ' yo' : '') + (sin ? ' sin' : '') + '" role="img" aria-label="' + nom + ': ' + (p == null ? 'todavía sin cruce' : p + ' % de su meta') + '">' +
      '<span class="sfp">' + (p == null ? '—' : p + ' %') + (sin ? MV_RAYO : '') + '</span><svg class="' + (yo && lit ? 'late' : '') + '" viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true">' + g + '</svg>' +
      '<span class="senom">' + nom + '</span></div>';
  }
  const sfTit = (b, i) => '<span class="setit sftit sig">' + b + (i ? ' <i>' + i + '</i>' : '') + '</span>';
  function sfUlt8(E, hasta){ const a = []; for (let w = sfNueva() ? 0 : -8; w < hasta; w++) a.push(sfRes(E, w).gano ? 1 : 0); return a.slice(-8); }
  // El mes de la banda: semanas del mes (las que arrancan en el mes) llegadas al 100 %. Con tres, el cartel de la banda.
  function sfMes(E){
    const w = Math.floor(SF.now / SE_SEM), mes = new Date(SE_BASE + w * SE_SEM * 60000).getUTCMonth();
    let n = 0; for (let p = sfNueva() ? 0 : -8; p <= w; p++) if (new Date(SE_BASE + p * SE_SEM * 60000).getUTCMonth() === mes && sfPct(E, p, Math.min(SF.now, sfFin(p))) >= 100) n++;
    return n;
  }
  function sfCruce(E){
    const w = Math.floor(SF.now / SE_SEM), dia = sfDia(SF.now), hora = SF.now % SE_DIA, nom = sfNom(), m = scMenor();
    if (sfNueva() && w === 0) {
      const p = sfPct(E, 0, SF.now), B = sfB();
      return mvPos((p >= 100 ? 'f' : 'c') + ' seeqbox sfcruce', '<span class="mvk">Su primera semana</span><span class="stack" style="gap:4px">' + (p >= 100 ? sfTit('<b>En</b>', 'sincro ' + MV_RAYO) : sfTit('<b>Vamos ' + p + ' %</b>')) +
          '<span class="mvsub">Meta a la mitad. El lunes arranca su primer cruce.</span></span>' +
        '<div class="sfx">' + sfCol(p, nom, true, SF.flash) + sfCol(null, 'Otra banda', false) + '</div>' +
        '<div class="sbint sfint">' + B.int.map(x => '<span class="sbper"><span class="av sm" style="background:' + grad(SF_GENTE[x.n]) + '">' + (x.id === 's1' ? 'M' : inicial(x.n)) + '</span><span class="small">' + x.n + '</span></span>').join('') + '</div>' +
        (m ? '' : '<button class="btn ghost sm" data-sfsumar>Sumá a alguien</button>'));
    }
    let cab, cols, extra = '', sincro = false, ult;
    if (sfLun1()) {
      const r = sfRes(E, w - 1); ult = sfUlt8(E, w);
      cab = '<span class="mvk">El cruce · la semana pasada</span><span class="stack" style="gap:4px">' + (r.gano ? sfTit('<b>Ganaron</b>', MV_RAYO) : sfTit('<b>Esta vez</b>', 'no')) +
        '<span class="mvsub">' + (r.gano ? r.a + ' a ' + r.b + ' contra ' + r.riv + '. Hoy arranca otro cruce, contra ' + sfRivNom(E, w) + '.' : r.b + ' a ' + r.a + ' contra ' + r.riv + '. Hoy arranca la revancha.') + '</span></span>';
      cols = sfCol(r.a, nom, true) + sfCol(r.b, r.riv, false); sincro = r.gano;
      if (SOC_V === 'G') { const g = sgLun1(E, w, r); cab = g.cab; cols = g.cols; }   // T26: el resultado se revela
      if (r.gano && !m) extra = '<button class="btn sm" data-sffoto>' + SB_CAM + 'La foto del cruce</button>';
    } else {
      const a = sfPct(E, w, SF.now), b = sfRivPct(w, SF.now), q = 6 - dia; ult = sfUlt8(E, w); sincro = a >= 100;
      const cuando = SOC_V === 'G' && dia === 6 ? 'Se define hoy.' : dia === 6 ? (hora >= SE_ABRE[6][1] * 60 ? 'El resultado, mañana.' : 'Cierra hoy.') : q === 1 ? 'Queda 1 día.' : 'Quedan ' + q + ' días.';
      const antes = dia === 0 && w > -8 ? '<span class="seres">La semana pasada: ' + (sfRes(E, w - 1).gano ? 'ganaron ' + MV_RAYO : 'esta vez no') + '</span>' : '';
      cab = antes + '<span class="mvk">El cruce · esta semana</span><span class="stack" style="gap:4px">' + sfTit('<b>Vamos ' + a + ' %</b>', '· ellos ' + b + ' %') +
        '<span class="mvsub">' + (sincro ? 'En sincro ' + MV_RAYO + ' ' : '') + cuando + '</span></span>';
      cols = sfCol(a, nom, true, SF.flash) + sfCol(b, sgRivLbl(sfRivNom(E, w)), false);
    }
    const mes = sfMes(E);
    if (mes >= 3) extra += '<div class="mvfila sfcartelf"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">Mes cumplido ' + MV_RAYO + '</span><span class="small muted">El cartel de la banda</span></span><button class="btn sm" data-sfcartel>Verlo</button></div>';
    return mvPos((sincro ? 'f' : 'c') + ' seeqbox sfcruce' + (SF.nuevoSincro ? ' seboom' : '') + (SOC_V === 'G' && !sfLun1() && dia === 6 ? ' sgvivo' : ''), cab + '<div class="sfx">' + cols + '</div>' +
      '<span class="stack" style="gap:6px">' + sdCeldas(ult) + '<span class="scpie"><span>Últimos ' + ult.length + ' cruces</span><span>Ganados: ' + ult.filter(Boolean).length + '</span></span></span>' + extra);
  }
  function sfUltimo(ev){
    const x = ev[0];
    if (!x) return '<div class="card sefrs"><div class="sefr"><span class="sefk">Lo último</span><span class="sefx muted">Todavía nada esta semana.</span></div></div>';
    const f = sfFirma(x), a = x.id === 's1' ? [f[0], f[1]] : [sfQuien(x), f[0].toLowerCase() + ' ' + f[1]];
    return '<div class="card sefrs"><div class="sefr"><button class="sefrb" data-sfvibra aria-label="Lo último de tu banda: ver los últimos 7 días">' + sfAv(x) +
      '<span class="sefx"><b>' + a[0] + '</b> ' + a[1] + (f[2] ? ' ' + MV_RAYO : '') + '</span></button>' + sfRayoBtn(x) + '</div></div>';
  }
  // ---- sin banda: el lugar que late (igual en las dos puertas) y la puerta
  function sfLugar(){
    let b = '';
    for (let i = 0; i < 3; i++) b += '<span class="sebar' + (i === 1 ? ' aca' : '') + '"><svg viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true"><rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>' +
      (i === 1 ? '<rect class="seaca" x="1" y="1" width="38" height="198" rx="5" fill="none" stroke="var(--lime)" stroke-width="2.5"/>' : '<rect x="2" y="2" width="36" height="196" rx="4" fill="none" stroke="var(--muted)" stroke-opacity=".35" stroke-dasharray="4 5"/>') +
      '</svg><span class="senom">' + (i === 1 ? 'Vos' : '') + '</span></span>';
    return '<div class="seeq off sfmini">' + b + '</div>';
  }
  const sfSal = (k, t) => '<button class="link lime sfsal" data-sfsal="' + k + '">' + t + '</button>';
  function sfSin(){
    const p = SF.alt ? (sfP() === 'trae' ? 'presenta' : 'trae') : sfP();
    if (p === 'trae') return mvPos('m sfpuerta', sfLugar() + '<span class="stack" style="gap:6px">' + sfTit('<b>Entrená</b>', 'con alguien') + '<span class="mvsub">De a dos, venir es más fácil ' + MV_RAYO + '</span></span>' +
      '<span class="stack" style="gap:10px"><button class="btn" data-sfinv>Invitá a un amigo</button><button class="btn ghost" data-sfcod>Ya entreno con alguien de Viva</button></span>' +
      (SF.alt ? sfSal('volver', 'Volver al primer jueves') : sfSal('presenta', 'No tengo con quién')));
    return mvPos('m sfpuerta', sfLugar() + '<span class="stack" style="gap:6px">' + sfTit('<b>Tu primer</b>', 'jueves') +
        '<span class="sfprofe">' + sbProfe('Te recibe · ' + SB_G.hora + ' · ' + SB_G.sede) + '</span></span>' +
      '<span class="stack" style="gap:10px"><button class="btn" data-sfprimer>Voy</button><span class="mvsub">Cada uno su rutina, a la misma hora. Tu profe arma las bandas.</span></span>' +
      (scMenor() ? '' : SF.alt ? sfSal('volver', 'Volver') : sfSal('trae', 'Prefiero traer a alguien')));
  }
  function sfEspera(){
    if (sfT() === 'trae') { const I = sfInv();
      return mvPos('m sfpuerta', '<span class="mvk">En espera</span><span class="stack" style="gap:6px">' + sfTit('<b>Invitaste</b>', 'a alguien') +
          '<span class="mvsub">Para el ' + SE_DIAS[sfDia(I.d * SE_DIA)] + ' ' + I.h + ' · ' + I.s + '. Si viene, arrancan en banda.</span></span>' +
        '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sfreenv>Reenviar</button><button class="btn ghost sm" data-sfinv>Cambiar el día</button></div>'); }
    return mvPos('m sfpuerta', '<span class="mvk">Tu primer jueves · ' + SB_G.sede + '</span><span class="stack" style="gap:6px">' + sfTit('<b>Anotado</b>', MV_RAYO) +
        '<span class="mvsub">El jueves te esperan a las ' + SB_G.hora + '. Prof. Lucas te recibe en la entrada de la sala.</span></span>' +
      '<button class="btn ghost sm" data-sfnollego>No llego</button>');
  }
  // ---- Lo de Viva: lo de la E (publicaciones y videos ilustrados por código, o Instagram en vivo en el iPhone) y Social VIVA con Me anoto
  function sfViva(){
    const car = SF.ig === 'vivo' ? sdIgVivo() + '<div class="secarr">' + seCar(SE_PUB[3]) + '</div>' : '<div class="secarr" aria-label="Publicaciones de Viva">' + SE_PUB.map(seCar).join('') + '</div>';
    return '<div class="stack" style="gap:14px"><span class="stack" style="gap:2px"><span class="lbl">Lo de Viva</span><span class="small muted">' + (SF.ig === 'vivo' ? 'La cuenta de Viva en Instagram' : 'Lo que publica Viva') + '</span></span>' + car + sdSocial() + '</div>';
  }
  // ---- la pantalla
  function sfRender(){
    const c = $('#sfArriba'); if (!c) return;
    if (sfNueva() && SF.now < SF_NUEVA + 15) SF.now = SF_NUEVA + 15;
    let h;
    if (SOC_V === 'G') h = sgArriba();   // T26: la G, con la fila arriba
    else if (SF.est === 'sin' || SF.est === 'espera') h = sfCab(false) + (SF.est === 'sin' ? sfSin() : sfEspera());
    else { const E = sfEntradas(); h = sfCab(true) + sfFecha() + sfCruce(E) + (SF.ult ? sfUltimo(sfEventos(E)) : ''); }
    c.innerHTML = h; SF.flash = false; SF.nuevoSincro = false;
    const v = $('#sfViva'), k = (SOC_V === 'G' ? 'G' + SG.voc : SF.ig) + !!SD.anot.e2;
    if (v.dataset.k !== k) { if (seVActivo) seVidPausa(seVActivo); v.dataset.k = k; v.innerHTML = SOC_V === 'G' ? sgPie() : sfViva(); seVidCargar('#sfViva'); }
    if (SOC_V === 'G') sgDespues(c);
    if (SF.preg) { SF.preg = false; sfComp(true); }
    if (SF.vivo && !sfVivoT) sfVivoProg();
  }
  function sfHoja(html){ $('#sfHojaIn').innerHTML = html; $('#sfHoja').hidden = false; if (SOC_V === 'G') sgVocDom($('#sfHojaIn')); }
  const sfCerrarBtn = (t) => '<button class="btn ghost sm" data-sfx type="button">' + (t || 'Cerrar') + '</button>';
  // La invitación (la de la B, con día, hora y sede): el mensaje a la vista; la app no pide ni guarda el nombre ni el teléfono del invitado.
  const sfHoras = d => d === 5 ? ['09:00', '11:00', '16:00'] : d === 6 ? ['10:00', '12:00'] : ['07:00', '12:00', '18:00', '19:00', '20:00'];
  function sfInv(){
    const hoy = Math.floor(SF.now / SE_DIA);
    if (!SF.inv || SF.inv.d < hoy) { let d = hoy + ((3 - sfDia(SF.now) + 7) % 7); if (d === hoy && SF.now % SE_DIA > 18 * 60) d += 7; SF.inv = { d:d, h:'19:00', s:SB_G.sede }; }
    return SF.inv;
  }
  function sfInvTxt(I){
    const hoy = Math.floor(SF.now / SE_DIA), dia = I.d === hoy ? 'Hoy' : I.d === hoy + 1 ? 'Mañana' : 'El ' + SE_DIAS[sfDia(I.d * SE_DIA)];
    return dia + ' a las ' + (I.h.slice(3) === '00' ? +I.h.slice(0, 2) : I.h) + ' entreno en Viva ' + I.s + '. ¿Venís? Tenés un pase para acompañarme';
  }
  function sfInvHoja(){
    const I = sfInv(), hoy = Math.floor(SF.now / SE_DIA), H = sfHoras(sfDia(I.d * SE_DIA));
    if (!H.includes(I.h)) I.h = H[H.length > 3 ? 3 : 0];
    const chip = (k, v, t, on) => '<button class="opt" type="button" data-' + k + '="' + v + '" aria-pressed="' + on + '">' + t + '</button>';
    let dias = ''; for (let d = hoy; d < hoy + 7; d++) dias += chip('sfid', d, d === hoy ? 'Hoy' : d === hoy + 1 ? 'Mañana' : SE_DIAS[sfDia(d * SE_DIA)].slice(0, 3).replace(/^./, c => c.toUpperCase()), d === I.d);
    const fila = (t, x) => '<span class="stack" style="gap:8px"><span class="lbl">' + t + '</span><div class="opts sfchips">' + x + '</div></span>';
    sfHoja('<span class="mtitle sig"><b>Invitá</b> <i>a un amigo</i></span>' + fila('Día', dias) + fila('Hora', H.map(h => chip('sfih', h, h, h === I.h)).join('')) +
      fila('Sede', SF_SEDES.map(s => chip('sfis', s, s, s === I.s)).join('')) +
      '<div class="sfmsg"><span>' + sfInvTxt(I) + '</span><span class="sflink">Enlace del pase · en la demo, de ejemplo</span></div>' +
      '<span class="small muted" style="line-height:1.4">Vivapp no pide ni guarda su nombre ni su teléfono. El pase lo valida recepción.</span>' +
      '<button class="btn" data-sfwa="inv" type="button">' + SB_WA + 'Mandar por WhatsApp</button>' + sfCerrarBtn());
  }
  // Ya entreno con alguien de Viva: un código de cuatro cifras, en persona. Sin buscador de personas; los dos aceptan.
  var sfCodT = 0;
  const sfCodigo = () => String(1000 + (Math.floor(SF.now) * 7919 + 4127) % 9000);
  function sfCodHoja(){
    clearTimeout(sfCodT);
    sfHoja('<span class="mtitle sig"><b>Ya entreno</b> <i>con alguien</i></span>' +
      '<span class="stack" style="gap:6px"><span class="lbl">Mostrale este código</span><span class="sfcod" aria-label="Tu código: ' + sfCodigo().split('').join(' ') + '">' + sfCodigo() + '</span><span class="small muted" style="text-align:center">Vale por hoy. Cuando lo cargue, los dos aceptan.</span></span>' +
      '<span class="stack" style="gap:8px"><span class="lbl">Tengo un código</span><div class="sfcodrow"><input class="sfcodin" id="sfCodIn" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="El código de cuatro cifras" placeholder="····">' +
      '<button class="btn sm" data-sfcodok type="button">Sumarme</button></div></span>' + sfCerrarBtn());
    sfCodT = setTimeout(() => { if (!$('#sfHoja').hidden && $('#sfCodIn')) sfAcepta('Cris cargó tu código'); }, 6000);   // en la demo, Cris lo carga a los 6 segundos
  }
  function sfAcepta(t){
    clearTimeout(sfCodT);
    sfHoja('<span class="mtitle sig"><b>' + t + '</b></span><span class="muted" style="line-height:1.45">¿Entrenan en banda? Quedan los dos, con el jueves a las 19 como su fecha. Lo cambian cuando quieran.</span>' +
      '<div class="grid2" style="gap:10px"><button class="btn ghost sm" data-sfx type="button">Ahora no</button><button class="btn sm" data-sfbandaok type="button">Entrenar en banda</button></div>');
  }
  // La pregunta de permisos de la D, una vez, al entrar a la banda
  function sfComp(primera){
    sfHoja('<span class="mtitle sig"><b>' + (primera ? 'Entraste a' : 'Qué ve') + '</b> <i>' + (primera ? sfNom() : 'tu banda') + '</i></span>' +
      (scMenor() ? '<span class="muted" style="line-height:1.45">Por ahora lo tuyo no sale a la banda. Lo que entrenás suma igual.</span>'
        : '<span class="muted" style="line-height:1.45">' + (primera ? '¿Qué querés que vea tu banda? ' : '') + 'Solo cosas logradas, nunca la hora. Lo que entrenás suma igual.</span>' +
          '<div>' + SD_COMP.map(x => '<label class="swrow" for="sfc_' + x[0] + '"><span style="flex:1">' + x[1] + '</span><input type="checkbox" class="sw" id="sfc_' + x[0] + '" data-sfsw="' + x[0] + '"' + (SF.comp[x[0]] ? ' checked' : '') + '></label>').join('') + '</div>' +
          '<span class="small muted">Lo cambiás cuando quieras, desde tu banda.</span>') +
      '<button class="btn" data-sfx type="button">Listo</button>');
  }
  function sfBandaHoja(){
    const B = sfB();
    sfHoja('<span class="mtitle sig"><b>' + B.nom[0] + '</b> <i>' + B.nom[1] + '</i></span>' + (B.conv ? sbProfe('La convoca · ' + SB_G.sede) : '<span class="small muted">El nombre lo eligen ustedes, cuando quieran.</span>') +
      '<div class="sbint">' + B.int.map(x => '<span class="sbper"><span class="av sm" style="background:' + grad(SF_GENTE[x.n]) + '">' + (x.id === 's1' ? 'M' : inicial(x.n)) + '</span><span class="small">' + x.n + '</span></span>').join('') + '</div>' +
      '<span class="small muted" style="line-height:1.4">Sin perfiles: solo el nombre. Del avance, la banda ve el total, nunca el de cada uno.</span>' +
      (scMenor() ? '' : '<button class="btn ghost sm" data-sfsumar type="button">Sumá a alguien</button>') + '<button class="btn ghost sm" data-sfcomp type="button">Qué ve tu banda</button>' + sfCerrarBtn());
  }
  function sfSumarHoja(){
    sfHoja('<span class="mtitle sig"><b>Sumá</b> <i>a alguien</i></span><span class="muted" style="line-height:1.45">A un amigo que todavía no viene, con una invitación; a alguien que ya entrena en Viva, con un código en persona.</span>' +
      '<button class="btn" data-sfinv type="button">Invitá a un amigo</button><button class="btn ghost" data-sfcod type="button">Ya entrena en Viva</button>' + sfCerrarBtn());
  }
  function sfVibraHoja(){
    const ev = sfEventos(sfEntradas());
    sfHoja('<span class="mtitle sig"><b>Lo último</b> <i>de tu banda</i></span><span class="small muted">Los últimos 7 días. Solo lo logrado, nunca la hora.</span>' +
      '<div class="mvfeed sevibra" style="gap:12px">' + ev.map(sfEv).join('') + '</div><span class="mvfin">Estás al día ⚡</span>' +
      '<button class="btn ghost sm" data-sfcomp type="button">Qué ve tu banda</button>' + sfCerrarBtn());
  }
  function sfMsg(){
    const fila = (k, t, s) => '<div class="mvfila"><span class="stack" style="gap:2px;flex:1;min-width:0"><span style="font-weight:700">' + t + '</span><span class="small muted">' + s + '</span></span><button class="btn sm" data-sfwa="' + k + '">Abrir</button></div>';
    sfHoja('<span class="mtitle sig"><b>Mensajes</b> <i>por WhatsApp</i></span><div class="list">' + fila('banda', sfNom(), 'El grupo de WhatsApp de tu banda') + fila('profe', 'Prof. Lucas', 'Tu profe, a su número de trabajo') + '</div>' +
      '<span class="small muted" style="line-height:1.4">En Vivapp no hay chat: la charla vive en WhatsApp. Nunca ves el número de otro socio. En la demo, los enlaces son de ejemplo.</span>' + sfCerrarBtn());
  }
  // La foto con marco (la de la A): el dato sale de las entradas; sale a historias y no se guarda en Vivapp
  function sfDato(E){
    const w = Math.floor(SF.now / SE_SEM);
    if (sfLun1() && sfRes(E, w - 1).gano) return ['Ganamos', 'el cruce'];
    let n = 0; for (let p = sfPct(E, w, SF.now) >= 100 ? w : w - 1; p >= (sfNueva() ? 0 : -8) && sfPct(E, p, Math.min(SF.now, sfFin(p))) >= 100; p--) n++;
    if (n >= 2) return [n + ' semanas', 'en sincro'];
    if (n === 1) return ['En', 'sincro'];
    return ['Entrenamos', 'en banda'];
  }
  function sfFoto(){
    const d = sfDato(sfEntradas());
    sfHoja('<span class="mtitle sig"><b>La foto</b> <i>de la banda</i></span>' + mvFoto(['#07b0f2', '#f400a0'], d, sfNom() + ' · ' + SB_G.sede, true) +
      '<span class="small muted" style="line-height:1.45">Sale con el marco de VIVA y el dato de la banda, y no se guarda en Vivapp. Antes de compartirla, que estén de acuerdo todos los que salen.</span>' +
      '<div class="grid2" style="gap:10px">' + sfCerrarBtn() + '<button class="btn sm" data-sfig type="button">A historias</button></div>');
  }
  function sfCartel(){
    sfHoja('<span class="mtitle sig"><b>Mes cumplido</b> <i>' + sfNom() + '</i></span><div class="sccartel sdcartel" role="img" aria-label="El cartel de ' + sfNom() + '">' + scCartelSvg(sfB().nom, 300, 170) + '</div>' +
      '<span class="small muted" style="line-height:1.4">Tres semanas del mes en sincro. Queda en Tu mural de cada uno y sale a tus historias: solo el nombre de la banda, sin fotos ni números de nadie.</span>' +
      '<div class="grid2" style="gap:10px">' + sfCerrarBtn() + '<button class="btn sm" data-sfig type="button">A historias</button></div>');
  }
  // ---- que pase algo (lo de la E): el próximo entrenamiento de hoy de la banda o, si no hay, alguien que hoy no vino. quien = 's1': entrás vos.
  var sfTim = [], sfVivoT = 0;
  const sfLimpiar = () => { sfTim.forEach(clearTimeout); sfTim = []; };
  function sfRayos(key){
    const otros = sfB().int.filter(m => m.id !== 's1'), n = Math.min(otros.length, 1 + (SF.rot % 2)); SF.rec[key] = [];
    for (let i = 0; i < n; i++) { const q = otros[(SF.rot + i) % otros.length].n;
      sfTim.push(setTimeout(() => { (SF.rec[key] = SF.rec[key] || []).push(q); toast(q + ' te mandó un ⚡'); sfRender(); }, 2200 + i * 2300)); }
    SF.rot++;
  }
  function sfEntrena(quien){
    if (SF.est === 'sin' || SF.est === 'espera') { toast('Sin banda no hay cruce: probalo con Banda recién formada o Con banda'); return false; }
    const E = sfEntradas(), w = Math.floor(SF.now / SE_SEM), dia = Math.floor(SF.now / SE_DIA), B = sfB(), ids = B.int.map(m => m.id), ab = SE_ABRE[sfDia(SF.now)], hora = SF.now % SE_DIA;
    const antes = sfTotal(E, w, SF.now), hoyYa = new Set(E.filter(e => Math.floor(e.m / SE_DIA) === dia && e.m <= SF.now).map(e => e.socio));
    const prox = quien ? null : E.find(e => ids.includes(e.socio) && e.m > SF.now && Math.floor(e.m / SE_DIA) === dia);
    let id;
    if (prox) { SF.now = prox.m; id = prox.socio; }
    else {
      if (hora < ab[0] * 60 || hora >= ab[1] * 60 - 10) { toast('A esta hora la sala está cerrada'); return false; }
      if (quien && hoyYa.has(quien)) { toast('Hoy ya entrenaste'); return false; }
      const libres = B.int.filter(m => !hoyYa.has(m.id)), bajo = libres.filter(m => sfHechos(E, m.id, w, SF.now) < m.meta), L = bajo.length ? bajo : libres;
      if (!quien && !L.length) { toast('Hoy ya entrenó toda la banda'); return false; }
      id = quien || L[SF.rot % L.length].id; SF.now += 4; SF.extra.push({ socio:id, fecha:seFm(SF.now), extra:true });
    }
    const desp = sfTotal(sfEntradas(), w, SF.now), meta = sfMeta(w);
    SF.flash = desp > antes; if (antes < meta && desp >= meta) { SF.nuevoSincro = true; toast(sfNom() + ': en sincro ⚡'); }
    if (id === 's1') { if (SF.comp.hoy && !scMenor()) sfRayos(id + '@' + SF.now); if (!SF.nuevoSincro) toast(desp > antes ? 'Entraste a la sala: la banda sumó uno' : 'Entraste a la sala: ya cumpliste tu semana'); }
    else if (!SF.nuevoSincro && desp > antes) toast('La banda sumó uno');
    sfRender(); return true;
  }
  function sfVivoProg(){
    clearTimeout(sfVivoT); sfVivoT = 0; if (!SF.vivo) return;
    sfVivoT = setTimeout(() => { sfVivoT = 0;
      const visible = (SOC_V === 'F' || SOC_V === 'G') && !$('#socialF').hidden && $('#demoSheet').hidden;
      if (visible) { const E = sfEntradas(), dia = Math.floor(SF.now / SE_DIA), ids = sfB().int.map(m => m.id);
        if (SF.prisa && !E.some(e => ids.includes(e.socio) && e.m > SF.now && Math.floor(e.m / SE_DIA) === dia)) { SF.prisa = false; sfVivoProg(); }
        else if (!sfEntrena()) sfVivoProg(); }
      else sfVivoProg();
    }, SF.prisa ? 5000 + Math.random() * 3000 : 20000 + Math.random() * 20000);
  }
  // El estado y el momento (panel de demo): limpian lo que pasó mientras se miraba
  function sfReset(){ sfLimpiar(); clearTimeout(sfCodT); SF.extra = []; SF.rec = {}; SF.flash = false; SF.nuevoSincro = false; SF.voy = 'voy'; }
  function sfMomento(k){ sfReset(); SF.mom = k; SF.now = SF_MOM[k]; }
  function sfEstado(est){ sfReset(); SF.est = est; SF.alt = false; SF.tipo = SF.puerta;
    SF.now = est === 'con' ? SF_MOM[SF.mom] : est === 'nueva' ? SF_NUEVA + 15 : SF_SIN; if (est === 'nueva') SF.preg = true; }
  sfEstado(SF.est);
  $('#socialF').addEventListener('click', e => {
    const q = s => e.target.closest(s), cerrar = () => { clearTimeout(sfCodT); $('#sfHoja').hidden = true; };
    let b;
    if ((b = q('[data-sevplay]')) || ((b = q('.sevid')) && !q('a'))) { seVidToggle(b.closest('.sevid')); return; }
    if ((b = q('[data-sfrayo]'))) { const k = b.dataset.sfrayo, nom = b.getAttribute('aria-label').replace(/^(Sacarle|Mandarle) (el|un) rayo a /, '');
      SF.rayo[k] = !SF.rayo[k]; $$('#socialF [data-sfrayo="' + k + '"]').forEach(x => { x.setAttribute('aria-pressed', !!SF.rayo[k]); x.setAttribute('aria-label', (SF.rayo[k] ? 'Sacarle el rayo a ' : 'Mandarle un rayo a ') + nom); });
      if (SF.rayo[k]) toast('Le mandaste un ⚡ a ' + nom); return; }
    if ((b = q('[data-sfvoy]'))) { SF.voy = b.dataset.sfvoy; sfRender(); toast(SF.voy === 'voy' ? '¡Vamos! Jueves a las 19, cada uno su rutina' : sfB().int.length >= 3 ? 'Listo. La banda ve un número, nunca quién' : 'Listo, esta vez no llegás'); return; }
    if (q('[data-sfvibra]')) { sfVibraHoja(); return; }
    if (q('[data-sfbanda]')) { sfBandaHoja(); return; }
    if (q('[data-sfsumar]')) { sfSumarHoja(); return; }
    if (q('[data-sfcomp]')) { sfComp(false); return; }
    if (q('[data-sfmsg]')) { sfMsg(); return; }
    if (q('[data-sffoto]')) { sfFoto(); return; }
    if (q('[data-sfcartel]')) { sfCartel(); return; }
    if (q('[data-sfig]')) { cerrar(); toast('Se abre Instagram para tu historia (en la demo, de ejemplo)'); return; }
    if ((b = q('[data-sfsal]'))) { const k = b.dataset.sfsal;
      if (k === 'volver') { SF.alt = false; sfRender(); return; }
      if (k === 'trae' && sfP() === 'presenta') { sfInvHoja(); return; }   // "Prefiero traer a alguien" abre la invitación
      SF.alt = true; sfRender(); $('#socialF .body').scrollTop = 0; return; }          // "No tengo con quién" lleva al primer jueves
    if (q('[data-sfinv]')) { sfInvHoja(); return; }
    if ((b = q('[data-sfid]'))) { sfInv().d = +b.dataset.sfid; sfInvHoja(); return; }
    if ((b = q('[data-sfih]'))) { sfInv().h = b.dataset.sfih; sfInvHoja(); return; }
    if ((b = q('[data-sfis]'))) { sfInv().s = b.dataset.sfis; sfInvHoja(); return; }
    if ((b = q('[data-sfwa]'))) { const k = b.dataset.sfwa; cerrar();
      if (k === 'inv') { if (SF.est === 'sin' || SF.est === 'espera') { SF.est = 'espera'; SF.tipo = 'trae'; SF.alt = false; sfRender(); }
        toast('Se abre WhatsApp con el mensaje: elegís a quién (en la demo, de ejemplo)'); return; }
      toast('Se abre WhatsApp: ' + (k === 'banda' ? 'el grupo de ' + sfNom() : 'Prof. Lucas') + ' (enlace de ejemplo)'); return; }
    if (q('[data-sfreenv]')) { toast('Se abre WhatsApp con el mismo mensaje'); return; }
    if (q('[data-sfcod]')) { sfCodHoja(); return; }
    if (q('[data-sfcodok]')) { const v = ($('#sfCodIn').value || '').replace(/\D/g, '');
      if (v.length !== 4) { toast('El código tiene cuatro cifras'); return; } sfAcepta('Es el código de Cris'); return; }
    if (q('[data-sfbandaok]')) { cerrar(); sfReset(); SF.est = 'nueva'; SF.tipo = 'trae'; SF.alt = false; SF.now = SF_NUEVA + 15; SF.preg = true; sfRender(); $('#socialF .body').scrollTop = 0; toast('Cris también aceptó: ya son banda'); return; }
    if (q('[data-sfprimer]')) { SF.est = 'espera'; SF.tipo = 'presenta'; SF.alt = false; sfRender(); toast('Te esperan el jueves a las 19 en Sarmiento'); return; }
    if (q('[data-sfnollego]')) { SF.est = 'sin'; sfRender(); toast('Listo, tu profe ya sabe. Te esperamos otro jueves'); return; }
    if (q('[data-sdanot]')) { SD.anot.e2 = !SD.anot.e2; sfRender(); toast(SD.anot.e2 ? 'Te anotaste a Social VIVA · sábado 08:30' : 'Te bajaste de Social VIVA'); return; }
    if (e.target.id === 'sfHoja' || q('[data-sfx]')) cerrar();
  });
  $('#socialF').addEventListener('change', e => { const s = e.target.closest('[data-sfsw]'); if (!s) return;
    SF.comp[s.dataset.sfsw] = s.checked; sfRender(); toast(s.checked ? 'Tu banda lo va a ver' : 'Tu banda ya no lo ve'); });

//#bloque 236
  // ===== T26 · Social VIVA, versión G: Las insignias (v109) =====
  // La F con otra cabecera: comparte pantalla (#socialF) y estado (SF). Lo nuevo: la fila de insignias arriba (todas las bandas que eligen
  // verse, de las sedes con app), la historia automática que abre cada una, la insignia que crece con las semanas en sincro, el cruce con
  // suspenso (domingo "se define hoy"; el lunes el resultado se revela) y el vocabulario Bandas · Tribus. Sale el carrusel de Lo de Viva.
  // Piso: nada que moderar (todo lo de una banda lo genera el sistema desde las entradas); de otra banda, solo datos de banda (insignia,
  // nombre, sede, semanas en sincro, eventos de banda); sin orden por rendimiento; una banda se ve solo si todos sus integrantes dijeron que sí
  // y ninguno es menor (E11). En real: entradas de EVO (sede del socio y entrada del día, sin verificar) · banda, nombre y su aprobación,
  // visible, ⚡ y "ya lo vi", tablas de Vivapp · cruce especial, lo carga Viva (sin definir quién).
  var SG = { voc:'Bandas', vis:'si', nombre:'ok', semK:'auto', nov:'varias', rivSede:'tu', esp:false, mano:false,
    visto:{}, novAt:'', rev:{}, rayo:{}, avW:{}, L:[], E:null, h:null, hT:0 };
  var SG_BC = {};
  SF_MOM.mar = SE_DIA + 20 * 60;   // martes a la noche (escenario 7)
  // El nombre que propuso quien armó la banda (en la demo, ya aprobado por el profe, o esperando)
  var SG_NOK = { trae:['Dúo', 'dinamita'], presenta:['Fuego del', 'jueves'] };
  function sgB(t){ const k = t + SG.nombre; return SG_BC[k] || (SG_BC[k] = Object.assign({}, SF_B[t], { nom:SG.nombre === 'ok' ? SG_NOK[t] : SF_B[t].nom })); }
  var SG_SEDE = 'Sarmiento', SG_OTRA = 'López y Planes';   // las dos sedes con app en la demo; Alberdi queda de control (sin app)
  const sgHash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const sgRnd = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sgVoc = s => SG.voc === 'Tribus' ? String(s).replace(/(^|[^A-Za-zÁÉÍÓÚáéíóúñÑ])([Bb])anda(s?)(?![A-Za-zÁÉÍÓÚáéíóúñÑ])/g, (m, a, b, p) => a + (b === 'B' ? 'T' : 't') + 'ribu' + p) : s;
  const sgW = () => Math.floor(SF.now / SE_SEM);
  const sgCon = () => SF.est === 'con' || SF.est === 'nueva';

  // ---- las bandas de los demás: quince, de las dos sedes con app. [nombre, sede, metas, constancia, semana de alta, extra]
  // extra: suma = un integrante que se suma esta semana (orden, día, hora) · no = uno no dio el sí · menor = un integrante menor de 18.
  // Nombres inventados; incluyen las rivales de semanas anteriores de la F (pas, prox), para que el cruce sea el mismo.
  const SG_GEN = [
    ['Los madrugadores', SG_SEDE, [3, 3, 2, 3], .7, -30], ['Team sábado', SG_OTRA, [2, 3, 2], .62, -22],
    ['Las imparables', SG_SEDE, [4, 3, 3, 3, 2], .66, -28], ['Los del mediodía', SG_OTRA, [3, 2, 3, 2], .58, -14],
    ['Dúo de la mañana', SG_SEDE, [3, 3], .74, -9], ['Los de las 21', SG_OTRA, [3, 3, 2, 2, 3], .6, -26],
    ['Hierro y mate', SG_OTRA, [3, 2], .7, -5], ['Las del after', SG_SEDE, [2, 2, 3], .64, -3],
    ['Doble turno', SG_OTRA, [4, 4], .78, -30], ['Los de siempre', SG_SEDE, [3, 3, 3, 2, 2], .63, -20, { suma:[0, 19, 30] }],
    ['Team domingo', SG_OTRA, [2, 2, 2], .72, 0], ['Las cardio', SG_SEDE, [3, 2, 3], .6, -12, { suma:[2, 18, 0] }],
    ['Los del fondo', SG_SEDE, [3, 3, 3], .8, -10, { no:true }], ['Piernas de acero', SG_OTRA, [3, 2], .8, -16, { no:true }],
    ['Los pibes', SG_SEDE, [3, 3, 2], .8, -8, { menor:true }]
  ];
  const SG_HORA = [6, 7, 8, 12, 13, 18, 19, 20, 21];
  // Entradas {socio, fecha} de 31 semanas: cada integrante tiene sus días y horas; viene con la constancia de la banda, y una semana de cada
  // siete o así la banda entera afloja. De acá salen semanas en sincro, eventos y cruces: ningún número escrito a mano.
  function sgArmar(){
    return SG_GEN.map((g, i) => {
      const R = sgRnd(sgHash(g[0])), x = g[5] || {}, b = { key:'g' + i, nom:g[0], sede:g[1], altaW:g[4], mem:[], E:[], vis:!x.no && !x.menor, gen:true };
      const metas = g[2].concat(x.suma ? [3] : []);
      metas.forEach((meta, j) => {
        const nuevo = x.suma && j === metas.length - 1, alta = nuevo ? x.suma[0] * SE_DIA + x.suma[1] * 60 + x.suma[2] : g[4] * SE_SEM + Math.floor(R() * 2) * SE_DIA + 18 * 60;
        const m = { id:b.key + 'm' + j, meta:meta, alta:alta, menor:!!x.menor && j === 1 };
        const dias = [0, 1, 2, 3, 4, 5].sort(() => R() - .5).slice(0, meta + (R() < .5 ? 1 : 0)).sort();
        m.hab = dias.map(d => { let h = SG_HORA[Math.floor(R() * SG_HORA.length)]; if (d === 5) h = Math.min(17, Math.max(8, h)); return d * SE_DIA + h * 60 + Math.floor(R() * 50); });
        m.p = Math.min(.97, g[3] * (.88 + R() * .24)); b.mem.push(m);
      });
      for (let w = Math.max(-30, g[4]); w <= 1; w++) { const floja = R() < .14 ? .55 : 1;
        b.mem.forEach(m => m.hab.forEach(t => { const at = w * SE_SEM + t; if (at >= m.alta && R() < m.p * floja) b.E.push({ socio:m.id, fecha:seFm(at) }); })); }
      b.E = b.E.map(e => ({ socio:e.socio, m:seMin(e.fecha) })).sort((p, q) => p.m - q.m);
      return b;
    });
  }
  var SG_GENB = null;
  const sgGenB = () => SG_GENB || (SG_GENB = sgArmar());
  // La rival de la semana de tu banda: la de la F (mismas entradas). En la G suma a alguien el martes (para el escenario 7).
  function sgRiv(){
    const B = sfB(), R = B.riv, nom = R.nom.join(' ');
    return { key:'riv', nom:nom, sede:SG.rivSede === 'otra' ? SG_OTRA : SG_SEDE, altaW:-8, half:false, vis:true, riv:true,
      mem:Object.keys(R.metas).map(id => ({ id:id, meta:R.metas[id], alta:-8 * SE_SEM })), E:sfRivEnt(), altas:[SE_DIA + 13 * 60 + 30] };
  }
  // Total y meta de una banda en la semana w hasta h (cada uno suma hasta su meta; meta = 80 % de la suma; a la mitad la semana de alta)
  function sgTM(b, w, h){
    const fin = (w + 1) * SE_SEM - 1, hh = Math.min(h, fin), M = b.mem.filter(x => x.alta < w * SE_SEM || (w === b.altaW && x.alta <= fin));
    if (!M.length || hh < w * SE_SEM) return [0, 1];
    let meta = Math.round(.8 * M.reduce((a, x) => a + x.meta, 0)); if (w === b.altaW && b.half !== false) meta = Math.max(1, Math.round(meta / 2));
    const t = M.reduce((a, x) => a + Math.min(x.meta, b.E.filter(e => e.socio === x.id && e.m >= w * SE_SEM && e.m <= hh).length), 0);
    return [t, meta];
  }
  const sgPct = (b, w, h) => { const r = sgTM(b, w, h); return 100 * r[0] / r[1]; };
  function sgSem(b, h){ let n = 0; for (let w = Math.max(-30, b.altaW); w <= Math.floor(h / SE_SEM); w++) if (sgPct(b, w, h) >= 100) n++; return n; }
  // El cruce de las demás: cada lunes se arman de a dos (de cualquier sede con app); la que fue rival de tu banda, con el resultado de la F.
  function sgGano(b, w, E){
    const rn = w >= -8 ? sfRivNom(E, w) : null;
    if (b.nom === rn) { const r = sfRes(E, w); return r.b > r.a; }
    if (b.riv) return false;
    const L = sgGenB().filter(x => x.altaW <= w && x.nom !== rn).sort((p, q) => sgHash(p.nom + w) - sgHash(q.nom + w)), i = L.indexOf(b), o = L[i ^ 1];
    return !!o && sgPct(b, w, (w + 1) * SE_SEM) > sgPct(o, w, (w + 1) * SE_SEM);
  }
  // Los eventos de banda de esta semana (duran hasta el lunes): entró en sincro · la insignia dio el salto (4, 12, 24) · ganó el cruce ·
  // sumaron a alguien · se armó. Nunca quién, ni la hora, ni quién falta.
  function sgEv(b, E){
    const w = sgW(), ev = [];
    if (sgPct(b, w, SF.now) >= 100) {
      const t = b.E.filter(e => e.m >= w * SE_SEM && e.m <= SF.now).find(e => sgPct(b, w, e.m) >= 100);
      if (t) { ev.push({ k:'sincro', m:t.m }); const n = sgSem(b, SF.now); if ([4, 12, 24].includes(n)) ev.push({ k:'salto', n:n, m:t.m + .3 }); }
    }
    if (w - 1 >= b.altaW && sgGano(b, w - 1, E)) ev.push({ k:'gano', m:w * SE_SEM + 1 });
    if (b.altaW === w) ev.push({ k:'nace', m:Math.min.apply(null, b.mem.map(x => x.alta)) });
    else b.mem.forEach(x => { if (x.alta >= w * SE_SEM && x.alta <= SF.now && x.alta > (b.altaW + 1) * SE_SEM) ev.push({ k:'alta', m:x.alta }); });
    (b.altas || []).forEach(m => { if (m >= w * SE_SEM && m <= SF.now) ev.push({ k:'alta', m:m }); });
    return ev.filter(x => x.m <= SF.now).sort((p, q) => p.m - q.m);
  }
  // Tu banda: semanas en sincro (de las entradas, o el atajo del panel) y lo de esta semana (Lo último, con los permisos de la D)
  function sgSemTu(E){
    if (SG.semK !== 'auto') return +SG.semK;
    let n = 0; const w = sgW(); for (let p = sfNueva() ? 0 : -8; p <= w; p++) if (sfPct(E, p, Math.min(SF.now, sfFin(p))) >= 100) n++;
    return n;
  }
  const sgVisible = () => SG.vis === 'si' && !scMenor();
  // ⚡ que le mandaron a tu banda esta semana (en la demo: dos bandas que tuvieron algo esta semana; solo si tu banda se ve)
  function sgRec(E, L){
    if (!sgVisible() || SF.est !== 'con') return [];
    return L.filter(b => b.gen && b.ev.length).slice(0, 2).map(b => ({ b:b, m:b.ev[0].m + 45 })).filter(x => x.m <= SF.now);
  }
  // La lista de la fila: "+" o tu banda · la rival · las que tienen algo nuevo, por lo reciente · el resto, alternando sedes.
  // Nunca por semanas en sincro ni por cruces ganados.
  function sgLista(E){
    const w = sgW(), out = [], con = sgCon();
    const rn = con && !(sfNueva() && w === 0) ? sfRivNom(E, w) : null;
    let otras = sgGenB().filter(b => b.vis && Math.min.apply(null, b.mem.map(x => x.alta)) <= SF.now);
    const riv = sgRiv(); if (rn === riv.nom) otras.push(riv);
    otras = otras.map(b => Object.assign(b, { sem:sgSem(b, SF.now), ev:sgEv(b, E), rival:b.nom === rn }));
    if (con) { const ev = sfEventos(E).filter(x => x.m >= w * SE_SEM).concat(sg2ResOn() ? [{ k:'resumen', m:w * SE_SEM }] : []); out.push({ key:'yo', yo:true, nom:sfNom(), sede:SG_SEDE, sem:sgSemTu(E), ev:ev }); }
    const on = b => b.ev.length && b.ev[b.ev.length - 1].m > (b.key in SG.visto ? SG.visto[b.key] : -1e9);
    const r = otras.find(b => b.rival); if (r) out.push(r);
    const resto = otras.filter(b => !b.rival), nuevas = resto.filter(on).sort((p, q) => q.ev[q.ev.length - 1].m - p.ev[p.ev.length - 1].m);
    const viejas = resto.filter(b => !on(b)).sort((p, q) => sgHash(p.nom) - sgHash(q.nom)), A = viejas.filter(b => b.sede === SG_SEDE), Bq = viejas.filter(b => b.sede !== SG_SEDE);
    const alt = []; while (A.length || Bq.length) { if (A.length) alt.push(A.shift()); if (Bq.length) alt.push(Bq.shift()); }
    out.push.apply(out, nuevas.concat(alt));
    if (con) { const yo = out[0]; yo.rec = sgRec(E, out); yo.ev = yo.ev.concat(yo.rec.length ? [{ k:'rayos', m:Math.max.apply(null, yo.rec.map(x => x.m)) }] : []).sort((p, q) => p.m - q.m); }
    out.forEach(b => b.on = !!on(b));
    return out;
  }
  // Cuántas bandas (todas las de las sedes con app, se vean o no) están en sincro esta semana; el lunes temprano, la semana pasada.
  function sgCuantas(E){
    const w = sgW(), c = (ww, h) => sgGenB().filter(b => b.altaW <= ww && sgPct(b, ww, h) >= 100).length + (sgPct(sgRiv(), ww, h) >= 100 ? 1 : 0) + (sgCon() && sfPct(E, ww, h) >= 100 ? 1 : 0);
    const n = c(w, SF.now); return n ? 'Esta semana, ' + n + ' bandas en sincro' : 'La semana pasada, ' + c(w - 1, w * SE_SEM - 1) + ' bandas en sincro';
  }

  // ---- la insignia: la genera la app desde el nombre (siempre igual para el mismo nombre). Diez formas, dos colores del neón de Viva,
  // las iniciales. Crece con las semanas en sincro acumuladas (nunca vuelve atrás): un rayo por semana hasta 12; a las 4, un segundo trazo;
  // a las 12, el anillo de puntos que se enciende uno por semana; a las 24, el espectro. Nace con su forma completa.
  const SG_PAR = [['#07b0f2', '#f400a0'], ['#f400a0', '#07b0f2'], ['#ffe94a', '#07b0f2'], ['#07b0f2', '#ffe94a'], ['#f400a0', '#ffe94a'], ['#ffe94a', '#f400a0']];
  const SG_STOP = ['los', 'las', 'la', 'el', 'del', 'de', 'y', 'en'];
  const sgIni = nom => nom.split(' ').filter(p => !SG_STOP.includes(p.toLowerCase())).slice(0, 2).map(p => /^\d+$/.test(p) ? p.slice(0, 2) : p[0].toUpperCase()).join('').slice(0, 2);
  function sgForma(k, r){
    const pol = (n, rot, rr) => { const p = []; for (let i = 0; i < n; i++) { const a = (rot + i * 360 / n) * Math.PI / 180; p.push((rr * Math.cos(a)).toFixed(1) + ',' + (rr * Math.sin(a)).toFixed(1)); } return '<polygon stroke-linejoin="round" points="' + p.join(' ') + '"'; };
    const s = r / 30;
    switch (k) {
      case 0: return '<circle r="' + (r * .95).toFixed(1) + '"';
      case 1: return pol(3, -90, r * 1.2);
      case 2: return pol(4, -90, r * 1.1);
      case 3: return '<rect x="' + (-r * .82).toFixed(1) + '" y="' + (-r * .82).toFixed(1) + '" width="' + (r * 1.64).toFixed(1) + '" height="' + (r * 1.64).toFixed(1) + '" rx="' + (r * .3).toFixed(1) + '"';
      case 4: return pol(5, -90, r * 1.04);
      case 5: return pol(5, 90, r * 1.04);
      case 6: return pol(6, -90, r);
      case 7: return pol(6, 0, r);
      case 8: return pol(8, 22.5, r);
      default: return '<path stroke-linejoin="round" d="M0 ' + (-31 * s).toFixed(1) + 'L' + (27 * s).toFixed(1) + ' ' + (-20 * s).toFixed(1) + 'L' + (27 * s).toFixed(1) + ' ' + (3 * s).toFixed(1) + 'Q' + (25 * s).toFixed(1) + ' ' + (22 * s).toFixed(1) + ' 0 ' + (32 * s).toFixed(1) + 'Q' + (-25 * s).toFixed(1) + ' ' + (22 * s).toFixed(1) + ' ' + (-27 * s).toFixed(1) + ' ' + (3 * s).toFixed(1) + 'L' + (-27 * s).toFixed(1) + ' ' + (-20 * s).toFixed(1) + 'Z"';
    }
  }
  function sgIns(nom, n, cls, nueva){
    const h = sgHash(nom), k = h % 10, P = SG_PAR[(h >>> 5) % 6], A = P[0], B = P[1], id = 'sgi' + (++scUid), ini = sgIni(nom), R = 29;
    let g = n >= 24 ? '<defs><linearGradient id="' + id + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient></defs>' : '';
    for (let i = 0; i < Math.min(n, 12); i++) { const a = (-90 + i * 30) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      g += '<line class="' + (nueva && i === Math.min(n, 12) - 1 ? 'sgpz' : '') + '" x1="' + (37 * c).toFixed(1) + '" y1="' + (37 * s).toFixed(1) + '" x2="' + (44 * c).toFixed(1) + '" y2="' + (44 * s).toFixed(1) + '" stroke="' + A + '" stroke-width="3.4" stroke-linecap="round"/>'; }
    if (n >= 12) for (let i = 0; i < 12; i++) { const a = (-75 + i * 30) * Math.PI / 180, on = i < Math.min(12, n - 11);
      g += '<circle cx="' + (45.5 * Math.cos(a)).toFixed(1) + '" cy="' + (45.5 * Math.sin(a)).toFixed(1) + '" r="2.5" fill="' + (on ? B : 'none') + '" stroke="' + B + '" stroke-opacity="' + (on ? 1 : .45) + '" stroke-width="1"/>'; }
    g += sgForma(k, R) + ' fill="' + A + '" fill-opacity=".16" stroke="' + (n >= 24 ? 'url(#' + id + ')' : A) + '" stroke-width="' + (n >= 24 ? 4 : 3.2) + '"/>';
    if (n >= 4) g += sgForma(k, R * .74) + ' fill="none" stroke="' + B + '" stroke-width="2"/>';
    if (ini) g += '<text x="0" y="' + (k === 1 ? 6 : k === 9 ? 3 : 1) + '" text-anchor="middle" dominant-baseline="central" style="font-family:var(--display);font-weight:800;letter-spacing:-.5px" font-size="' + (ini.length > 1 ? (k === 1 ? 15 : 21) : (k === 1 ? 22 : 27)) + '" fill="currentColor">' + ini + '</text>';
    return '<svg class="sgins ' + (cls || '') + '" viewBox="-50 -50 100 100" style="--ia:' + A + '" aria-hidden="true">' + g + '</svg>';
  }
  // Lo que le falta para la próxima pieza, dicho en positivo
  function sgProx(n){
    if (n >= 24) return 'Tiene todas sus piezas. Cada semana en sincro la mantiene encendida.';
    const p = n === 3 ? 'el segundo trazo' : n === 11 ? 'el anillo' : n === 23 ? 'el espectro' : n < 12 ? 'un rayo' : 'un punto del anillo';
    return 'Una semana más en sincro y suma ' + p + '.';
  }

  // ---- la cabecera y la fila
  function sgCab(con){
    const m = scMenor();
    return '<div class="sdhead"><div class="stack" style="gap:6px;flex:1;min-width:0"><h1 class="mtitle sig"><b>Las</b> <i>bandas</i></h1></div>' +
      (con && !m ? '<span class="sfcabb"><button class="btn ghost sdmsg" data-sffoto aria-label="La foto con el marco de Viva">' + SB_CAM + '<span>Foto</span></button>' +
        '<button class="btn ghost sdmsg" data-sfmsg aria-label="Mensajes: abre WhatsApp">' + SB_WA + '<span>WhatsApp</span></button></span>' : '') + '</div>';
  }
  function sgFila(E){
    const L = SG.L, it = b => '<button class="sgc" data-sgver="' + b.key + '" aria-label="' + (b.yo ? 'Tu banda, ' : '') + b.nom + (b.sede !== SG_SEDE ? ', ' + b.sede : '') + (b.on ? ': hay algo nuevo' : '') + '">' +
      '<span class="sgaro' + (b.on ? ' on' : '') + (b.yo && sg2ResOn() ? ' res' : '') + (b.yo && !sgVisible() ? ' priv' : '') + '">' + sgIns(b.nom, b.sem) + '</span><span class="sgn">' + b.nom + '</span>' + (b.sede !== SG_SEDE ? '<span class="sgs">' + b.sede + '</span>' : '') + '</button>';
    const mas = sgCon() ? '' : '<button class="sgc" data-sgmas aria-label="Armá tu banda"><span class="sgaro plus"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></span><span class="sgn">Tu banda</span></button>';
    return '<div class="sgfila" role="list" aria-label="Las bandas">' + mas + L.map(it).join('') + '<span class="sgtot">' + sgCuantas(E) + '</span></div>';
  }
  function sgBandaLinea(){
    const B = sfB(), nom = sfNom(), sub = [B.conv ? 'la convoca ' + B.conv : '', sgVisible() ? '' : 'solo ustedes la ven'].filter(Boolean).join(' · ');
    return '<button class="sfbanda sgbl" data-sfbanda aria-label="Tu banda: ' + nom + '">' + sgIns(nom, SG.L[0] ? SG.L[0].sem : 0, 'sgmini') +
      '<span class="stack" style="gap:2px;min-width:0"><span class="sdbanda">' + nom + '</span>' + (sub ? '<span class="small muted">' + sub + '</span>' : '') + '</span></button>';
  }
  // El cruce especial del mes (lo propone Viva): sede contra sede, cada una en % de la suma de las metas de sus bandas
  function sgEspPct(E){
    const w = sgW(), S = {}; S[SG_SEDE] = [0, 0]; S[SG_OTRA] = [0, 0];
    const add = (sede, r) => { S[sede][0] += r[0]; S[sede][1] += r[1]; };
    sgGenB().filter(b => b.altaW <= w).forEach(b => add(b.sede, sgTM(b, w, SF.now))); const rv = sgRiv(); add(rv.sede, sgTM(rv, w, SF.now));
    if (sgCon()) add(SG_SEDE, [sfTotal(E, w, SF.now), sfMeta(w)]);
    return [[SG_SEDE, Math.round(100 * S[SG_SEDE][0] / S[SG_SEDE][1])], [SG_OTRA, Math.round(100 * S[SG_OTRA][0] / S[SG_OTRA][1])]];
  }
  const sgEspFr = E => '<div class="card sefrs sgesp"><div class="sefr"><span class="sefk">Cruce especial</span><span class="sefx small">' + sgEspPct(E).map(x => x[0] + ' ' + x[1] + ' %').join(' · ') + '</span></div></div>';
  const sgMano = () => '<button class="link lime sfsal sgmano" data-sgmano' + (SG.mano ? ' aria-pressed="true"' : '') + '>' + (SG.mano ? 'Tu profe ya sabe ' + MV_RAYO : 'Que mi profe me sume a una') + '</button>';
  // La pantalla de la G (la llama sfRender): cabecera, fila, y abajo lo de la F
  function sgArriba(){
    const E = sfEntradas(), con = sgCon(), k = SF.est + SF.puerta + SF.mom + SG.semK + SG.vis + SG.nombre + SG.rivSede;
    SG.E = E;
    if (SG.novAt !== k) { SG.novAt = k; SG.rev = {}; sgNovAplicar(E); }
    SG.L = sgLista(E);
    let h = sgCab(false) + sgFila(E);   // T27: Foto y WhatsApp pasan a la fila de acciones de Tu banda
    if (!con) h += SF.est === 'sin' ? sfSin() : sfEspera();
    else h += sg2Banda() + (SG.esp && SF.est === 'con' ? sgEspFr(E) : '') + sfCruce(E) + (SF.ult ? sfUltimo(sfEventos(E)) : '');   // T27: la fecha vive en Voy
    return h;
  }
  // Novedades (panel): qué anillos arrancan encendidos. "Ya lo vi" = el momento en que se abrió la historia.
  function sgNovAplicar(E){
    SG.visto = {}; if (SG.nov === 'varias') return;
    sgLista(E).forEach(b => { const deja = (SG.nov === 'tu' || SG.nov === 'dos') && b.key === 'yo' || (SG.nov === 'rival' || SG.nov === 'dos') && b.rival; if (!deja) SG.visto[b.key] = SF.now; });
  }
  function sgPie(){ return '<div class="stack sgpie0" style="gap:10px">' + sdSocial() + '</div>'; }
  // Después de dibujar: el vocabulario, el resultado del lunes que queda fijo y, una vez por semana, el aviso de los ⚡ recibidos
  function sgDespues(c){
    sgVocDom(c); sgVocDom($('#sfViva'));
    const w = sgW();
    if (sfLun1() && !SG.rev[w]) setTimeout(() => { SG.rev[w] = true; }, 2600);
    const yo = SG.L[0]; if (yo && yo.yo && yo.rec && yo.rec.length && !SG.avW[w] && $('#demoSheet').hidden) { SG.avW[w] = true; setTimeout(() => toast('Les mandaron ⚡ a tu banda'), 900); }
  }
  function sgVocDom(el){
    if (!el || SG.voc !== 'Tribus') return;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const v = sgVoc(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    el.querySelectorAll('[aria-label]').forEach(x => x.setAttribute('aria-label', sgVoc(x.getAttribute('aria-label'))));
  }
  toast = (f => m => f(SOC_V === 'G' ? sgVoc(m) : m))(toast);
  // En la G, la columna rival dice el nombre y la sede (la rival puede ser de cualquier sede con app)
  function sgRivLbl(n){ if (SOC_V !== 'G') return n; const r = sgRiv(), b = n === r.nom ? r : sgGenB().find(x => x.nom === n); return b && b.sede !== SG_SEDE ? n + ' · ' + b.sede : n; }

  // ---- el cruce con suspenso: el lunes, el resultado no está a la vista; las columnas terminan de llenarse y después queda fijo
  function sgColRev(p0, p, nom, yo){
    const N = 10, l0 = Math.min(N, Math.floor(Math.min(100, p0) / 10)), lit = Math.min(N, Math.floor(Math.min(100, p) / 10)), sin = yo && p >= 100, id = 'sfc' + (++scUid), GP = 5, sh = (200 - GP * (N - 1)) / N;
    const C = yo ? 'var(--lime)' : 'var(--muted)', F = sin ? 'url(#' + id + 'z)' : C, L = eqLuz(Math.max(.4, lit / N));
    let g = '<defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-30" y="-30" width="100" height="270"><feGaussianBlur stdDeviation="' + (L.hb * .5).toFixed(1) + '"/></filter>' +
      '<linearGradient id="' + id + 'z" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient></defs>' +
      '<rect class="rl-slot" x="-4" y="-4" width="48" height="208" rx="6"/>';
    for (let j = 0; j < N; j++) { const y = 200 - (j + 1) * sh - j * GP;
      g += eqCeldaCol(0, y, 40, sh, false, C, L, id, false);
      if (j < lit) g += '<g' + (j >= l0 ? ' class="sgllena" style="animation-delay:' + (.35 + (j - l0) * .16).toFixed(2) + 's"' : '') + '>' + eqCeldaCol(0, y, 40, sh, true, F, L, id, sin) + '</g>'; }
    return '<div class="sfcol' + (yo ? ' yo' : '') + (sin ? ' sin' : '') + '" role="img" aria-label="' + nom + ': ' + p + ' % de su meta">' +
      '<span class="sfp sgtras">' + p + ' %' + (sin ? MV_RAYO : '') + '</span><svg viewBox="-6 -6 52 212" preserveAspectRatio="none" aria-hidden="true">' + g + '</svg><span class="senom">' + nom + '</span></div>';
  }
  function sgLun1(E, w, r){
    const nom = sfNom(), rl = sgRivLbl(r.riv), rev = SG.rev[w], sab = (w - 1) * SE_SEM + 3 * SE_DIA;   // las columnas arrancan como estaban el jueves y terminan de llenarse
    const sumo = SG.semK === 'auto' && r.a >= 100;
    const txt = (r.gano ? sfTit('<b>Ganaron</b>', MV_RAYO) : sfTit('<b>Esta vez</b>', 'no')) +
      '<span class="mvsub">' + (r.gano ? r.a + ' a ' + r.b + ' contra ' + r.riv + '. Hoy arranca otro cruce, contra ' + sfRivNom(E, w) + '.' : r.b + ' a ' + r.a + ' contra ' + r.riv + '. Hoy arranca la revancha.') + '</span>' +
      (sumo ? '<span class="sgsumo">' + sgIns(nom, sgSemTu(E), 'sgmini', true) + '<span class="small">Su insignia sumó una pieza</span></span>' : '');
    return { cab:'<span class="mvk">El cruce · la semana pasada</span><span class="stack' + (rev ? '' : ' sgtras') + '" style="gap:4px">' + txt + '</span>',
      cols:rev ? sfCol(r.a, nom, true) + sfCol(r.b, rl, false) : sgColRev(sfPct(E, w - 1, sab), r.a, nom, true) + sgColRev(sfRivPct(w - 1, sab), r.b, rl, false) };
  }

  // ---- la historia: dos a cuatro tarjetas a pantalla completa; un toque pasa (a la izquierda, vuelve), deslizar cierra; cada una dura 5 s y
  // al final se cierra sola (ver una historia y volver: un toque). Duran hasta el lunes.
  $('#socialF').insertAdjacentHTML('beforeend', '<div class="sghist" id="sgHist" hidden role="dialog" aria-label="Historia de la banda"></div>');
  const sgFirmaB = x => x.k === 'sincro' ? ['Entraron', 'en sincro', 1] : x.k === 'gano' ? ['Ganaron', 'el cruce', 1] : x.k === 'alta' ? ['Sumaron', 'a alguien'] :
    x.k === 'nace' ? ['Se armó', 'la banda', 1] : x.k === 'salto' ? ['Su insignia', 'dio el salto', 1] : ['', ''];
  const sgBig = (b, i, s) => '<span class="sgbig sig"><b>' + b + '</b> <i>' + i + '</i>' + (s ? ' ' + MV_RAYO : '') + '</span>';
  const sgSemTxt = n => n ? (n === 1 ? '1 semana en sincro' : n + ' semanas en sincro') : 'Banda nueva';
  function sgCruceCard(E, b){
    const w = sgW(), nom = sfNom(), lun = sfLun1();
    if (sfNueva() && w === 0) return '<span class="sgkick">El cruce</span>' + sgBig('El lunes', 'arranca') + '<span class="sgsub">Su primer cruce. Esta semana, la meta a la mitad.</span>';
    const r = lun ? sfRes(E, w - 1) : null, a = lun ? r.a : sfPct(E, w, SF.now), c = lun ? r.b : sfRivPct(w, SF.now), rn = lun ? r.riv : sfRivNom(E, w), dia = sfDia(SF.now);
    const tit = lun ? (r.gano ? sgBig('Ganaron', '', 1) : sgBig('Esta vez', 'no')) : a >= 100 ? sgBig('En', 'sincro', 1) : sgBig('Vamos', a + ' %');
    const sub = lun ? (r.gano ? 'La semana pasada, contra ' + rn + '.' : 'El lunes hay revancha.') : dia === 6 ? 'Se define hoy.' : 'El lunes, el resultado.';
    return '<span class="sgkick">' + (b && !b.yo ? 'Contra ustedes' : 'El cruce') + '</span>' + tit + '<div class="sfx sgx">' + sfCol(a, nom, true) + sfCol(c, sgRivLbl(rn), false) + '</div><span class="sgsub">' + sub + '</span>' +
      (SG.esp && !lun ? '<span class="sgsub">Cruce especial: ' + sgEspPct(E).map(x => x[0] + ' ' + x[1] + ' %').join(' · ') + '</span>' : '');
  }
  function sgCardsT26(b){   // T27: reemplazada por sgCards (bloque 237)
    const E = SG.E || sfEntradas(), C = [], m = scMenor();
    if (b.yo) {
      const ev = b.ev.filter(x => x.k !== 'rayos').slice(-3).reverse();
      C.push('<span class="sgkick">Esta semana</span>' + (ev.length ? '<span class="sglist">' + ev.map(x => { const f = sfFirma(x), q = x.id ? (x.id === 's1' ? '' : sfQuien(x) + ' ') : '';
        return '<span class="sgl">' + (x.id ? sfAv(x) : '') + '<span><b>' + q + (q ? f[0].toLowerCase() : f[0]) + '</b> ' + f[1] + (f[2] ? ' ' + MV_RAYO : '') + '</span></span>'; }).join('') + '</span>'
        : sgBig('Todavía', 'nada') + '<span class="sgsub">El lunes arrancó la semana.</span>') +
        (sgVisible() ? '' : '<span class="sgsub">' + (SG.vis === 'falta' ? 'Solo ustedes la ven: falta el sí de alguien.' : 'Solo ustedes la ven.') + '</span>'));
      C.push(sgCruceCard(E, b));
      C.push('<span class="sgkick">La insignia</span>' + sgIns(b.nom, b.sem, 'sgxl') + sgBig(sgSemTxt(b.sem), '') + '<span class="sgsub">' + sgProx(b.sem) + '</span>' +
        (SG.nombre === 'espera' ? '<span class="sgsub">Propusieron «' + SG_NOK[sfT()].join(' ') + '»: lo aprueba tu profe.</span>' : '') +
        (m ? '' : '<button class="btn sm" data-sgfoto type="button">' + SB_CAM + 'Foto con la insignia</button>'));
      if (b.rec && b.rec.length) C.push('<span class="sgkick">De otras bandas</span><span class="sgrec">' + b.rec.map(x => sgIns(x.b.nom, x.b.sem, 'sgmed')).join('') + '</span>' + sgBig('Les mandaron', '', 1));
      return C;
    }
    C.push(sgIns(b.nom, b.sem, 'sgxl') + sgBig(b.nom.split(' ').slice(0, -1).join(' ') || b.nom, b.nom.split(' ').length > 1 ? b.nom.split(' ').slice(-1)[0] : '') +
      '<span class="sgsub">' + b.sede + ' · ' + sgSemTxt(b.sem) + '</span>');
    if (b.rival && sgCon()) C.push(sgCruceCard(E, b));
    b.ev.slice(-(4 - C.length)).forEach(x => { const f = sgFirmaB(x);
      C.push((x.k === 'salto' ? sgIns(b.nom, x.n, 'sgxl', true) : '') + sgBig(f[0], f[1], f[2]) + '<span class="sgsub">' + (x.k === 'salto' ? sgSemTxt(x.n) + ' · ' : '') + sfCuando(x.m) + '</span>'); });
    if (C.length === 1) C.push(sgBig('Esta semana,', 'todavía nada nuevo') + '<span class="sgsub">Vuelve a pasar algo cuando entrenen.</span>');
    return C;
  }
  function sgAbrir(key){
    const b = SG.L.find(x => x.key === key); if (!b) return;
    SG.h = { b:b, C:sgCards(b), i:0 }; SG.visto[key] = SF.now;
    $('#sgHist').hidden = false; sgPaso(0);
  }
  function sgPaso(i){
    clearTimeout(SG.hT); const H = SG.h; if (!H) return;
    if (i < 0) i = 0; if (i >= H.C.length) { sgCerrar(); return; }
    H.i = i; const b = H.b, m = scMenor(); $('#sgHist').style.setProperty('--hc', sg2Par(b.nom)[0]);
    const sub = b.yo ? (sgVisible() ? 'Tu banda' : 'Tu banda · solo ustedes la ven') : b.sede;
    $('#sgHist').innerHTML = '<div class="sgbars">' + H.C.map((_, j) => '<i class="' + (j < i ? 'ya' : j === i ? 'ahora' : '') + '"></i>').join('') + '</div>' +
      '<div class="sghcab">' + sgIns(b.nom, b.sem, 'sgmed') + '<span class="stack" style="gap:2px;flex:1;min-width:0"><b class="sghn">' + b.nom + '</b><span class="small sghs">' + sub + '</span></span>' +
        '<button class="iconbtn sgx" data-sgx type="button" aria-label="Cerrar">✕</button></div>' +
      '<div class="sgcard" aria-live="polite">' + H.C[i] + '</div>' +
      '<div class="sgfoot">' + (!b.yo && !m && sgCon() ? '<span class="sgrayow"><button class="sgrayo" data-sgrayo type="button" aria-pressed="' + !!SG.rayo[b.key] + '" aria-label="' + (SG.rayo[b.key] ? 'Sacarles el ⚡' : 'Mandarles un ⚡') + '">' + MV_RAYO + '</button><span class="sgrw"><span class="a">Mandar</span><span class="b">Mandado</span></span></span>' : '') + '</div>';
    sgVocDom($('#sgHist'));
    if (!/data-sg2share/.test(H.C[i])) SG.hT = setTimeout(() => sgPaso(i + 1), SG2_DUR);   // T27: la de compartir espera
  }
  function sgCerrar(){ clearTimeout(SG.hT); SG.h = null; $('#sgHist').hidden = true; sfRender(); }
  (function () {
    const H = $('#sgHist'); let y0 = null;
    H.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive:true });
    H.addEventListener('touchend', e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) { y0 = null; sgCerrar(); H.dataset.sw = '1'; setTimeout(() => delete H.dataset.sw, 400); } y0 = null; });
    H.addEventListener('click', e => {
      if (H.dataset.sw || !SG.h) return;
      const q = s => e.target.closest(s);
      if (q('[data-sgx]')) { sgCerrar(); return; }
      if (q('[data-sgrayo]')) { const k = SG.h.b.key; SG.rayo[k] = !SG.rayo[k]; const b = q('[data-sgrayo]'); b.setAttribute('aria-pressed', !!SG.rayo[k]); b.setAttribute('aria-label', SG.rayo[k] ? 'Sacarles el ⚡' : 'Mandarles un ⚡');
        if (SG.rayo[k]) toast('Les mandaste ⚡ a ' + SG.h.b.nom); return; }
      if (q('[data-sgfoto]')) { sgCerrar(); sgFoto(); return; }
      const r = H.getBoundingClientRect(); sgPaso(SG.h.i + (e.clientX - r.left < r.width / 3 ? -1 : 1));
    });
  })();
  // La foto con marco de la F, con la insignia de la banda
  function sgFoto(){ sfFoto(); const f = $('#sfHojaIn .mvfoto'); if (f) f.insertAdjacentHTML('beforeend', '<span class="sgfotoins">' + sgIns(sfNom(), sgSemTu(SG.E || sfEntradas())) + '</span>'); }
  function sgBandaHoja(){
    const B = sfB(), m = scMenor(), nom = sfNom();
    sfHoja('<div class="sgbh">' + sgIns(nom, sgSemTu(SG.E || sfEntradas()), 'sgmed') + '<span class="mtitle sig"><b>' + B.nom[0] + '</b> <i>' + B.nom[1] + '</i></span></div>' +
      (SG.nombre === 'espera' ? '<span class="small muted" style="line-height:1.4">Propusieron «' + SG_NOK[sfT()].join(' ') + '». Lo aprueba tu profe; mientras, la banda se llama así y la insignia sale de este nombre.</span>' : '') +
      (B.conv ? sbProfe('La convoca · ' + SB_G.sede) : '') +
      '<div class="sbint">' + B.int.map(x => '<span class="sbper"><span class="av sm" style="background:' + grad(SF_GENTE[x.n]) + '">' + (x.id === 's1' ? 'M' : inicial(x.n)) + '</span><span class="small">' + x.n + '</span></span>').join('') + '</div>' +
      (m ? '<span class="small muted" style="line-height:1.4">Por ahora tu banda no aparece en la fila de las demás.</span>'
        : '<label class="swrow" for="sgVisSw"><span style="flex:1">Que las otras bandas nos vean</span><input type="checkbox" class="sw" id="sgVisSw" data-sgvis' + (SG.vis !== 'no' ? ' checked' : '') + '></label>' +
          '<span class="small muted" style="line-height:1.4">' + (SG.vis === 'falta' ? 'Falta el sí de alguien: hasta entonces, solo ustedes la ven.' : 'Aparece si todos dicen que sí, cada uno por su lado. Cualquiera la saca cuando quiere.') + ' Las otras ven la insignia, el nombre y lo que logra la banda; nunca quién.</span>') +
      (m ? '' : '<button class="btn ghost sm" data-sfsumar type="button">Sumá a alguien</button>') + '<button class="btn ghost sm" data-sfcomp type="button">Qué ve tu banda</button>' + sfCerrarBtn());
  }
  function sgMasHoja(){
    const m = scMenor(), pr = sfP() === 'presenta' || m;
    const jue = '<button class="btn' + (pr ? '' : ' ghost') + '" data-sfprimer type="button">Tu primer jueves · ' + SB_G.hora + '</button>';
    sfHoja('<span class="mtitle sig"><b>Armá</b> <i>tu banda</i></span><span class="muted" style="line-height:1.45">Que nadie entrene solo. Elegí cómo:</span>' +
      (pr ? jue : '') + (m ? '' : '<button class="btn' + (pr ? ' ghost' : '') + '" data-sfinv type="button">Invitá a un amigo</button><button class="btn ghost" data-sfcod type="button">Ya entreno con alguien de Viva</button>') + (pr ? '' : jue) +
      sgMano() + sfCerrarBtn());
  }
  // Los toques de la G van antes que los de la F (captura): solo con la G
  $('#socialF').addEventListener('click', e => {
    if (SOC_V !== 'G') return;
    const q = s => e.target.closest(s), para = () => { e.stopPropagation(); e.preventDefault(); };
    let b;
    if ((b = q('[data-sgver]'))) { para(); sgAbrir(b.dataset.sgver); return; }
    if (q('[data-sgmas]')) { para(); sgMasHoja(); return; }
    if (q('[data-sgmano]')) { para(); $('#sfHoja').hidden = true; SG.mano = true; sfRender(); toast('Listo: tu profe ya sabe. Él te suma a una banda'); return; }
    if (q('[data-sfbanda]')) { para(); sgBandaHoja(); return; }
    if (q('[data-sffoto]')) { para(); sgFoto(); return; }
    if (q('#sfHoja [data-sfprimer]')) $('#sfHoja').hidden = true;   // sigue la F: queda anotado al primer jueves
  }, true);
  $('#socialF').addEventListener('change', e => { const s = e.target.closest('[data-sgvis]'); if (!s || SOC_V !== 'G') return;
    SG.vis = s.checked ? 'si' : 'no'; sfRender(); sgBandaHoja(); toast(s.checked ? 'Tu banda aparece en la fila de las demás' : 'Tu banda ya no aparece en la fila de las demás'); });

//#bloque 237
  // ===== T27 · Social VIVA, la G ordenada y con vida (v112): reemplaza a la G de T26 y sigue llamándose G =====
  // Con banda, cuatro niveles: la fila · Tu banda (la insignia, el nombre y cuatro acciones con ícono de neón y palabra: Voy · Foto · Chat ·
  // Sumar) · el cruce · Lo último. Sale la franja de la fecha (vive en Voy) y las pastillas Foto y WhatsApp de la cabecera.
  // La historia pasa a ser gráfica: las siete celdas de la semana, las columnas del cruce que se llenan, la insignia que suma su pieza, el
  // resultado y los ⚡. De lunes a miércoles (si el panel dice "Resumen del lunes: sí"), el anillo de tu banda trae el resumen de la semana
  // que cerró: la semana, el cruce, la insignia y una imagen para historias. Todo sale de las entradas y metas de T26.
  // Quieta se entiende: cada animación arranca de un estado "from"; el estilo de base es el final (movimiento reducido, capturas).
  // Piso: de otra banda, solo datos de banda (sus celdas dicen qué días entrenó alguien, nunca quién ni a qué hora); lo de cada integrante,
  // solo dentro de su banda y con los permisos de la D; lo que sale a Instagram lleva nombre, insignia y un dato de banda; menores: solo Voy,
  // sin compartir hacia afuera. En real: lo de T26, y la imagen se arma en el teléfono y no se guarda.
  SG.res = true; SG.voy = null;
  sfReset = (f => function () { f(); SG.voy = null; })(sfReset);
  const SG2_DUR = 6000;
  const sg2Par = nom => { const h = sgHash(nom); return SG_PAR[(h >>> 5) % 6]; };
  // El resumen: de lunes a miércoles, con banda y semana anterior
  const sg2ResOn = () => SOC_V === 'G' && SG.res && SF.est === 'con' && sfDia(SF.now) <= 2 && sgW() > -8;

  // ---- Tu banda: insignia, nombre y la fila de acciones
  const SG2_IC = {
    voy:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16M9 15l2 2 4-4"/>',
    foto:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    chat:'<path d="M4 20l1.4-4.2A8 8 0 1 1 8.6 19z"/>',
    sumar:'<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M19 8v6M16 11h6"/>' };
  const sg2Ic = k => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SG2_IC[k] + '</svg>';
  function sg2Fecha(){   // [día y hora de la fecha de la banda, "van N" (solo con tres o más) o '']
    const w = sgW(), esta = SF.now < w * SE_SEM + SE_JUE + 20 * 60, hoy = esta && sfDia(SF.now) === 3, n = sfB().int.length;
    const van = Math.max(1, Math.round((n - 1) * (esta ? .75 : .25))) + (SG.voy === 'voy' ? 1 : 0);
    return [(hoy ? 'Hoy ' : 'Jue ') + SB_G.hora, n >= 3 ? 'van ' + van : ''];
  }
  const sg2Acc = (k, word, sub, cls, at) => '<button class="sgacc' + (cls || '') + '" type="button" ' + at + '><span class="sgtubo">' + sg2Ic(k) + '</span><span class="sgaw">' + word + '</span>' +
    (sub ? '<span class="sgas">' + sub + '</span>' : '') + '</button>';
  function sg2Acciones(){
    const f = sg2Fecha(), m = scMenor(), v = SG.voy;
    const voy = sg2Acc('voy', v === 'no' ? 'No llego' : 'Voy', f[0] + (f[1] ? '<br>' + f[1] : ''), v === 'voy' ? ' on' : v === 'no' ? ' no' : '',
      'data-sgvoy aria-pressed="' + (v === 'voy') + '" aria-label="' + (v === 'voy' ? 'Vas el ' : v === 'no' ? 'No llegás el ' : 'Voy: ') + f[0] + ', ' + SB_G.sede + '"');
    return '<div class="sgaccs' + (m ? ' solo' : '') + '" role="group" aria-label="Lo que se hace con tu banda">' + voy +
      (m ? '' : sg2Acc('foto', 'Foto', '', '', 'data-sffoto aria-label="Foto con el marco de Viva"') + sg2Acc('chat', 'Chat', '', '', 'data-sfmsg aria-label="Chat: abre el WhatsApp de la banda"') +
        sg2Acc('sumar', 'Sumar', '', '', 'data-sfsumar aria-label="Sumar a alguien a la banda"')) + '</div>';
  }
  function sg2Banda(){
    const B = sfB(), nom = sfNom(), yo = SG.L[0] && SG.L[0].yo ? SG.L[0] : null, res = sg2ResOn();
    const sub = [B.conv ? 'la convoca ' + B.conv : '', sgVisible() ? '' : 'solo ustedes la ven'].filter(Boolean).join(' · ');
    return '<div class="sgtu"><div class="sgtuc"><button class="sgtuins" data-sgver="yo" type="button" aria-label="' + (res ? 'El resumen de la semana de tu banda' : 'La historia de tu banda') + '">' +
        '<span class="sgaro grande' + (yo && yo.on ? ' on' : '') + (res ? ' res' : '') + (sgVisible() ? '' : ' priv') + '">' + sgIns(nom, yo ? yo.sem : 0) + '</span>' +
        (res ? '<span class="sgrespill">Resumen</span>' : '') + '</button>' +
      '<button class="sfbanda sgtun" data-sfbanda type="button" aria-label="Tu banda: ' + nom + '"><span class="sdbanda">' + nom + '</span>' + (sub ? '<span class="small muted">' + sub + '</span>' : '') + '</button></div>' +
      sg2Acciones() + '</div>';
  }
  function sg2VoyHoja(){
    const f = sg2Fecha(), op = (k, t) => '<button class="opt" data-sgvoyop="' + k + '" type="button" aria-pressed="' + (SG.voy === k) + '">' + t + '</button>';
    sfHoja('<span class="mtitle sig"><b>' + f[0] + '</b> <i>' + SB_G.sede + '</i></span><span class="muted" style="line-height:1.45">' + SB_G.que + '.' + (f[1] ? ' Esta semana ' + f[1] + '.' : '') + '</span>' +
      '<div class="opts g2">' + op('voy', 'Voy') + op('no', 'No llego') + '</div>' + sfCerrarBtn());
  }
  function sg2Voy(k){
    SG.voy = k; $('#sfHoja').hidden = true; sfRender();
    toast(k === 'voy' ? '¡Vamos! ' + sg2Fecha()[0] + ', cada uno su rutina' : sfB().int.length >= 3 ? 'Listo. La banda ve un número, nunca quién' : 'Listo, esta vez no llegás');
  }

  // ---- piezas gráficas de la historia
  const sg2Big = (b, i, s) => '<span class="sgbig sig"><b>' + b + '</b>' + (i ? ' <i>' + i + '</i>' : '') + (s ? ' ' + MV_RAYO : '') + '</span>';
  const SG2_DL = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  // Qué días de la semana w entrenó alguien de la banda (hasta h). quien: dentro de tu banda, las iniciales de quien lo comparte.
  function sg2Dias(lista, w, h, quien){
    const d = [0, 0, 0, 0, 0, 0, 0].map(() => ({ on:false, q:[] }));
    lista.forEach(e => { if (e.m >= w * SE_SEM && e.m < (w + 1) * SE_SEM && e.m <= h) { const x = d[sfDia(e.m)]; x.on = true;
      if (quien && quien(e.socio) && !x.q.includes(e.socio)) x.q.push(e.socio); } });
    return d;
  }
  function sg2Celdas(d, hoy, avs){
    const id = 'sgd' + (++scUid), L = eqLuz(1);
    let i = 0;
    return '<div class="sgdias" role="img" aria-label="' + d.filter(x => x.on).length + ' de 7 días con entrenamiento">' +
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="' + id + '" filterUnits="userSpaceOnUse" x="-20" y="-20" width="80" height="160"><feGaussianBlur stdDeviation="3"/></filter>' +
      '<linearGradient id="' + id + 'z" gradientUnits="userSpaceOnUse" x1="0" y1="110" x2="0" y2="0"><stop offset="0" stop-color="var(--z1)"/><stop offset=".5" stop-color="var(--z2)"/><stop offset="1" stop-color="var(--z3)"/></linearGradient></defs></svg>' +
      d.map((x, j) => { const fut = hoy >= 0 && j > hoy, on = x.on && !fut, F = on ? 'var(--lime-f)' : '#8f99ab';
        const cel = fut ? '<rect x="1" y="1" width="34" height="108" rx="3" fill="none" stroke="#8f99ab" stroke-opacity=".4" stroke-dasharray="4 5"/>' : eqCeldaCol(0, 0, 36, 110, on, F, L, id, false);
        return '<span class="sgdia' + (on ? ' on' : '') + (j === hoy ? ' hoy' : '') + '"' + (on ? ' style="animation-delay:' + (.25 + (i++) * .14).toFixed(2) + 's"' : '') + '>' +
          '<svg viewBox="-4 -4 44 118" aria-hidden="true">' + (j === hoy ? '<rect x="-3" y="-3" width="42" height="116" rx="5" fill="none" stroke="var(--lime-f)" stroke-width="1.6"/>' : '') + cel + '</svg>' +
          '<span class="sgdl">' + SG2_DL[j] + '</span>' + (avs && on ? '<span class="sgdav">' + x.q.slice(0, 3).map(avs).join('') + '</span>' : '') + '</span>'; }).join('') + '</div>';
  }
  const sg2Av = id => '<span class="av sgavx" style="background:' + grad(SF_GENTE[sfNomDe(id)]) + '" aria-hidden="true">' + (id === 's1' ? 'M' : inicial(sfNomDe(id))) + '</span>';
  const sg2Comparte = id => id === 's1' ? SF.comp.hoy && !scMenor() : sfB().hoy.includes(id);
  function sg2SemanaCard(lista, w, h, propia, b){
    const hoy = Math.floor(h / SE_SEM) === w ? sfDia(h) : -1, d = sg2Dias(lista, w, h, propia ? sg2Comparte : null), n = d.filter(x => x.on).length;
    return '<span class="sgkick">' + (hoy < 0 ? 'La semana' : 'Esta semana') + '</span>' + sg2Celdas(d, hoy, propia ? sg2Av : null) +
      (n ? sg2Big(String(n), n === 1 ? 'día' : 'días') + '<span class="sgsub">con alguien de la banda</span>' : sg2Big('Todavía', 'nada') + '<span class="sgsub">La semana arrancó el lunes.</span>') +
      (propia && !sgVisible() ? '<span class="sgsub">' + (SG.vis === 'falta' ? 'Solo ustedes la ven: falta el sí de alguien.' : 'Solo ustedes la ven.') + '</span>' : '');
  }
  // El cruce: las dos columnas se llenan desde cero hasta donde van (o hasta el final, el lunes)
  function sg2CruceCard(E, b){
    const w = sgW(), nom = sfNom();
    if (sfNueva() && w === 0) return '<span class="sgkick">El cruce</span>' + sg2Big('El lunes', 'arranca') + '<span class="sgsub">Su primer cruce. Esta semana, la meta a la mitad.</span>';
    const a = sfPct(E, w, SF.now), c = sfRivPct(w, SF.now), rn = sfRivNom(E, w), dia = sfDia(SF.now);
    return '<span class="sgkick">' + (b && !b.yo ? 'Contra ustedes' : 'El cruce') + '</span>' + (a >= 100 ? sg2Big('En', 'sincro', 1) : sg2Big('Vamos', a + ' %')) +
      '<div class="sfx sgx">' + sgColRev(0, a, nom, true) + sgColRev(0, c, sgRivLbl(rn), false) + '</div>' +
      '<span class="sgsub">' + (dia === 6 ? 'Se define hoy.' : 'El lunes, el resultado.') + (SG.esp ? ' Cruce especial: ' + sgEspPct(E).map(x => x[0] + ' ' + x[1] + ' %').join(' · ') + '.' : '') + '</span>';
  }
  // El resultado de la semana que cerró (lunes): ganaron o esta vez no, con las columnas llenas y la insignia
  function sg2ResultadoCard(E, foto){
    const w = sgW() - 1, r = sfRes(E, w), nom = sfNom(), m = scMenor();
    return '<span class="sgkick">El cruce</span>' + (r.gano ? sg2Big('Ganaron', '', 1) : sg2Big('Esta vez', 'no')) +
      '<div class="sfx sgx">' + sgColRev(0, r.a, nom, true) + sgColRev(0, r.b, sgRivLbl(r.riv), false) + '</div>' +
      '<span class="sgsub">' + (r.gano ? 'Hoy arranca otro cruce.' : 'Hoy arranca la revancha.') + '</span>' +
      (foto && r.gano && !m ? '<button class="btn sm" data-sgfoto type="button">' + SB_CAM + 'Foto</button>' : '');
  }
  function sg2InsCard(nom, n, nueva, extra){
    return '<span class="sgkick">La insignia</span><span class="sginsw">' + sgIns(nom, n, 'sgxl', nueva) + '</span>' +
      (nueva ? sg2Big('Sumó', 'una pieza', 1) : sg2Big(sgSemTxt(n), '')) + '<span class="sgsub">' + (nueva ? sgSemTxt(n) + '. ' : '') + sgProx(n) + '</span>' + (extra || '');
  }
  // Los eventos de otra banda, como piezas
  function sg2EvCard(b, x){
    const cu = '<span class="sgsub">' + (x.k === 'salto' ? sgSemTxt(x.n) + ' · ' : '') + sfCuando(x.m) + '</span>';
    if (x.k === 'sincro') return '<div class="sfx sgx sguno">' + sgColRev(0, 100, b.nom, true) + '</div>' + sg2Big('Entraron', 'en sincro', 1) + cu;
    if (x.k === 'gano') return '<span class="sgrafaga">' + sgIns(b.nom, b.sem, 'sgxl') + '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>' + sg2Big('Ganaron', 'el cruce', 1) + cu;
    if (x.k === 'alta') { const n = b.mem.filter(z => z.alta <= x.m).length;
      return '<span class="sgpuntos" role="img" aria-label="Ahora son ' + n + '">' + Array.from({ length:n }, (_, j) => '<i' + (j === n - 1 ? ' class="nuevo"' : '') + '></i>').join('') + '</span>' + sg2Big('Sumaron', 'a alguien') + '<span class="sgsub">Ahora son ' + n + ' · ' + sfCuando(x.m) + '</span>'; }
    if (x.k === 'nace') return '<span class="sginsw nace">' + sgIns(b.nom, 0, 'sgxl') + '</span>' + sg2Big('Se armó', 'la banda', 1) + cu;
    if (x.k === 'salto') return '<span class="sginsw">' + sgIns(b.nom, x.n, 'sgxl', true) + '</span>' + sg2Big('Su insignia', 'dio el salto', 1) + cu;
    return '';
  }

  // ---- el resumen del lunes: la semana que cerró, en cuatro tarjetas (la cuarta, la imagen para historias; menores, sin ella)
  function sg2Res(E){
    const w = sgW() - 1, r = sfRes(E, w), ids = sfB().int.map(m => m.id);
    const ent = E.filter(e => ids.includes(e.socio) && e.m >= sfDesde(w) && e.m <= sfFin(w)).length, sem = sgSemTu(E), llego = r.a >= 100;
    const dato = r.gano ? ['Ganamos', 'el cruce'] : llego ? (sem >= 2 ? [sem + ' semanas', 'en sincro'] : ['En', 'sincro']) : [ent + ' entrenamientos', 'en banda'];
    return { w:w, r:r, ent:ent, sem:sem, llego:llego, dato:dato };
  }
  function sg2Share(R){
    const nom = sfNom(), d = new Date(SE_BASE + R.w * SE_SEM * 60000), P = sg2Par(nom);
    return '<div class="sgshare" style="--a:' + P[0] + ';--b:' + P[1] + '" role="img" aria-label="Imagen para historias: ' + nom + ', ' + R.dato.join(' ') + '">' +
      '<svg class="sgshlogo" width="58" height="28" aria-hidden="true"><use href="#vLogo" width="58" height="28"/></svg>' + sgIns(nom, R.sem, 'sgshins') +
      '<span class="sgshn">' + nom + '</span><span class="mvdato sig sgshd"><b>' + R.dato[0] + '</b> <i>' + R.dato[1] + '</i>' + MV_RAYO + '</span>' +
      '<span class="sgshs">' + SG_SEDE + ' · semana del ' + d.getUTCDate() + '/' + (d.getUTCMonth() + 1) + '</span></div>';
  }
  function sg2ResCards(E){
    const R = sg2Res(E), C = [], pct = R.r.a, nom = sfNom();
    C.push('<span class="sgkick">Su semana</span>' + sg2Celdas(sg2Dias(E.filter(e => sfB().int.some(m => m.id === e.socio)), R.w, sfFin(R.w)), -1, null) +
      sg2Big(String(R.ent), 'entrenamientos') + '<span class="sgsub">' + (R.llego ? pct + ' % de la meta de la banda.' : pct + ' % de la meta. Todo lo entrenado suma.') + '</span>');
    C.push(sg2ResultadoCard(E, false));
    C.push(sg2InsCard(nom, R.sem, R.llego && SG.semK === 'auto', R.llego ? '' : '<span class="sgsub">Nunca pierde nada.</span>'));
    if (!scMenor()) C.push('<span class="sgkick">Para compartir</span>' + sg2Share(R) + '<button class="btn sgcomp" data-sg2share type="button">Compartir en historias</button>');
    return C;
  }

  // ---- las tarjetas de cada historia (reemplaza a las de T26)
  function sgCards(b){
    const E = SG.E || sfEntradas(), C = [], m = scMenor(), w = sgW();
    if (b.yo) {
      if (sg2ResOn()) return sg2ResCards(E);
      C.push(sg2SemanaCard(E.filter(e => sfB().int.some(x => x.id === e.socio)), w, SF.now, true, b));
      C.push(sfLun1() ? sg2ResultadoCard(E, true) : sg2CruceCard(E, b));
      const nueva = SG.semK === 'auto' && !sfLun1() && sfPct(E, w, SF.now) >= 100;
      C.push(sg2InsCard(b.nom, b.sem, nueva, (SG.nombre === 'espera' ? '<span class="sgsub">Propusieron «' + SG_NOK[sfT()].join(' ') + '»: lo aprueba tu profe.</span>' : '') +
        (m ? '' : '<button class="btn sm" data-sgfoto type="button">' + SB_CAM + 'Foto con la insignia</button>')));
      if (b.rec && b.rec.length) C.push('<span class="sgkick">De otras bandas</span><span class="sgrec">' + b.rec.map(x => sgIns(x.b.nom, x.b.sem, 'sgmed')).join('') + '</span>' + sg2Big('Les mandaron', '', 1) +
        '<span class="sgsub">' + b.rec.map(x => x.b.nom).join(' y ') + '</span>');
      return C;
    }
    const nm = b.nom.split(' ');
    C.push('<span class="sginsw">' + sgIns(b.nom, b.sem, 'sgxl') + '</span>' + sg2Big(nm.length > 1 ? nm.slice(0, -1).join(' ') : b.nom, nm.length > 1 ? nm[nm.length - 1] : '') +
      '<span class="sgsub">' + b.sede + ' · ' + sgSemTxt(b.sem) + '</span>');
    if (b.rival && sgCon()) C.push(sg2CruceCard(E, b));
    C.push(sg2SemanaCard(b.E, w, SF.now, false, b));
    b.ev.slice(-(4 - C.length)).forEach(x => { const h = sg2EvCard(b, x); if (h) C.push(h); });
    return C;
  }

  // ---- toques de la G nueva (antes que los de la F, como los de T26)
  $('#socialF').addEventListener('click', e => {
    if (SOC_V !== 'G') return;
    const q = s => e.target.closest(s), para = () => { e.stopPropagation(); e.preventDefault(); };
    let b;
    if (q('[data-sgvoy]')) { para(); if (SG.voy === 'voy') sg2VoyHoja(); else sg2Voy('voy'); return; }
    if ((b = q('[data-sgvoyop]'))) { para(); sg2Voy(b.dataset.sgvoyop); return; }
  }, true);
  $('#sgHist').addEventListener('click', e => {
    if (!e.target.closest('[data-sg2share]')) return;
    e.stopPropagation(); sgCerrar(); toast('Se abre Instagram para tu historia (en la demo, de ejemplo)');
  }, true);

//#bloque 238
  // ===== T28 · Social, versión H: la tira y las placas (v114) =====
  // Tres zonas: la barra ("+", el nombre, Desafíos y People, que ve solo quien la activó) · la tira (insignias en círculo; aro blanco = algo
  // nuevo; tocar una abre su historia) · el muro (placas 4:5, la primera fijada, después por fecha; termina en "Estás al día"). Una sola pieza,
  // la placa: imagen con un marco fijo (sello de Viva, @vivafithouse y, solo con un dato de la puerta, el sello amarillo "PUERTA · …").
  // Simulación propia (no toca el estado de la F ni de la G): una sede con la forma de EVO ({socio, fecha}), metas de 2 a 5, altas por
  // semana y bandas con insignias de la biblioteca. Todo número sale de ahí, con un día de atraso ("hasta ayer").
  // Piso (reglas 4, 5, 8 y 14 de T28): lo de una persona lo ve ella y quien ella eligió; lo de un dúo, ellos dos; una banda se muestra a
  // otros desde cuatro integrantes y si eligió verse, y de ella solo datos de banda; de la sede, agregados sin nombres; nada dice la hora,
  // qué faltó ni cuántos días pasaron; la camada es un número, con 8 o más y solo mientras la mayoría viene; menores: sin dúo, sin foto hacia
  // afuera, sin People y sin Voy. En real: entradas, altas (fecha y sede, sin verificar) y edad, de EVO; dúos, bandas, cruces, ⚡ y chispas,
  // tablas de Vivapp; la foto "desde Instagram", la API de Meta (sin verificar).
  var SH = { perfil:'banda', mom:'mie', dia:8, vino:3, comp:true, people:false, muro:'lleno',
    visto:{}, rayo:{}, chispa:{}, voy:false, ins:null, prop:[], desaf:{}, puertaNo:false, h:null, hT:0, now:0 };
  const SH_C = { c:'#07b0f2', m:'#f400a0', y:'#ffe94a' }, SH_GR = '#c3cad6';
  const shMen = () => scMenor();

  // ---- trazos (los del tablero del DIS: gen-tablero-social-cero.py)
  const SH_TR = {
    rayo:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', duelo:'<path d="M5 19 19 5M15 5h4v4M19 19 5 5M5 9V5h4"/>', mas:'<path d="M12 5v14M5 12h14"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.5"/>', camara:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
    fijada:'<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>', der:'<path d="M9 5l7 7-7 7"/>',
    chispa:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    wa:'<path d="M4 20l1.4-4.2A8 8 0 1 1 8.6 19z"/>', momento:'<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>' };
  const shTr = (k, c, s, sw, lleno) => '<svg aria-hidden="true" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="' + (lleno ? c : 'none') + '" stroke="' + c + '" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round">' + SH_TR[k] + '</svg>';

  // ---- insignias: las seis de neón (pantalla Base), la de la sede, el monograma de cada persona y la del dúo. Crecen: nacen con un tubo
  // encendido y suman los otros con las semanas en sincro (4 y 12); nunca pierden nada.
  const SH_EMB = {
    'Dúo dinamita':[['m', '<rect x="17" y="26" width="12" height="28" rx="3"/><rect x="35" y="26" width="12" height="28" rx="3"/><path d="M17 34h12M17 46h12M35 34h12M35 46h12"/>'],
      ['c', '<path d="M23 26c0-8 9-6 9-12M41 26c0-8-9-6-9-12"/>'], ['y', '<path d="M32 3v5M25 6l3.5 3.5M39 6l-3.5 3.5M21 14h5M38 14h5"/>']],
    'Las del mediodía':[['y', '<circle cx="32" cy="22" r="9"/><path d="M32 4v5M17 7l3.5 3.5M47 7l-3.5 3.5M12 22h5M47 22h5"/>'], ['m', '<path d="M16 54a16 16 0 0 1 32 0M32 54V42"/>'], ['c', '<path d="M8 54h48"/>']],
    'Team domingo':[['c', '<path d="M14 6v52M14 10h38l-10 12 10 12H14"/>'], ['m', '<path d="M28 15l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"/>'], ['y', '<path d="M8 58h14"/>']],
    'Hierro y mate':[['m', '<path d="M21 24h22v5c0 10-4.5 17-11 17s-11-7-11-17z"/>'], ['y', '<path d="M35 24l7-18h7"/>'], ['c', '<path d="M14 56h36M10 51v10M16 52v8M54 51v10M48 52v8"/>']],
    'Los de siempre':[['m', '<path d="M32 34c-5-8-9-11-14-11a11 11 0 0 0 0 22c5 0 9-3 14-11zm0 0c5 8 9 11 14 11a11 11 0 0 0 0-22c-5 0-9 3-14 11z"/>'], ['y', '<path d="M35 3l-7 9h6l-2 7 7-10h-6z"/>'], ['c', '<path d="M18 56h28"/>']],
    'Los madrugadores':[['y', '<path d="M16 40a16 16 0 0 1 32 0M32 12v6M15 19l4 4M49 19l-4 4"/>'], ['c', '<path d="M4 42h56"/>'], ['m', '<path d="M14 50h36M22 58h20"/>']],
    Sarmiento:[['c', '<path d="M32 58S14 41 14 27a18 18 0 0 1 36 0c0 14-18 31-18 31z"/>'], ['m', '<circle cx="32" cy="27" r="7"/>'], ['y', '<path d="M22 60h20"/>']]
  };
  const shSvg = (s, sombra, g, lbl) => '<svg class="shemb" width="' + s + '" height="' + s + '" viewBox="0 0 64 64" fill="none" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 ' + (s > 60 ? 10 : 6) + 'px ' + sombra + ')"' + (lbl ? ' role="img" aria-label="' + lbl + '"' : ' aria-hidden="true"') + '>' + g + '</svg>';
  const shTubo = (c, d, on) => on ? '<g stroke="' + c + '" stroke-width="8" opacity=".22">' + d + '</g><g stroke="' + c + '" stroke-width="3.2">' + d + '</g><g stroke="#fff" stroke-width="1" opacity=".8">' + d + '</g>' : '<g stroke="#3a4352" stroke-width="3">' + d + '</g>';
  function shEmb(nom, s, sem, lbl){
    const L = SH_EMB[nom], lit = sem == null ? 3 : 1 + (sem >= 4) + (sem >= 12);
    return shSvg(s, SH_C[L[0][0]], L.map((x, i) => shTubo(SH_C[x[0]], x[1], i < lit)).join(''), lbl);
  }
  const SH_HEX = '<path d="M32 5 55 18v28L32 59 9 46V18z"/>';
  const shMono = (l, c1, c2, s) => shSvg(s, SH_C[c1], shTubo(SH_C[c1], SH_HEX, true) +
    '<text x="32" y="42" text-anchor="middle" style="font-family:var(--display);font-weight:800" font-size="27" fill="#fff" stroke="' + SH_C[c2] + '" stroke-width=".8">' + l + '</text>');
  const shDuo = s => shSvg(s, SH_C.m, shTubo(SH_C.m, '<path d="M24 12 41 22v20L24 52 7 42V22z"/>', true) + shTubo(SH_C.c, '<path d="M40 12 57 22v20L40 52 23 42V22z"/>', true));
  const shHueco = s => '<svg class="shemb" width="' + s + '" height="' + s + '" viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke="' + SH_GR + '" stroke-width="2.4" stroke-dasharray="5 6">' + SH_HEX + '</g>' +
    '<text x="32" y="42" text-anchor="middle" style="font-family:var(--display);font-weight:800" font-size="27" fill="' + SH_GR + '">?</text></svg>';
  const shLogo = w => { const h = Math.round(w * 167.9 / 344.8); return '<svg class="shlogo" width="' + w + '" height="' + h + '" aria-hidden="true"><use href="#vLogo" width="' + w + '" height="' + h + '"/></svg>'; };
  const shViva = s => '<span class="shvivai" style="width:' + s + 'px;height:' + s + 'px">' + shLogo(Math.round(s * .7)) + '</span>';
  // La insignia de cada uno: Martina, Sofi y Cami con su monograma (Sofi la elige el día 1); las de otros, solo dentro de su banda o su dúo
  const SH_PER = { Martina:['M', 'm', 'c'], Sofi:['S', 'm', 'c'], Cami:['C', 'c', 'm'], Cris:['C', 'c', 'm'], Lu:['L', 'm', 'y'] };
  const shPer = (n, s) => { const x = n === 'Sofi' && SH.ins ? SH.ins : SH_PER[n]; return shMono(x[0], x[1], x[2], s); };

  // ---- la sede simulada (Sarmiento; las bandas pueden ser de López y Planes). Nombres inventados.
  const SH_BANDAS = [
    { key:'dd', nom:'Dúo dinamita', sede:'Sarmiento', mem:[['Martina', 3, .86], ['Cris', 3, 1], ['Vero', 2, .8], ['Pau', 4, .74], ['Juli', 3, .72]] },
    { key:'lm', nom:'Las del mediodía', sede:'Sarmiento', mem:[['Lu', 3, .93], ['Ani', 2, .8], ['Caro', 3, .76], ['Meli', 3, .72]] },
    { key:'hm', nom:'Hierro y mate', sede:'López y Planes', mem:[[null, 3, .85], [null, 2, .82], [null, 3, .8], [null, 4, .72]] },
    { key:'ls', nom:'Los de siempre', sede:'Sarmiento', mem:[[null, 3, .78], [null, 3, .74], [null, 2, .8], [null, 4, .66], [null, 3, .7]] },
    { key:'md', nom:'Los madrugadores', sede:'Sarmiento', mem:[[null, 3, .7], [null, 3, .66], [null, 2, .72], [null, 3, .62]] },
    { key:'td', nom:'Team domingo', sede:'López y Planes', mem:[[null, 2, .8], [null, 2, .78], [null, 3, .7]] }   // de tres: no se muestra a otros (regla 4)
  ];
  SH_BANDAS.forEach(b => { b.ids = b.mem.map((_, j) => b.key + j); b.vis = b.mem.length >= 4; });
  const shBan = k => SH_BANDAS.find(b => b.key === k);
  // Sofi y Cami: alta el lunes 2/11 (semana -2) a la mañana; sus entradas las fija el panel (semana 1: 3 de 3 o una vez)
  const SH_FIJ = { sofi:[['L10:30', 'X19:00', 'V18:30'], ['L18:30', 'X19:00', 'V18:30'], ['L18:30', 'X19:00', 'V18:30']], cami:[['L10:35', 'J19:00'], ['M19:00', 'J19:05'], ['L19:00', 'X19:00']] };
  var SH_SIM = null;
  function shArmar(){
    const R = sgRnd(sgHash('T28 · Sarmiento')), P = {}, ent = [];
    const alta = (id, o) => P[id] = Object.assign({ id:id, sede:'Sarmiento', meta:3, p:.7, alta:-40 * SE_SEM }, o);
    for (let i = 0; i < 150; i++) alta('v' + i, { meta:[2, 3, 3, 3, 4, 4, 5][Math.floor(R() * 7)], p:.3 + R() * .65 });
    SH_BANDAS.forEach(b => b.mem.forEach((x, j) => alta(b.key + j, { n:x[0], sede:b.sede, meta:x[1], p:x[2], banda:b.key })));
    for (let w = -9; w <= 1; w++) { const N = w === -2 ? 17 : 15 + Math.floor(R() * 9);
      for (let i = 0; i < N; i++) alta('a' + w + '_' + i, { meta:[2, 3, 3, 3, 4][Math.floor(R() * 5)], p:.62 + R() * .33, drop:.15,
        alta:w * SE_SEM + Math.floor(Math.pow(R(), 2.6) * 6) * SE_DIA + (8 + Math.floor(R() * 12)) * 60 }); }   // más altas al principio de la semana
    alta('sofi', { n:'Sofi', meta:3, alta:-2 * SE_SEM + 10 * 60, fija:true }); alta('cami', { n:'Cami', meta:2, alta:-2 * SE_SEM + 10 * 60 + 5, fija:true });
    Object.values(P).forEach(s => { if (s.fija) return;
      // los días de cada uno: barajados con el generador (un sort con comparador al azar no da lo mismo en cada carga)
      const d6 = [0, 1, 2, 3, 4, 5]; for (let i = 5; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = d6[i]; d6[i] = d6[j]; d6[j] = t; }
      s.hab = d6.slice(0, s.meta + 1).sort((x, y) => x - y);
      const w0 = Math.max(-12, Math.floor(s.alta / SE_SEM)); let fuera = false;
      for (let w = w0; w <= 1; w++) {
        if (s.drop && w > w0 && R() < s.drop) fuera = true;
        const p = fuera ? .03 : s.p >= 1 ? 1 : s.p * (R() < .12 ? .5 : 1);
        // la primera semana el que arranca viene más: cualquier día desde el alta
        if (s.drop && w === w0) { for (let d = sfDia(s.alta); d < 6; d++) { const m = w * SE_SEM + d * SE_DIA + (7 + Math.floor(R() * 14)) * 60; if (m >= s.alta && R() < s.p * .8) ent.push({ socio:s.id, fecha:seFm(m) }); } continue; }
        s.hab.forEach(d => { const m = w * SE_SEM + d * SE_DIA + (7 + Math.floor(R() * 14)) * 60 + Math.floor(R() * 50);
          if (m >= s.alta && R() < p) ent.push({ socio:s.id, fecha:seFm(m) }); }); } });
    // los ⚡ que mandaron socios de la sede a la placa "arrancaron" de la camada de Sofi (cada veterano, uno de cada cinco)
    let rayos = 0; for (let i = 0; i < 150; i++) if (R() < .2) rayos++;
    return { P:P, ent:ent, rayos:rayos };
  }
  function shSim(){
    if (!SH_SIM) { const A = shArmar(), M = {};
      A.ent.forEach(e => (M[e.socio] = M[e.socio] || []).push(seMin(e.fecha)));
      Object.keys(M).forEach(k => M[k].sort((a, b) => a - b)); SH_SIM = { P:A.P, M:M, rayos:A.rayos }; }
    ['sofi', 'cami'].forEach(id => { const L = [];
      SH_FIJ[id].forEach((sem, k) => (id === 'sofi' && k === 0 && SH.perfil === 'sola' && SH.dia === 8 && SH.vino === 1 ? ['L10:30'] : sem).forEach(t => L.push(seMin(seFm(seSlot(k - 2, t))))));
      SH_SIM.M[id] = L; });
    return SH_SIM;
  }

  // ---- lecturas: todo cuenta hasta ayer (la puerta se confirma de noche)
  const shHoy = () => Math.floor(SH.now / SE_DIA) * SE_DIA;
  const shWk = m => Math.floor(m / SE_SEM);
  const shCuenta = (id, w, h) => (shSim().M[id] || []).filter(m => m >= w * SE_SEM && m < (w + 1) * SE_SEM && m < h).length;
  const shMeta = id => shSim().P[id].meta;
  function shPct(b, w, h){ const t = b.ids.reduce((a, id) => a + Math.min(shMeta(id), shCuenta(id, w, h)), 0), M = Math.round(.8 * b.ids.reduce((a, id) => a + shMeta(id), 0)); return Math.round(100 * t / M); }
  function shSincro(b, h){ let n = 0; for (let w = -12; w < shWk(h); w++) if (shPct(b, w, (w + 1) * SE_SEM) >= 100) n++; return n; }
  function shSeguidas(id, h){ let n = 0; for (let w = shWk(h) - 1; w >= -12 && shCuenta(id, w, h) >= shMeta(id); w--) n++; return n; }
  // El cruce: esta semana, Dúo dinamita contra Las del mediodía; la semana pasada, la primera que ganaron (si no, la revancha sería otra)
  const SH_RIV0 = 'lm';
  function shRiv(w){ if (w >= 0) return SH_RIV0; const fin = (w + 1) * SE_SEM, a = shPct(shBan('dd'), w, fin);
    return ['md', 'ls', 'hm'].find(k => a > shPct(shBan(k), w, fin)) || 'md'; }
  // El resto se cruza entre sí cada lunes (de a dos, por orden fijo); de ahí sale quién ganó su cruce
  function shGano(k, w){ const fin = (w + 1) * SE_SEM, dd = shBan('dd');
    if (k === shRiv(w)) return shPct(shBan(k), w, fin) > shPct(dd, w, fin);
    const L = SH_BANDAS.filter(b => b.key !== 'dd' && b.key !== shRiv(w)).map(b => b.key), i = L.indexOf(k), o = L[i ^ 1];
    return !!o && shPct(shBan(k), w, fin) > shPct(shBan(o), w, fin); }
  // Eventos de banda de esta semana (solo de banda; nunca quién): entró en sincro (el día) · ganó su cruce (el lunes)
  function shEv(b){
    const h = shHoy(), w = shWk(h), ev = [];
    if (w - 1 >= -12 && shGano(b.key, w - 1)) ev.push({ k:'gano', m:w * SE_SEM + 6 * 60 });
    const E = b.ids.reduce((a, id) => a.concat((shSim().M[id] || []).filter(m => m >= w * SE_SEM && m < h)), []).sort((a, c) => a - c);
    const t = E.find(m => shPct(b, w, m + 1) >= 100); if (t != null) ev.push({ k:'sincro', m:Math.floor(t / SE_DIA) * SE_DIA + SE_DIA + 6 * 60 });
    return ev.filter(x => x.m <= SH.now).sort((p, q) => p.m - q.m);
  }
  // La sede: de los que vinieron al menos una vez en el último mes, cuántos de cada 10 llegaron a su meta esa semana
  function shSedeMeta(w){
    const S = shSim(), act = Object.values(S.P).filter(s => s.sede === 'Sarmiento' && !s.fija && s.alta < w * SE_SEM && (S.M[s.id] || []).some(m => m >= (w - 3) * SE_SEM && m < (w + 1) * SE_SEM));
    const ok = act.filter(s => shCuenta(s.id, w, Infinity) >= s.meta).length;
    return { n:act.length, ok:ok, r:ok / act.length, de10:Math.round(10 * ok / act.length) };
  }
  const shAltas = (w, h) => Object.values(shSim().P).filter(s => s.sede === 'Sarmiento' && s.alta >= w * SE_SEM && s.alta < (w + 1) * SE_SEM && s.alta < h);
  // La camada de Sofi: los que se dieron de alta la semana del lunes 2/11 en Sarmiento (ella y Cami incluidas)
  function shCamada(){
    const h = shHoy(), C = shAltas(-2, Infinity), sem = shWk(h) - (-2);   // semanas cerradas desde el alta
    if (C.length < 8 || sem < 1) return null;
    const dos = s => (shSim().M[s.id] || []).filter(m => m >= s.alta && m < s.alta + 7 * SE_DIA && m < h).length >= 2, todas = s => [-2, -1, 0].every(w => shCuenta(s.id, w, h) >= 1);
    const f = sem >= 3 ? todas : dos, n = C.filter(f).length;
    return { N:C.length, n:n, tres:sem >= 3, mayoria:n / C.length > .5, sofi:f(shSim().P.sofi), cami:f(shSim().P.cami) };
  }

  // ---- el momento de la demo
  const SH_MOMV = { lun:8 * 60, mie:2 * SE_DIA + 12 * 60, dom:6 * SE_DIA + 12 * 60 };
  const shNow = () => SH.perfil === 'banda' ? SH_MOMV[SH.mom] : -2 * SE_SEM + (SH.dia - 1) * SE_DIA + 13 * 60;
  function shCuando(m){ const d = Math.floor(SH.now / SE_DIA) - Math.floor(m / SE_DIA);
    if (d <= 0) return 'hoy'; if (d === 1) return 'ayer'; if (d < 7) return SE_DIAS[sfDia(m)];
    const f = new Date(SE_BASE + m * 60000); return f.getUTCDate() + '/' + (f.getUTCMonth() + 1); }

  // ---- la placa
  const shSello = t => '<span class="shsello">' + shTr('check', '#14110a', 16, 2.2) + '<span>' + t + '</span></span>';
  const shBl = (top, html) => '<div class="shbl" style="top:' + top + 'cqw">' + html + '</div>';
  const shG = (t, cqw, cls) => '<span class="shg' + (cls ? ' ' + cls : '') + '" style="font-size:' + cqw + 'cqw">' + t + '</span>';
  const shL = (t, sub) => '<span class="shl' + (sub ? ' sub' : '') + '">' + t + '</span>';
  const shCartel = (t, c, cqw) => '<span class="shcartel ' + (c || 'cy') + '" style="font-size:' + (cqw || 6.2) + 'cqw">' + t + '</span>';
  const shChipIg = () => '<span class="shchip">' + shTr('camara', '#eef2f8', 14) + 'desde Instagram</span>';
  const shBtn = (data, ic, t, on) => '<button class="shbtn" type="button" ' + data + (on != null ? ' aria-pressed="' + !!on + '"' : '') + '>' + ic + '<span>' + t + '</span></button>';
  const shRayoBtn = (k, t) => shBtn('data-shrayo="' + k + '"', shTr('rayo', SH_C.y, 18, 1.6, !!SH.rayo[k]), SH.rayo[k] ? 'Mandado' : (t || 'Mandar'), SH.rayo[k]);
  const shIgBtn = k => shMen() ? '' : shBtn('data-shig="' + k + '"', shTr('camara', '#eef2f8', 16), 'A Instagram');
  function shPlaca(p){
    return '<article class="shp' + (p.fija ? ' fija' : '') + '" data-shp="' + p.key + '">' +
      '<header class="shpcab">' + (p.hoja ? '<button class="shqb" type="button" data-shbanda aria-label="Abrir ' + p.nom + '">' : '') + p.ins +
        '<span class="shpq"><b>' + p.nom + (p.hoja ? shTr('der', SH_GR, 14) : '') + '</b><span>' + p.sub + '</span></span>' + (p.hoja ? '</button>' : '') +
        (p.fija ? '<span class="shfija">' + shTr('fijada', SH_GR, 16) + 'FIJADA</span>' : '<span class="shcu">' + shCuando(p.m) + '</span>') + '</header>' +
      '<div class="shlz' + (p.foto ? ' foto' : '') + '" role="img" aria-label="' + p.alt + '">' +
        (p.foto ? '<img src="img/social/' + p.foto + '.svg' + seV() + '" alt="" decoding="async"><i class="shvelo"></i>' : '') +
        '<svg class="shsv" viewBox="0 0 257.6 289.3" aria-hidden="true"><use href="#vSello"/></svg>' + (p.cuenta === false ? '' : '<span class="shcta">@vivafithouse</span>') +
        p.inner + (p.sello ? shSello(p.sello) : '') + '</div>' +
      '<footer class="shpie">' + (p.pie || '') + '</footer></article>';
  }

  // ---- las placas de cada fuente
  function shCruceP(){
    const h = shHoy(), w = shWk(h), lun = SH.mom === 'lun', wc = lun ? w - 1 : w, fin = lun ? w * SE_SEM : h, dd = shBan('dd'), rv = shBan(shRiv(wc));
    const a = shPct(dd, wc, fin), c = shPct(rv, wc, fin), gano = a > c, q = 6 - sfDia(SH.now);
    const lado = (b, p, yo) => '<span class="shlado' + (yo ? ' yo' : '') + '">' + shEmb(b.nom, yo ? 92 : 64, shSincro(b, h)) + '<b>' + b.nom + '</b>' +
      '<span class="shpct ' + (yo ? 'cy' : 'mg') + '">' + p + ' %</span></span>';
    const kick = lun ? 'EL CRUCE · LA SEMANA PASADA' : 'EL CRUCE · ESTA SEMANA';
    const big = lun ? (gano ? 'GANARON ' + MV_RAYO : 'ESTA VEZ NO') : q === 0 ? 'SE DEFINE HOY' : 'QUEDAN ' + (q + 1) + ' DÍAS';
    const sub = lun ? 'Esta semana, contra ' + shBan(SH_RIV0).nom + '.' : q === 0 ? 'Cada banda contra su propia meta. El resultado, mañana.' : 'Cada banda contra su propia meta.';
    return { key:'cruce', fija:true, hoja:true, ins:shEmb(dd.nom, 36, shSincro(dd, h)), nom:dd.nom, sub:'tu banda', m:h, alt:'El cruce de la semana: ' + dd.nom + ' ' + a + ' % de su meta; ' + rv.nom + ' ' + c + ' %',
      inner:'<span class="shkick">' + kick + '</span><div class="shvs">' + lado(dd, a, true) + '<span class="shvsx">VS</span>' + lado(rv, c, false) + '</div>' +
        shBl(80, shG(big, 10.6) + shL(sub, true)), sello:lun ? 'PUERTA · semana cerrada' : 'PUERTA · hasta ayer',
      pie:shRayoBtn('cruce', 'A tu banda') + '<span class="shsp"></span>' + shBtn('data-shver="dd"', shTr('der', '#eef2f8', 16), 'Ver el cruce') };
  }
  function shLuP(){   // la foto de Lu: nace en Vivapp con el marco, sale a su Instagram y vuelve desde ahí (simulada)
    const h = shHoy(), id = 'lm0', M = shMeta(id); let m = null;
    for (let w = shWk(h); w >= shWk(h) - 2 && m == null; w--) { const L = (shSim().M[id] || []).filter(x => x >= w * SE_SEM && x < (w + 1) * SE_SEM && x < h);
      if (L.length >= M) m = Math.floor(L[M - 1] / SE_DIA) * SE_DIA + SE_DIA + 19 * 60; }
    if (m == null || m > SH.now) return null;
    return { key:'lu', ins:shPer('Lu', 36), nom:'Lu', sub:'Las del mediodía · Sarmiento', m:m, foto:'pub-01', alt:'Foto de Lu con el marco de Viva: semana cumplida, ' + M + ' de ' + M,
      inner:shChipIg() + '<span class="shneon mg shsc">SEMANA CUMPLIDA</span>', sello:'PUERTA · ' + M + ' de ' + M,
      pie:shRayoBtn('lu') + '<span class="shsp"></span>' + (SH.people && !shMen() ? shBtn('data-shchispa="lu"', shTr('chispa', SH.chispa.lu ? SH_C.m : SH_GR, 18), SH.chispa.lu ? 'Guardado' : 'Me interesa', SH.chispa.lu) : '') };
  }
  function shCrisP(){   // un momento de Inicio que Cris contó a su banda: VIVA Flow (4 semanas seguidas o más con su meta)
    const h = shHoy(), n = shSeguidas('dd1', h); if (n < 4) return null;
    return { key:'cris', ins:shPer('Cris', 36), nom:'Cris', sub:'de tu banda', m:shWk(h) * SE_SEM + 7 * 60, alt:'Cris: VIVA Flow, ' + n + ' semanas seguidas con su meta',
      inner:'<div class="shflow">' + shLogo(250) + '<span class="shflowt"><span class="shesp">FLOW</span>' + shTr('rayo', SH_C.y, 38, 1, true) + '</span>' +
        shL('viene a su meta todas las semanas') + shL('Cris · Sede Sarmiento', true) + '</div>', sello:'PUERTA · ' + n + ' semanas seguidas', pie:shRayoBtn('cris') };
  }
  function shSedeP(){
    const h = shHoy(), w = shWk(h) - 1, r = shSedeMeta(w);
    const nov = []; for (let x = -2; x < w; x++) nov.push(shSedeMeta(x).r);
    const mejor = w >= -2 && nov.every(v => r.r > v);
    return { key:'sede', ins:shEmb('Sarmiento', 36), nom:'Sarmiento', sub:'tu sede', m:shWk(h) * SE_SEM + 6 * 60, alt:r.de10 + ' de cada 10 socios de Sarmiento llegaron a su meta la semana pasada',
      inner:shBl(25.7, shCartel('SARMIENTO') + shG(r.de10 + ' DE<br>CADA 10', 21.2) + shL('llegaron a su meta la semana pasada.') + (mejor ? shL('La mejor semana de noviembre en tu sede.', true) : '')),
      sello:'PUERTA · sin nombres', pie:shRayoBtn('sede') + '<span class="shsp"></span>' + shIgBtn('sede') };
  }
  function shArrancP(){   // las altas son de EVO (no de la puerta): sin sello. Esta semana hasta ayer; si todavía son pocas, la pasada.
    const h = shHoy(), w = shWk(h), n0 = shAltas(w, h).length, esta = n0 >= 3, n = esta ? n0 : shAltas(w - 1, Infinity).length, nueva = SH.perfil !== 'banda' && SH.dia === 1;
    const t = (esta ? 'arrancaron esta semana' : 'arrancaron la semana pasada') + ' en tu sede.' + (nueva ? (esta ? ' Vos también.' : ' Esta semana, vos.') : '');
    return { key:'arranc', ins:shEmb('Sarmiento', 36), nom:'Sarmiento', sub:'tu sede', m:h + 6 * 60, alt:n + ' socios ' + t,
      inner:shBl(25.7, shCartel('SARMIENTO') + shG(String(n), 33.5) + shL(t) + shL('Es un número: nadie ve quién es quién.', true)),
      pie:nueva ? '' : shRayoBtn('arranc', 'Mandales un rayo') };
  }
  function shVivaP(){ const mm = SH.perfil === 'banda' ? -1 * SE_SEM + 5 * SE_DIA + 11 * 60 : shHoy() - 2 * SE_DIA + 11 * 60;   // el sábado
    return { key:'viva', ins:shViva(36), nom:'VIVA', sub:'cuenta oficial · ejemplo ilustrado', m:mm, foto:'pub-04', cuenta:false, alt:'Publicación de ejemplo de la cuenta oficial de Viva, ilustrada',
      inner:shChipIg(), pie:shRayoBtn('viva') }; }
  // la socia nueva
  const shPar = der => '<div class="shpar">' + shPer('Sofi', 92) + '<span class="shparx">+</span>' + der + '</div>';
  function shPuertaP(){
    const t = SH.dia === 1 ? '¿VINISTE<br>CON ALGUIEN?' : '¿YA CONOCÉS<br>A ALGUIEN ACÁ?';
    return { key:'puerta', ins:shPer('Sofi', 36), nom:'Tu arranque', sub:'solo lo ves vos', m:shHoy(), alt:'¿Viniste con alguien? Armen dúo',
      inner:shPar(shHueco(92)) + shBl(57.5, shG(t, 11.2) + shL('Armen dúo: cada semana que cumplen, se enciende un tubo de su insignia.', true)),
      pie:shBtn('data-shinv', shTr('wa', '#eef2f8', 16), 'Invitar por WhatsApp') + shBtn('data-shno', '', 'Ahora no') };
  }
  const shTubos = (n, on) => '<span class="shtubos" role="img" aria-label="' + on + ' de ' + n + ' tubos encendidos">' + Array.from({ length:n }, (_, k) => '<i' + (k < on ? ' class="on"' : '') + '></i>').join('') + '</span>';
  function shDuoP(){
    const h = shHoy(), sem = shWk(h) - (-2), both = w => shCuenta('sofi', w, h) >= 3 && shCuenta('cami', w, h) >= 2;
    let on = 0; for (let w = -2; w < shWk(h); w++) if (both(w)) on++;
    const ult = sem >= 1 && both(shWk(h) - 1);
    const big = sem < 1 ? 'ARRANCAN<br>JUNTAS' : ult ? (on >= 3 ? 'TRES SEMANAS,<br>LAS DOS' : 'CUMPLIERON<br>LAS DOS') : 'SEMANA ' + (sem + 1) + '<br>DEL DÚO';
    const sub = sem < 1 ? 'Cada semana que cumplen las dos, se enciende un tubo.' : 'Semana ' + (sem + 1) + ' del dúo: en marcha.';
    return { key:'duo', fija:true, hoja:true, ins:shDuo(36), nom:'Sofi y Cami', sub:'tu dúo · lo ven ustedes dos', m:h, alt:'Tu dúo con Cami: ' + on + ' semanas cumplidas las dos',
      inner:shPar(shPer('Cami', 92)) + shBl(54.7, shTubos(4, Math.min(4, on)) + shG(big, 11.2) + shL(sub, true)), sello:on > 1 ? 'PUERTA · ' + on + ' semanas' : on ? 'PUERTA · semana 1' : sem >= 1 ? 'PUERTA · hasta ayer' : null,
      pie:shRayoBtn('duo', 'A Cami') + '<span class="shsp"></span>' + (shMen() ? '' : shBtn('data-shvoy', shTr('check', SH.voy ? SH_C.c : '#eef2f8', 16), SH.voy ? 'Vas mañana' : 'Voy mañana', SH.voy)) };
  }
  function shPropias(){   // los momentos de Inicio de Sofi (Semana cumplida, Mes cumplido): solo los ve ella; puede llevarlos a Instagram
    const h = shHoy(), L = [];
    if (SH.perfil === 'sola' && SH.dia === 8 && shCuenta('sofi', -2, h) >= 3)
      L.push({ key:'sem1', ins:shPer('Sofi', 36), nom:'Tu semana 1', sub:'solo lo ves vos', m:-1 * SE_SEM + 6 * 60, alt:'Tu semana 1: semana cumplida, 3 de 3',
        inner:shBl(41.9, '<span class="shneon mg" style="font-size:15.6cqw">SEMANA<br>CUMPLIDA</span>' + shL('La primera ya es tuya.')), sello:'PUERTA · 3 de 3', pie:shIgBtn('sem1') });
    if (SH.perfil === 'sola' && SH.dia === 22)
      L.push({ key:'nov', ins:shPer('Sofi', 36), nom:'Tu noviembre', sub:'solo lo ves vos', m:1 * SE_SEM + 6 * 60, alt:'Mes cumplido: noviembre, tu primer cartel',
        inner:shBl(39.1, '<span class="shkick0">MES CUMPLIDO</span>' + shCartel('NOVIEMBRE', 'mg', 12.8) + shL('Tu primer cartel. Ya está en tu mural.')), sello:'PUERTA · 3 semanas', pie:shIgBtn('nov') });
    return L;
  }
  function shCamadaP(){
    if (!SH.comp) return null; const C = shCamada(); if (!C || !C.mayoria) return null;
    const duo = SH.perfil === 'duo', ya = duo ? C.sofi && C.cami : C.sofi;
    const t = (C.tres ? 'vinieron las tres semanas.' : 'vinieron dos veces o más en su primera semana.') + ' ' +
      (ya ? (duo ? 'Ustedes también.' : 'Vos también.') : 'Tu semana ' + (shWk(shHoy()) + 3) + ' arranca hoy.');
    return { key:'camada', ins:shEmb('Sarmiento', 36), nom:'Sarmiento', sub:'los que arrancaron con vos', m:shHoy() + 6 * 60, alt:C.n + ' de ' + C.N + ' ' + t,
      inner:shBl(25.7, shCartel('SARMIENTO') + shG(C.n + ' DE ' + C.N, 21.2) + shL(t)), sello:'PUERTA · sin nombres', pie:'' };
  }
  function shRayosP(){
    if (SH.dia !== 8) return null; const n = shSim().rayos;
    return { key:'rayos', ins:shEmb('Sarmiento', 36), nom:'Sarmiento', sub:'tu sede', m:shHoy() - SE_DIA + 20 * 60, alt:n + ' rayos de socios de tu sede para los que arrancaron con vos',
      inner:shBl(30.7, '<span class="shrow">' + shTr('rayo', SH_C.y, 84, 1, true) + shG(String(n), 33.5) + '</span>' + shL('rayos de socios de tu sede para los que arrancaron con vos.')), pie:'' };
  }

  // ---- el muro: la fijada primero; después por fecha, la más nueva arriba. Sin algoritmo.
  function shPlacas(){
    const nueva = SH.perfil !== 'banda', poco = SH.muro === 'poco', P = [];
    let fija = null, resto = [];
    if (!nueva) { fija = shCruceP(); resto = poco ? [shSedeP(), shVivaP()] : [shLuP(), shCrisP(), shSedeP(), shArrancP(), shVivaP()]; }
    else {
      const prop = shPropias(), duo = SH.perfil === 'duo' && !shMen();
      const puerta = !duo && !SH.puertaNo && !shMen() && !prop.length && SH.dia !== 22 ? shPuertaP() : null;
      fija = duo ? shDuoP() : prop.length ? Object.assign(prop.shift(), { fija:true }) : puerta && Object.assign(puerta, { fija:true });
      resto = poco ? [shVivaP()] : prop.concat(SH.dia === 1 ? [shArrancP(), shVivaP()] : [shCamadaP(), shRayosP()]);
    }
    SH.prop.forEach(x => resto.push(x));
    resto = resto.filter(Boolean).filter(p => p.m <= SH.now).sort((a, b) => b.m - a.m);
    if (!fija && resto.length) fija = Object.assign(resto.shift(), { fija:true });
    return (fija ? [fija] : []).concat(resto);
  }

  // ---- la tira: el socio · su banda o su dúo · su rival · las que tienen algo nuevo (por lo reciente) · su sede y VIVA, siempre
  function shTira(){
    const h = shHoy(), w = shWk(h), out = [], nueva = SH.perfil !== 'banda';
    const on = (k, m) => m != null && m > (k in SH.visto ? SH.visto[k] : -1e9);
    if (nueva && SH.dia === 1 && !SH.ins) out.push({ key:'elegir', elegir:true, nom:'Tu insignia', rol:'elegila' });
    else out.push({ key:'yo', ins:shPer(nueva ? 'Sofi' : 'Martina', 44), nom:nueva ? 'Sofi' : 'Martina', rol:'vos', m:nueva ? shPropias().concat(SH.prop).reduce((a, p) => Math.max(a, p.m), null) : SH.prop.reduce((a, p) => Math.max(a, p.m), null) });
    if (SH.perfil === 'duo' && !shMen()) out.push({ key:'duo', ins:shDuo(44), nom:'Sofi y Cami', rol:'tu dúo', m:shHoy() });
    if (!nueva) {
      const dd = shBan('dd'), rv = shBan(SH_RIV0), ev = b => { const e = shEv(b); return e.length ? e[e.length - 1].m : null; };
      out.push({ key:'dd', b:dd, ins:shEmb(dd.nom, 44, shSincro(dd, h)), nom:dd.nom, rol:'tu banda', m:ev(dd) });
      out.push({ key:SH_RIV0, b:rv, ins:shEmb(rv.nom, 44, shSincro(rv, h)), nom:rv.nom, rol:'tu rival', m:ev(rv) });
      SH_BANDAS.filter(b => b.vis && b.key !== 'dd' && b.key !== SH_RIV0).map(b => ({ key:b.key, b:b, ins:shEmb(b.nom, 44, shSincro(b, h)), nom:b.nom, rol:b.sede, m:ev(b) }))
        .filter(x => x.m != null).sort((p, q) => on(q.key, q.m) - on(p.key, p.m) || q.m - p.m).forEach(x => out.push(x));   // lo nuevo adelante; lo visto queda, en gris, hasta el lunes
    }
    out.push({ key:'sede', ins:shEmb('Sarmiento', 44), nom:'Sarmiento', rol:'tu sede', m:h + 6 * 60 });
    out.push({ key:'viva', ins:shLogo(40), nom:'VIVA', rol:'oficial', m:shVivaP().m });
    out.forEach(x => { x.on = on(x.key, x.m) && (x.key !== 'viva' || SH.now - x.m < 2 * SE_DIA); });
    return out;
  }
  function shTiraHtml(L){
    return '<div class="shtira" role="list">' + L.map(x => '<button class="shti" type="button" role="listitem" data-shti="' + x.key + '" aria-label="' + x.nom + ', ' + x.rol + (x.on ? ', con algo nuevo' : '') + '">' +
      '<span class="sharo' + (x.elegir ? ' elegir' : x.on ? ' on' : '') + '">' + (x.elegir ? shTr('mas', '#eef2f8', 24) : x.ins) + '</span>' +
      '<span class="shtn">' + x.nom + '</span><span class="shtr">' + x.rol + '</span></button>').join('') + '</div>';
  }
  function shBarra(){
    const ppl = SH.people && !shMen();
    return '<header class="shbar"><button class="shmas" type="button" data-shmas aria-label="Crear una placa">' + shTr('mas', '#fff', 24, 2.4) + '</button>' +
      '<h1 class="shtit">SOCIAL</h1>' + shMiIns() +
      (ppl ? '<button class="shent" type="button" data-shppl>' + shTr('chispa', '#eef2f8', 22) + '<span>People</span></button>' : '') + '</header>';
  }
  // Tu insignia, fija en la barra: con banda o dúo abre su hoja; sola, la tuya (o elegirla, el día 1)
  function shMiIns(){
    const banda = SH.perfil === 'banda', duo = SH.perfil === 'duo' && !shMen(), elegir = !banda && !duo && SH.dia === 1 && !SH.ins;
    const ins = banda ? shEmb('Dúo dinamita', 46, shSincro(shBan('dd'), shHoy())) : duo ? shDuo(46) : elegir ? shHueco(46) : shPer('Sofi', 46);
    const w = banda ? 'Tu banda' : duo ? 'Tu dúo' : elegir ? 'Elegila' : 'Vos';
    return '<button class="shmiins" type="button" data-shmiins aria-label="' + (banda ? 'Dúo dinamita, tu banda' : duo ? 'Sofi y Cami, tu dúo' : elegir ? 'Elegí tu insignia' : 'Tu insignia') + '">' + ins + '<span>' + w + '</span></button>';
  }
  function shYoHoja(){
    shHoja('<div class="shbh">' + shPer('Sofi', 56) + '<span class="stack" style="gap:3px"><span class="mtitle sig">Sofi</span><span class="small muted">Sarmiento · meta ' + shMeta('sofi') + ' por semana</span></span></div>' +
      '<span class="muted" style="line-height:1.45">Tu insignia la ves vos y quienes vos elegís. Con alguien que ya conocés, arman dúo: cada semana que cumplen las dos, se enciende un tubo.</span>' +
      (shMen() ? '' : shOpc('data-shinv', shTr('wa', SH_C.c, 24), 'Armar dúo', 'Le llega por WhatsApp con tu día y tu sede.')));
  }
  function shRender(){
    const c = $('#shIn'); if (!c) return;
    SH.now = shNow(); SH.L = shTira(); SH.P = shPlacas();
    c.innerHTML = shBarra() + shTiraHtml(SH.L) + '<main class="shmuro">' + SH.P.map(shPlaca).join('') +
      '<div class="shfin"><b>Estás al día' + shTr('rayo', SH_C.y, 18, 1, true) + '</b><span>Lo nuevo aparece cuando alguien entrena.</span></div></main>';
  }

  // ---- las historias: el patrón de la G (barras, tocar a los costados, se pasan solas cada 6 s, deslizar hacia abajo cierra)
  const shCel = (ids, w, h) => { const d = [0, 0, 0, 0, 0, 0, 0].map(() => ({ on:false, q:[] }));
    ids.forEach(id => (shSim().M[id] || []).forEach(m => { if (m >= w * SE_SEM && m < (w + 1) * SE_SEM && m < h) d[sfDia(m)].on = true; })); return d; };
  function shSemCard(ids, quien){
    const h = shHoy(), w = shWk(h), hoy = sfDia(SH.now), d = shCel(ids, w, h), n = d.filter(x => x.on).length;
    return '<span class="sgkick">Esta semana</span>' + sg2Celdas(d, hoy, null) +
      (n ? sg2Big(String(n), n === 1 ? 'día' : 'días') + '<span class="sgsub">' + quien + '. Cuenta hasta ayer.</span>' : sg2Big('Arranca', 'la semana') + '<span class="sgsub">Cuenta hasta ayer.</span>');
  }
  function shCruceCard(b){
    const h = shHoy(), lun = SH.mom === 'lun', w = shWk(h) - (lun ? 1 : 0), fin = lun ? shWk(h) * SE_SEM : h, dd = shBan('dd'), rv = shBan(shRiv(w)), a = shPct(dd, w, fin), c = shPct(rv, w, fin);
    return '<span class="sgkick">' + (b.key === 'dd' ? 'El cruce' : 'Contra ustedes') + (lun ? ' · la semana pasada' : '') + '</span>' +
      (lun ? (a > c ? sg2Big('Ganaron', '', 1) : sg2Big('Esta vez', 'no')) : sg2Big('Van', a + ' %')) +
      '<div class="sfx sgx">' + sgColRev(0, a, dd.nom, true) + sgColRev(0, c, rv.nom, false) + '</div>' +
      '<span class="sgsub">' + (lun ? 'Esta semana, contra ' + shBan(SH_RIV0).nom + '.' : sfDia(SH.now) === 6 ? 'Se define hoy.' : 'Cada banda contra su propia meta.') + '</span>';
  }
  function shInsCard(b){ const n = shSincro(b, shHoy());
    return '<span class="sgkick">La insignia</span><span class="shinsw">' + shEmb(b.nom, 180, n) + '</span>' + sg2Big(n === 1 ? '1 semana' : n + ' semanas', 'en sincro') +
      '<span class="sgsub">' + (n >= 12 ? 'Tiene sus tres tubos encendidos. Nunca pierde nada.' : 'A las ' + (n < 4 ? 4 : 12) + ' semanas en sincro se enciende otro tubo.') + '</span>'; }
  function shCards(x){
    const h = shHoy(), C = [], nueva = SH.perfil !== 'banda';
    if (x.key === 'yo') { const id = nueva ? 'sofi' : 'dd0', M = shMeta(id), n = shCuenta(id, shWk(h), h);
      C.push(shSemCard([id], 'Tu meta: ' + M + ' por semana'));
      C.push('<span class="sgkick">Tu insignia</span><span class="shinsw">' + shPer(nueva ? 'Sofi' : 'Martina', 180) + '</span>' + sg2Big(n >= M ? 'Semana' : 'Vas', n >= M ? 'cumplida' : n + ' de ' + M) +
        '<span class="sgsub">La ves vos y quienes vos elegís.</span>'); return C; }
    if (x.key === 'duo') { let on = 0; for (let w = -2; w < shWk(h); w++) if (shCuenta('sofi', w, h) >= 3 && shCuenta('cami', w, h) >= 2) on++;
      C.push(shSemCard(['sofi', 'cami'], 'Con alguien del dúo'));
      C.push('<span class="sgkick">Su insignia</span><span class="shinsw">' + shDuo(180) + '</span>' + shTubos(4, Math.min(4, on)) +
        '<span class="sgsub">Cada semana que cumplen las dos, se enciende un tubo. La ven ustedes dos.</span>'); return C; }
    if (x.key === 'sede') { const r = shSedeMeta(shWk(h) - 1);
      C.push('<span class="shinsw">' + shEmb('Sarmiento', 180) + '</span>' + sg2Big(r.de10 + ' de', 'cada 10') + '<span class="sgsub">llegaron a su meta la semana pasada. Sin nombres.</span>');
      const n = shAltas(shWk(h), h).length; if (n) C.push('<span class="sgkick">Esta semana</span>' + sg2Big(String(n), 'arrancaron', 1) + '<span class="sgsub">Un número: nadie ve quién es quién.</span>');
      return C; }
    if (x.key === 'viva') { C.push('<span class="sgkick">Cuenta oficial</span><span class="shvivaimg"><img src="img/social/pub-04.svg' + seV() + '" alt="Publicación de ejemplo, ilustrada"></span><span class="sgsub">Ejemplo ilustrado: en real, la cuenta de Instagram de Viva.</span>'); return C; }
    const b = x.b, ev = shEv(b), nm = b.nom.split(' ');
    if (b.key === 'dd') { C.push(shSemCard(b.ids, 'Con alguien de la banda')); C.push(shCruceCard(b)); C.push(shInsCard(b)); return C; }
    C.push('<span class="shinsw">' + shEmb(b.nom, 180, shSincro(b, h)) + '</span>' + sg2Big(nm.slice(0, -1).join(' '), nm[nm.length - 1]) + '<span class="sgsub">' + b.sede + ' · ' + sgSemTxt(shSincro(b, h)) + '</span>');
    if (b.key === SH_RIV0 && !nueva) C.push(shCruceCard(b));
    ev.forEach(e => C.push(e.k === 'gano' ? '<span class="sgrafaga">' + shEmb(b.nom, 180, shSincro(b, h)) + '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>' + sg2Big('Ganaron', 'su cruce', 1) + '<span class="sgsub">' + shCuando(e.m) + '</span>'
      : '<div class="sfx sgx sguno">' + sgColRev(0, 100, b.nom, true) + '</div>' + sg2Big('Entraron', 'en sincro', 1) + '<span class="sgsub">' + shCuando(e.m) + '</span>'));
    C.push(shSemCard(b.ids, 'Con alguien de la banda'));
    return C.slice(0, 4);
  }
  function shAbrir(key, i){
    const x = SH.L.find(y => y.key === key); if (!x) return;
    if (x.elegir) { shElegir(); return; }
    SH.h = { x:x, C:shCards(x), i:0 }; SH.visto[key] = SH.now; $('#shHist').hidden = false; shPaso(i || 0);
  }
  function shPaso(i){
    clearTimeout(SH.hT); const H = SH.h; if (!H) return;
    if (i < 0) i = 0; if (i >= H.C.length) { shCerrar(); return; }
    H.i = i; const x = H.x, otra = x.b && x.b.key !== 'dd', banda = SH.perfil === 'banda' && !shMen();
    $('#shHist').style.setProperty('--hc', x.b ? SH_C[SH_EMB[x.b.nom][0][0]] : x.key === 'sede' ? SH_C.c : x.key === 'viva' ? '#10202c' : SH_C.m);
    const des = otra && banda && x.b.key !== SH_RIV0;
    $('#shHist').innerHTML = '<div class="sgbars">' + H.C.map((_, j) => '<i class="' + (j < i ? 'ya' : j === i ? 'ahora' : '') + '"></i>').join('') + '</div>' +
      '<div class="sghcab">' + x.ins.replace('width="44" height="44"', 'width="40" height="40"') + ((x.key === 'dd' || x.key === 'duo') ?
        '<button class="shqb" type="button" data-shbanda aria-label="Abrir ' + x.nom + '"><span class="stack" style="gap:2px;flex:1;min-width:0"><b class="sghn">' + x.nom + ' ›</b><span class="small sghs">' + x.rol + '</span></span></button>' :
        '<span class="stack" style="gap:2px;flex:1;min-width:0"><b class="sghn">' + x.nom + '</b><span class="small sghs">' + x.rol + '</span></span>') +
        '<button class="iconbtn sgx" data-shx type="button" aria-label="Cerrar">✕</button></div>' +
      '<div class="sgcard" aria-live="polite">' + H.C[i] + '</div>' +
      '<div class="shhfoot">' + (des ? (SH.desaf[x.b.key] ? '<span class="shdesok">Desafío enviado. Si aceptan, el cruce arranca el lunes.</span>'
          : '<button class="shdesaf" type="button" data-shdesaf>' + shTr('duelo', '#fff', 22, 2.2) + '<span>Desafiar</span></button>') : '') +
        (otra && SH.perfil === 'banda' && !shMen() || x.key === 'sede' ? '<span class="sgrayow"><button class="sgrayo" data-shhrayo type="button" aria-pressed="' + !!SH.rayo['h' + x.key] + '" aria-label="' + (SH.rayo['h' + x.key] ? 'Sacar el ⚡' : 'Mandar un ⚡') + '">' + MV_RAYO + '</button><span class="sgrw"><span class="a">Mandar</span><span class="b">Mandado</span></span></span>' : '') + '</div>';
    SH.hT = setTimeout(() => shPaso(i + 1), SG2_DUR);
  }
  function shCerrar(){ clearTimeout(SH.hT); SH.h = null; $('#shHist').hidden = true; shRender(); }

  // ---- las hojas: "+", Desafíos, People, elegir insignia, invitar
  function shHoja(html){ $('#shHojaIn').innerHTML = html + '<button class="btn ghost sm" data-shhx type="button">Cerrar</button>'; $('#shHoja').hidden = false; }
  const shOpc = (data, ic, t, d) => '<button class="shopc" type="button" ' + data + '>' + ic + '<span class="stack" style="gap:3px"><b>' + t + '</b><span class="small muted">' + d + '</span></span></button>';
  function shMas(){
    shHoja('<span class="mtitle sig"><b>Crear</b> <i>una placa</i></span>' +
      (shMen() ? '' : shOpc('data-shfoto', shTr('camara', SH_C.m, 26), 'Foto con marco', 'Sale a tu Instagram etiquetando a Viva. No se guarda en Vivapp.')) +
      shOpc('data-shmom', shTr('momento', SH_C.c, 26), 'Contar un momento', 'Uno de los tuyos de Inicio: aparece como placa en tu muro.'));
  }
  function shMios(){
    const h = shHoy(), nueva = SH.perfil !== 'banda', id = nueva ? 'sofi' : 'dd0', M = shMeta(id), w = shWk(h), L = [];
    if (shCuenta(id, w - 1, h) >= M) L.push({ k:'sem', t:'Semana cumplida', g:'SEMANA<br>CUMPLIDA', s:'PUERTA · ' + M + ' de ' + M });
    const n = shSeguidas(id, h); if (n >= 2) L.push({ k:'seg', t:n + ' semanas seguidas', g:n + ' SEMANAS<br>SEGUIDAS', s:'PUERTA · ' + n + ' semanas seguidas' });
    return L.filter(x => !SH.prop.some(p => p.mk === x.k));
  }
  function shMomento(){
    const L = shMios(), aud = SH.perfil === 'banda' ? 'Lo ve tu banda.' : SH.perfil === 'duo' ? 'Lo ve tu dúo.' : 'Lo ves vos; si querés, lo llevás a Instagram.';
    shHoja('<span class="mtitle sig"><b>Contar</b> <i>un momento</i></span>' + (L.length ? '<span class="small muted">' + aud + '</span>' + L.map(x => shOpc('data-shmomk="' + x.k + '"', shTr('rayo', SH_C.y, 24, 1.6), x.t, 'De tus entradas, hasta ayer.')).join('')
      : '<span class="muted" style="line-height:1.45">Todavía no hay un momento para contar. Aparece cuando cumplís tu semana.</span>'));
  }
  function shFoto(){
    const h = shHoy(), id = SH.perfil === 'banda' ? 'dd0' : 'sofi', M = shMeta(id), n = shCuenta(id, shWk(h) - 1, h), s = shSeguidas(id, h);
    const d = n >= M ? [['Semana', 'cumplida'], M + ' de ' + M + ' · Sarmiento'] : s ? [[s + ' semanas', 'cumplidas'], 'en Viva · Sarmiento'] : [['Entreno', 'en Viva'], 'Sarmiento'];
    shHoja('<span class="mtitle sig"><b>Foto</b> <i>con marco</i></span>' + mvFoto([SH_C.c, SH_C.m], d[0], d[1], true) +
      '<span class="small muted" style="line-height:1.45">El filtro trabaja la luz, el color y el marco, no el cuerpo. Sale a tu Instagram etiquetando a @vivafithouse; si lo aceptaste, se ve acá desde allá.</span>' +
      '<button class="btn sm" data-shfotoig type="button">' + SB_CAM + 'A Instagram</button>');
  }
  function shDesafios(){
    const h = shHoy(), w = shWk(h), b = SH.perfil === 'banda';
    const tu = b ? 'Esta semana: ' + shBan('dd').nom + ' contra ' + shBan(SH_RIV0).nom + '. Van ' + shPct(shBan('dd'), w, h) + ' % de su meta, hasta ayer.'
      : SH.perfil === 'duo' && !shMen() ? 'Esta semana: Sofi y Cami, cada una contra su meta. Si cumplen las dos, se enciende un tubo.'
      : 'Esta semana: vos contra tu meta, ' + shMeta('sofi') + ' veces. Vas ' + shCuenta('sofi', w, h) + ', hasta ayer.';
    shHoja('<span class="mtitle sig"><b>Desafíos</b></span><span class="muted" style="line-height:1.45">Cada uno contra su propia meta semanal. Vale para vos, tu dúo, tu banda y tu sede.</span>' +
      '<div class="card" style="gap:6px"><span class="lbl">Tu desafío</span><span style="line-height:1.4">' + tu + '</span></div>' +
      (SH.perfil === 'sola' && !shMen() ? shOpc('data-shinv', shTr('wa', SH_C.c, 24), '¿Viniste con alguien?', 'Armen dúo: cada semana que cumplen las dos, se enciende un tubo.') : '') +
      (b ? '<button class="btn sm" data-shver="dd" type="button">Ver el cruce</button>' : ''));
  }
  function shPeople(){
    shHoja('<span class="mtitle sig"><b>People</b></span><span class="muted" style="line-height:1.45">Para conocer gente de Viva, si querés. La ves porque la activaste; nadie más sabe que la usás.</span>' +
      '<div class="card" style="gap:6px"><span class="lbl">Cómo funciona (acordado con el dueño, 22/10)</span><span class="small" style="line-height:1.5">Solo mayores de 18, verificados. Nunca muestra si estás en la sede. ' +
      'Marcás "Me interesa" en privado sobre alguien que ves en el muro: si es mutuo, les avisamos a los dos. Sin catálogo de personas.</span></div>' +
      '<span class="small muted" style="line-height:1.45">Falta que el dueño defina el resto: plan o chat después del aviso, y quién atiende las denuncias.</span>');
  }
  function shElegir(){
    const P = [['S', 'm', 'c'], ['S', 'c', 'y'], ['S', 'y', 'm']];
    shHoja('<span class="mtitle sig"><b>Tu</b> <i>insignia</i></span><span class="muted" style="line-height:1.45">Tu inicial en neón. La ves vos y quienes vos elegís; crece con tus semanas cumplidas.</span>' +
      '<div class="shelige">' + P.map((p, i) => '<button type="button" data-shins="' + i + '" aria-label="Insignia ' + (i + 1) + '">' + shMono(p[0], p[1], p[2], 72) + '</button>').join('') + '</div>');
    SH.insOp = P;
  }
  // La hoja de tu banda o de tu dúo (D1 de T28, 18/11; sin cajón fijo): quiénes son, Voy, WhatsApp y Sumar. Lo de adentro lo ve solo la banda.
  // "van N": los de la banda que marcaron Voy para mañana (en la demo, los que tienen entrada mañana); solo con tres o más y nunca en un dúo.
  function shBandaHoja(){
    const duo = SH.perfil === 'duo', m = shMen(), h = shHoy(), b = shBan('dd'), man = h + SE_DIA, ids = duo ? ['sofi', 'cami'] : b.ids;
    const nom = duo ? 'Sofi y Cami' : b.nom, ins = duo ? shDuo(56) : shEmb(b.nom, 56, shSincro(b, h));
    const sub = duo ? 'Tu dúo · Sarmiento' : 'Tu banda · Sarmiento · ' + sgSemTxt(shSincro(b, h)).toLowerCase();
    const mem = (duo ? ['Sofi', 'Cami'] : b.mem.map(x => x[0])).map((n, j) => '<span class="shmem">' + (SH_PER[n] ? shPer(n, 44) : shMono(n[0], ['c', 'y', 'm'][j % 3], 'm', 44)) +
      '<span>' + n + (j === 0 ? ' <i>vos</i>' : '') + '</span></span>').join('');
    const van = ids.slice(1).filter(id => (shSim().M[id] || []).some(x => x >= man && x < man + SE_DIA)).length + (SH.voy ? 1 : 0);
    const voy = sg2Acc('voy', SH.voy ? 'Vas' : 'Voy', 'mañana' + (!duo && van >= 3 ? '<br>van ' + van : ''), SH.voy ? ' on' : '', 'data-shbvoy');
    shHoja('<div class="shbh">' + ins + '<span class="stack" style="gap:3px;min-width:0"><span class="mtitle sig">' + nom + '</span><span class="small muted">' + sub + '</span></span></div>' +
      '<div class="shmems">' + mem + '</div>' +
      (m ? '' : '<div class="sgaccs shaccs" style="grid-template-columns:repeat(' + (duo ? 2 : 3) + ',minmax(0,1fr))">' + voy + sg2Acc('chat', 'WhatsApp', duo ? 'de las dos' : 'de la banda', '', 'data-shbwa') +
        (duo ? '' : sg2Acc('sumar', 'Sumar', 'a alguien', '', 'data-shsumar')) + '</div>') +
      '<span class="small muted" style="line-height:1.45">' + (duo ? 'Lo ven ustedes dos.' : 'Otras bandas ven el nombre, la insignia y lo que logra la banda; nunca quiénes son ni quién vino.') + '</span>');
  }
  function shInvitar(k){
    const banda = k === 'banda';
    shHoja('<span class="mtitle sig"><b>' + (banda ? 'Sumá' : 'Armen') + '</b> <i>' + (banda ? 'a alguien' : 'dúo') + '</i></span><span class="muted" style="line-height:1.45">' +
      (banda ? 'Le llega por WhatsApp con el nombre de la banda y tu sede. Si se suma, entra a la banda el lunes, con su propia meta.' : 'Le llega por WhatsApp con tu día y tu sede. Si se suma, arrancan su dúo: cada uno contra su meta, juntos.') + '</span>' +
      '<div class="card" style="gap:6px"><span class="lbl">El mensaje</span><span style="line-height:1.45">' + (banda ? '«Estoy en ' + shBan('dd').nom + ', en Viva Sarmiento. ¿Te sumás? Cada uno contra su meta, juntos.»' : '«Empecé en Viva Sarmiento. ¿Venís conmigo? Si te sumás, armamos dúo en la app.»') + '</span></div>' +
      '<span class="small muted">Vivapp no guarda el nombre ni el teléfono de a quién se lo mandás.</span><button class="btn sm" data-shwa type="button">' + SB_WA + 'Abrir WhatsApp</button>');
  }

  // ---- la pantalla y sus toques
  $('#socialH').insertAdjacentHTML('beforeend', '<div class="sghist shhist" id="shHist" hidden role="dialog" aria-label="Historia"></div>');
  $('#socialH').addEventListener('click', e => {
    const q = s => e.target.closest(s); let b;
    if (q('#shHist')) return;
    if ((b = q('[data-shti]'))) { shAbrir(b.dataset.shti); return; }
    if ((b = q('[data-shver]'))) { $('#shHoja').hidden = true; shAbrir(b.dataset.shver, 1); return; }
    if ((b = q('[data-shrayo]'))) { const k = b.dataset.shrayo; SH.rayo[k] = !SH.rayo[k]; if (SH.rayo[k]) toast('Mandaste un ⚡'); shRender(); return; }
    if ((b = q('[data-shchispa]'))) { const k = b.dataset.shchispa; SH.chispa[k] = !SH.chispa[k]; toast(SH.chispa[k] ? 'Guardado. Si es mutuo, les avisamos' : 'Listo, lo sacamos'); shRender(); return; }
    if (q('[data-shvoy]')) { SH.voy = !SH.voy; toast(SH.voy ? 'Le avisamos a Cami: vas mañana' : 'Listo, lo sacamos'); shRender(); return; }
    if ((b = q('[data-shig]'))) { toast('Se abre Instagram con la placa (en la demo, de ejemplo)'); return; }
    if (q('[data-shinv]')) { shInvitar('duo'); return; }
    if (q('[data-shbanda]')) { shBandaHoja(); return; }
    if (q('[data-shmiins]')) { if (SH.perfil === 'banda' || SH.perfil === 'duo' && !shMen()) shBandaHoja(); else if (SH.dia === 1 && !SH.ins) shElegir(); else shYoHoja(); return; }
    if (q('[data-shbvoy]')) { SH.voy = !SH.voy; toast(SH.voy ? (SH.perfil === 'duo' ? 'Le avisamos a Cami: vas mañana' : 'Le avisamos a tu banda: vas mañana') : 'Listo, lo sacamos'); shRender(); shBandaHoja(); return; }
    if (q('[data-shbwa]')) { $('#shHoja').hidden = true; toast('Se abre el grupo de WhatsApp (en la demo, de ejemplo)'); return; }
    if (q('[data-shsumar]')) { shInvitar('banda'); return; }
    if (q('[data-shwa]')) { $('#shHoja').hidden = true; toast('Se abre WhatsApp con el mensaje (en la demo, de ejemplo)'); return; }
    if (q('[data-shno]')) { SH.puertaNo = true; toast('Listo. Vuelve a aparecer el lunes'); shRender(); return; }
    if (q('[data-shmas]')) { shMas(); return; }
    if (q('[data-shdes]')) { shDesafios(); return; }
    if (q('[data-shppl]')) { shPeople(); return; }
    if (q('[data-shfoto]')) { shFoto(); return; }
    if (q('[data-shfotoig]')) { $('#shHoja').hidden = true; toast('Se abre Instagram con tu foto y la etiqueta de Viva (en la demo, de ejemplo)'); return; }
    if (q('[data-shmom]')) { shMomento(); return; }
    if ((b = q('[data-shmomk]'))) { const x = shMios().find(y => y.k === b.dataset.shmomk), nueva = SH.perfil !== 'banda', yo = nueva ? 'Sofi' : 'Martina';
      SH.prop.push({ key:'p' + SH.prop.length, mk:x.k, ins:shPer(yo, 36), nom:yo, sub:SH.perfil === 'banda' ? 'lo ve tu banda' : SH.perfil === 'duo' ? 'lo ve tu dúo' : 'solo lo ves vos', m:SH.now, alt:x.t,
        inner:shBl(41.9, '<span class="shneon mg" style="font-size:13.4cqw">' + x.g + '</span>' + shL('Contado desde Inicio.', true)), sello:x.s, pie:shIgBtn('p' + SH.prop.length) });
      $('#shHoja').hidden = true; toast('Listo: está en tu muro'); shRender(); return; }
    if ((b = q('[data-shins]'))) { SH.ins = SH.insOp[+b.dataset.shins]; $('#shHoja').hidden = true; toast('Tu insignia ya está en la tira'); shRender(); return; }
    if (q('[data-shhx]') || e.target.id === 'shHoja') { $('#shHoja').hidden = true; return; }
  });
  (function () {
    const H = $('#shHist'); let y0 = null;
    H.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive:true });
    H.addEventListener('touchend', e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 70) { y0 = null; shCerrar(); H.dataset.sw = '1'; setTimeout(() => delete H.dataset.sw, 400); } y0 = null; });
    H.addEventListener('click', e => {
      if (H.dataset.sw || !SH.h) return;
      const q = s => e.target.closest(s), x = SH.h.x;
      if (q('[data-shx]')) { shCerrar(); return; }
      if (q('[data-shbanda]')) { shCerrar(); shBandaHoja(); return; }
      if (q('[data-shdesaf]')) { SH.desaf[x.b.key] = true; toast('Desafío enviado a ' + x.nom); shPaso(SH.h.i); return; }
      if (q('[data-shhrayo]')) { const k = 'h' + x.key; SH.rayo[k] = !SH.rayo[k]; const b = q('[data-shhrayo]'); b.setAttribute('aria-pressed', !!SH.rayo[k]); if (SH.rayo[k]) toast('Les mandaste ⚡ a ' + x.nom); return; }
      if (q('.shhfoot')) return;
      const r = H.getBoundingClientRect(); shPaso(SH.h.i + (e.clientX - r.left < r.width / 3 ? -1 : 1));
    });
  })();
