/* Vivapp · Captación: ingreso, embudo, pago por uso, pase, primer entrenamiento y alta.
   Bloques de la función principal: cargar.js los une por número (//#bloque NNN), en orden.
   No borrar ni renumerar las marcas; código nuevo, dentro de un bloque o en uno nuevo con número intermedio. */
//#bloque 020
  // Ingreso por teléfono
  let demo = 'socio';
  function step(n){
    [0,1,2,3].forEach(i => $('#step'+i).hidden = i !== n);
    $('#loginBack').hidden = n === 0; $('#lDots').hidden = n === 0; $('#lSocioTop').hidden = n !== 0;
    $('#dot2').classList.toggle('on', n >= 2);
    $('#dot3').classList.toggle('on', n === 3);
    $('#loginBack').dataset.back = n - 1;
  }
  $$('[data-step]').forEach(b => b.addEventListener('click', () => {
    const t = $('#tel').value.trim(); $('#telShow').textContent = t; $('#telOk').textContent = t;
    step(+b.dataset.step);
  }));
  $('#loginBack').addEventListener('click', e => step(+e.currentTarget.dataset.back));
  $$('.code input').forEach((inp, i, all) => inp.addEventListener('input', () => { if (inp.value && all[i+1]) all[i+1].focus(); }));
  let ppuIntent = false;
  const entrarSocio = () => { demo = 'socio'; ppuIntent = false; $('#s1Title').textContent = 'Ingresá con tu teléfono'; $('#s1Txt').textContent = 'Te mandamos un código por WhatsApp. Lo hacés una sola vez: después la app entra directo.'; step(1); };
  $('#lSocio').addEventListener('click', entrarSocio); $('#lSocioTop').addEventListener('click', entrarSocio);
  $('#lPpu').addEventListener('click', () => { demo = 'nuevo'; ppuIntent = true; $('#s1Title').textContent = 'Primero, tu teléfono'; $('#s1Txt').textContent = 'Te mandamos un código por WhatsApp para crear tu cuenta. Después elegís la sede y pagás.'; step(1); });
  function renderLanding(){
    const col = { low:'var(--ok)', mid:'var(--orange)', high:'var(--pink)', full:'var(--pink)' };
    $('#lOcc').innerHTML = sedesPPU.map(x => { const [lv, c] = nivel(x.occ); return '<div class="lsede"><span class="hdot oc-' + c + '" style="background:' + col[c] + '"></span><span style="flex:1;font-weight:500">' + x.n + '</span><span class="small muted">' + (c === 'low' ? 'Poca gente' : c === 'mid' ? 'Gente moderada' : 'Mucha gente') + '</span></div>'; }).join('');
    $('#hsTrial').textContent = mitad() ? 'Probala a mitad de precio con un profe' : 'Probala gratis con un profe';
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-group="gancho"]')) setTimeout(renderLanding, 0); });
  // Estado del embudo de personas nuevas
  var lastFeel = null;
  let leadFlow = false, leadMode = false, leadSaved = false, cuenta = false, preview = false, fichaOk = false, trial = null, feelMsg = null;
  $('#validar').addEventListener('click', () => {
    if (leadFlow) { leadFlow = false; cuenta = true; guardarLead(); return; }
    if (demo === 'socio') { go('inicio'); toast('Encontramos tu cuenta de socia'); }
    else step(3);
  });
  $('#crearCuenta').addEventListener('click', () => {
    if (!$('#rNom').value.trim()) { toast('Contanos tu nombre'); return; }
    $('#nName').textContent = $('#rNom').value.trim(); cuenta = true;
    renderNuevo(); if (ppuIntent) { go('ppu'); toast('Cuenta creada · elegí tu sede'); } else { go('nuevo'); toast('Cuenta creada'); }
  });
  $('#logout').addEventListener('click', () => { step(0); go('login'); });

//#bloque 110
  // ===== Pase del día a precio fijo (T2; alcance 4, dueno.md 20). Precio: [PRECIO] hasta que Viva lo mande. Cierre de las sedes: ejemplo =====
  const PRECIO = '[PRECIO]', cfg = { tope:90, cierre:'22:00' };
  const sedesPPU = [
    { id:'sar', n:'Sarmiento', occ:34 }, { id:'lyp', n:'López y Planes', occ:57 },
    { id:'cor', n:'Corrientes', occ:74 }, { id:'alb', n:'Alberdi', occ:92 }, { id:'sta', n:'Santa Ana', occ:22 }, { id:'pos', n:'Posadas', occ:41 }
  ];
  const nivel = o => o >= cfg.tope ? ['Llena ahora','full'] : o >= 70 ? ['Mucha gente','high'] : o >= 40 ? ['Gente moderada','mid'] : ['Poca gente','low'];
  let selSede = null, ago = 0, pase = null;

  function renderPPU(){
    $('#ppuList').innerHTML = sedesPPU.map(s => {
      const [lv, cls] = nivel(s.occ);
      return '<button class="sede ' + cls + '" data-sede="' + s.id + '">' +
        '<span class="stack" style="gap:6px;flex:1;min-width:0"><span style="font-weight:700;font-size:16px">' + s.n + '</span>' +
        '<span class="occ sm"><i style="width:' + s.occ + '%"></i></span>' +
        '<span class="small"><span class="lv">' + lv + '</span> · ' + s.occ + '% de ocupación</span></span>' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>' +
        '</button>';
    }).join('');
  }
  function renderCotiza(){
    if (!selSede) return;
    const s = sedesPPU.find(x => x.id === selSede), [lv, cls] = nivel(s.occ);
    $('#cSede').textContent = s.n;
    $('#cOcc').textContent = s.occ + '%'; $('#cLvl').textContent = lv;
    $('#cBar').style.width = s.occ + '%'; $('#cBar').className = cls;
    $('#cLleno').hidden = s.occ < cfg.tope;
  }
  $('#ppuList').addEventListener('click', e => {
    const b = e.target.closest('[data-sede]'); if (!b) return;
    const s = sedesPPU.find(x => x.id === b.dataset.sede);
    selSede = s.id; renderCotiza(); go('cotiza');
  });

  // Ocupación en vivo (simulada a partir de los ingresos de molinete)
  setInterval(() => {
    sedesPPU.forEach(s => {
      const d = Math.round((Math.random() - 0.5) * 8);
      s.occ = Math.max(8, Math.min(97, s.occ + d));
      if (s.id === 'alb') s.occ = Math.max(90, Math.min(96, s.occ));
    });
    ago = 0; renderPPU(); renderCotiza(); renderOcc();
  }, 4000);
  setInterval(() => { ago++; $('#ppuAgo').textContent = ago; }, 1000);

  // Pago (simulado) y pase
  const hhmm = d => String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  $('#payBtn').addEventListener('click', () => requireFicha(() => {
    const s = sedesPPU.find(x => x.id === selSede);
    const activar = () => {
      const now = ahora();
      pase = { sede:s.n, at:now, estado:'activo' };
      consumos.unshift({ d:now, sede:s.n }); paintPase(); go('pase');
    };
    $('#mpSheet').hidden = false; $('#mpWait').hidden = false; $('#mpOk').hidden = true;
    setTimeout(() => {
      $('#mpWait').hidden = true; $('#mpOk').hidden = false; $('#mpOkTxt').textContent = 'Acreditado en Viva Fit House · Pase del día ' + PRECIO;
      setTimeout(() => { $('#mpSheet').hidden = true; activar(); }, 1300);
    }, 1600);
  }));
  function paintPase(){
    if (!pase) return;
    $('#pSede').textContent = pase.sede; $('#pPaid').textContent = PRECIO;
    $('#pAt').textContent = hhmm(pase.at); $('#pUntil').textContent = cfg.cierre;
    $('#pActivo').hidden = pase.estado !== 'activo'; $('#pDentro').hidden = pase.estado !== 'dentro';
    $('#pDemo').hidden = pase.estado !== 'activo';
    $('#nPase').hidden = pase.estado !== 'activo';
    $('#nPaseTxt').textContent = pase.sede + ' · vale hoy hasta las ' + cfg.cierre;
    renderPpuHome();
  }
  $('#simIngreso').addEventListener('click', () => {
    pase.estado = 'dentro'; pase.inAt = ahora(); $('#pDentroTxt').textContent = pase.sede + ' · ' + hhmm(ahora()) + '. ¡Buen entrenamiento!';
    paintPase(); toast('Molinete habilitado');
  });
  renderPPU();

  // ===== Inicio y entrenamientos de pago por uso =====
  const diasAtras = (n, h, m) => { const d = ahora(); d.setDate(d.getDate() - n); d.setHours(h, m, 0, 0); return d; };
  const consumos = [
    { d:diasAtras(3, 18, 40), sede:'López y Planes' },
    { d:diasAtras(7, 10, 5), sede:'Sarmiento' },
    { d:diasAtras(14, 19, 30), sede:'López y Planes' }
  ];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const franjas = [['7',48],['9',24],['11',20],['13',28],['15',22],['17',62],['19',86],['21',54]];   // ocupación promedio (%), simulada desde las entradas
  rutinas.ppu = null;

  function renderPpuHome(){
    $('#phName').textContent = $('#nName').textContent;
    try { const s = ahora().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' }); $('#phHoy').textContent = s.charAt(0).toUpperCase() + s.slice(1); } catch(_){}
    // Estado del pase de hoy
    let h = '';
    if (!pase) h = '<span class="lbl">Sin pase hoy</span><button class="btn sm" data-go="ppu">Sacar el pase del día</button>';
    else if (pase.estado === 'activo') h = '<div class="between"><span class="lbl">Pase de hoy · ' + pase.sede + '</span><span class="pill">ACTIVO</span></div><span class="h2">Vale hasta las ' + cfg.cierre + '</span><button class="btn sm" data-go="pase">Ver tu pase</button>';
    else if (pase.estado === 'dentro') h = '<div class="between"><span class="lbl">Pase de hoy · ' + pase.sede + '</span><span class="pill gris">USADO</span></div><span class="h2">Ingresaste a las ' + hhmm(pase.inAt || ahora()) + '</span><span class="small muted">¡Buen entrenamiento! Tu rutina está en la pestaña Entrenamientos.</span>';
    $('#phPase').innerHTML = h;
    // Estadísticas del mes
    const now = ahora(), mes = consumos.filter(c => c.d.getMonth() === now.getMonth() && c.d.getFullYear() === now.getFullYear());
    $('#phCount').textContent = mes.length;
    $('#phMes').textContent = meses[now.getMonth()];
    // Con 2 pases o más en el mes, te conviene un plan; lo pagado en pases se descuenta del primer mes
    const pagos = mes.length;
    $('#phNudge').hidden = pagos < 2;
    $('#phNudge').innerHTML = '<span class="lbl">¿Venís seguido?</span><span style="font-weight:700;font-size:18px;line-height:1.3">Este mes ya viniste ' + pagos + ' veces con el pase del día.</span><span class="small muted" style="line-height:1.45">Con 2 o más pases en el mes, te conviene un plan. Lo que pagaste en pases este mes se descuenta del primer mes, hasta la mitad de la cuota.</span><button class="btn sm" data-go="planes">Ver planes</button>';
    $('#plNudge').hidden = !pagos; $('#plNudge').textContent = 'Te descontamos lo que pagaste en pases este mes, hasta la mitad del primer mes.';
    // Mejores horarios
    const sede = pase ? pase.sede : 'López y Planes';
    $('#phSede').textContent = sede;
    const max = Math.max.apply(null, franjas.map(f => f[1])), min = Math.min.apply(null, franjas.map(f => f[1]));
    $('#phChart').innerHTML = franjas.map(f => '<span class="hb' + (f[1] === min ? ' best' : '') + '" style="height:' + Math.round(f[1] / max * 100) + '%" title="' + f[0] + ' h · ' + f[1] + ' %"><em>' + f[1] + '%</em></span>').join('');
    $('#phLabels').innerHTML = franjas.map(f => '<span>' + f[0] + ' h</span>').join('');
    $('#phTip').textContent = 'Con menos gente en ' + sede + ': de 9 a 16 h.';
    // Consumos
    $('#phList').innerHTML = consumos.map(c => '<div><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700">' + c.sede + '</span><span class="small muted">' +
      c.d.toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit' }) + ' · ' + hhmm(c.d) + '</span></span><span class="small muted">Pase del día</span></div>').join('');
  }

  function renderPpuTrain(){
    const r = rutinas.ppu;
    if (!r) { $('#ptList').innerHTML = '<div class="card" style="align-items:center;text-align:center"><span class="h2">Todavía no tenés rutina</span><span class="small muted">Contanos qué buscás y te mostramos la rutina de los profes de Viva que va con vos, con las máquinas de tu sede.</span></div>'; return; }
    $('#ptList').innerHTML = '<div class="card rut cur"><div class="between"><span class="pill ia">DE LOS PROFES DE VIVA</span><span class="pill">EN CURSO</span></div>' +
      '<div class="stack" style="gap:4px"><span class="h2">' + r.nombre + '</span><span class="small muted">' + r.sub + '</span></div>' +
      '<div class="days" style="grid-template-columns:repeat(' + r.dias.length + ',minmax(0,1fr))">' +
      r.dias.map((d, i) => '<button class="day ' + (i < r.next ? 'done' : i === r.next ? 'today' : '') + '" data-pstart="' + i + '"><b>' + d.k + '</b><span>' + (i < r.next ? 'Hecho' : i === r.next ? 'Hoy' : d.lbl) + '</span></button>').join('') +
      '</div><span class="small muted">Tocá un día para entrenar.</span></div>';
  }
  $('#ptList').addEventListener('click', e => { const b = e.target.closest('[data-pstart]'); if (b) startDay('ppu', +b.dataset.pstart); });
  $('#iaBack').addEventListener('click', () => { if (leadMode) { setLead(false); if (!cuenta) step(0); go(cuenta ? 'nuevo' : 'login'); return; } go(modo === 'ppu' ? 'ppuTrain' : 'rutinas'); });
  $('#exMin').addEventListener('click', () => { stopRest(); if (preview) { go(leadSaved ? 'nuevo' : 'ia'); return; } go(modo === 'ppu' ? 'ppuHome' : 'inicio'); });
  $$('[data-go="ppuHome"],[data-go="ppuTrain"]').forEach(b => b.addEventListener('click', () => { renderPpuHome(); renderPpuTrain(); }));
  renderPpuTrain();

//#bloque 140
  // ===== Embudo: primero la rutina, después los datos =====
  function setLead(on){
    leadMode = on;
    $('#iaH1').textContent = on ? 'Creá tu rutina a medida' : 'Contanos cómo querés entrenar';
    $('#iaSub').hidden = !on;
  }
  function abrirLead(){ setLead(true); $('#iaResult').hidden = true; $('#iaLoading').hidden = true; $('#iaForm').hidden = false; go('ia'); }
  $('#leadStart').addEventListener('click', abrirLead);
  $('#nLead').addEventListener('click', abrirLead);
  function prepLead(){
    $('#leadPrev').hidden = !leadMode; $('#activarBtn').hidden = leadMode; $('#iaAviso').hidden = leadMode;
    if (!leadMode) return;
    rutinas.lead = crearRutinaIA(); leadSaved = false;
    const d = rutinas.lead.dias[0];
    $('#lpName').textContent = 'Día A · ' + d.n;
    $('#lpList').innerHTML = d.ex.map(k => { const e = lib[k]; return '<div class="between" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="stack" style="gap:0;min-width:0"><span style="font-weight:700">' + e.n + '</span><span class="small muted">' + e.grupo + '</span></span><span class="small" style="font-weight:700;white-space:nowrap">' + e.sets.length + ' × ' + e.sets[0][2] + '</span></div>'; }).join('');
  }
  $('#lpTry').addEventListener('click', () => startDay('lead', 0, true));
  function guardarLead(){
    leadSaved = true; setLead(false); renderNuevo(); renderSlots(); go('prueba');
    toast('Guardada · un profe la revisa');
  }
  $('#lpSave').addEventListener('click', () => { if (cuenta) guardarLead(); else go('guardar'); });
  $('#gBack').addEventListener('click', () => go('ia'));
  $('#gSend').addEventListener('click', () => {
    const n = $('#gNom').value.trim(), t = $('#gTel').value.trim();
    if (!n || t.replace(/\D/g, '').length < 8) { toast('Completá nombre y teléfono'); return; }
    $('#nName').textContent = n; $('#tel').value = t; $('#telShow').textContent = t;
    leadFlow = true; step(2); go('login');
  });

  // Primer entrenamiento gratis, en un horario con poca gente
  const diaLbl = n => { if (n === 0) return 'Hoy'; if (n === 1) return 'Mañana'; const d = new Date(+ahora() + n * 864e5), w = d.toLocaleDateString('es-AR', { weekday:'long' }); return w.charAt(0).toUpperCase() + w.slice(1) + ' ' + d.getDate(); };
  const slots = [ { dia:'Mañana', h:'14:00', sede:'Sarmiento', nota:'Poca gente · ideal para arrancar', lv:'low' }, { dia:'Mañana', h:'10:30', sede:'Santa Ana', nota:'Poca gente', lv:'low' }, { dia:diaLbl(3), h:'15:00', sede:'López y Planes', nota:'Gente moderada', lv:'mid' } ];
  let slotSel = 0;
  const okIco = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--dat)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
  const mitad = () => val('gancho') === 'Mitad de precio';
  function renderSlots(){
    const m = mitad();
    $('#pruH1').textContent = m ? 'Probala a mitad de precio' : 'Probala gratis';
    $('#pruTxt').textContent = m ? 'Tu primer entrenamiento en Viva a mitad de precio: $2.500 (uno por persona). Te recibe un profe con 15 minutos de bienvenida. Te sugerimos los horarios con menos gente.' : 'Tu primer entrenamiento en Viva no se paga (uno por persona). Te recibe un profe con 15 minutos de bienvenida. Te sugerimos los horarios con menos gente.';
    $('#trialOk').textContent = m ? 'Reservar a mitad de precio' : 'Reservar mi entrenamiento gratis';
    $('#slotList').innerHTML = slots.map((x, i) => '<button class="slot" data-slot="' + i + '" aria-pressed="' + (i === slotSel) + '"><span class="stack" style="gap:2px;flex:1"><span style="font-weight:700;font-size:17px">' + x.dia + ' · ' + x.h + '</span><span class="small muted">Sede ' + x.sede + '</span><span class="small lvt ' + x.lv + '">' + x.nota + '</span></span>' + (i === slotSel ? okIco : '') + '</button>').join('');
  }
  $('#slotList').addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if (b) { slotSel = +b.dataset.slot; renderSlots(); } });
  $('#trialOk').addEventListener('click', () => { trial = slots[slotSel]; renderNuevo(); go('nuevo'); toast('Te esperamos ' + trial.dia.toLowerCase() + ' a las ' + trial.h); });
  $('#trialSkip').addEventListener('click', () => { renderNuevo(); go('nuevo'); });

  let planOffer = false;
  const vence48 = () => { const d = new Date(+ahora() + 2 * 864e5); return d.toLocaleDateString('es-AR', { weekday:'long', day:'numeric' }); };
  function renderNuevo(){
    const t = $('#nTrial'); t.hidden = !trial;
    if (trial && trial.hecho) t.innerHTML = '<div class="between"><span class="lbl">Tu primera visita</span><span class="pill ok">HECHA</span></div><span class="h2">¡Gracias por venir, ' + $('#nName').textContent + '!</span>' +
      '<div class="note"><span class="avatar" style="width:30px;height:30px;font-size:11px">LP</span><span>Prof. Lucas ajustó tu rutina: bajó el peso en sentadilla y sumó movilidad de cadera.</span></div>' +
      '<div class="note"><span><strong>Asociate antes del ' + vence48() + ':</strong> 20% en tu primer mes.</span></div>' +
      '<button class="btn sm" data-go="planes">Ver planes</button><span class="small muted" style="text-align:center">Tu cara ya quedó registrada: como socio entrás directo.</span>';
    else if (trial) t.innerHTML = '<div class="between"><span class="lbl">' + (mitad() ? 'Tu entrenamiento a mitad de precio' : 'Tu entrenamiento gratis') + '</span><span class="pill">RESERVADO</span></div><span class="h2">' + trial.dia + ' · ' + trial.h + '</span><span class="small muted" style="line-height:1.45">Sede ' + trial.sede + ' · un profe te recibe con 15 minutos de bienvenida.' + (mitad() ? ' Pagás $2.500 al entrar.' : '') + '</span><button class="btn sm" id="nTrialQr">Preparar mi primer ingreso</button><button class="link" id="simVisita" style="min-height:44px;font-size:13px">Demo: simular que ya fui</button>';
    $('#plNudge').hidden = !planOffer && $('#plNudge').hidden; if (planOffer) { $('#plNudge').hidden = false; $('#plNudge').innerHTML = '<span><strong>20% en tu primer mes</strong> por haber venido a tu primera visita. Válido hasta el ' + vence48() + '.</span>'; }
    const r = $('#nRut'), tiene = !!(rutinas.lead && leadSaved);
    r.hidden = !tiene;
    if (tiene) r.innerHTML = '<div class="between"><span class="pill ia">DE LOS PROFES DE VIVA</span><span class="small muted">Se revisa en tu visita</span></div><span class="h2">' + rutinas.lead.nombre + '</span><div class="note"><span class="avatar" style="width:30px;height:30px;font-size:11px">LP</span><span>La elegimos entre las rutinas de los profes. En tu primera visita, un profe la ajusta a vos.</span></div><button class="btn ghost sm" id="nRutVer">Ver mi rutina</button>';
    $('#nLead').hidden = tiene;
  }
  $('#nuevo').addEventListener('click', e => {
    if (e.target.closest('#nTrialQr')) requireFicha(() => showAcceso((mitad() ? 'Entrenamiento a mitad de precio' : 'Entrenamiento gratis') + ' · ' + trial.dia + ' ' + trial.h + ' · Sede ' + trial.sede));
    if (e.target.closest('#simVisita')) { trial.hecho = true; fichaOk = true; planOffer = true; renderNuevo(); $('#nuevo .body').scrollTop = 0; toast('Así se ve después de tu primera visita'); }
    if (e.target.closest('#nRutVer')) startDay('lead', 0, true);
  });
  function showQR(lbl, name){ $('#qrLbl').textContent = lbl; $('#qrName').textContent = name; $('#qrOverlay').hidden = false; }
  function showAcceso(lbl){ showQR(lbl, $('#nName').textContent); }

  // Elegir plan → Mercado Pago (simulado) → alta de socio
  $('#planes').addEventListener('click', e => {
    const b = e.target.closest('[data-plan]'); if (!b) return;
    requireFicha(() => {
      $('#mpSheet').hidden = false; $('#mpWait').hidden = false; $('#mpOk').hidden = true;
      setTimeout(() => {
        $('#mpWait').hidden = true; $('#mpOk').hidden = false; $('#mpOkTxt').textContent = 'Acreditado en Viva Fit House · ' + b.dataset.plan;
        setTimeout(() => { $('#mpSheet').hidden = true; altaSocio(b.dataset.plan); }, 1300);
      }, 1600);
    });
  });
  const semTxt = n => n === 1 ? 'una semana' : 'unas ' + n + ' semanas';
  function altaSocio(plan){
    $('#altaPlan').textContent = plan + (plan.includes('3 veces') ? ' · tu sede' : ' · todas las sedes') + (planOffer ? ' · 20% en el primer mes' : '');
    // Forma de alguien que arranca: solo su primera visita (TAU 42 días, meta 4 por semana)
    const m = Math.max(2, Math.min(5, +val('dias') || 3)), f0 = Math.max(1, Math.round((1 / 42) / (m / 7) * 100)), zs = zonas();
    $('#altaF').textContent = f0;
    $('#altaTxt').textContent = 'Tu meta: ' + m + ' veces por semana' + (plan.includes('3 veces') ? ', la de tu plan' : ' (la cambiás cuando quieras)') + '. Si la cumplís, en ' + semTxt(semHasta(zs[1][0])) + ' pasás a ' + zs[1][1] + ' y en ' + semTxt(semHasta(zs[2][0])) + ', a ' + zs[2][1] + '.';
    go('alta');
  }
  $('#altaGo').addEventListener('click', () => {
    const n = $('#nName').textContent, dias = Math.max(2, Math.min(5, +val('dias') || 3));
    const nv = $('#demoSheet [data-nv="0"]'); if (nv) nv.click();   // socio nuevo, recién dado de alta (T11)
    $('#demoSheet').hidden = true;
    if (IA.obj.length) { OBJ = IA.obj.slice(); OB.res.obj = OBJ.slice(); }
    if (IA.exp) obExp(IA.exp);
    // Retomo en un socio nuevo: sin historia en Viva no hay "80 % de la vez pasada" ni "Volviste" (veracidad); la regla del primer mes ya frena la carga sugerida
    if (IA.exp === 'retomo') { ETAPA = 'normal'; $('.app').dataset.etapa = ETAPA; $$('#etPick [data-et]').forEach(y => y.setAttribute('aria-pressed', y.dataset.et === 'normal')); }
    META_SEM = dias; META_PROX = null; OB.res.meta = dias;
    OB.hecho = true; OB.salt = ['cui'].concat(IA.obj.length ? [] : ['obj']).concat(IA.exp ? [] : ['exp']);   // lo que no preguntó la captación queda para "Contame de vos"
    try { nvRefresh(); } catch (e) {}
    $('#inicio .title').textContent = 'Hola, ' + n; go('inicio'); toast('Así arranca tu inicio de socio nuevo');
  });

  // DNI y deslinde: recién antes del primer ingreso
  let fichaCb = null;
  function requireFicha(cb){ if (fichaOk) return cb(); fichaCb = cb; $('#fichaSheet').hidden = false; }
  $('#fCancel').addEventListener('click', () => { $('#fichaSheet').hidden = true; fichaCb = null; });
  $('#fOk').addEventListener('click', () => {
    if ($('#fDni').value.replace(/\D/g, '').length < 7) { toast('Revisá tu DNI'); return; }
    if (!$('#fDes').checked) { toast('Aceptá el deslinde para entrar'); return; }
    fichaOk = true; $('#fichaSheet').hidden = true; const cb = fichaCb; fichaCb = null; toast('Listo, no te lo pedimos más'); if (cb) cb();
  });

