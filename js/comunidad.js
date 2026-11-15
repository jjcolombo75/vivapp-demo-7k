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
  var SOC_V = 'B', SOC_B = 'con';   // la B abre por defecto (Juanjo, 14/11)
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
  function socNav(){ const t = $('#nav [data-go="social"]').lastChild; if (t && t.nodeType === 3) t.nodeValue = SOC_V === 'A' ? 'Mural' : SOC_V === 'C' ? SC.tab : SOC_V === 'D' ? SD.tab : 'Social'; }
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
