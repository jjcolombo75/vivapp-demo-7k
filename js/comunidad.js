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
    { id:'e2', dia:'JUE', hora:'20:30', k:'Evento', t:'Spinning Night', donde:'López y Planes', n:18, cupo:25 },
    { id:'e3', dia:'SÁB', hora:'11:30', k:'Evento', t:'Funcional en dúo', donde:'Sarmiento', n:12, cupo:20 },
    { id:'e4', dia:'VIE', hora:'21:00', k:'Evento', t:'After Train', donde:'Sarmiento', n:9, cupo:30 }
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
