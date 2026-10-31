/* Vivapp · Comunidad: compañeros, match, chat y Gente.
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
  let smode = 'desafios', fil = 'todas', deckList = [], cur = null, chatId = null, asistMode = false;
  const miSede = 'Sarmiento';
  const inicial = n => n.charAt(0);
  const grad = c => 'linear-gradient(160deg,' + c[0] + ',' + c[1] + ')';


  function setSmode(m){
    smode = m; asistMode = false;
    $$('#smode [data-smode]').forEach(b => b.setAttribute('aria-selected', b.dataset.smode === m));
    $('#desafBox').hidden = m !== 'desafios'; $('#logrosBox').hidden = m !== 'logros';
    $('#deckBox').hidden = m !== 'entrenar'; $('#eventsBox').hidden = m !== 'eventos';
    if (m === 'entrenar') renderGente();
    if (m === 'desafios') renderDesafios();
    if (m === 'logros') renderLogros();
  }
  $('#smode').addEventListener('click', e => { const b = e.target.closest('[data-smode]'); if (b) setSmode(b.dataset.smode); });
  $('#verAsist').addEventListener('click', () => { setSmode('entrenar'); asistMode = true; renderGente(); if (!miGente.on) toast('Activá tu perfil para ver a los asistentes'); });

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
    pushCard('<span class="lbl">Invitación a entrenar</span><span class="h2" style="font-size:22px">' + $('#invDia').value + ' · ' + $('#invHora').value + '</span><span class="small muted">' + $('#invSede').value + '</span><span class="small" style="color:var(--dat);font-weight:700">Esperando respuesta</span>', 'Invitación a entrenar');
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
  let feedMode = 'todos';
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
    miGente.on = true; $('#swGente').checked = true; renderGente(); toast('Tu perfil de Gente está activo');
  });
  $('#swGente').addEventListener('change', e => { miGente.on = e.target.checked; renderGente(); toast(miGente.on ? 'Aparecés en Gente' : 'Ya no aparecés en Gente'); });
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
    }).join('') : '<div class="card" style="align-items:center;text-align:center"><span class="h2" style="font-size:22px">Nadie por ahora</span><span class="small muted">Probá con todas las sedes o sumá otra intención.</span></div>';
  }
  $('#gente').addEventListener('click', e => {
    const f = e.target.closest('[data-follow]'), l = e.target.closest('[data-like]'), h = e.target.closest('[data-hide]');
    if (f) { const n = f.dataset.follow; if (siguiendo.has(n)) siguiendo.delete(n); else { siguiendo.add(n); toast('Ahora ves sus logros en el muro'); } renderGente(); return; }
    if (h) { const p = gente.find(x => x.id === h.dataset.hide); ocultos.add(p.id); renderGente(); toast('Bloqueaste a ' + p.n + '. No van a volver a verse.'); return; }
    if (l) {
      const p = gente.find(x => x.id === l.dataset.like); if (intereses.has(p.id)) return;
      intereses.add(p.id); renderGente();
      if (p.likesMe) { const v = visibles(p); showMatch(p, v.includes('conocer') || v.includes('amigos') ? 'conocer' : 'entrenar'); }
      else toast('Enviado. Solo se entera si también le interesa');
    }
  });
  $('#sedeFil').addEventListener('click', e => { const b = e.target.closest('[data-fil]'); if (!b) return; fil = b.dataset.fil; $$('#sedeFil .opt').forEach(x => x.setAttribute('aria-pressed', x === b)); renderGente(); });
  $('#feedFil').addEventListener('click', e => { const b = e.target.closest('[data-ff]'); if (b) { feedMode = b.dataset.ff; renderLogros(); } });
  $('#qEvt').addEventListener('click', () => pushCard('<span class="lbl">Invitación a un evento</span><span class="h2" style="font-size:22px">Spinning Night · Jue 20:30</span><span class="small muted">López y Planes</span><span class="small" style="color:var(--dat);font-weight:700">Esperando respuesta</span>', 'Invitación a un evento'));

